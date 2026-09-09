const { getPool } = require('../_lib/db');
const { bcrypt, sign } = require('../_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    const db = getPool();
    const [rows] = await db.execute('SELECT id,name,email,phone,password_hash,email_verified FROM users WHERE email = ? LIMIT 1', [email.trim().toLowerCase()]);
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash))) return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    const user = { id: rows[0].id, name: rows[0].name, email: rows[0].email, phone: rows[0].phone, email_verified: !!rows[0].email_verified };
    return res.status(200).json({ user, token: sign(user) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Não foi possível entrar na conta.' });
  }
};
