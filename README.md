# ⚡ FlashMarket — KoraMarketplace

> Marketplace web responsivo desenvolvido como projeto acadêmico/TCC, com experiência desktop e mobile, PWA, checkout demonstrativo e uma API opcional.

**FlashMarket** é a interface de comércio eletrônico do projeto **KoraMarketplace**. O repositório reúne o frontend, funções de API, arquivos de configuração de deploy e preparação para aplicativos móveis com Capacitor.

## 🌐 Links

| Recurso | Link |
|---|---|
| **Site publicado (Vercel)** | https://koramarketplace.vercel.app/ |
| Frontend estático (GitHub Pages) | https://rafaeloliveirxis.github.io/koramarketplace/ |
| Repositório | https://github.com/RafaelOliveirxis/koramarketplace |
| Frontend | [FlashMarket/](./FlashMarket/) |
| Documentação da API | [api/README.md](./api/README.md) |
| Preparação mobile | [MOBILE-STORE-SETUP.md](./MOBILE-STORE-SETUP.md) |
| Pipeline de release | [RELEASE-PIPELINE.md](./RELEASE-PIPELINE.md) |
| Checklist para lojas | [STORE-RELEASE-CHECKLIST.md](./STORE-RELEASE-CHECKLIST.md) |
| Guia de pagamentos | [PAGAMENTO-MERCADOPAGO-MYSQL.md](./PAGAMENTO-MERCADOPAGO-MYSQL.md) |

> **Importante:** os links de produção podem receber atualizações em momentos diferentes. Recursos que dependem de banco de dados, e-mail, pagamento ou outros serviços externos só funcionam quando a respectiva integração está configurada e validada.

## ✨ Funcionalidades do projeto

### Loja e navegação
- Catálogo, busca, categorias, filtros e ofertas.
- Carrinho, favoritos, cupons demonstrativos e avaliações na interface.
- Layout responsivo para desktop, tablet e celular.
- Navegação mobile com atalhos para áreas importantes.
- Tema e preferências locais quando disponíveis.

### Checkout e pedidos
- Fluxo de checkout em etapas: entrega, pagamento e revisão.
- Opções demonstrativas de frete e formas de pagamento.
- Criação de pedido em **modo simulação**, com página de detalhes.
- Páginas de consulta e rastreamento de pedidos.
- O checkout demonstrativo não realiza cobrança e não deve ser tratado como venda real; os pedidos locais podem ficar salvos no navegador.

### Conta e afiliados
- Páginas de cadastro, login, perfil e recuperação de senha.
- Estrutura de autenticação via API.
- Área de afiliados com painel, links e métricas demonstrativas ou dependentes da API configurada.
- Atendimento e interface do assistente Flash IA.

### PWA e mobile
- Web App Manifest e Service Worker.
- Instalação em navegadores compatíveis.
- Configuração para preparar versões Android/iOS com Capacitor.

## 🧰 Tecnologias

- **Frontend:** HTML5, CSS3, JavaScript ES6+, Fetch API e LocalStorage.
- **PWA:** Web App Manifest e Service Worker.
- **API:** funções serverless Node.js, endpoints REST, JWT, bcryptjs e CORS.
- **Banco de dados:** MySQL via mysql2.
- **Mobile:** Capacitor para Android/iOS.
- **Hospedagem e versionamento:** Vercel, GitHub Pages e Git.

## 📁 Estrutura do repositório

```text
koramarketplace/
├── .github/                   # Workflows e automações
├── FlashMarket/               # Frontend da loja
│   ├── assets/                # Imagens, ícones e recursos
│   ├── css/                   # Estilos e responsividade
│   ├── js/                    # Lógica da interface
│   ├── index.html             # Página inicial
│   ├── checkout.html          # Checkout demonstrativo
│   ├── pedido.html            # Detalhes do pedido
│   ├── rastrear-pedido.html   # Rastreamento
│   ├── afiliado.html          # Área de afiliados
│   ├── manifest.webmanifest   # Configuração PWA
│   └── sw.js                  # Service Worker
├── api/                       # API serverless
│   ├── _lib/                  # Utilitários compartilhados
│   ├── auth/                  # Autenticação e perfil
│   ├── affiliate/             # Endpoints de afiliados
│   └── README.md
├── assets/                    # Recursos compartilhados
├── scripts/                   # Scripts de preparação
├── flashmarket.sql            # Estrutura/dump SQL de desenvolvimento
├── package.json               # Scripts e dependências
├── capacitor.config.ts        # Configuração do Capacitor
├── vercel.json                # Configuração de deploy
└── README.md
```

