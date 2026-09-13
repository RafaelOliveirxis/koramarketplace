const crypto = require('crypto');
const { getPool } = require('../_lib/db');
const { sendPasswordResetEmail } = require('../_lib/mailer');

const message = 'Se o e-mail estiver cadastrado, você receberá um link de recuperação em instantes.';

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!email) return res.status(400).json({ error: 'Informe seu e-mail.' });

  try {
    const db = getPool();
    const [users] = await db.execute('SELECT id,name,email FROM users WHERE email = ? LIMIT 1', [email]);
    if (!users.length) return res.status(200).json({ message });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    await db.execute('UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL', [users[0].id]);
    await db.execute('INSERT INTO password_reset_tokens (user_id,token_hash,expires_at) VALUES (?,?,DATE_ADD(NOW(), INTERVAL 1 HOUR))', [users[0].id, tokenHash]);

    const appUrl = (process.env.APP_URL || 'http://localhost:5500/FlashMarket/').replace(/\/$/, '');
    await sendPasswordResetEmail({
      email: users[0].email,
      name: users[0].name,
      resetUrl: `${appUrl}/resetar-senha.html?token=${rawToken}`
    });
    return res.status(200).json({ message });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Não foi possível enviar o link de recuperação.' });
  }
};