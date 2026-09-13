const crypto = require('crypto');
const { getPool } = require('../_lib/db');
const { bcrypt } = require('../_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  const token = String(req.body?.token || '');
  const password = String(req.body?.password || '');
  if (!token || password.length < 6) return res.status(400).json({ error: 'Informe um token válido e uma senha com pelo menos 6 caracteres.' });

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const db = getPool();
    const [rows] = await db.execute('SELECT id,user_id FROM password_reset_tokens WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW() LIMIT 1', [tokenHash]);
    if (!rows.length) return res.status(400).json({ error: 'Este link é inválido ou expirou.' });

    const passwordHash = await bcrypt.hash(password, 12);
    await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, rows[0].user_id]);
    await db.execute('UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL', [rows[0].user_id]);
    return res.status(200).json({ message: 'Senha redefinida com sucesso.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Não foi possível redefinir a senha.' });
  }
};