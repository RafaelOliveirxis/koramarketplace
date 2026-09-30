const crypto = require('crypto');

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    const error = new Error(`Configuração ausente: ${name}`);
    error.code = 'CONFIGURATION_ERROR';
    throw error;
  }
  return value;
}

async function mpRequest(path, options = {}) {
  const token = requiredEnv('MP_ACCESS_TOKEN');
  const response = await fetch(`https://api.mercadopago.com${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!response.ok) {
    const error = new Error(data.message || data.error || `Mercado Pago retornou HTTP ${response.status}`);
    error.status = response.status;
    error.details = data;
    throw error;
  }
  return data;
}

function validateWebhookSignature({ xSignature, xRequestId, dataId, secret }) {
  if (!xSignature || !secret || !dataId) return false;
  const parts = Object.fromEntries(xSignature.split(',').map(part => {
    const index = part.indexOf('=');
    return index > 0 ? [part.slice(0, index), part.slice(index + 1)] : [part, ''];
  }));
  const ts = parts.ts;
  const received = parts.v1;
  if (!ts || !received) return false;
  const manifest = `id:${dataId};request-id:${xRequestId || ''};ts:${ts};`;
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  const a = Buffer.from(received, 'hex');
  const b = Buffer.from(expected, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { mpRequest, validateWebhookSignature, requiredEnv };
