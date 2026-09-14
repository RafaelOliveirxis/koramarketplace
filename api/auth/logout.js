const { applyCors } = require('../_lib/cors');

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  // JWT é stateless: o cliente remove o token. Para revogação imediata, adicione uma tabela de sessões/blacklist posteriormente.
  return res.json({ ok: true });
};
