const { getPool } = require('../_lib/db');
const { mpRequest } = require('../_lib/mercadopago');
const { applyCors } = require('../_lib/cors');

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' });
  const publicId = String(req.query?.order || '').trim();
  if (!publicId) return res.status(400).json({ error: 'Informe o número do pedido.' });

  try {
    const db = getPool();
    const [rows] = await db.execute('SELECT public_id,total_amount,status,status_detail,mp_order_id,created_at,paid_at FROM fm_orders WHERE public_id=? LIMIT 1', [publicId]);
    if (!rows.length) return res.status(404).json({ error: 'Pedido não encontrado.' });
    const local = rows[0];

    let remote = null;
    if (local.mp_order_id) {
      try { remote = await mpRequest(`/v1/orders/${encodeURIComponent(local.mp_order_id)}`, { method: 'GET' }); } catch {}
    }

    return res.status(200).json({
      order: {
        id: local.public_id,
        total: Number(local.total_amount),
        status: remote?.status || local.status,
        statusDetail: remote?.status_detail || local.status_detail,
        paidAt: local.paid_at,
        createdAt: local.created_at
      }
    });
  } catch (error) {
    console.error('payment/status', error);
    if (error.code === 'CONFIGURATION_ERROR') return res.status(503).json({ error: 'Configure o banco de dados no servidor.' });
    return res.status(500).json({ error: 'Não foi possível consultar o pedido.' });
  }
};
