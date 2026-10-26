const { getPool } = require('./_lib/db');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Método não permitido.' });
  }

  try {
    const db = getPool();
    await db.execute('SELECT 1 AS healthy');
    return res.status(200).json({ ok: true, api: 'online', database: 'connected' });
  } catch (error) {
    console.error('health/database', error);
    const configured = error.code !== 'CONFIGURATION_ERROR';
    return res.status(503).json({
      ok: false,
      api: 'online',
      database: configured ? 'unavailable' : 'not_configured',
      error: 'O banco de dados não está disponível. Verifique as variáveis DB_* e o serviço MySQL.'
    });
  }
};
