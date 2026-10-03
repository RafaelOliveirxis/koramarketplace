const { getPool } = require('../_lib/db');
const { mpRequest } = require('../_lib/mercadopago');
const { applyCors } = require('../_lib/cors');
const { ensurePaymentsSchema } = require('../_lib/ensurePaymentsSchema');

function mapStatus(order) {
  const status = String(order?.status || '').toLowerCase();
  const detail = String(order?.status_detail || '').toLowerCase();
  if (status === 'processed' || detail.includes('accredited')) return 'paid';
  if (status === 'action_required') return 'action_required';
  if (status === 'failed') return 'failed';
  if (status === 'refunded') return 'refunded';
  if (status === 'canceled' || status === 'cancelled') return 'cancelled';
  if (status === 'processing') return 'pending';
  return 'pending';
}

const eventMap = {
  paid: ['paid','Pagamento confirmado','Pagamento aprovado. O pedido está registrado e aguardando processamento logístico.'],
  pending: ['pending','Pagamento em processamento','Aguardando confirmação do pagamento.'],
  action_required: ['action_required','Ação necessária no pagamento','É necessária uma ação para concluir o pagamento.'],
  failed: ['failed','Pagamento não concluído','O pagamento não foi concluído.'],
  cancelled: ['cancelled','Pedido cancelado','O pedido/pagamento foi cancelado.'],
  refunded: ['refunded','Pagamento reembolsado','O pagamento foi reembolsado.']
};

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' });
  const query = String(req.query?.order || '').trim();
  if (!query) return res.status(400).json({ error: 'Informe o número do pedido ou código de rastreio.' });

  try {
    const db = getPool();
    await ensurePaymentsSchema(db);

    const [rows] = await db.execute(
      `SELECT o.id,o.public_id,o.total_amount,o.status,o.status_detail,o.mp_order_id,o.created_at,o.paid_at,
              t.tracking_code,t.carrier
       FROM fm_orders o
       LEFT JOIN fm_order_tracking t ON t.id=(
         SELECT t2.id FROM fm_order_tracking t2
         WHERE t2.order_id=o.id AND t2.tracking_code IS NOT NULL AND t2.tracking_code<>''
         ORDER BY t2.event_at DESC,t2.id DESC LIMIT 1
       )
       WHERE o.public_id=? OR t.tracking_code=?
       LIMIT 1`,
      [query, query]
    );
    if (!rows.length) return res.status(404).json({ error: 'Pedido ou código de rastreio não encontrado.' });

    const local = rows[0];
    let remote = null;
    if (local.mp_order_id) {
      try { remote = await mpRequest('/v1/orders/' + encodeURIComponent(local.mp_order_id), { method: 'GET' }); } catch {}
    }

    const paymentStatus = remote ? mapStatus(remote) : mapStatus({ status: local.status, status_detail: local.status_detail });
    const remoteStatus = remote?.status || local.status;
    const remoteDetail = remote?.status_detail || local.status_detail || null;
    const paidAt = paymentStatus === 'paid' ? (local.paid_at || new Date()) : null;

    if (remote && ['paid','action_required','failed','refunded','cancelled'].includes(paymentStatus)) {
      await db.execute(
        'UPDATE fm_orders SET status=?,status_detail=?,paid_at=COALESCE(?,paid_at) WHERE id=?',
        [paymentStatus, remoteDetail, paidAt, local.id]
      );
    }

    const event = eventMap[paymentStatus];
    if (event) {
      const [latest] = await db.execute(
        'SELECT status FROM fm_order_tracking WHERE order_id=? ORDER BY event_at DESC,id DESC LIMIT 1',
        [local.id]
      );
      if (!latest.length || latest[0].status !== event[0]) {
        await db.execute(
          'INSERT INTO fm_order_tracking (order_id,status,title,description,tracking_code,carrier) VALUES (?,?,?,?,?,?)',
          [local.id,event[0],event[1],event[2],local.tracking_code || null,local.carrier || null]
        );
      }
    }

    const [trackingRows] = await db.execute(
      'SELECT status,title,description,tracking_code,carrier,event_at FROM fm_order_tracking WHERE order_id=? ORDER BY event_at ASC,id ASC',
      [local.id]
    );

    return res.status(200).json({
      order: {
        id: local.public_id,
        total: Number(local.total_amount),
        status: remoteStatus,
        paymentStatus,
        statusDetail: remoteDetail,
        paidAt: paidAt || local.paid_at,
        createdAt: local.created_at,
        trackingCode: local.tracking_code || null,
        carrier: local.carrier || null,
        tracking: trackingRows.map(event => ({
          status:event.status,title:event.title,description:event.description,
          trackingCode:event.tracking_code || null,carrier:event.carrier || null,date:event.event_at
        }))
      }
    });
  } catch (error) {
    console.error('payment/status', error);
    if (error.code === 'CONFIGURATION_ERROR') return res.status(503).json({ error: 'Configure o banco de dados no servidor.' });
    return res.status(500).json({ error: 'Não foi possível consultar o pedido.' });
  }
};