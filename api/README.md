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
```

Não coloque essas credenciais no GitHub ou no código do front-end.

## Endpoints

- `POST /api/auth/register` — cadastro
- `POST /api/auth/login` — login
- `POST /api/auth/logout` — logout
- `GET /api/auth/me` — usuário autenticado
- `PUT /api/auth/profile` — atualiza nome, e-mail e telefone do usuário autenticado

O front-end usa JWT no header `Authorization: Bearer <token>` e não grava senhas no navegador.
