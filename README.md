# ⚡ KoraMarketplace

> **Marketplace digital responsivo, moderno e preparado para Web, PWA e aplicativo mobile**, desenvolvido como projeto acadêmico/TCC a partir do FlashMarket.

O **KoraMarketplace** reúne uma experiência de e-commerce, autenticação de usuários, área do cliente, rastreamento de pedidos, área de afiliados, atendimento, PWA e uma API serverless em um único projeto.

---

## 🌐 Projeto

- **Repositório:** https://github.com/RafaelOliveirxis/koramarketplace
- **Frontend publicado:** https://rafaeloliveirxis.github.io/koramarketplace/
- **Frontend:** `FlashMarket/`
- **API:** `api/`

---

## 🛍️ Sobre o projeto

O KoraMarketplace foi desenvolvido para oferecer uma experiência de compra simples, rápida e visualmente próxima de um aplicativo de marketplace.

A interface é adaptada para desktop, tablet e smartphone. No modo mobile, o projeto utiliza cabeçalho compacto, menu lateral, busca, navegação inferior e acesso rápido a:

**Início · Rastrear pedido · Área de afiliado · Favoritos · Conta**

A identidade visual mantém a marca **FlashMarket**, utilizada na interface e nos recursos promocionais.

---

## ✨ Funcionalidades

### 🛒 E-commerce

- Catálogo de produtos
- Pesquisa de produtos
- Categorias
- Ofertas Flash
- Cards de produtos
- Carrinho de compras
- Favoritos
- Cupons demonstrativos
- Avaliações
- Checkout demonstrativo
- Estrutura para Pix, cartão e boleto

### 👤 Conta e autenticação

- Cadastro de usuário
- Login
- Logout
- Recuperação de senha
- Perfil do usuário
- Minha Conta
- Sessão persistida no navegador
- Integração com API de autenticação
- JWT para sessão da API
- Fallback local para testes do frontend quando a API não estiver disponível

> O fallback local é destinado a testes e demonstração. Para autenticação persistente entre dispositivos, é necessário manter a API e o banco de dados configurados.

### 📦 Pedidos

- Rastreamento de pedidos
- Página de acompanhamento
- Estrutura preparada para pedidos reais
- Estrutura preparada para integração com transportadoras

### 🤝 Área de afiliados

A Área de Afiliados possui fluxo próprio de autenticação e dashboard.

- Cadastro de afiliado
- Login de afiliado
- Logout
- Sessão persistida
- Dashboard após autenticação na **mesma página**
- Nome do afiliado no painel
- Receita/vendas do período
- Produtos ativos
- Conversão
- Receita líquida
- Comissão total
- Pedidos ativos
- Retenção
- Link exclusivo de afiliado
- Cópia do link de divulgação
- Filtro por período
- Lista de pedidos
- Lista de produtos afiliados
- Atualização dos dados do dashboard
- Estrutura de banco para perfis, produtos, pedidos e cliques

Após o login ou cadastro, a tela de autenticação é removida e o afiliado permanece diretamente no dashboard da `afiliado.html`.

### 💬 Atendimento

- Central de suporte
- Flash IA
- Newsletter
- Formulários de contato

### 📱 Mobile / PWA

- Layout responsivo
- Cabeçalho compacto
- Menu lateral pelo botão **☰**
- Categorias acessíveis pelo menu
- Barra inferior fixa no modo aplicativo
- Navegação para Início, Rastreamento, Afiliados, Favoritos e Conta
- Rodapé tradicional ocultado no modo aplicativo
- Hero adaptado para celular
- Manifest Web App
- Service Worker
- Instalação como PWA em navegadores compatíveis

---

## 🧰 Tecnologias

### Frontend

- HTML5
- CSS3
- JavaScript ES6+
- LocalStorage
- Fetch API
- Responsive Design
- PWA / Service Worker
- Web App Manifest
- Google Fonts

### Backend / API

- Node.js
- Vercel Serverless Functions
- MySQL / MySQL2
- JWT
- bcryptjs
- CORS
- API REST

### Aplicativo

- Capacitor
- Android
- iOS

### Versionamento e deploy

- Git
- GitHub
- GitHub Pages
- Vercel
- GitHub Actions

---

## 📁 Estrutura do projeto

```text
koramarketplace/
├── .github/
│   └── workflows/                 # Automação
├── FlashMarket/
│   ├── assets/                    # Imagens, logos e ícones
│   ├── css/                       # Estilos do projeto
│   ├── js/                        # Scripts do frontend
│   │   ├── auth-real.js            # Autenticação do cliente
│   │   ├── affiliate-live.js       # Área de afiliados
│   │   ├── mobile-app.js            # Experiência mobile
│   │   └── pwa.js                   # PWA e carregamento mobile
│   ├── index.html                 # Página inicial
│   ├── minha-conta.html           # Área do cliente
│   ├── rastrear-pedido.html       # Rastreamento
│   ├── afiliado.html              # Área de afiliados
│   ├── suporte.html               # Atendimento
│   ├── manifest.webmanifest        # Manifest PWA
│   └── sw.js                      # Service Worker
├── api/
│   ├── _lib/                     # Banco, autenticação e CORS
│   ├── auth/                     # Endpoints de autenticação
│   ├── affiliate/                # Endpoints da área de afiliados
│   └── README.md                 # Documentação da API
├── capacitor.config.ts            # Configuração Capacitor
├── package.json                  # Dependências e scripts
├── package-lock.json              # Lockfile
├── vercel.json                   # Configuração Vercel
├── .gitignore
└── README.md                     # Documentação principal
```

