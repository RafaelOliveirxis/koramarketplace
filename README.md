# ⚡ FlashMarket — KoraMarketplace

> Projeto de marketplace web responsivo desenvolvido para fins acadêmicos e de demonstração, com frontend em HTML/CSS/JavaScript, estrutura PWA, API serverless opcional e preparação para aplicativo móvel.

**FlashMarket** é a experiência de loja virtual do projeto **KoraMarketplace**. Este repositório reúne a interface, os recursos de backend disponíveis, scripts de banco de dados, documentação e configurações para execução local e publicação.

> **Estado funcional importante:** o projeto inclui API para catálogo, pedidos e integração com Mercado Pago, mas esses recursos só operam quando backend, banco e credenciais estão configurados. Métricas, rastreamento logístico e outros recursos podem depender de integrações adicionais. Valide cada ambiente antes de qualquer operação comercial.

## Índice

- [Links do projeto](#-links-do-projeto)
- [Objetivo e escopo](#-objetivo-e-escopo)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Estrutura do repositório](#-estrutura-do-repositório)
- [Requisitos](#-requisitos)
- [Instalação e execução local](#-instalação-e-execução-local)
- [Configuração da API](#-configuração-da-api)
- [Banco de dados](#-banco-de-dados)
- [Publicação e hospedagem](#-publicação-e-hospedagem)
- [PWA e aplicativo Android](#-pwa-e-aplicativo-android)
- [Testes e checklist](#-testes-e-checklist)
- [Segurança e privacidade](#-segurança-e-privacidade)
- [Solução de problemas](#-solução-de-problemas)
- [Próximas evoluções](#-próximas-evoluções)
- [Autor e licença](#-autor-e-licença)

## 🌐 Links do projeto

| Recurso | Endereço |
|---|---|
| Site publicado na Vercel | https://koramarketplace.vercel.app/ |
| Versão estática no GitHub Pages | https://rafaeloliveirxis.github.io/koramarketplace/ |
| Repositório GitHub | https://github.com/RafaelOliveirxis/koramarketplace |
| Frontend | [FlashMarket/](./FlashMarket/) |
| Documentação da API | [api/README.md](./api/README.md) |
| Preparação para lojas móveis | [MOBILE-STORE-SETUP.md](./MOBILE-STORE-SETUP.md) |
| Pipeline de release | [RELEASE-PIPELINE.md](./RELEASE-PIPELINE.md) |
| Checklist de publicação | [STORE-RELEASE-CHECKLIST.md](./STORE-RELEASE-CHECKLIST.md) |
| Documentação de pagamento | [PAGAMENTO-MERCADOPAGO-MYSQL.md](./PAGAMENTO-MERCADOPAGO-MYSQL.md) |

Os ambientes de hospedagem podem estar em versões diferentes. A existência de um link ou arquivo de configuração não garante, por si só, que todas as funções estejam ativas no ambiente publicado.

## 🎯 Objetivo e escopo

O projeto tem como objetivo demonstrar a construção de uma experiência de marketplace: navegação por produtos, busca, categorias, carrinho, conta do usuário, checkout, consulta de pedidos e área de afiliados. Também serve como base de estudo para responsividade, organização de frontend, APIs, banco de dados e preparação de aplicativos.

O sistema deve ser entendido como um projeto em evolução. Antes de operar comercialmente, é necessário validar fluxos críticos, persistência de dados, segurança, pagamentos, logística, suporte, privacidade e requisitos legais.

## ✨ Funcionalidades

### Loja e navegação
- Página inicial com catálogo, ofertas e categorias.
- Busca, filtros e navegação entre áreas da loja.
- Componentes de interface responsivos para desktop, tablet e celular.
- Carrinho, favoritos, cupons e preferências locais quando implementados na página.
- Elementos visuais de atendimento e assistente Flash IA.

### Conta e autenticação
- Páginas de cadastro, login, conta e perfil.
- Estrutura de API para autenticação e sessão.
- Fluxo de solicitação e redefinição de senha, sujeito à configuração do banco e do serviço de e-mail.
- Recursos autenticados dependem da configuração e da disponibilidade do backend.

### Checkout e pedidos
- Checkout dividido em etapas, com entrega, revisão e encaminhamento para pagamento.
- API para validar itens e preços pelo catálogo MySQL, registrar pedidos e criar Orders no Mercado Pago.
- Consulta do status do pagamento, retorno do checkout, detalhes do pedido e rastreamento.
- Webhook do Mercado Pago para atualizar pedidos e o histórico de eventos.

Esses fluxos dependem da configuração da API, do MySQL e das credenciais do Mercado Pago. A presença das páginas não garante que os serviços estejam ativos no ambiente publicado. Eventos de pagamento não são eventos de entrega; rastreamento logístico externo depende de integração com transportadora.

### Área de afiliados
- Estrutura de painel e páginas para produtos/links de afiliados.
- API para painel, registro de cliques, atribuição de vendas e solicitação de saque via PIX.
- Saques pelo Mercado Pago dependem das credenciais e do modo suportado pela implementação.
- Indicadores, comissões e saldos dependem dos pedidos e eventos persistidos no banco; valide as regras antes de uso comercial.

### PWA e aplicativo móvel
- Manifest e Service Worker para preparar a experiência instalável na web.
- Recursos de interface específicos para telas pequenas.
- Configuração de Capacitor para preparar projeto Android e, em ambiente compatível, iOS.
- A instalação como PWA e a publicação em lojas são processos diferentes.

## 🧰 Tecnologias

| Área | Tecnologias e ferramentas |
|---|---|
| Interface | HTML5, CSS3, JavaScript moderno |
| Requisições | Fetch API |
| Persistência local | LocalStorage, quando usado pela interface |
| API | Node.js e funções serverless |
| Autenticação | JWT e bcryptjs, conforme os endpoints |
| Banco | MySQL e mysql2 |
| PWA | Web App Manifest e Service Worker |
| Aplicativo móvel | Capacitor |
| Hospedagem | Vercel e GitHub Pages |
| Versionamento | Git e GitHub |

## 📁 Estrutura do repositório

A estrutura pode mudar ao longo do desenvolvimento. Use este mapa como orientação e confirme os arquivos presentes na branch atual.

```text
koramarketplace/
├── .github/workflows/       # Deploy web, testes e builds/releases móveis
├── FlashMarket/             # Frontend da loja
│   ├── assets/              # Imagens, ícones e recursos visuais
│   ├── css/                 # Estilos e responsividade
│   ├── js/                  # Lógica e interações do frontend
│   ├── index.html            # Página inicial
│   ├── checkout.html         # Checkout web
│   ├── pedido.html           # Detalhes do pedido
│   ├── rastrear-pedido.html  # Consulta/rastreamento
│   ├── afiliado.html         # Área de afiliados
│   ├── manifest.webmanifest # Metadados da PWA
│   └── sw.js                 # Service Worker
├── api/                     # Endpoints serverless e integrações
│   ├── _lib/handlers/       # Implementações de autenticação, pedidos e pagamentos
│   ├── [...route].js        # Roteador serverless principal
│   ├── auth/                # Rota dinâmica e esquema de autenticação
│   ├── affiliate/           # Rotas e esquema de afiliados
│   ├── payments/            # Esquema de catálogo, pedidos e rastreamento
│   ├── .env.example         # Exemplo mínimo de configuração
│   └── README.md            # Documentação da API
├── scripts/                 # Scripts auxiliares
├── tests/                   # Testes responsivos com Playwright
├── flashmarket.sql          # Dump legado; revisar antes de importar
├── package.json             # Scripts e dependências
├── capacitor.config.ts      # Configuração Capacitor
├── vercel.json              # Configuração de hospedagem/API
└── README.md                # Este documento
```

## 💻 Requisitos

- Git.
- Node.js na versão compatível com o `package.json` (o projeto está configurado para Node.js 22.x).
- npm.
- Navegador moderno.
- Para recursos da API: banco MySQL e variáveis de ambiente correspondentes.
- Para Android nativo: Android Studio, Android SDK e JDK compatível com a versão do projeto.
- Para iOS nativo: macOS e Xcode.

## 🚀 Instalação e execução local

### 1. Clonar o repositório

```bash
git clone https://github.com/RafaelOliveirxis/koramarketplace.git
cd koramarketplace
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Validar o frontend

```bash
npm run web:check
```

Se o comando reportar problemas, corrija-os antes de publicar. A validação automatizada não substitui testes manuais no navegador.

### 4. Iniciar o site

```bash
npm run web:serve
```

Abra no navegador o endereço local informado pelo terminal. Também é possível usar uma extensão como Live Server no VS Code apontando para a pasta `FlashMarket/`.

**Para testar PWA:** prefira `localhost` ou HTTPS. Abrir o HTML diretamente pelo protocolo `file://` pode impedir Service Worker, instalação e outras funções do navegador.

## 🔐 Configuração da API

A pasta `api/` contém funções serverless. Para executar recursos que dependem de backend, configure as variáveis exigidas pelos arquivos de API no ambiente de desenvolvimento ou na plataforma de hospedagem.

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

Nem todas as variáveis são necessárias em todos os ambientes. `api/.env.example` contém somente os valores-base de banco e JWT; configure as demais quando habilitar os respectivos fluxos. O código usa Microsoft Graph para e-mails de redefinição de senha e Resend para notificações de eventos de pedido. Consulte [api/README.md](./api/README.md) para detalhes e nunca coloque valores reais no Git.

Não crie variáveis no frontend para guardar segredos. Valores entregues ao navegador são públicos.

## 🗄️ Banco de dados

O projeto contém scripts de esquema separados para autenticação, afiliados e checkout/pagamentos, além de um dump legado na raiz. Os scripts da API podem criar ou ajustar tabelas, mas confirme dependências e compatibilidade antes de executá-los. Para inicializar manualmente:

1. Faça backup se o banco já contiver dados.
2. Crie um banco MySQL e configure `DB_NAME`.
3. Crie um usuário próprio para cada ambiente, com permissões mínimas.
4. Configure host, porta, nome, usuário, senha e SSL.
5. Aplique os scripts necessários nesta ordem: `api/auth/setup.sql`, `api/payments/setup.sql` e `api/affiliate/setup.sql`.
6. Não importe `flashmarket.sql` sobre uma base existente sem revisá-lo: o dump contém instruções para remover e recriar tabelas e pode apagar dados.
7. Teste os fluxos com dados fictícios antes de usar informações reais.

O armazenamento local do navegador não é sincronizado automaticamente com o MySQL. Para compartilhar pedidos entre dispositivos, a aplicação precisa criar e consultar esses pedidos por meio do backend.

## ☁️ Publicação e hospedagem

### Vercel
1. Importe ou conecte o repositório à Vercel.
2. Confira a pasta raiz do projeto e a configuração em `vercel.json`.
3. Configure as variáveis necessárias em Development, Preview e Production.
4. Faça o deploy e verifique o status do build.
5. Confira os logs de build e de execução.
6. Teste o site publicado e cada endpoint utilizado pelo frontend.

### GitHub Pages
O GitHub Pages pode servir arquivos estáticos. Ele não executa funções serverless da pasta `api/`. Para usar autenticação ou banco a partir da versão estática, o frontend deve apontar para uma API hospedada, com CORS e segurança configurados.

### Após cada publicação
- Abra o site em uma janela privada para reduzir interferência de cache.
- Teste desktop e celular.
- Confira o console do navegador e os logs do provedor.
- Valide links, formulários, carregamento de imagens e chamadas de API.
- Confirme que a URL principal aponta para o deploy esperado.

## 📱 PWA e aplicativo Android

A PWA usa os arquivos `FlashMarket/manifest.webmanifest` e `FlashMarket/sw.js`. A disponibilidade da instalação depende do navegador, do HTTPS, do manifesto, dos ícones e dos requisitos de instalação. O workflow `deploy-pages.yml` publica `FlashMarket/` como site estático; esse ambiente não executa a API.

Para preparar a estrutura móvel, confira os scripts disponíveis no `package.json`. O comando de preparação documentado no projeto é:

```bash
npm run mobile:prepare
```

Para preparar Android:

```bash
npm run mobile:android
```

Para preparar iOS:

```bash
npm run mobile:ios
```

Android exige Android Studio/SDK configurados. iOS exige macOS e Xcode. Os comandos preparam o projeto; não significam que o aplicativo esteja publicado em uma loja.

### APK de teste
O workflow [Android build (FlashMarket)](./.github/workflows/android-build.yml), quando disponível e executado com sucesso, pode gerar um APK de depuração para testes. Consulte a execução em **GitHub → Actions** e baixe o artefato produzido. APK de depuração não equivale a um Android App Bundle assinado e pronto para publicação na Google Play.

## 🧪 Testes e checklist de validação

Antes de considerar uma versão pronta:

- [ ] Executar `npm run web:check`.
- [ ] Conferir o workflow de testes visuais `mobile-visual-tests.yml`, que valida o site publicado em 320/390 px e 1440 px.
- [ ] Testar a página inicial em desktop, tablet e celular.
- [ ] Verificar navegação, links, categorias, busca e filtros.
- [ ] Testar carrinho vazio, inclusão de itens, quantidades e remoção.
- [ ] Testar favoritos e persistência local, quando aplicável.
- [ ] Percorrer o checkout com dados fictícios e verificar a resposta da API.
- [ ] Em ambiente de teste do Mercado Pago, confirmar o redirecionamento e o retorno do status.
- [ ] Validar assinatura do webhook e atualização do pedido no MySQL antes de habilitar pagamentos reais.
- [ ] Testar páginas de detalhes e consulta de pedidos.
- [ ] Testar cadastro, login, sessão e recuperação de senha se a API estiver configurada.
- [ ] Verificar banco, esquema e logs de API.
- [ ] Testar estados de carregamento, erro e ausência de dados.
- [ ] Confirmar instalação PWA em navegador compatível.
- [ ] Conferir console, acessibilidade básica, contraste e formulários.
- [ ] Confirmar que nenhum segredo ou dado pessoal foi incluído no commit.

## 🔒 Segurança e privacidade

- Nunca publique senhas, tokens, chaves privadas ou arquivos `.env`.
- Mantenha credenciais exclusivamente nas variáveis de ambiente do servidor.
- Nunca exponha tokens do Mercado Pago, Microsoft Graph, Resend ou JWT no frontend, em issues ou em logs.
- Se uma credencial for exposta, revogue-a e gere outra imediatamente.
- Use HTTPS e restrinja CORS às origens necessárias.
- Valide dados no servidor; validação apenas no navegador não é suficiente.
- Não armazene senhas em texto puro.
- Evite dados pessoais reais em ambientes de teste.
- Defina política de privacidade, retenção e exclusão de dados antes de uso público.
- Pagamentos reais precisam de validação de assinatura/webhook, idempotência, tratamento de falhas e reconciliação.

## 🛠️ Solução de problemas

**O site abre, mas login ou cadastro falha**
- Confirme se a API foi publicada e se a rota aceita o método HTTP utilizado.
- Verifique as variáveis de ambiente, logs da função, conexão MySQL e esquema.
- Confira se o frontend está chamando a URL correta da API.

**O site está desatualizado depois do deploy**
- Confira o commit e o status do deploy na plataforma.
- Faça uma recarga forçada ou teste em janela privada.
- Se houver Service Worker, valide a estratégia de cache e a versão dos arquivos.

**A instalação PWA não aparece**
- Acesse por HTTPS ou localhost.
- Verifique o manifesto, ícones, Service Worker e critérios do navegador.
- No iPhone/iPad, abra no Safari e use Compartilhar → Adicionar à Tela de Início.

**Pedidos não aparecem em outro dispositivo**
- Verifique se o fluxo usa apenas LocalStorage. Dados locais não são compartilhados; isso exige API e persistência no banco.

## 🔭 Próximas evoluções

Para evoluir de demonstração para operação comercial, planeje e teste: persistência de pedidos, gestão de estoque, pagamentos e webhooks reais, logística e rastreamento de transportadora, cálculo de comissões e saques, observabilidade, testes automatizados, prevenção a fraude, acessibilidade, suporte, políticas de privacidade e revisão jurídica.

## 👨‍💻 Autor e licença

**Rafael Oliveira**  
Projeto acadêmico/TCC: **KoraMarketplace / FlashMarket**  
GitHub: https://github.com/RafaelOliveirxis

Projeto voltado a fins acadêmicos, educacionais e demonstrativos. Antes de redistribuir ou publicar, confira os direitos e licenças de imagens, fontes, bibliotecas e outros recursos de terceiros utilizados no projeto.

---

<p align="center">
  ⚡ <strong>FlashMarket</strong><br>
  Marketplace em evolução para Web, PWA e Mobile.
</p>
