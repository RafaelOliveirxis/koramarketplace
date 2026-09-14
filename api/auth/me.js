const { getPool } = require('../_lib/db');
const { requireAuth } = require('../_lib/auth');
const { applyCors } = require('../_lib/cors');

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' });
  const auth = requireAuth(req, res);
  if (!auth) return;
  try {
    const db = getPool();
    const [rows] = await db.execute('SELECT id,name,email,phone,email_verified,created_at,updated_at FROM users WHERE id = ? LIMIT 1', [auth.id]);
    if (!rows.length) return res.status(404).json({ error: 'Usuário não encontrado.' });
    return res.json({ user: rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Não foi possível carregar a conta.' });
  }
};
