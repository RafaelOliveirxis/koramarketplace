const { getPool } = require('../_lib/db');
const { requireAuth } = require('../_lib/auth');
const { applyCors } = require('../_lib/cors');
const { ensurePaymentsSchema } = require('../_lib/ensurePaymentsSchema');
const { ensureAffiliateSchema } = require('../_lib/ensureAffiliateSchema');

const moneyNumber = value => Number(value || 0);
const normalizedStatus = value => String(value || '').toLowerCase();
const isPaid = value => ['paid', 'processed', 'approved', 'pago'].includes(normalizedStatus(value));
const isCancelled = value => ['cancelled', 'canceled', 'cancelado', 'cancelada', 'failed', 'refunded', 'refunded'].includes(normalizedStatus(value));

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' });
  const user = requireAuth(req, res);
  if (!user) return;

  try {
    const db = getPool();
    await ensurePaymentsSchema(db);
    await ensureAffiliateSchema(db);
    const requestedDays = Number.parseInt(req.query.days || '30', 10);
    const days = Math.min(365, Math.max(1, Number.isFinite(requestedDays) ? requestedDays : 30));

    let [profileRows] = await db.execute(
      'SELECT code, commission_rate FROM affiliate_profiles WHERE user_id = ? LIMIT 1',
      [user.id]
    );

    if (!profileRows.length) {
      const base = String(user.name || String(user.email || 'AFILIADO').split('@')[0])
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase().slice(0, 8) || 'AFILIADO';
      const code = `FM-${base}-${String(user.id).padStart(3, '0')}`;
      await db.execute(
        'INSERT INTO affiliate_profiles (user_id,code,commission_rate) VALUES (?,?,18)',
        [user.id, code]
      );
      profileRows = [{ code, commission_rate: 18 }];
    }

    const profile = profileRows[0];
    const rate = moneyNumber(profile.commission_rate || 18) / 100;

    // Catálogo ativo real do marketplace; nunca mistura produtos de outros afiliados.
    const [productRows] = await db.execute(
      'SELECT product_id AS id, name, price, active FROM fm_catalog WHERE active = 1 ORDER BY name ASC LIMIT 100'
    );

    // Vendas atribuídas no checkout real. O filtro de user_id é sempre aplicado no servidor.
    const [orderRows] = await db.execute(
      `SELECT o.id, o.public_id AS external_id, o.customer_name,
              COALESCE(GROUP_CONCAT(DISTINCT i.product_name ORDER BY i.id SEPARATOR ', '), 'Pedido FlashMarket') AS product_name,
              GREATEST(0, o.total_amount - o.shipping_amount) AS value,
              o.status, o.created_at AS ordered_at
       FROM fm_orders o
       LEFT JOIN fm_order_items i ON i.order_id = o.id
       WHERE o.affiliate_user_id = ?
         AND o.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY o.id, o.public_id, o.customer_name, o.total_amount, o.shipping_amount, o.status, o.created_at
       ORDER BY o.created_at DESC LIMIT 200`,
      [user.id, days]
    );

    const [clickRows] = await db.execute(
      'SELECT COUNT(*) AS clicks FROM affiliate_clicks WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)',
      [user.id, days]
    );
    const [dailyRows] = await db.execute(
      `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS day, COUNT(*) AS clicks
       FROM affiliate_clicks
       WHERE user_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       GROUP BY DATE(created_at) ORDER BY DATE(created_at)`,
      [user.id]
    );
    const [withdrawRows] = await db.execute(
      "SELECT COALESCE(SUM(amount),0) AS total FROM affiliate_withdrawals WHERE user_id = ? AND status IN ('pending','processing','paid')",
      [user.id]
    );

    const [lifetimeCommissionRows] = await db.execute("SELECT COALESCE(SUM(GREATEST(0,total_amount-shipping_amount)),0) AS value FROM fm_orders WHERE affiliate_user_id = ? AND status IN ('paid','processed','approved','pago')", [user.id]);

    const paidOrders = orderRows.filter(o => isPaid(o.status));
    const validOrders = orderRows.filter(o => !isCancelled(o.status));
    const revenue = validOrders.reduce((sum, order) => sum + moneyNumber(order.value), 0);
    const totalCommission = moneyNumber(lifetimeCommissionRows[0]?.value) * rate;
    const withdrawn = moneyNumber(withdrawRows[0]?.total);
    const availableCommission = Math.max(0, Number((totalCommission - withdrawn).toFixed(2)));
    const clicks = moneyNumber(clickRows[0]?.clicks);
    const conversion = clicks ? (paidOrders.length / clicks) * 100 : 0;

    const clicksByDay = [];
    for (let offset = 6; offset >= 0; offset--) {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      date.setDate(date.getDate() - offset);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const found = dailyRows.find(row => String(row.day).slice(0, 10) === key);
      clicksByDay.push({ day: key, label: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''), clicks: moneyNumber(found?.clicks) });
    }

    return res.status(200).json({
      profile: { code: profile.code, commission_rate: Number(profile.commission_rate || 18) },
      metrics: {
        revenue, activeProducts: productRows.length, conversion,
        liquidRevenue: availableCommission, totalCommission, withdrawn,
        availableCommission, activeOrders: paidOrders.length, clicks
      },
      clicksByDay,
      products: productRows,
      orders: orderRows
    });
  } catch (error) {
    console.error('affiliate/dashboard', error);
    if (error.code === 'ER_NO_SUCH_TABLE' || /tabela obrigatória/.test(String(error.message || ''))) {
      return res.status(503).json({ error: 'Não foi possível preparar a Área de Afiliados. Confirme que o schema principal do FlashMarket (users, fm_orders e fm_catalog) foi criado no banco configurado na Vercel.' });
    }
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(503).json({ error: 'O banco ainda não possui os campos de atribuição de afiliados. Execute novamente api/affiliate/setup.sql.' });
    }
    return res.status(500).json({ error: 'Não foi possível atualizar os dados do afiliado.' });
  }
};
