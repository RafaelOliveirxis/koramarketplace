# KoraMarketplace API

API serverless da autenticação real do KoraMarketplace.

## Banco MySQL

Execute `api/auth/setup.sql` no seu MySQL.

## Variáveis de ambiente na Vercel

Configure em **Project Settings → Environment Variables**:

```text
DB_HOST=seu-host-mysql
DB_PORT=3306
DB_USER=seu-usuario
DB_PASSWORD=sua-senha
DB_NAME=koramarketplace
DB_SSL=true
JWT_SECRET=uma-chave-aleatoria-longa-e-secreta
APP_URL=https://seu-dominio.com/FlashMarket/
MAIL_FROM="FlashMarket <seu-email@outlook.com>"
MICROSOFT_TENANT_ID=consumers
MICROSOFT_CLIENT_ID=seu-client-id
MICROSOFT_CLIENT_SECRET=seu-client-secret
MICROSOFT_REFRESH_TOKEN=seu-refresh-token
```

Não coloque essas credenciais no GitHub ou no código do front-end.

## Endpoints

- `POST /api/auth/register` — cadastro
- `POST /api/auth/login` — login
- `POST /api/auth/logout` — logout
- `GET /api/auth/me` — usuário autenticado
- `PUT /api/auth/profile` — atualiza nome, e-mail e telefone do usuário autenticado
- `POST /api/auth/request-reset` — envia um link de recuperação para o e-mail informado
- `POST /api/auth/reset-password` — define uma nova senha usando o token recebido por e-mail

Depois de executar o SQL, registre um aplicativo no Microsoft Entra, conceda a permissão delegada `Mail.Send`, gere um refresh token OAuth2 com escopo do Microsoft Graph e configure as variáveis Microsoft acima. O endpoint de solicitação sempre retorna a mesma mensagem, mesmo quando o e-mail não está cadastrado.

O front-end usa JWT no header `Authorization: Bearer <token>` e não grava senhas no navegador.
