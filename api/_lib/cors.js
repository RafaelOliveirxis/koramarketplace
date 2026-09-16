function applyCors(req, res) {
  const origin = req.headers.origin || '';
  const allowed = [
    'https://rafaeloliveirxis.github.io',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'null'
  ];

  // O navegador envia Origin: null quando o HTML é aberto diretamente via file://.
  // Isso permite testar o login localmente sem bloquear o acesso à API por CORS.
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }

  return false;
}

module.exports = { applyCors };
