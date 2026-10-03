const { getPool } = require('../_lib/db');
const { mpRequest, validateWebhookSignature } = require('../_lib/mercadopago');
const { applyCors } = require('../_lib/cors');
const { ensurePaymentsSchema } = require('../_lib/ensurePaymentsSchema');

function mapStatus(order) {
  const status = String(order.status || '').toLowerCase();
  const detail = String(order.status_detail || '').toLowerCase();
  if (status === 'processed' || detail.includes('accredited') || Number(order.total_paid_amount || 0) >= Number(order.total_amount || 0)) return 'paid';
  if (status === 'action_required') return 'action_required';
  if (status === 'failed') return 'failed';
  if (status === 'refunded') return 'refunded';
  if (status === 'cancelled' || status === 'canceled') return 'cancelled';
  if (status === 'processing') return 'pending';
  return 'pending';
}

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });

  const dataId = req.query?.['data.id'] || req.query?.data_id || req.body?.data?.id;
  const signature = req.headers['x-signature'];
  const requestId = req.headers['x-request-id'];
  const secret = process.env.MP_WEBHOOK_SECRET;

  if (!secret || !validateWebhookSignature({ xSignature: signature, xRequestId: requestId, dataId, secret })) {
    return res.status(401).json({ error: 'Webhook não autenticado.' });
  }

  try {
    const order = await mpRequest(`/v1/orders/${encodeURIComponent(dataId)}`, { method: 'GET' });
    const status = mapStatus(order);
    const paidAt = status === 'paid' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null;
    const db = getPool();
    await ensurePaymentsSchema(db);
    const [result] = await db.execute(
      `UPDATE fm_orders SET status=?,status_detail=?,paid_at=COALESCE(?,paid_at) WHERE mp_order_id=? OR mp_external_reference=?`,
      [status, order.status_detail || null, paidAt, order.id, order.external_reference || '']
    );

    return res.status(200).json({ received: true, updated: result.affectedRows, status });
  } catch (error) {
    console.error('payment/webhook', error);
    return res.status(500).json({ error: 'Falha ao processar webhook.' });
  }
};
