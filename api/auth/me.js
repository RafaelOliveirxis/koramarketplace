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

      if (action === 'admin_tracking') {
        const admins = String(process.env.ADMIN_EMAILS || '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
        if (!admins.length || !admins.includes(String(auth.email || '').toLowerCase())) {
          return res.status(403).json({ error: 'Acesso administrativo não autorizado.' });
        }
        const publicId = String(req.body?.publicId || '').trim();
        const status = String(req.body?.status || '').trim().toLowerCase();
        const title = String(req.body?.title || '').trim();
        const description = String(req.body?.description || '').trim();
        const carrier = String(req.body?.carrier || '').trim().slice(0, 120);
        const trackingCode = String(req.body?.trackingCode || '').trim().slice(0, 80);
        const allowedStatuses = ['processing','ready_to_ship','shipped','in_transit','out_for_delivery','delivered'];
        if (!publicId || !allowedStatuses.includes(status) || !title) {
          return res.status(400).json({ error: 'Dados de expedição inválidos.' });
        }
        const [orders] = await db.execute('SELECT id,public_id FROM fm_orders WHERE public_id=? LIMIT 1', [publicId]);
        if (!orders.length) return res.status(404).json({ error: 'Pedido não encontrado.' });
        await db.execute(
          'INSERT INTO fm_order_tracking (order_id,status,title,description,tracking_code,carrier,event_at) VALUES (?,?,?,?,?,?,CURRENT_TIMESTAMP)',
          [orders[0].id,status,title,description || null,trackingCode || null,carrier || null]
        );
        return res.json({
          ok: true,
          event: { status, title, description: description || null, trackingCode: trackingCode || null, carrier: carrier || null }
        });
      }
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
    const includeAdminOrders = includes.includes('admin-orders');
    const includeNotifications = includes.includes('notifications');
    const admins = String(process.env.ADMIN_EMAILS || '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
    const isAdmin = admins.includes(String(rows[0].email || '').toLowerCase());
    if (includeNotifications) {
      const [events] = await db.execute(
        `SELECT t.order_id,t.status,t.title,t.description,t.tracking_code,t.carrier,t.event_at,o.public_id
         FROM fm_order_tracking t INNER JOIN fm_orders o ON o.id=t.order_id
         WHERE o.user_id=? ORDER BY t.event_at DESC,t.id DESC LIMIT 30`, [auth.id]
      );
      return res.json({
        user: rows[0],
        notifications: events.map(e => ({
          orderId: e.public_id, status: e.status, title: e.title,
          description: e.description || null, trackingCode: e.tracking_code || null,
          carrier: e.carrier || null, date: e.event_at
        }))
      });
    }
    if (includeAdminOrders) {
      if (!isAdmin) return res.status(403).json({ error: 'Acesso administrativo não autorizado.' });
      const [adminOrders] = await db.execute(
        'SELECT id,public_id,total_amount,status,status_detail,mp_order_id,created_at,paid_at FROM fm_orders ORDER BY created_at DESC LIMIT 100'
      );
      if (!adminOrders.length) return res.json({ user: rows[0], isAdmin: true, orders: [] });
      const adminIds = adminOrders.map(o => o.id);
      const [adminTracking] = await db.execute(
        `SELECT order_id,status,title,description,tracking_code,carrier,event_at FROM fm_order_tracking WHERE order_id IN (${adminIds.map(() => '?').join(',')}) ORDER BY event_at DESC,id DESC`,
        adminIds
      );
      const latest = new Map();
      for (const e of adminTracking) if (!latest.has(e.order_id)) latest.set(e.order_id, e);
      return res.json({
        user: rows[0],
        isAdmin: true,
        orders: adminOrders.map(o => {
          const e = latest.get(o.id);
          return {
            id: o.public_id, total: Number(o.total_amount), paymentStatus: o.status,
            statusDetail: o.status_detail || null, mpOrderId: o.mp_order_id || null,
            date: o.created_at, paidAt: o.paid_at,
            shippingStatus: e?.status || 'processing',
            trackingCode: e?.tracking_code || null, carrier: e?.carrier || null,
            latestTracking: e ? { title: e.title, description: e.description || null, date: e.event_at } : null
          };
        })
      });
    }
    if (!includeOrders && !includeFavorites) return res.json({ user: rows[0], isAdmin });
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
