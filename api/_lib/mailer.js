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