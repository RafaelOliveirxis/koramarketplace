const { getPool } = require('../_lib/db');
const { requireAuth } = require('../_lib/auth');
const { applyCors } = require('../_lib/cors');
const { ensurePaymentsSchema } = require('../_lib/ensurePaymentsSchema');

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;
  if (!['GET','POST'].includes(req.method)) return res.status(405).json({ error: 'Método não permitido.' });
  const auth = requireAuth(req, res);
  if (!auth) return;
  try {
    const db = getPool();
    await ensurePaymentsSchema(db);
    if (req.method === 'POST') {
      const action = String(req.body?.action || '').trim().toLowerCase();
      const productId = Number(req.body?.productId);
      if (!['add','remove','toggle'].includes(action) || !Number.isInteger(productId) || productId <= 0) {
        return res.status(400).json({ error: 'Favorito inválido.' });
      }
      const [product] = await db.execute('SELECT product_id FROM fm_catalog WHERE product_id=? AND active=1 LIMIT 1', [productId]);
      if (!product.length) return res.status(404).json({ error: 'Produto não encontrado.' });
      const [existing] = await db.execute('SELECT product_id FROM fm_favorites WHERE user_id=? AND product_id=? LIMIT 1', [auth.id, productId]);
      const shouldAdd = action === 'add' || (action === 'toggle' && !existing.length);
      if (shouldAdd) await db.execute('INSERT IGNORE INTO fm_favorites (user_id,product_id) VALUES (?,?)', [auth.id, productId]);
      else await db.execute('DELETE FROM fm_favorites WHERE user_id=? AND product_id=?', [auth.id, productId]);
      const [favorites] = await db.execute('SELECT product_id FROM fm_favorites WHERE user_id=? ORDER BY created_at DESC', [auth.id]);
      return res.json({ favorites: favorites.map(row => Number(row.product_id)), favorite: shouldAdd });
    }
    const [rows] = await db.execute('SELECT id,name,email,phone,email_verified,created_at,updated_at FROM users WHERE id = ? LIMIT 1', [auth.id]);
    if (!rows.length) return res.status(404).json({ error: 'Usuário não encontrado.' });
    const includes = String(req.query?.include || '').split(',').map(x => x.trim());
    const includeFavorites = includes.includes('favorites');
    const includeOrders = includes.includes('orders');
    if (!includeOrders && !includeFavorites) return res.json({ user: rows[0] });
    if (includeFavorites && !includeOrders) {
      const [favorites] = await db.execute('SELECT product_id FROM fm_favorites WHERE user_id=? ORDER BY created_at DESC', [auth.id]);
      return res.json({ user: rows[0], favorites: favorites.map(row => Number(row.product_id)) });
    }

    const [orders] = await db.execute(
      'SELECT id,public_id,total_amount,shipping_amount,payment_method,status,status_detail,mp_order_id,created_at,paid_at FROM fm_orders WHERE user_id=? ORDER BY created_at DESC LIMIT 100',
      [auth.id]
    );
    if (!orders.length) return res.json({ user: rows[0], orders: [] });

    const ids = orders.map(o => o.id);
    const [trackingRows] = await db.execute(
      `SELECT order_id,status,title,description,tracking_code,carrier,event_at FROM fm_order_tracking WHERE order_id IN (${ids.map(() => '?').join(',')}) ORDER BY event_at ASC,id ASC`,
      ids
    );
    const trackingGrouped = new Map();
    for (const event of trackingRows) {
      if (!trackingGrouped.has(event.order_id)) trackingGrouped.set(event.order_id, []);
      trackingGrouped.get(event.order_id).push({
        status: event.status, title: event.title, description: event.description || null,
        trackingCode: event.tracking_code || null, carrier: event.carrier || null, date: event.event_at
      });
    }
    const placeholders = ids.map(() => '?').join(',');
    const [items] = await db.execute(
      `SELECT order_id,product_id,product_name,unit_price,quantity,total_amount FROM fm_order_items WHERE order_id IN (${placeholders}) ORDER BY id ASC`,
      ids
    );
    const grouped = new Map();
    for (const item of items) {
      if (!grouped.has(item.order_id)) grouped.set(item.order_id, []);
      grouped.get(item.order_id).push({
        id: Number(item.product_id),
        n: item.product_name,
        p: Number(item.unit_price),
        qty: Number(item.quantity),
        total: Number(item.total_amount)
      });
    }
    const labels = {
      created: 'a-pagar',
      processing: 'preparando',
      action_required: 'a-pagar',
      processed: 'finalizado',
      canceled: 'cancelado',
      cancelled: 'cancelado',
      failed: 'cancelado',
      refunded: 'reembolso'
    };
    return res.json({
      user: rows[0],
      orders: orders.map(order => ({
        id: order.public_id,
        total: Number(order.total_amount),
        shipping: Number(order.shipping_amount),
        payment: order.payment_method,
        status: labels[String(order.status).toLowerCase()] || 'preparando',
        realStatus: order.status,
        statusDetail: order.status_detail || null,
        mercadoPagoOrderId: order.mp_order_id || null,
        paidAt: order.paid_at,
        date: order.created_at,
        items: grouped.get(order.id) || [],
        tracking: trackingGrouped.get(order.id) || []
      }))
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Não foi possível carregar a conta.' });
  }
};
