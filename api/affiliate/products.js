const { getPool } = require('../_lib/db');
const { requireAuth } = require('../_lib/auth');
const { applyCors } = require('../_lib/cors');

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;
  const user = requireAuth(req, res);
  if (!user) return;
  try {
    const db = getPool();
    if (req.method === 'GET') {
      const [rows] = await db.execute('SELECT id,name,category,price,status,created_at FROM affiliate_products WHERE user_id = ? ORDER BY created_at DESC', [user.id]);
      return res.json({ products: rows });
    }
    if (req.method === 'POST') {
      const { name, category, price, status = 'Ativo' } = req.body || {};
      if (!name || !category || !Number.isFinite(Number(price))) return res.status(400).json({ error: 'Nome, categoria e preço são obrigatórios.' });
      const [result] = await db.execute('INSERT INTO affiliate_products (user_id,name,category,price,status) VALUES (?,?,?,?,?)', [user.id, String(name).trim(), String(category).trim(), Number(price), status]);
      return res.status(201).json({ id: result.insertId });
    }
    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (error) {
    console.error(error);
    return res.status(error.code === 'ER_NO_SUCH_TABLE' ? 503 : 500).json({ error: error.code === 'ER_NO_SUCH_TABLE' ? 'Configure as tabelas de afiliados no MySQL.' : 'Não foi possível atualizar os produtos.' });
  }
};
