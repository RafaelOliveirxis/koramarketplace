# ⚡ FlashMarket API

API serverless responsável por **autenticação, sessões, gerenciamento de perfil e recuperação de senha** do FlashMarket.

O diretório `api/` integra o frontend do FlashMarket a uma camada de backend, utilizando **MySQL, JWT e serviços serverless**.

---

## 🚀 Funcionalidades

- 👤 Cadastro de usuários
- 🔐 Login e autenticação
- 🚪 Logout
- 🪪 Consulta do usuário autenticado
- ✏️ Atualização de nome, e-mail e telefone
- 🔑 Recuperação e redefinição de senha
- 📧 Envio de e-mail para recuperação de acesso
- 🛡️ Autenticação baseada em JWT
- 🗄️ Integração com MySQL
- ☁️ Compatibilidade com ambiente serverless

---

## 📁 Estrutura

```text
api/
├── README.md
├── auth/
│   └── setup.sql
└── ...
```

---

## 🗄️ Banco de dados MySQL

Execute o script abaixo no seu banco MySQL antes de utilizar a autenticação:

```text
api/auth/setup.sql
```

É necessário possuir um banco de dados, usuário e permissões adequadas para a aplicação.

---

## 🔐 Variáveis de ambiente

Na Vercel, configure em **Project Settings → Environment Variables**:

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

### ⚠️ Segurança

**Nunca coloque senhas, tokens, chaves JWT ou credenciais do banco no GitHub ou no código do frontend.**

Utilize somente variáveis de ambiente para informações sensíveis.

Depois de alterar as variáveis, faça um novo deploy.

---

## 🔌 Endpoints

| Método | Endpoint | Função |
|---|---|---|
| `POST` | `/api/auth/register` | Cadastro de usuário |
| `POST` | `/api/auth/login` | Login |
| `POST` | `/api/auth/logout` | Logout |
| `GET` | `/api/auth/me` | Usuário autenticado |
| `PUT` | `/api/auth/profile` | Atualização do perfil |
| `POST` | `/api/auth/request-reset` | Solicitação de recuperação de senha |
| `POST` | `/api/auth/reset-password` | Redefinição de senha |

---

## 🪪 Autenticação JWT

As rotas protegidas utilizam o token JWT enviado no cabeçalho:

```http
Authorization: Bearer <token>
```

As senhas não devem ser armazenadas diretamente no navegador.

---

## 📧 Recuperação de senha

O fluxo de recuperação pode utilizar o **Microsoft Graph** para envio dos e-mails.

Para habilitar esse recurso, configure um aplicativo no Microsoft Entra, as permissões necessárias de envio e as credenciais OAuth2 correspondentes.

Variáveis utilizadas:

```text
MICROSOFT_TENANT_ID
MICROSOFT_CLIENT_ID
MICROSOFT_CLIENT_SECRET
MICROSOFT_REFRESH_TOKEN
MAIL_FROM
```

Por segurança, a solicitação de recuperação utiliza uma resposta genérica para não revelar se um e-mail está cadastrado.

---

## ☁️ Deploy

Fluxo recomendado para publicação:

1. Conecte o repositório à Vercel.
2. Configure as variáveis de ambiente.
3. Configure o banco MySQL.
4. Execute `api/auth/setup.sql`.
5. Faça o deploy.
6. Teste os endpoints.
7. Verifique a integração com o frontend.

---

## 🧪 Testando a API

Você pode utilizar **Postman, Insomnia, Thunder Client** ou `fetch()` do JavaScript.

Exemplo:

```javascript
fetch('/api/auth/me', {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 🔗 Integração com o FlashMarket

```text
┌─────────────────────┐
│      FlashMarket    │
│      Frontend       │
└──────────┬──────────┘
           │ HTTP / JSON
           ▼
┌─────────────────────┐
│        /api/        │
│ Autenticação/Perfil │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│       MySQL         │
│       Dados         │
└─────────────────────┘
```

---

## ⚠️ Observações

- O funcionamento depende das variáveis de ambiente corretamente configuradas.
- O MySQL precisa estar acessível pelo ambiente de hospedagem.
- O `JWT_SECRET` deve ser longo, aleatório e secreto.
- Nunca publique credenciais no repositório.
- Utilize HTTPS em produção.
- O serviço de e-mail depende da configuração correta do OAuth2.

---

## 🎓 Projeto acadêmico

A API faz parte do **FlashMarket Oficial / KoraMarketplace**, projeto acadêmico de desenvolvimento web com foco em e-commerce, responsividade, experiência do usuário, integração entre frontend e backend e autenticação.

---

## 🔮 Próximas melhorias

- 🛒 Persistência do carrinho no banco
- 📦 Sistema completo de pedidos
- 🚚 Rastreamento integrado
- 💳 Gateway de pagamento
- 🏪 Gerenciamento de vendedores
- ⭐ Avaliações persistidas
- 🎟️ Cupons no backend
- 📊 Painel administrativo
- 🔔 Notificações
- 🛡️ Rate limiting e controles adicionais de segurança

---

## 👨‍💻 Autor

**Rafael Oliveira**  
Projeto: **FlashMarket Oficial / KoraMarketplace**

Desenvolvido para fins acadêmicos, estudos e demonstração de desenvolvimento web.

---

## 📄 Licença

Projeto desenvolvido para fins acadêmicos e educacionais. Consulte as condições definidas no repositório principal antes de reutilizar ou distribuir partes do projeto.
