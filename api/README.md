# ⚡ KoraMarketplace API

> API serverless do KoraMarketplace responsável por autenticação, sessão, perfil e recuperação de senha.

A pasta `api/` conecta o frontend do `FlashMarket/` a uma camada de backend preparada para hospedagem serverless, utilizando **Node.js, MySQL, JWT, bcryptjs e CORS**.

---

## 🚀 Responsabilidades

- 👤 Cadastro de usuários
- 🔐 Login
- 🚪 Logout
- 🪪 Consulta do usuário autenticado
- ✏️ Atualização de perfil
- 🔑 Recuperação de senha
- 🔒 Redefinição de senha
- 🛡️ JWT
- 🗄️ MySQL
- 🌐 CORS para integração com o frontend
- ☁️ Execução em ambiente serverless

---

## 📁 Estrutura

```text
api/
├── README.md
├── _lib/
│   ├── auth.js
│   ├── cors.js
│   └── db.js
├── auth/
│   ├── login.js
│   ├── register.js
│   ├── logout.js
│   ├── me.js
│   ├── profile.js
│   ├── request-reset.js
│   ├── reset-password.js
│   └── setup.sql
└── ...
```

---

## 🔌 Endpoints

| Método | Endpoint | Função |
|---|---|---|
| `POST` | `/api/auth/register` | Cadastro |
| `POST` | `/api/auth/login` | Login |
| `POST` | `/api/auth/logout` | Logout |
| `GET` | `/api/auth/me` | Usuário autenticado |
| `PUT` | `/api/auth/profile` | Atualização de perfil |
| `POST` | `/api/auth/request-reset` | Solicitação de recuperação |
| `POST` | `/api/auth/reset-password` | Redefinição de senha |

---

## 🗄️ MySQL

O banco deve possuir as tabelas necessárias para autenticação.

Script inicial:

```text
api/auth/setup.sql
```

Antes do uso em produção, configure:

- banco de dados;
- usuário MySQL;
- senha;
- host;
- porta;
- permissões de acesso.

---

## 🔐 Variáveis de ambiente

Configure as variáveis no ambiente de hospedagem, por exemplo na Vercel:

```text
DB_HOST=seu-host-mysql
DB_PORT=3306
DB_USER=seu-usuario
DB_PASSWORD=sua-senha
DB_NAME=seu-banco
DB_SSL=true
JWT_SECRET=uma-chave-aleatoria-longa-e-secreta
APP_URL=https://seu-dominio.com/FlashMarket/
MAIL_FROM="FlashMarket <seu-email@dominio.com>"
MICROSOFT_TENANT_ID=consumers
MICROSOFT_CLIENT_ID=seu-client-id
MICROSOFT_CLIENT_SECRET=seu-client-secret
MICROSOFT_REFRESH_TOKEN=seu-refresh-token
```

Os valores acima são apenas exemplos. **Não copie credenciais reais para o GitHub.**

---

## 🛡️ CORS

As rotas de autenticação possuem tratamento de CORS para permitir a comunicação entre o frontend publicado e a API.

Origens autorizadas devem ser mantidas restritas aos domínios realmente utilizados pelo projeto.

O navegador pode enviar uma requisição `OPTIONS` antes de determinadas chamadas; a API responde a esse preflight.

---

## 🪪 JWT

As rotas protegidas utilizam:

```http
Authorization: Bearer <token>
```

O token é gerado após autenticação válida e utilizado pelo frontend nas chamadas que exigem usuário autenticado.

As senhas são armazenadas utilizando hash e **não devem ser salvas em texto puro**.

---

## 🔑 Recuperação de senha

O fluxo de recuperação pode utilizar Microsoft Graph para envio de e-mail.

Variáveis relacionadas:

```text
MICROSOFT_TENANT_ID
MICROSOFT_CLIENT_ID
MICROSOFT_CLIENT_SECRET
MICROSOFT_REFRESH_TOKEN
MAIL_FROM
```

A solicitação deve utilizar respostas genéricas para evitar revelar se determinado e-mail está cadastrado.

---

## 🌐 Integração com o frontend

```text
┌─────────────────────────────┐
│ KoraMarketplace / FlashMarket│
│          Frontend             │
└──────────────┬──────────────┘
               │ HTTPS / JSON
               ▼
┌─────────────────────────────┐
│            /api/             │
│  Login • Cadastro • Perfil   │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│            MySQL             │
│ Usuários • Perfil • Dados    │
└─────────────────────────────┘
```

No frontend publicado, a configuração de autenticação aponta para a API quando disponível. Em ambientes estáticos sem API, existe um fallback local destinado à demonstração da interface.

---

## 🧪 Testando

Pode utilizar Postman, Insomnia, Thunder Client ou JavaScript.

Exemplo para consultar o usuário autenticado:

```javascript
fetch('/api/auth/me', {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

Para login:

```javascript
fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'usuario@exemplo.com',
    password: 'SUA_SENHA'
  })
});
```

---

## ☁️ Deploy na Vercel

Fluxo recomendado:

1. Conectar o repositório à Vercel.
2. Configurar as variáveis de ambiente.
3. Configurar o MySQL.
4. Executar `api/auth/setup.sql` no banco.
5. Fazer o deploy.
6. Testar `/api/auth/login` e `/api/auth/me`.
7. Testar a integração pelo frontend.

Nunca coloque `.env` ou credenciais diretamente no repositório.

---

## ⚠️ Segurança

- Não publique senhas.
- Não publique `JWT_SECRET`.
- Não publique tokens OAuth.
- Utilize HTTPS.
- Restrinja CORS às origens necessárias.
- Use senhas fortes no banco.
- Mantenha as dependências atualizadas.
- Não considere o fallback local como autenticação de produção.

---

## 🔮 Próximas melhorias

- 🛒 Persistência do carrinho
- 📦 Pedidos completos
- 🚚 Rastreamento integrado
- 💳 Gateway de pagamento
- 🏪 Vendedores
- ⭐ Avaliações persistidas
- 🎟️ Cupons no backend
- 📊 Painel administrativo
- 🔔 Notificações
- 🛡️ Rate limiting
- 📋 Logs e monitoramento

---

## 👨‍💻 Autor

**Rafael Oliveira**  
Projeto: **KoraMarketplace / FlashMarket**

GitHub: https://github.com/RafaelOliveirxis

---

## 📄 Licença

Projeto desenvolvido para fins acadêmicos, educacionais e demonstrativos. Consulte o repositório principal para informações gerais do projeto.
