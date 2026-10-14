const { randomUUID } = require('crypto');
const { getPool } = require('../../db');
const { requireAuth } = require('../../auth');
const { applyCors } = require('../../cors');
const { ensurePaymentsSchema } = require('../../ensurePaymentsSchema');
const { ensureAffiliateSchema } = require('../../ensureAffiliateSchema');

const MIN_WITHDRAWAL = 50;
const clean = (value, max = 255) => String(value || '').trim().slice(0, max);
function normalizePixType(value) {
  const type = String(value || '').toUpperCase();
  return ['CPF','CNPJ','EMAIL','PHONE','PIX_CODE'].includes(type) ? type : null;
}
function statusForProvider(status, detail) {
  const s = String(status || '').toLowerCase();
  const d = String(detail || '').toLowerCase();
  if (s === 'success' || s === 'processed' || (s === 'approved' && d === 'accredited')) return 'paid';
  if (['error','rejected','canceled','cancelled','refunded'].includes(s)) return s === 'refunded' ? 'refunded' : 'failed';
  return 'processing';
}
function appBaseUrl() {
  const configured = String(process.env.APP_URL || process.env.PUBLIC_APP_URL || '').trim();
  if (configured) return configured.replace(/\/+$/, '');
  const vercel = String(process.env.VERCEL_PROJECT_PRODUCTION_URL || '').trim();
  return vercel ? 'https://' + vercel.replace(/\/+$/, '') : '';
}
async function mpRequest(path, { token, mode, method='GET', body, idempotencyKey } = {}) {
  const headers = { Authorization: 'Bearer ' + token, Accept: 'application/json' };
  if (body) headers['Content-Type'] = 'application/json';
  if (idempotencyKey) headers['X-Idempotency-Key'] = idempotencyKey;
  if (mode === 'sandbox') {
    headers['X-test-token'] = 'true';
    headers['X-enforce-signature'] = 'false';
  } else {
    // Payouts in production require Mercado Pago's request-signature mechanism.
    // Do not make a real-money request until the signature/key flow is configured.
    const error = new Error('O ambiente de produção exige assinatura de requisição do Mercado Pago; mantenha o modo sandbox até concluir essa configuração.');
    error.code = 'MP_PRODUCTION_SIGNATURE_REQUIRED';
    throw error;
  }
  const response = await fetch('https://api.mercadopago.com' + path, {
    method, headers, ...(body ? { body: JSON.stringify(body) } : {})
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || data.error || 'Mercado Pago recusou a solicitação de payout.');
    error.status = response.status;
    error.provider = data;
    throw error;
  }
  return data;
}

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  const user = requireAuth(req, res);
  if (!user) return;

  const body = req.body || {};
  const amount = Number(body.amount);
  const pixKey = clean(body.pixKey, 255);
  const pixKeyType = normalizePixType(body.pixKeyType);
  if (!Number.isFinite(amount) || amount < MIN_WITHDRAWAL) return res.status(400).json({ error: 'O saque mínimo é de R$ 50,00.' });
  if (!pixKey || !pixKeyType) return res.status(400).json({ error: 'Informe a chave PIX e o tipo correspondente.' });
  if (pixKeyType === 'EMAIL' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pixKey)) return res.status(400).json({ error: 'A chave PIX de e-mail não parece válida.' });
  if (pixKeyType === 'PHONE' && pixKey.replace(/\D/g, '').length < 10) return res.status(400).json({ error: 'Informe um telefone com DDD.' });
  if (!['CPF','CNPJ','EMAIL','PHONE','PIX_CODE'].includes(pixKeyType)) return res.status(400).json({ error: 'Tipo de chave PIX inválido.' });

  const roundedAmount = Number(amount.toFixed(2));
  if (roundedAmount > 10000000000) return res.status(400).json({ error: 'Valor acima do limite permitido.' });
  const externalReference = 'FM-WD-' + Date.now().toString(36).toUpperCase() + '-' + randomUUID().slice(0, 8).toUpperCase();
  const idempotencyKey = randomUUID();

  try {
    const db = getPool();
    await ensurePaymentsSchema(db);
    await ensureAffiliateSchema(db);

    const connection = await db.getConnection();
    let withdrawalId;
    try {
      await connection.beginTransaction();
      const [profileRows] = await connection.execute('SELECT commission_rate FROM affiliate_profiles WHERE user_id=? LIMIT 1 FOR UPDATE', [user.id]);
      if (!profileRows.length) {
        await connection.rollback();
        return res.status(400).json({ error: 'Seu cadastro ainda não possui perfil de afiliado.' });
      }
      const rate = Number(profileRows[0].commission_rate || 18) / 100;
      const [paidRows] = await connection.execute("SELECT COALESCE(SUM(GREATEST(0,total_amount-shipping_amount)),0) AS total FROM fm_orders WHERE affiliate_user_id=? AND LOWER(status) IN ('paid','processed','approved','pago')", [user.id]);
      const [withdrawnRows] = await connection.execute("SELECT COALESCE(SUM(amount),0) AS total FROM affiliate_withdrawals WHERE user_id=? AND status IN ('pending','processing','paid')", [user.id]);
      const grossCommission = Number(paidRows[0]?.total || 0) * rate;
      const alreadyWithdrawn = Number(withdrawnRows[0]?.total || 0);
      const available = Math.max(0, Number((grossCommission - alreadyWithdrawn).toFixed(2)));
      if (roundedAmount > available) {
        await connection.rollback();
        return res.status(400).json({ error: 'Saldo insuficiente para este saque.', available });
      }
      const [insert] = await connection.execute(
        'INSERT INTO affiliate_withdrawals (user_id,external_reference,amount,pix_key,pix_key_type,status,idempotency_key) VALUES (?,?,?,?,?,?,?)',
        [user.id,externalReference,roundedAmount,pixKey,pixKeyType,'pending',idempotencyKey]
      );
      withdrawalId = insert.insertId;
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    const enabled = String(process.env.MP_PAYOUTS_ENABLED || '').toLowerCase() === 'true';
    const mode = String(process.env.MP_PAYOUTS_MODE || 'sandbox').toLowerCase();
    const token = clean(process.env.MP_PAYOUTS_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN, 1000);
    if (!enabled) {
      return res.status(202).json({
        success: true, status: 'pending', externalReference,
        message: 'Solicitação registrada. O envio automático está desativado até que a integração de Payouts seja habilitada no servidor.'
      });
    }
    if (!token) {
      await db.execute("UPDATE affiliate_withdrawals SET status='failed',provider_status='configuration_error',provider_detail='Token de acesso do Mercado Pago ausente' WHERE id=?", [withdrawalId]);
      return res.status(503).json({ error: 'Configure MP_PAYOUTS_ACCESS_TOKEN nas variáveis de ambiente da Vercel.' });
    }
    if (!['sandbox','production'].includes(mode)) {
      await db.execute("UPDATE affiliate_withdrawals SET status='failed',provider_status='configuration_error',provider_detail='Modo de payout inválido' WHERE id=?", [withdrawalId]);
      return res.status(503).json({ error: 'MP_PAYOUTS_MODE deve ser sandbox ou production.' });
    }
    try {
      const base = appBaseUrl();
      const secret = clean(process.env.MP_PAYOUTS_WEBHOOK_SECRET, 300);
      const notificationUrl = base && secret ? base + '/api/affiliate/payout-webhook?key=' + encodeURIComponent(secret) : '';
      const payoutBody = {
        external_reference: externalReference,
        description: 'FlashMarket affiliate withdrawal',
        ...(notificationUrl ? { config: { notification_url: notificationUrl } } : {}),
        transactions: [{
          description: 'FlashMarket affiliate commission',
          type: 'pix',
          pix: { type: pixKeyType, chave: pixKey },
          amount: { currency: 'BRL', value: roundedAmount },
          external_reference: externalReference
        }]
      };
      const payout = await mpRequest('/v1/payouts', { token, mode, method: 'POST', body: payoutBody, idempotencyKey });
      const transaction = Array.isArray(payout.transactions) ? payout.transactions[0] : null;
      const providerStatus = String(transaction?.status || payout.status || 'created');
      const localStatus = statusForProvider(providerStatus, transaction?.status_detail);
      await db.execute(
        'UPDATE affiliate_withdrawals SET status=?,provider_id=?,provider_payout_id=?,provider_transaction_id=?,provider_status=?,provider_detail=? WHERE id=?',
        [localStatus, String(transaction?.id || payout.id || '').slice(0,120) || null, String(payout.id || '').slice(0,120) || null, String(transaction?.id || '').slice(0,120) || null, providerStatus.slice(0,80), String(transaction?.status_detail || payout.status || '').slice(0,255), withdrawalId]
      );
      return res.status(202).json({
        success: true, status: localStatus, externalReference,
        provider: 'mercado_pago', providerStatus,
        message: localStatus === 'paid' ? 'O Mercado Pago confirmou a transferência.' : 'Solicitação enviada ao Mercado Pago para processamento. A confirmação depende do status final da transação.'
      });
    } catch (error) {
      const providerStatus = error.code === 'MP_PRODUCTION_SIGNATURE_REQUIRED' ? 'production_signature_required' : 'provider_error';
      await db.execute(
        "UPDATE affiliate_withdrawals SET status='failed',provider_status=?,provider_detail=? WHERE id=?",
        [providerStatus, String(error.message || 'Falha ao solicitar payout').slice(0,255), withdrawalId]
      );
      console.error('affiliate/withdraw Mercado Pago error', error.status || error.code || '', error.message || '');
      if (error.code === 'MP_PRODUCTION_SIGNATURE_REQUIRED') {
        return res.status(503).json({ error: 'Payouts de produção bloqueados por segurança.', message: 'A assinatura exigida pelo Mercado Pago para produção ainda precisa ser configurada. Nenhum PIX foi enviado.' });
      }
      return res.status(502).json({ error: 'O Mercado Pago não aceitou a solicitação de saque.', message: 'A solicitação foi marcada como falha para não bloquear seu saldo. Confira as credenciais e o acesso à API de Payouts.' });
    }
  } catch (error) {
    console.error('affiliate/withdraw', error);
    if (error.code === 'ER_NO_SUCH_TABLE') return res.status(503).json({ error: 'Execute o schema principal do FlashMarket antes de usar saques.' });
    return res.status(500).json({ error: 'Não foi possível registrar o saque.' });
  }
};
