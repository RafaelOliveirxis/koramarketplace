const { getPool } = require('../_lib/db');
const { requireAuth, sign } = require('../_lib/auth');
const { applyCors } = require('../_lib/cors');

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Método não permitido.' });
  const auth = requireAuth(req, res);
  if (!auth) return;

  try {
    const { name, email, phone = null } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedName = String(name || '').trim();
    if (!normalizedName || !normalizedEmail) {
      return res.status(400).json({ error: 'Nome e e-mail são obrigatórios.' });
    }

    const db = getPool();
    const [existing] = await db.execute(
      'SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1',
      [normalizedEmail, auth.id]
    );
    if (existing.length) return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });

    await db.execute(
      'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?',
      [normalizedName, normalizedEmail, phone ? String(phone).trim() : null, auth.id]
    );
    const user = { id: auth.id, name: normalizedName, email: normalizedEmail, phone: phone ? String(phone).trim() : null };
    return res.json({ user, token: sign(user) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Não foi possível atualizar o perfil.' });
  }
};
