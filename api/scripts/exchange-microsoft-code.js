const fs = require('fs');
const path = require('path');

require('dotenv').config({
  quiet: true,
  path: path.resolve(__dirname, '..', '.env')
});

const code = process.env.OAUTH_CODE;
const redirectUri = 'http://localhost:3000/oauth/callback';

if (!code) {
  console.error('Defina OAUTH_CODE com o valor code da URL de retorno.');
  process.exit(1);
}

async function main() {
  const response = await fetch(`https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID || 'consumers'}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      scope: 'openid offline_access https://graph.microsoft.com/Mail.Send'
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.refresh_token) {
    throw new Error(data.error_description || 'A Microsoft não retornou um refresh token.');
  }

  const envPath = path.resolve(__dirname, '..', '.env');
  let env = fs.readFileSync(envPath, 'utf8');
  if (/^MICROSOFT_REFRESH_TOKEN=/m.test(env)) {
    env = env.replace(/^MICROSOFT_REFRESH_TOKEN=.*$/m, `MICROSOFT_REFRESH_TOKEN=${data.refresh_token}`);
  } else {
    env += `\nMICROSOFT_REFRESH_TOKEN=${data.refresh_token}\n`;
  }
  fs.writeFileSync(envPath, env);
  console.log('Refresh token salvo no api/.env com sucesso.');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
