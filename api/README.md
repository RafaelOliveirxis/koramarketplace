# 🔐 KoraMarketplace — API e backend

Este diretório reúne funções serverless da API do projeto **KoraMarketplace / FlashMarket**. A API oferece endpoints para autenticação, conta, recuperação de senha e recursos da área de afiliados, de acordo com os arquivos existentes no repositório.

> **Importante:** a documentação descreve a finalidade dos endpoints, não garante que cada rota esteja ativa em todos os ambientes. Confirme os arquivos de código, variáveis, tabelas e logs do deploy antes de depender de uma funcionalidade.

## Índice

- [Links relacionados](#-links-relacionados)
- [Arquitetura](#-arquitetura)
- [Endpoints](#-endpoints)
- [Estrutura de pastas](#-estrutura-de-pastas)
- [Requisitos e configuração](#-requisitos-e-configuração)
- [Banco de dados](#-banco-de-dados)
- [Autenticação e segurança](#-autenticação-e-segurança)
- [Testes manuais](#-testes-manuais)
- [Deploy na Vercel](#-deploy-na-vercel)
- [Diagnóstico de problemas](#-diagnóstico-de-problemas)
- [Limitações e próximos passos](#-limitações-e-próximos-passos)

## 🔗 Links relacionados

- [README principal](../README.md)
- [Frontend FlashMarket](../FlashMarket/README.md)
- [Repositório GitHub](https://github.com/RafaelOliveirxis/koramarketplace)
- [Site publicado](https://koramarketplace.vercel.app/)

## 🏗️ Arquitetura

Visão simplificada:

```text
Navegador / Frontend FlashMarket
             |
             | HTTPS / Fetch API
             v
       Funções serverless
             |
             +---- autenticação e validação
             |
             +---- conexão MySQL (mysql2)
             |
             +---- Mercado Pago (checkout, pagamentos e webhooks)
             |
             +---- serviços de e-mail (Microsoft Graph / Resend)
```

O frontend é responsável pela apresentação e interação. A API deve validar entradas, autenticar o usuário, aplicar permissões e executar operações confiáveis. O banco MySQL mantém os dados que precisam ser compartilhados entre sessões/dispositivos.

## 🔌 Endpoints

Os caminhos abaixo refletem a interface documentada do projeto. Verifique os arquivos e métodos permitidos na versão publicada antes de integrar um cliente.

| Método | Endpoint | Finalidade |
|---|---|---|
| POST | `/api/auth/register` | Criar uma conta |
| POST | `/api/auth/login` | Autenticar usuário |
| POST | `/api/auth/logout` | Encerrar sessão |
| GET | `/api/auth/me` | Consultar o usuário/sessão autenticada |
| PUT | `/api/auth/profile` | Atualizar dados do perfil |
| POST | `/api/auth/request-reset` | Solicitar recuperação de senha |
| POST | `/api/auth/reset-password` | Redefinir senha com token válido |
| GET | `/api/products` | Consultar o catálogo ativo no MySQL |
| GET | `/api/affiliate/dashboard` | Consultar dados do painel de afiliados |
| GET/POST | `/api/affiliate/products` | Consultar/criar produtos; `POST` com `action: "click"` registra clique público |
| POST | `/api/affiliate/withdraw` | Solicitar saque de comissão via PIX |
| POST | `/api/affiliate/payout-webhook` | Receber atualização de saque do Mercado Pago |
| POST | `/api/payments/create` | Validar carrinho, gravar pedido e iniciar checkout no Mercado Pago |
| GET | `/api/payments/status` | Consultar status de pagamento do pedido |
| POST | `/api/payments/webhook` | Validar notificação e atualizar o pedido |
| GET | `/api/orders/tracking` | Consultar pedido e eventos de rastreamento por código |

**Observações:** o registro de clique é feito em `/api/affiliate/products` com `action: "click"` e um código de afiliado — não existe endpoint separado `/api/affiliate/click`. O saque depende de configuração específica. Confira os handlers antes de depender dos contratos ou da disponibilidade das rotas em produção.

## 📁 Estrutura de pastas

```text
api/
├── [...route].js             # roteador serverless principal
├── auth/[action].js          # roteador de autenticação
├── _lib/handlers/            # handlers de autenticação, afiliados, pedidos e pagamentos
├── _lib/                     # banco, CORS, JWT, e-mail e integrações
├── auth/setup.sql            # usuários e tokens de redefinição
├── affiliate/setup.sql       # perfis, vendas, cliques e saques
├── payments/setup.sql        # catálogo, pedidos, itens e rastreamento
├── .env.example              # configuração mínima para banco/JWT
└── README.md                 # esta documentação
```

O endpoint `/api/products` e os fluxos do checkout podem criar/ajustar tabelas por meio de funções `ensure*Schema`; para preparação manual, aplique os scripts SQL na ordem indicada abaixo.

## 🧰 Requisitos e configuração

- Node.js compatível com o `package.json` do projeto.
- Dependências instaladas com npm.
- Banco MySQL acessível pela API.
- Variáveis de ambiente definidas no ambiente em que as funções serão executadas.
- Serviço de e-mail configurado se a recuperação de senha depender de envio de mensagens.

Exemplos de nomes de variáveis usados pelo projeto:

```text
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
DB_SSL
JWT_SECRET
APP_URL
PUBLIC_APP_URL
FRONTEND_URL
ADMIN_EMAILS
MP_ACCESS_TOKEN
MP_WEBHOOK_SECRET
MP_PAYOUTS_ENABLED
MP_PAYOUTS_MODE
MP_PAYOUTS_ACCESS_TOKEN
MP_PAYOUTS_WEBHOOK_SECRET
RESEND_API_KEY
RESEND_FROM_EMAIL
MICROSOFT_TENANT_ID
MICROSOFT_CLIENT_ID
MICROSOFT_CLIENT_SECRET
MICROSOFT_REFRESH_TOKEN
```

`api/.env.example` contém somente as variáveis básicas de MySQL e JWT. O conjunto completo depende dos fluxos habilitados; confirme os nomes e requisitos nos handlers e nas bibliotecas de `api/_lib/`.

### Significado geral das variáveis

| Variável | Uso geral |
|---|---|
| `DB_HOST` | Host do servidor MySQL |
| `DB_PORT` | Porta do MySQL, normalmente 3306 |
| `DB_USER` | Usuário de conexão |
| `DB_PASSWORD` | Senha do usuário do banco |
| `DB_NAME` | Banco/esquema utilizado |
| `DB_SSL` | Configuração de conexão TLS/SSL conforme o código |
| `JWT_SECRET` | Segredo usado para assinar/verificar tokens JWT |
| `APP_URL`, `PUBLIC_APP_URL` | URL pública usada por fluxos de afiliados |
| `FRONTEND_URL` | URL base para retorno do checkout e links das notificações de pedido |
| `ADMIN_EMAILS` | Lista separada por vírgulas de e-mails administrativos |
| `MP_ACCESS_TOKEN` | Credencial do Mercado Pago para checkout e, como fallback, saques |
| `MP_WEBHOOK_SECRET` | Segredo de validação do webhook de pagamentos |
| `MP_PAYOUTS_*` | Habilitação, ambiente, credencial e segredo do webhook de saques |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Envio de notificações de eventos de pedido pelo Resend |
| `MICROSOFT_*` | Credenciais OAuth2/Microsoft Graph para e-mails de redefinição de senha |

Configure cada variável na plataforma de hospedagem, separando Development, Preview e Production. Não publique valores reais na documentação.

O modo de payouts usa `sandbox` por padrão. A implementação rejeita chamadas de payout em produção enquanto a assinatura de requisição do Mercado Pago não estiver integrada; mantenha saques em sandbox e desabilitados para dinheiro real até completar essa integração.

## 🗄️ Banco de dados

A API utiliza MySQL através de `mysql2`. Para preparar um ambiente:

1. Crie um banco exclusivo para o ambiente e um usuário com permissões mínimas.
2. Configure as variáveis de conexão.
3. Faça backup antes de alterar um banco existente.
4. Aplique, se necessário, `api/auth/setup.sql`, `api/payments/setup.sql` e então `api/affiliate/setup.sql` (o esquema de afiliados estende pedidos).
5. Compare as colunas do banco com as consultas executadas pela API.
6. Teste cadastro, login, checkout, rastreamento e afiliados com dados fictícios.
7. Confira os logs e remova dados de teste quando apropriado.

O dump `flashmarket.sql` é separado, antigo e contém `DROP TABLE`; não o importe em um banco com dados que deseja preservar. Não execute scripts de configuração sem revisar seu conteúdo e fazer backup.

Não misture esquemas diferentes sem verificar compatibilidade. Um banco acessível ainda pode causar erros se faltarem tabelas, colunas ou registros esperados.

## 🔐 Autenticação e segurança

- Rotas autenticadas usam `Authorization: Bearer <token>`; confira os requisitos específicos de cada handler.
- Armazene senhas somente com hash seguro; nunca em texto puro.
- Use HTTPS.
- Restrinja CORS às origens necessárias.
- Valide tipos, tamanhos e conteúdo de todas as entradas no servidor.
- Aplique autorização por usuário em cada recurso privado.
- Não exponha stack traces, SQL, tokens ou segredos nas respostas.
- Use mensagens de erro úteis sem revelar detalhes internos.
- Proteja tokens de redefinição de senha, imponha expiração e invalide-os após uso, conforme a implementação.
- Não confie em valores enviados pelo navegador para preço, saldo, comissão, permissões ou status de pagamento.
- Mantenha credenciais em variáveis de ambiente e revogue imediatamente qualquer segredo exposto.
- Use contas de banco com privilégio mínimo e mantenha dependências atualizadas.

## 🧪 Testes manuais

Faça testes com contas e dados descartáveis. Exemplo de requisição de login em ambiente onde o endpoint esteja disponível:

```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'usuario@exemplo.com',
    password: 'SENHA_DE_TESTE'
  })
});

const data = await response.json();
console.log('HTTP:', response.status);
console.log('Resposta:', data);
```

Se estiver chamando a API de outra origem, substitua o caminho relativo pela URL base correta e configure CORS adequadamente. Nunca coloque senhas reais em exemplos, commits, capturas de tela ou logs públicos.

### O que verificar em cada teste
- Método HTTP permitido pela rota.
- Código de resposta HTTP.
- Formato e validação do JSON enviado.
- Campos obrigatórios e mensagens de validação.
- Necessidade de token e permissões.
- Conexão com o banco e existência das tabelas.
- Logs do runtime sem segredos.
- Comportamento em falha de banco, token expirado ou serviço de e-mail indisponível.

## ☁️ Deploy na Vercel

1. Conecte o repositório à Vercel.
2. Confira a pasta raiz e a configuração de rotas em `vercel.json`.
3. Configure variáveis de ambiente para cada ambiente.
4. Confirme que o banco é acessível a partir do runtime da API.
5. Faça o deploy e verifique o resultado do build.
6. Consulte logs de build e logs de execução.
7. Teste individualmente os endpoints com dados descartáveis.
8. Teste a integração a partir do frontend publicado.
9. Repita os testes após mudanças de variáveis, banco ou código.

O GitHub Pages hospeda conteúdo estático e não executa as funções serverless desta pasta. Para a versão estática usar a API, o frontend deve chamar um backend acessível e configurado.

## 🛠️ Diagnóstico de problemas

**Método não permitido (405)**
- Confira o método HTTP enviado.
- Abra o arquivo da rota e veja quais métodos são aceitos.
- Confirme se a URL corresponde ao endpoint esperado.

**Erro genérico de login**
- Confira as variáveis de ambiente e os logs da função.
- Verifique a conexão MySQL, a tabela de usuários e o formato do hash de senha.
- Confirme se o frontend envia os nomes de campos esperados pela API.

**Erro de conexão com o banco**
- Confirme host, porta, usuário, senha, nome do banco e SSL.
- Verifique se o serviço está ativo e acessível pelo ambiente de execução.
- Confira se as tabelas e colunas necessárias existem.

**Recuperação de senha não envia e-mail**
- Verifique as variáveis do provedor de e-mail, remetente, permissões e logs.
- Confira validade do token, URL de retorno e expiração.
- Não mostre se um endereço de e-mail está cadastrado quando isso puder facilitar enumeração de contas.

**CORS no navegador**
- Confirme a origem do frontend e a configuração de CORS.
- Verifique preflight OPTIONS, cabeçalhos e métodos necessários.
- Não use uma política aberta em produção sem avaliar o risco.

## ⚠️ Limitações e próximos passos

O checkout usa a API e o Mercado Pago quando o banco e as credenciais estão configurados, mas isso não garante disponibilidade nem aprovação de uma cobrança em todos os ambientes. Pedidos somente no navegador não substituem persistência centralizada. Estoque, logística, comissões e saques precisam de regras de negócio, auditoria, testes e controles próprios antes de uso comercial.

Sugestões de evolução:
- Testes automatizados para cada endpoint.
- Esquema versionado e migrações de banco.
- Limites de requisição e proteção contra abuso.
- Logs estruturados e monitoramento.
- Documentação de contratos de resposta e códigos HTTP.
- Testes de autorização e validação de entradas.
- Testes de integração para banco, e-mail e serviços externos.

## 👨‍💻 Responsável

**Rafael Oliveira** — projeto acadêmico/TCC **KoraMarketplace / FlashMarket**.
