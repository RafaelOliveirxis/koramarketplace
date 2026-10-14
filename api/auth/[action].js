// Dynamic authentication route: /api/auth/:action
// Keeps the authentication endpoints in one Vercel Function.
const handlers = {
  login: () => require('../_lib/handlers/auth/login'),
  logout: () => require('../_lib/handlers/auth/logout'),
  me: () => require('../_lib/handlers/auth/me'),
  profile: () => require('../_lib/handlers/auth/profile'),
  register: () => require('../_lib/handlers/auth/register'),
  'request-reset': () => require('../_lib/handlers/auth/request-reset'),
  'reset-password': () => require('../_lib/handlers/auth/reset-password')
};

module.exports = async (req, res) => {
  const pathname = String(req.url || '').split('?')[0];
  const action = pathname.split('/').filter(Boolean).pop();
  const load = handlers[action];
  if (!load) return res.status(404).json({ error: 'Endpoint de autenticação não encontrado.' });
  try {
    return await load()(req, res);
  } catch (error) {
    console.error('auth router', action, error);
    return res.status(500).json({ error: 'Erro interno da API.' });
  }
};
