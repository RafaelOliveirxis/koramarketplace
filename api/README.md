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
             +---- serviços externos opcionais
                   (ex.: envio de e-mail)
```

O frontend é responsável pela apresentação e interação. A API deve validar entradas, autenticar o usuário, aplicar permissões e executar operações confiáveis. O banco MySQL mantém os dados que precisam ser compartilhados entre sessões/dispositivos.

## 🔌 Endpoints

Os caminhos abaixo refletem a interface documentada do projeto. Verifique os arquivos e métodos permitidos na versão publicada antes de integrar um cliente.

| Método | Endpoint | Finalidade |
|---|---|---|
| POST | `/api/auth/register` | Criar uma conta |
| POST | `/api/auth/login` | Autenticar usuário |
| POST | `/api/auth/logout` | Encerrar sessão, quando implementado pelo fluxo atual |
| GET | `/api/auth/me` | Consultar o usuário/sessão autenticada |
| PUT | `/api/auth/profile` | Atualizar dados do perfil |
| POST | `/api/auth/request-reset` | Solicitar recuperação de senha |
| POST | `/api/auth/reset-password` | Redefinir senha com token válido |
| GET | `/api/affiliate/dashboard` | Consultar dados do painel de afiliados |
| GET/POST | `/api/affiliate/products` | Consultar ou gerenciar recursos de produtos de afiliados |
| POST | `/api/affiliate/click` | Registrar clique de afiliado |

**Contrato de API:** confirme para cada endpoint o método, o formato do corpo, o formato de resposta, a autenticação exigida, os códigos HTTP e os campos obrigatórios diretamente no arquivo correspondente. Não assuma que GET/POST ou um caminho documentado estão operacionais sem teste.

## 📁 Estrutura de pastas

```text
api/
├── _lib/       # conexão com banco, CORS e utilitários compartilhados
├── auth/       # cadastro, login, perfil e recuperação de senha
├── affiliate/  # recursos da área de afiliados
└── README.md   # esta documentação
```

Os scripts SQL relacionados podem incluir `api/auth/setup.sql` e `api/affiliate/setup.sql`. Revise os arquivos atuais antes de executar alterações no banco.

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
MAIL_FROM
MICROSOFT_TENANT_ID
MICROSOFT_CLIENT_ID
MICROSOFT_CLIENT_SECRET
MICROSOFT_REFRESH_TOKEN
```

O conjunto exato depende do endpoint e da implementação em uso. Consulte os arquivos em `api/_lib/` e `api/auth/` para confirmar os nomes e os valores esperados.

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
| `APP_URL` | URL base da aplicação, quando utilizada |
| `MAIL_FROM` | Remetente de e-mail, quando utilizado |
| `MICROSOFT_*` | Credenciais da integração Microsoft/e-mail, se essa estratégia estiver configurada |

Configure cada variável na plataforma de hospedagem, separando Development, Preview e Production. Não publique valores reais na documentação.

## 🗄️ Banco de dados

A API utiliza MySQL através de `mysql2`. Para preparar um ambiente:

1. Crie um banco exclusivo para o ambiente e um usuário com permissões mínimas.
2. Configure as variáveis de conexão.
3. Faça backup antes de alterar um banco existente.
4. Revise o SQL para confirmar banco, tabelas, colunas, índices e restrições.
5. Execute apenas os scripts necessários ao código implantado.
6. Compare as colunas do banco com as consultas executadas pela API.
7. Teste cadastro, login, perfil e endpoints de afiliados com dados fictícios.
8. Confira os logs e remova dados de teste quando apropriado.

Não misture esquemas diferentes sem verificar compatibilidade. Um banco acessível ainda pode causar erros se faltarem tabelas, colunas ou registros esperados.

## 🔐 Autenticação e segurança

- As rotas protegidas podem exigir um cabeçalho `Authorization: Bearer <token>`; confirme o mecanismo no código.
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

O checkout descrito no frontend é demonstrativo até que o provedor de pagamento esteja integrado e validado. Pedidos salvos apenas no navegador não substituem persistência centralizada. Pagamentos, webhooks, estoque, logística, comissões e saques precisam de regras de negócio, auditoria, testes e controles de segurança próprios antes de uso comercial.

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
