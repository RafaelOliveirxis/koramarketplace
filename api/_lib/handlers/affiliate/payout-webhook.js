const { getPool } = require('../../db');
const { applyCors } = require('../../cors');
const { ensurePaymentsSchema } = require('../../ensurePaymentsSchema');
const { ensureAffiliateSchema } = require('../../ensureAffiliateSchema');

function localStatus(status, detail) {
  const s = String(status || '').toLowerCase();
  const d = String(detail || '').toLowerCase();
  if (s === 'success' || s === 'processed' || (s === 'approved' && d === 'accredited')) return 'paid';
  if (s === 'refunded') return 'refunded';
  if (['error','rejected','canceled','cancelled'].includes(s)) return 'failed';
  return 'processing';
}

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  const expected = String(process.env.MP_PAYOUTS_WEBHOOK_SECRET || '');
  const received = String(req.query?.key || '');
  if (!expected || !received || received.length !== expected.length || received !== expected) {
    return res.status(401).json({ error: 'Notificação não autorizada.' });
  }
  const token = String(process.env.MP_PAYOUTS_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN || '');
  if (!token) return res.status(503).json({ error: 'Provedor ainda não configurado.' });
  const payload = req.body || {};
  const payoutId = String(payload.payout?.id || payload.payout_id || '').trim();
  const transactionId = String(payload.id || payload.transaction_id || '').trim();
  const externalReference = String(payload.external_reference || '').trim();
  if (!payoutId || !transactionId || !externalReference) return res.status(400).json({ error: 'Evento de payout incompleto.' });
  try {
    const db = getPool();
    await ensurePaymentsSchema(db);
    await ensureAffiliateSchema(db);
    const [rows] = await db.execute(
      'SELECT id FROM affiliate_withdrawals WHERE external_reference=? AND provider_payout_id=? AND provider_transaction_id=? LIMIT 1',
      [externalReference,payoutId,transactionId]
    );
    if (!rows.length) return res.status(200).json({ received: true, ignored: true });
    const mode = String(process.env.MP_PAYOUTS_MODE || 'sandbox').toLowerCase();
    const headers = { Authorization: 'Bearer ' + token, Accept: 'application/json' };
    if (mode === 'sandbox') { headers['X-test-token']='true'; headers['X-enforce-signature']='false'; }
    else return res.status(503).json({ error: 'A consulta de status em produção requer a assinatura de Payouts configurada.' });
    const response = await fetch('https://api.mercadopago.com/v1/payouts/'+encodeURIComponent(payoutId)+'/transactions/'+encodeURIComponent(transactionId), { headers });
    const verified = await response.json().catch(()=>({}));
    if (!response.ok) return res.status(502).json({ error: 'Não foi possível confirmar o evento com o Mercado Pago.' });
    if (String(verified.external_reference || '') !== externalReference) return res.status(400).json({ error: 'Referência externa não corresponde.' });
    const status = localStatus(verified.status, verified.status_detail);
    await db.execute(
      'UPDATE affiliate_withdrawals SET status=?,provider_status=?,provider_detail=? WHERE id=?',
      [status,String(verified.status || '').slice(0,80),String(verified.status_detail || '').slice(0,255),rows[0].id]
    );
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('affiliate/payout-webhook', error);
    return res.status(500).json({ error: 'Falha ao processar notificação.' });
  }
};
