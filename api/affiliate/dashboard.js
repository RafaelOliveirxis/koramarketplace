const { getPool } = require('../_lib/db');
const { requireAuth } = require('../_lib/auth');
const { applyCors } = require('../_lib/cors');

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' });
  const user = requireAuth(req, res);
  if (!user) return;

  try {
    const db = getPool();
    const days = Math.min(3650, Math.max(1, Number(req.query.days || 30)));
    const [profileRows] = await db.execute(
      'SELECT code, commission_rate FROM affiliate_profiles WHERE user_id = ? LIMIT 1',
      [user.id]
    );
    const profile = profileRows[0] || { code: null, commission_rate: 18 };
    const [productRows] = await db.execute(
      'SELECT id,name,category,price,status,created_at FROM affiliate_products WHERE user_id = ? ORDER BY created_at DESC',
      [user.id]
    );
    const [orderRows] = await db.execute(
      `SELECT id,external_id,customer_name,product_name,value,status,ordered_at
       FROM affiliate_orders WHERE user_id = ? AND ordered_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       ORDER BY ordered_at DESC`,
      [user.id, days]
    );
    const [clickRows] = await db.execute(
      `SELECT COUNT(*) AS clicks FROM affiliate_clicks WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [user.id, days]
    );

    const rate = Number(profile.commission_rate || 18) / 100;
    const paid = orderRows.filter(o => String(o.status).toLowerCase() === 'pago');
    const valid = orderRows.filter(o => !['cancelado', 'cancelada'].includes(String(o.status).toLowerCase()));
    const revenue = valid.reduce((sum, o) => sum + Number(o.value || 0), 0);
    const commission = paid.reduce((sum, o) => sum + Number(o.value || 0) * rate, 0);
    const customers = new Map();
    orderRows.forEach(o => { if (o.customer_name) customers.set(o.customer_name, (customers.get(o.customer_name) || 0) + 1); });
    const repeatCustomers = [...customers.values()].filter(n => n > 1).length;
    const retention = customers.size ? (repeatCustomers / customers.size) * 100 : 0;
    const clicks = Number(clickRows[0]?.clicks || 0);
    const conversion = clicks ? (paid.length / clicks) * 100 : 0;

    return res.status(200).json({
      profile: { code: profile.code, commission_rate: Number(profile.commission_rate || 18) },
      metrics: {
        revenue,
        activeProducts: productRows.filter(p => p.status === 'Ativo').length,
        conversion,
        liquidRevenue: commission,
        totalCommission: commission,
        activeOrders: paid.length,
        retention,
        clicks
      },
      products: productRows,
      orders: orderRows
    });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_NO_SUCH_TABLE') return res.status(503).json({ error: 'As tabelas da Área de Afiliados ainda não foram criadas. Execute api/auth/setup.sql.' });
    return res.status(500).json({ error: 'Não foi possível atualizar os dados do afiliado.' });
  }
};
