const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

function sign(user) {
  if (!process.env.JWT_SECRET) { const error = new Error('JWT_SECRET não configurado.'); error.code='CONFIGURATION_ERROR'; throw error; }
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function getToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : null;
}

function requireAuth(req, res) {
  const token = getToken(req);
  if (!token) { res.status(401).json({ error: 'Não autenticado.' }); return null; }
  if (!process.env.JWT_SECRET) { res.status(503).json({ error: 'Autenticação indisponível no momento.' }); return null; }
  try { return jwt.verify(token, process.env.JWT_SECRET); }
  catch { res.status(401).json({ error: 'Sessão inválida ou expirada.' }); return null; }
}

function normalizeEmail(value) { return String(value || '').trim().toLowerCase(); }
function validEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
function passwordStrength(value) { return typeof value === 'string' && value.length >= 8 && value.length <= 128; }

module.exports = { bcrypt, sign, requireAuth, normalizeEmail, validEmail, passwordStrength };