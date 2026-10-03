const { getPool } = require('../_lib/db');
const { bcrypt, sign, normalizeEmail, validEmail, passwordStrength } = require('../_lib/auth');
const { applyCors } = require('../_lib/cors');

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  try {
    const name = String(req.body?.name || '').trim();
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');
    const phone = req.body?.phone ? String(req.body.phone).trim() : null;
    if (name.length < 2 || name.length > 120 || !validEmail(email) || !passwordStrength(password)) return res.status(400).json({ error: 'Informe nome, e-mail válido e uma senha de 8 a 128 caracteres.' });
    const db = getPool();
    const [exists] = await db.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (exists.length) return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    const hash = await bcrypt.hash(password, 12);
    const [result] = await db.execute('INSERT INTO users (name,email,phone,password_hash,email_verified) VALUES (?,?,?,?,0)', [name, email, phone, hash]);
    const user = { id: result.insertId, name, email, phone, email_verified: false };
    return res.status(201).json({ user, token: sign(user) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Não foi possível criar a conta.' });
  }
};
