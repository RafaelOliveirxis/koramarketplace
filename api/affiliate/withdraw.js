const { randomUUID } = require('crypto');
const { getPool } = require('../_lib/db');
const { requireAuth } = require('../_lib/auth');
const { applyCors } = require('../_lib/cors');

const MIN_WITHDRAWAL = 50;

function clean(value, max = 255) { return String(value || '').trim().slice(0, max); }
function normalizePixType(value) {
  const type = String(value || '').toUpperCase();
  return ['CPF','CNPJ','EMAIL','PHONE','PIX_CODE'].includes(type) ? type : null;
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
  if (!pixKey || !pixKeyType) return res.status(400).json({ error: 'Informe uma chave PIX válida e o tipo da chave.' });

  const roundedAmount = Number(amount.toFixed(2));
  const externalReference = 'FM-WD-' + Date.now().toString(36).toUpperCase() + '-' + randomUUID().slice(0, 8).toUpperCase();
  const idempotencyKey = randomUUID();

  try {
    const db = getPool();
    await db.execute(`CREATE TABLE IF NOT EXISTS affiliate_withdrawals (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id BIGINT UNSIGNED NOT NULL,
      external_reference VARCHAR(100) NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      pix_key VARCHAR(255) NOT NULL,
      pix_key_type ENUM('CPF','CNPJ','EMAIL','PHONE','PIX_CODE') NOT NULL,
      status ENUM('pending','processing','paid','failed','refunded') NOT NULL DEFAULT 'pending',
      provider_id VARCHAR(120) NULL,
      provider_status VARCHAR(80) NULL,
      provider_detail VARCHAR(255) NULL,
      idempotency_key VARCHAR(100) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY(id),
      UNIQUE KEY uq_aff_withdraw_external(external_reference),
      UNIQUE KEY uq_aff_withdraw_idempotency(idempotency_key),
      KEY ix_aff_withdraw_user_status(user_id,status,created_at),
      CONSTRAINT fk_aff_withdraw_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    const [profileRows] = await db.execute('SELECT commission_rate FROM affiliate_profiles WHERE user_id=? LIMIT 1', [user.id]);
    if (!profileRows.length) return res.status(400).json({ error: 'Seu cadastro ainda não possui perfil de afiliado.' });

    const rate = Number(profileRows[0].commission_rate || 18) / 100;
    const [paidRows] = await db.execute("SELECT COALESCE(SUM(value),0) AS total FROM affiliate_orders WHERE user_id=? AND status='Pago'", [user.id]);
    const [withdrawnRows] = await db.execute("SELECT COALESCE(SUM(amount),0) AS total FROM affiliate_withdrawals WHERE user_id=? AND status IN ('pending','processing','paid')", [user.id]);

    const grossCommission = Number(paidRows[0]?.total || 0) * rate;
    const alreadyWithdrawn = Number(withdrawnRows[0]?.total || 0);
    const available = Number((grossCommission - alreadyWithdrawn).toFixed(2));
    if (roundedAmount > available) return res.status(400).json({ error: 'Saldo insuficiente para este saque.', available: Math.max(0, available) });

    await db.execute('INSERT INTO affiliate_withdrawals (user_id,external_reference,amount,pix_key,pix_key_type,status,idempotency_key) VALUES (?,?,?,?,?,?,?)', [user.id,externalReference,roundedAmount,pixKey,pixKeyType,'pending',idempotencyKey]);

    if (String(process.env.MP_PAYOUTS_ENABLED).toLowerCase() !== 'true') {
      return res.status(503).json({
        error: 'Saque real ainda não habilitado no servidor.',
        message: 'O pedido foi registrado com segurança. Para enviar o PIX de verdade, habilite o produto Payouts/Money Out do Mercado Pago e configure as credenciais de produção.'
      });
    }

    return res.status(501).json({
      error: 'Provedor de saque não configurado.',
      message: 'O cadastro do saque está pronto, mas o conector de Payouts precisa ser configurado no ambiente de produção antes de movimentar dinheiro.'
    });
  } catch (error) {
    console.error('affiliate/withdraw', error);
    if (error.code === 'ER_NO_SUCH_TABLE') return res.status(503).json({ error: 'Execute api/affiliate/setup.sql no banco antes de usar saques.' });
    return res.status(500).json({ error: 'Não foi possível registrar o saque.' });
  }
};