## 🚀 Começar localmente

### Requisitos
- Node.js **22.x** (conforme `package.json`)
- npm
- Git
- Navegador moderno

### 1. Clonar e instalar

```bash
git clone https://github.com/RafaelOliveirxis/koramarketplace.git
cd koramarketplace
npm install
```

### 2. Validar arquivos básicos do frontend

```bash
npm run web:check
```

### 3. Executar o site localmente

```bash
npm run web:serve
```

O comando usa o pacote `serve` via `npx` para servir a pasta `FlashMarket/`. Abra no endereço local mostrado no terminal.

Também é possível abrir `FlashMarket/index.html` com uma extensão como Live Server no VS Code. Para testar recursos de PWA, prefira um servidor local ou HTTPS em vez de abrir o arquivo diretamente.

## 🔐 API e configuração

A pasta `api/` contém endpoints serverless. A disponibilidade de cada rota depende do deploy e das variáveis configuradas.

Variáveis de ambiente utilizadas pelo backend podem incluir:

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

Nem todas as funcionalidades exigem todas as variáveis. Configure apenas as necessárias para os recursos que estiver usando, na plataforma de hospedagem.

**Nunca commite credenciais reais, tokens, senhas, chaves privadas ou arquivos `.env`.** Use variáveis de ambiente no provedor de deploy e, se uma credencial for exposta, revogue-a e gere outra.

Consulte [api/README.md](./api/README.md) para endpoints, banco, autenticação e deploy.

## 🗄️ Banco de dados

O projeto inclui `flashmarket.sql` e scripts SQL específicos em diretórios da API. Revise o conteúdo do arquivo antes de importar e execute somente os scripts adequados ao ambiente.

- Faça backup antes de alterar um banco existente.
- Não utilize dados pessoais reais em ambientes de demonstração.
- Confirme que o esquema instalado corresponde às rotas da API.
- O LocalStorage do navegador não substitui persistência centralizada em banco de dados.

## ☁️ Publicação

### Vercel
O repositório possui `vercel.json` e funções em `api/`. Conecte o repositório à Vercel, configure as variáveis necessárias e valide os logs de build e as rotas após cada deploy.

### GitHub Pages
O GitHub Pages pode servir a versão estática do frontend. Funcionalidades serverless não são executadas pelo GitHub Pages; para usá-las, o frontend precisa apontar para uma API hospedada e acessível.

## 📱 PWA e aplicativos móveis

O frontend inclui `FlashMarket/manifest.webmanifest` e `FlashMarket/sw.js`.

Para preparar o ambiente Capacitor:

```bash
npm run mobile:prepare
```

Para adicionar e preparar a plataforma Android:

```bash
npm run mobile:android
```

Para iOS:

```bash
npm run mobile:ios
```

**Android:** requer Android Studio e SDK configurados. **iOS:** requer macOS e Xcode. Esses comandos preparam o projeto; não significam que um aplicativo já esteja publicado nas lojas.

## 🧪 Verificações recomendadas antes de publicar

- [ ] Executar `npm run web:check`.
- [ ] Testar navegação em desktop e celular.
- [ ] Testar carrinho vazio, carrinho preenchido e atualização de quantidades.
- [ ] Testar checkout simulado e página de detalhes do pedido.
- [ ] Confirmar claramente que o checkout de demonstração não cobra dinheiro.
- [ ] Validar endpoints e variáveis de ambiente da API.
- [ ] Confirmar conexão com o banco e esquema instalado.
- [ ] Verificar console do navegador e logs de deploy.
- [ ] Revisar links, formulários, acessibilidade e estados de erro.
- [ ] Confirmar que nenhum segredo foi enviado ao repositório.

## 🔭 Próximas evoluções

A evolução para operação comercial exige implementar e testar, entre outros itens, pagamentos reais e webhooks, persistência de pedidos e carrinho, estoque, integração com transportadoras, observabilidade, testes automatizados, controles antifraude e políticas de privacidade.

## 👨‍💻 Autor

**Rafael Oliveira**  
Projeto acadêmico/TCC: **KoraMarketplace / FlashMarket**  
GitHub: https://github.com/RafaelOliveirxis

## 📄 Licença

Projeto desenvolvido para fins acadêmicos, educacionais e demonstrativos. Verifique os direitos e as licenças de imagens, fontes, bibliotecas e outros recursos de terceiros usados no projeto.

---

<p align="center">
  ⚡ <strong>FlashMarket</strong><br>
  Uma experiência de marketplace em evolução para Web, PWA e Mobile.
</p>
