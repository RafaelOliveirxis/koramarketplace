const { getPool } = require('../_lib/db');
const { bcrypt, sign } = require('../_lib/auth');
const { applyCors } = require('../_lib/cors');

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  try {
    const { name, email, password, phone = null } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
    if (password.length < 6) return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
    const db = getPool();
    const [exists] = await db.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email.trim().toLowerCase()]);
    if (exists.length) return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    const hash = await bcrypt.hash(password, 12);
    const [result] = await db.execute('INSERT INTO users (name,email,phone,password_hash,email_verified) VALUES (?,?,?,?,0)', [name.trim(), email.trim().toLowerCase(), phone, hash]);
    const user = { id: result.insertId, name: name.trim(), email: email.trim().toLowerCase() };
    return res.status(201).json({ user, token: sign(user) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Não foi possível criar a conta.' });
  }
};
