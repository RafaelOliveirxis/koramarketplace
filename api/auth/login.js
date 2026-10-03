const { getPool } = require('../_lib/db');
const { bcrypt, sign, normalizeEmail, validEmail } = require('../_lib/auth');
const { applyCors } = require('../_lib/cors');

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');
    if (!validEmail(email) || !password) return res.status(400).json({ error: 'Informe um e-mail válido e sua senha.' });
    const db = getPool();
    const [rows] = await db.execute('SELECT id,name,email,phone,password_hash,email_verified FROM users WHERE email = ? LIMIT 1', [email]);
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash))) return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    const user = { id: rows[0].id, name: rows[0].name, email: rows[0].email, phone: rows[0].phone, email_verified: !!rows[0].email_verified };
    return res.status(200).json({ user, token: sign(user) });
  } catch (error) {
    console.error(error);
    if (error.code === 'CONFIGURATION_ERROR') {
      return res.status(503).json({ error: 'A API ainda não foi configurada no servidor. Configure o banco de dados e tente novamente.' });
    }
    return res.status(500).json({ error: 'Não foi possível entrar na conta.' });
  }
};
