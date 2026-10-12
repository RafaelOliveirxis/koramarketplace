const { getPool } = require('../../db');
const { requireAuth } = require('../../auth');
const { applyCors } = require('../../cors');

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;
  const body = req.body || {};
  if (req.method === 'POST' && body.action === 'click') {
    try {
      const db = getPool();
      const code = String(body.code || '').trim().slice(0, 80);
      if (!code) return res.status(400).json({ error: 'Código de afiliado ausente.' });
      const [profiles] = await db.execute('SELECT user_id FROM affiliate_profiles WHERE code = ? LIMIT 1', [code]);
      if (!profiles.length) return res.status(404).json({ error: 'Código de afiliado inválido.' });
      await db.execute('INSERT INTO affiliate_clicks (user_id,code) VALUES (?,?)', [profiles[0].user_id, code]);
      return res.status(201).json({ success: true });
    } catch (error) {
      return res.status(error.code === 'ER_NO_SUCH_TABLE' ? 503 : 500).json({ error: 'Não foi possível registrar o clique.' });
    }
  }
  const user = requireAuth(req, res);
  if (!user) return;
  try {
    const db = getPool();
    if (req.method === 'GET') {
      const [rows] = await db.execute('SELECT id,name,category,price,status,created_at FROM affiliate_products WHERE user_id = ? ORDER BY created_at DESC', [user.id]);
      return res.json({ products: rows });
    }
    if (req.method === 'POST') {
      const body = req.body || {};
      if (body.action === 'click' || body.user_id) return res.status(400).json({ error: 'Use o endpoint público de cliques com um código válido.' });
      const { name, category, price, status = 'Ativo' } = body;
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
