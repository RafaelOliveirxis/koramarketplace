# 🔐 KoraMarketplace — API

A pasta `api/` contém endpoints serverless para autenticação, perfil, recuperação de senha e recursos da área de afiliados. A API usa Node.js, MySQL, JWT, bcryptjs e CORS, conforme os arquivos implementados no repositório.

## Documentação relacionada
- [README principal](../README.md)
- [Frontend FlashMarket](../FlashMarket/README.md)
- [Repositório GitHub](https://github.com/RafaelOliveirxis/koramarketplace)
- [Site publicado](https://koramarketplace.vercel.app/)

## Recursos e endpoints

| Método | Endpoint | Uso |
|---|---|---|
| POST | `/api/auth/register` | Cadastro |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Consultar sessão |
| PUT | `/api/auth/profile` | Atualizar perfil |
| POST | `/api/auth/request-reset` | Solicitar recuperação de senha |
| POST | `/api/auth/reset-password` | Redefinir senha |
| GET | `/api/affiliate/dashboard` | Dados do painel de afiliados |
| GET/POST | `/api/affiliate/products` | Consultar/gerenciar produtos de afiliados |
| POST | `/api/affiliate/click` | Registrar clique de afiliado |

> Os endpoints disponíveis e os métodos aceitos devem ser confirmados nos arquivos da versão implantada. Uma rota listada aqui não garante que esteja configurada ou operacional no ambiente atual.

## Estrutura

```text
api/
├── _lib/       # autenticação, CORS e conexão com banco
├── auth/       # cadastro, login, perfil e recuperação
├── affiliate/  # dashboard, produtos e cliques
└── README.md
```

Scripts SQL relacionados à API incluem `api/auth/setup.sql` e `api/affiliate/setup.sql`. Confira os scripts antes de executá-los e garanta que o esquema corresponde ao código implantado.

## Configuração

Configure as variáveis necessárias no provedor de hospedagem. O conjunto pode incluir:

```text
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
DB_SSL
JWT_SECRET
APP_URL
MAIL_FROM
MICROSOFT_TENANT_ID
MICROSOFT_CLIENT_ID
MICROSOFT_CLIENT_SECRET
MICROSOFT_REFRESH_TOKEN
```

As variáveis de banco e JWT são necessárias para os fluxos que dependem de persistência e autenticação. As variáveis Microsoft/e-mail só são necessárias se o envio de recuperação estiver configurado por essa integração. Use valores de exemplo apenas na documentação.

**Nunca envie credenciais reais, arquivos `.env`, tokens ou chaves privadas ao GitHub.** Mantenha segredos nas Environment Variables da Vercel ou de outro provedor. Se um segredo for exposto, revogue-o e gere outro.

## Banco de dados

O backend utiliza MySQL por meio de `mysql2`. Antes de usar:
1. Crie um banco e um usuário com permissões mínimas.
2. Configure host, porta, nome, usuário, senha e SSL.
3. Revise e execute o script SQL apropriado.
4. Confirme que as tabelas e colunas correspondem às consultas da API.
5. Teste a conexão e os fluxos com dados de teste.

Não execute scripts de alteração em produção sem backup. Não inclua dados pessoais reais em ambientes de demonstração.

## Autenticação e segurança

- Rotas protegidas podem utilizar `Authorization: Bearer <token>`.
- Senhas devem ser armazenadas com hash, nunca em texto puro.
- Use HTTPS e restrinja CORS às origens necessárias.
- Valide entradas no servidor e retorne mensagens de erro sem expor segredos ou detalhes internos.
- Não confie no armazenamento local do navegador como autenticação segura.
- Configure rotação de segredos e monitore logs do provedor.

## Teste manual

Exemplo de login usando um endpoint local ou a URL base da API:

```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'usuario@exemplo.com',
    password: 'SUA_SENHA'
  })
});

const data = await response.json();
console.log(response.status, data);
```

Teste com contas e dados descartáveis. Não coloque senhas reais em commits, exemplos públicos ou capturas de tela.

## Deploy na Vercel

1. Importe o repositório na Vercel.
2. Configure as variáveis de ambiente por ambiente (Development/Preview/Production).
3. Confirme o banco e os scripts de esquema.
4. Faça o deploy.
5. Consulte build logs e runtime logs.
6. Teste cadastro, login, sessão, perfil, recuperação de senha e recursos de afiliados.
7. Teste a integração pelo frontend publicado.

O GitHub Pages serve conteúdo estático e não executa as funções serverless da pasta `api/`.

## Limitações conhecidas do escopo

O checkout atual descrito pelo frontend é demonstrativo e não deve ser tratado como integração de pagamento real. Pedidos locais no navegador não substituem persistência de pedidos no MySQL. Recursos comerciais — pagamento, estoque, transportadora, comissões e saques — exigem implementação, validação e testes próprios antes de uso em produção.

## Autor
**Rafael Oliveira** — KoraMarketplace / FlashMarket.
