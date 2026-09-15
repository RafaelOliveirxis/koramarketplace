const { getPool } = require('../_lib/db');
const { applyCors } = require('../_lib/cors');

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  try {
    const { user_id, code } = req.body || {};
    if (!user_id) return res.status(400).json({ error: 'user_id é obrigatório.' });
    const db = getPool();
    await db.execute('INSERT INTO affiliate_clicks (user_id,code) VALUES (?,?)', [user_id, code || null]);
    return res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(error.code === 'ER_NO_SUCH_TABLE' ? 503 : 500).json({ error: 'Não foi possível registrar o clique.' });
  }
};
