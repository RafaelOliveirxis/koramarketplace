// Catch-all API router to stay within Vercel Hobby's serverless function limit.
// Existing public API paths remain unchanged.
const routes = {
  'affiliate/dashboard': () => require('./_lib/handlers/affiliate/dashboard'),
  'affiliate/products': () => require('./_lib/handlers/affiliate/products'),
  'affiliate/withdraw': () => require('./_lib/handlers/affiliate/withdraw'),
  'auth/login': () => require('./_lib/handlers/auth/login'),
  'auth/logout': () => require('./_lib/handlers/auth/logout'),
  'auth/me': () => require('./_lib/handlers/auth/me'),
  'auth/profile': () => require('./_lib/handlers/auth/profile'),
  'auth/register': () => require('./_lib/handlers/auth/register'),
  'auth/request-reset': () => require('./_lib/handlers/auth/request-reset'),
  'auth/reset-password': () => require('./_lib/handlers/auth/reset-password'),
  'orders/tracking': () => require('./_lib/handlers/orders/tracking'),
  'payments/create': () => require('./_lib/handlers/payments/create'),
  'payments/status': () => require('./_lib/handlers/payments/status'),
  'payments/webhook': () => require('./_lib/handlers/payments/webhook'),
  'products': () => require('./_lib/handlers/products')
};

module.exports = async (req, res) => {
  const parts = String(req.url || '').split('?')[0].split('/').filter(Boolean);
  const pathname = parts[0] === 'api' ? parts.slice(1).join('/') : parts.join('/');
  const load = routes[pathname];
  if (!load) return res.status(404).json({ error: 'Endpoint da API não encontrado.' });
  try {
    return await load()(req, res);
  } catch (error) {
    console.error('api router', pathname, error);
    return res.status(500).json({ error: 'Erro interno da API.' });
  }
};
