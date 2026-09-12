const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

function sign(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function getToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

function requireAuth(req, res) {
  const token = getToken(req);
  if (!token) {
    res.status(401).json({ error: 'Não autenticado.' });
    return null;
  }
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    res.status(401).json({ error: 'Sessão inválida ou expirada.' });
    return null;
  }
}

module.exports = { bcrypt, sign, requireAuth };
