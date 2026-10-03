async function getMicrosoftAccessToken() {
  const tenant = process.env.MICROSOFT_TENANT_ID || 'consumers';
  const response = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET,
      refresh_token: process.env.MICROSOFT_REFRESH_TOKEN,
      grant_type: 'refresh_token',
      scope: 'https://graph.microsoft.com/Mail.Send offline_access'
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || 'Não foi possível obter o token OAuth2 da Microsoft.');
  }
  return data.access_token;
}

async function sendPasswordResetEmail({ email, name, resetUrl }) {
  const accessToken = await getMicrosoftAccessToken();
  const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: {
        subject: 'Redefina sua senha | FlashMarket',
        body: {
          contentType: 'HTML',
          content: `<p>Olá, ${name || 'cliente'}!</p><p>Use o botão abaixo para criar uma nova senha:</p><p><a href="${resetUrl}">Redefinir minha senha</a></p><p>O link expira em 1 hora. Se você não solicitou isso, ignore este e-mail.</p>`
        },
        toRecipients: [{ emailAddress: { address: email } }]
      },
      saveToSentItems: true
    })
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error?.message || 'Não foi possível enviar o e-mail pelo Microsoft Graph.');
  }
}

module.exports = { sendPasswordResetEmail };

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

async function sendOrderEventEmail({ email, name, orderId, title, description, trackingCode, carrier }) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL || !email) return { skipped: true };
  const safeName = escapeHtml(name || 'cliente');
  const safeOrder = escapeHtml(orderId);
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description || '');
  const safeCarrier = escapeHtml(carrier || '');
  const safeTracking = escapeHtml(trackingCode || '');
  const frontendUrl = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
  const trackingUrl = frontendUrl ? frontendUrl + '/rastrear-pedidos.html?order=' + encodeURIComponent(orderId) : '';
  const button = trackingUrl ? '<p><a href="' + trackingUrl + '" style="display:inline-block;padding:12px 18px;background:#ffc21c;color:#111;text-decoration:none;border-radius:8px;font-weight:700">ACOMPANHAR PEDIDO</a></p>' : '';
  const tracking = safeTracking ? '<p><b>' + safeCarrier + '</b>: ' + safeTracking + '</p>' : '';
  const html = '<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#151619"><h2>FlashMarket</h2><p>Olá, ' + safeName + '!</p><h3>' + safeTitle + '</h3><p>Pedido <b>#' + safeOrder + '</b></p><p>' + safeDescription + '</p>' + tracking + button + '<p style="font-size:12px;color:#777">Você recebeu esta atualização porque houve uma alteração real no seu pedido.</p></div>';
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL,
      to: [email],
      subject: safeTitle + ' | Pedido #' + safeOrder + ' | FlashMarket',
      html,
      headers: { 'X-Entity-Ref-ID': 'flashmarket-order-' + String(orderId) + '-' + String(title).replace(/\s+/g, '-').toLowerCase().slice(0, 60) }
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Falha ao enviar e-mail transacional.');
  return { id: data.id };
}

module.exports = { sendPasswordResetEmail, sendOrderEventEmail };