---

## 🚀 Executar localmente

### Pré-requisitos

- Node.js LTS
- npm
- Git
- VS Code
- Live Server (recomendado para o frontend)

Verifique as versões:

```bash
node -v
npm -v
npx -v
```

### Clonar o projeto

```bash
git clone https://github.com/RafaelOliveirxis/koramarketplace.git
cd koramarketplace
```

### Instalar dependências

```bash
npm install
```

### Abrir o frontend

Abra `FlashMarket/index.html` usando o Live Server do VS Code para evitar limitações de navegador relacionadas a páginas abertas diretamente por `file://`.

---

## 🔐 API e autenticação

A pasta `api/` contém as funções serverless da aplicação.

### Autenticação

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
PUT  /api/auth/profile
POST /api/auth/request-reset
POST /api/auth/reset-password
```

### Área de afiliados

```text
GET  /api/affiliate/dashboard
GET  /api/affiliate/products
POST /api/affiliate/products
POST /api/affiliate/click
```

A API utiliza variáveis de ambiente para conexão com o banco e assinatura dos tokens.

Exemplo de configuração necessária na Vercel:

```text
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
DB_SSL
JWT_SECRET
```

**Nunca publique no GitHub:**

- senha do banco;
- `JWT_SECRET`;
- tokens;
- chaves privadas;
- arquivos `.env`.

---

## 🗄️ Banco de dados

O backend foi estruturado para MySQL.

A Área de Afiliados possui um script de estrutura em:

```text
api/affiliate/setup.sql
```

As tabelas utilizadas pela área de afiliados incluem estruturas para:

- perfis de afiliados;
- produtos afiliados;
- pedidos;
- cliques.

Para funcionamento completo em produção, o banco precisa estar criado e as variáveis de conexão configuradas no ambiente da Vercel.

---

## 📲 PWA

Arquivos principais:

```text
FlashMarket/manifest.webmanifest
FlashMarket/sw.js
FlashMarket/js/pwa.js
```

Em navegadores compatíveis, o usuário pode instalar o KoraMarketplace como aplicativo.

No iPhone/iPad, utilize **Compartilhar → Adicionar à Tela de Início**.

---

## 📱 Capacitor

A aplicação também possui configuração para evolução para Android e iOS.

```bash
npm install
npx cap add android
npx cap add ios
npm run cap:sync
npm run cap:android
npm run cap:ios
```

Android requer Android Studio. iOS requer macOS com Xcode.

---

## 🌐 Deploy

### GitHub Pages

O frontend pode ser publicado pelo GitHub Pages:

https://rafaeloliveirxis.github.io/koramarketplace/

### Vercel

A pasta `api/` foi organizada para funcionar como funções serverless na Vercel.

As credenciais do banco e demais segredos devem ser configurados nas **Environment Variables** da Vercel e não no repositório.

---

## 🔄 Atualizar o projeto pelo terminal

Depois de alterar os arquivos:

```bash
git status
git add .
git commit -m "feat: atualizar KoraMarketplace"
git push origin main
```

Antes de começar um novo trabalho:

```bash
git pull origin main
```

---

## 🧪 Status do projeto

**Em desenvolvimento ativo.**

O frontend, a experiência mobile, o PWA, a autenticação e a estrutura da Área de Afiliados estão em evolução.

Recursos que dependem de serviços externos, como banco de dados, pagamentos, estoque, pedidos reais, transportadoras e notificações, precisam estar configurados para uso em produção.

---

## 🔮 Próximas evoluções

- Persistência completa de pedidos
- Integração com transportadoras
- Gateway de pagamento real
- Estoque real
- Painel administrativo
- Gestão de vendedores
- Sistema completo de comissões e saques
- Rastreamento de cliques e conversões por afiliado
- Notificações push
- Analytics
- Testes automatizados
- Melhorias contínuas de segurança
- Publicação dos aplicativos Android/iOS

---

## 👨‍💻 Autor

**Rafael Oliveira**  
Projeto acadêmico / TCC — KoraMarketplace / FlashMarket

GitHub: https://github.com/RafaelOliveirxis

---

## 📄 Licença

Projeto desenvolvido para fins acadêmicos, educacionais e demonstrativos. Respeite a autoria e as licenças dos recursos de terceiros utilizados no projeto.

---

<p align="center">
  ⚡ <strong>KoraMarketplace</strong> — experiência de marketplace para Web e Mobile.
</p>
