const { randomUUID } = require('crypto');
const { getPool } = require('../_lib/db');
const { mpRequest } = require('../_lib/mercadopago');
const { applyCors } = require('../_lib/cors');
const { getToken } = (() => { try { return require('../_lib/auth'); } catch { return {}; } })();
const jwt = require('jsonwebtoken');

function optionalUser(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ') || !process.env.JWT_SECRET) return null;
  try { return jwt.verify(header.slice(7), process.env.JWT_SECRET); } catch { return null; }
}

function clean(value, max = 255) { return String(value || '').trim().slice(0, max); }
function validEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });

  const body = req.body || {};
  const customer = body.customer || {};
  const address = body.address || {};
  const items = Array.isArray(body.items) ? body.items : [];
  const shippingAmount = Number(body.shippingAmount || 0);
  const paymentMethod = clean(body.paymentMethod, 30) || 'checkout_pro';

  if (!items.length) return res.status(400).json({ error: 'O carrinho está vazio.' });
  if (!['pix', 'card', 'boleto'].includes(paymentMethod)) return res.status(400).json({ error: 'Forma de pagamento inválida.' });
  if (![0, 19.9].includes(shippingAmount)) return res.status(400).json({ error: 'Frete inválido.' });

  const customerName = clean(customer.name, 120);
  const customerEmail = clean(customer.email, 190).toLowerCase();
  const customerPhone = clean(customer.phone, 30);
  const cep = clean(address.cep, 10);
  const state = clean(address.state, 2).toUpperCase();
  const city = clean(address.city, 100);
  const street = clean(address.address, 220);
  const complement = clean(address.complement, 120);

  if (!customerName || !validEmail(customerEmail) || !cep || !state || !city || !street) {
    return res.status(400).json({ error: 'Preencha nome, e-mail e todos os dados obrigatórios de entrega.' });
  }

  const normalized = items.map(item => ({ id: Number(item.id), qty: Math.floor(Number(item.qty)) }));
  if (normalized.some(item => !Number.isInteger(item.id) || item.id < 1 || !Number.isInteger(item.qty) || item.qty < 1 || item.qty > 50)) {
    return res.status(400).json({ error: 'Itens ou quantidades inválidos.' });
  }

  try {
    const db = getPool();
    const ids = [...new Set(normalized.map(item => item.id))];
    const placeholders = ids.map(() => '?').join(',');
    const [rows] = await db.execute(`SELECT product_id, name, price, active FROM fm_catalog WHERE active = 1 AND product_id IN (${placeholders})`, ids);
    const catalog = new Map(rows.map(row => [Number(row.product_id), row]));

    if (catalog.size !== ids.length) return res.status(400).json({ error: 'Um ou mais produtos não estão disponíveis.' });

    const orderItems = normalized.map(item => {
      const product = catalog.get(item.id);
      const unitPrice = Number(product.price);
      return { id: item.id, name: product.name, qty: item.qty, unitPrice, total: unitPrice * item.qty };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
    const total = Number((subtotal + shippingAmount).toFixed(2));
    const publicId = `FM-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 6).toUpperCase()}`;
    const externalReference = publicId.replace(/[^A-Z0-9_-]/g, '').slice(0, 64);
    const user = optionalUser(req);

    const [insert] = await db.execute(
      `INSERT INTO fm_orders (public_id,user_id,customer_name,customer_email,customer_phone,cep,state,city,address,complement,shipping_amount,payment_method,total_amount,status,mp_external_reference) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'creating',?)`,
      [publicId, user?.id || null, customerName, customerEmail, customerPhone || null, cep, state, city, street, complement || null, shippingAmount, paymentMethod, total, externalReference]
    );
    const orderId = insert.insertId;

    for (const item of orderItems) {
      await db.execute(
        'INSERT INTO fm_order_items (order_id,product_id,product_name,unit_price,quantity,total_amount) VALUES (?,?,?,?,?,?)',
        [orderId, item.id, item.name, item.unitPrice, item.qty, item.total]
      );
    }

    const mpOrder = await mpRequest('/v1/orders', {
      method: 'POST',
      headers: { 'X-Idempotency-Key': randomUUID() },
      body: JSON.stringify({
        type: 'online',
        processing_mode: 'manual',
        capture_mode: 'automatic_async',
        total_amount: total.toFixed(2),
        external_reference: externalReference,
        description: `Compra FlashMarket ${publicId}`,
        payer: { email: customerEmail, first_name: customerName.split(/\s+/)[0] },
        items: orderItems.map(item => ({
          title: item.name,
          quantity: item.qty,
          unit_measure: 'unit',
          unit_price: item.unitPrice.toFixed(2),
          total_amount: item.total.toFixed(2)
        }))
      })
    });

    await db.execute(
      'UPDATE fm_orders SET mp_order_id=?,mp_checkout_url=?,status=?,status_detail=? WHERE id=?',
      [mpOrder.id, mpOrder.checkout_url || null, mpOrder.status || 'created', mpOrder.status_detail || null, orderId]
    );

    return res.status(201).json({
      success: true,
      order: { id: publicId, total, status: mpOrder.status || 'created', checkoutUrl: mpOrder.checkout_url, mercadoPagoOrderId: mpOrder.id }
    });
  } catch (error) {
    console.error('payment/create', error);
    if (error.code === 'CONFIGURATION_ERROR') return res.status(503).json({ error: 'Configure MySQL e MP_ACCESS_TOKEN nas variáveis de ambiente.' });
    if (error.status >= 400 && error.status < 500) return res.status(502).json({ error: 'O Mercado Pago recusou a criação do pagamento.', details: error.details });
    return res.status(500).json({ error: 'Não foi possível iniciar o pagamento.' });
  }
};
