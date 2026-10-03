const { getPool } = require('../_lib/db');
const { requireAuth } = require('../_lib/auth');
const { applyCors } = require('../_lib/cors');

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

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' });
  const auth = requireAuth(req, res);
  if (!auth) return;

  try {
    const db = getPool();
    const [orders] = await db.execute(
      'SELECT id,public_id,total_amount,shipping_amount,payment_method,status,status_detail,mp_order_id,created_at,paid_at FROM fm_orders WHERE user_id=? ORDER BY created_at DESC LIMIT 100',
      [auth.id]
    );
    if (!orders.length) return res.json({ orders: [] });

    const ids = orders.map(o => o.id);
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

    return res.json({
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
        items: grouped.get(order.id) || []
      }))
    });
  } catch (error) {
    console.error('orders/mine', error);
    if (error.code === 'CONFIGURATION_ERROR') return res.status(503).json({ error: 'Banco de dados não configurado.' });
    return res.status(500).json({ error: 'Não foi possível carregar seus pedidos.' });
  }
};
