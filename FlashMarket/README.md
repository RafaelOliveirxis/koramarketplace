# ⚡ FlashMarket — Frontend do KoraMarketplace

> **Frontend responsivo do KoraMarketplace**, desenvolvido para experiência de e-commerce em desktop, smartphone, PWA e futura aplicação mobile.

O diretório `FlashMarket/` concentra a interface principal da loja: catálogo, categorias, ofertas, carrinho, favoritos, conta do usuário, rastreamento de pedidos, Área de Afiliado, atendimento e recursos de instalação como aplicativo.

---

## 🌐 Projeto

**Repositório:**
https://github.com/RafaelOliveirxis/koramarketplace

**GitHub Pages:**
https://rafaeloliveirxis.github.io/koramarketplace/

**API / Backend:**
https://koramarketplace.vercel.app

---

## ✨ Funcionalidades

### 🛍️ Loja

- Catálogo de produtos
- Busca de produtos
- Categorias
- Ofertas Flash
- Carrinho de compras
- Favoritos
- Cupons
- Avaliações
- Checkout e estrutura para integração com pedidos reais
- Benefícios de frete, pagamento seguro e compra protegida

### 👤 Conta do usuário

- Cadastro
- Login
- Logout
- Recuperação de senha
- Perfil
- Minha Conta
- Sessão persistida
- Integração com API de autenticação
- Fallback local para demonstração quando a API não estiver disponível

### 📦 Pedidos

- Rastrear pedido
- Página de acompanhamento
- Estrutura preparada para integração com pedidos reais e transportadoras

### 🤝 Área de Afiliado

A Área de Afiliado possui fluxo próprio de autenticação e dashboard.

- Cadastro de afiliado
- Login de afiliado
- Sessão persistida
- Dashboard na mesma página após autenticação
- Nome do afiliado exibido no painel
- Faturamento
- Produtos ativos
- Conversão
- Comissão
- Pedidos
- Retenção
- Saldo disponível
- Link exclusivo de afiliado
- Lista de produtos
- Atualização dos dados pela API
- Botão para sair da conta

Após o login ou cadastro, a tela de **Entrar / Criar conta desaparece** e o afiliado permanece na própria `afiliado.html`, visualizando o dashboard.

### 💬 Atendimento

- Página de suporte
- Flash IA
- Formulários de contato
- Newsletter

---

## 📱 Experiência mobile / app

O frontend possui uma interface específica para smartphones, com aparência de aplicativo e navegação otimizada para toque.

### Cabeçalho mobile

- Menu lateral `☰`
- Logo centralizada
- Usuário
- Favoritos
- Carrinho
- Campo de pesquisa

### Menu lateral

O menu reúne os principais atalhos:

- Início
- Rastrear pedido
- Área de afiliado
- Ofertas Flash
- Atendimento
- Informações da conta
- Fechamento por `X`, toque fora do menu e gesto de voltar

### Barra inferior

A navegação principal do modo aplicativo utiliza:

```text
┌────────┬──────────────┬──────────────────┬───────────┬────────┐
│ Início │ Rastrear     │ Área de afiliado │ Favoritos │ Conta  │
│        │ pedido       │                  │           │        │
└────────┴──────────────┴──────────────────┴───────────┴────────┘
```

### Desktop

No desktop, o site mantém o cabeçalho e a navegação tradicional, sem forçar o menu mobile.

### Rodapé

No modo mobile/app, o rodapé tradicional é ocultado para priorizar a navegação inferior e deixar a interface mais próxima de um aplicativo nativo.

---

## 📲 PWA

Principais arquivos:

```text
manifest.webmanifest
sw.js
js/pwa.js
```

O frontend pode ser instalado como aplicativo pelo navegador compatível.

### Android / Chrome

Abra a versão publicada do site e utilize **Instalar app** quando a opção for disponibilizada pelo navegador.

### iPhone / iPad

Utilize:

**Compartilhar → Adicionar à Tela de Início**

---

## 🔐 Autenticação e API

O frontend utiliza a API hospedada na Vercel quando disponível.

Endpoints principais:

```text
POST /auth/register
POST /auth/login
POST /auth/logout
GET  /auth/me
PUT  /auth/profile
POST /auth/request-reset
POST /auth/reset-password
```

A integração principal do usuário está em:

```text
js/auth-real.js
```

A Área de Afiliado utiliza:

```text
js/affiliate-live.js
```

E o dashboard consulta:

```text
GET /affiliate/dashboard
```

A API utiliza autenticação por token e integração com banco de dados MySQL quando o ambiente de produção está configurado.

> Variáveis de ambiente, senhas, tokens e credenciais do banco não devem ser armazenados no repositório.

---

## 🗄️ Backend

O backend do projeto está organizado no diretório `api/` do repositório principal.

Principais áreas:

```text
api/
├── _lib/
│   ├── auth.js
│   ├── cors.js
│   └── db.js
│
├── auth/
│   ├── login.js
│   ├── register.js
│   ├── logout.js
│   ├── me.js
│   ├── profile.js
│   ├── request-reset.js
│   └── reset-password.js
│
└── affiliate/
    ├── dashboard.js
    ├── products.js
    ├── click.js
    └── setup.sql
```

### Variáveis da API

Na Vercel, as configurações do backend devem ser adicionadas como variáveis de ambiente, por exemplo:

```text
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
DB_SSL
JWT_SECRET
```

O arquivo `.env` local não deve ser enviado ao GitHub.

---

## 💾 Armazenamento local

O navegador utiliza `localStorage` para determinados recursos da experiência, como:

- carrinho;
- favoritos;
- sessão local;
- preferências;
- dados de demonstração;
- estado da interface.

O armazenamento local não substitui o banco de dados e a autenticação de produção.

---

## 📁 Estrutura do frontend

```text
FlashMarket/
├── index.html
├── minha-conta.html
├── rastrear-pedido.html
├── afiliado.html
├── suporte.html
├── manifest.webmanifest
├── sw.js
├── README.md
│
├── assets/
│   ├── imagens
│   ├── logos
│   └── ícones
│
├── css/
│   ├── style.css
│   ├── mobile-app.css
│   ├── mobile-fix.css
│   ├── mobile-app-v3.css
│   ├── mobile-app-final.css
│   └── affiliate-live.css
│
└── js/
    ├── app.js
    ├── auth-real.js
    ├── affiliate-live.js
    ├── mobile-app.js
    ├── pwa.js
    ├── rastreamento.js
    └── suporte.js
```

---

## 🛠️ Tecnologias

- HTML5
- CSS3
- JavaScript ES6+
- LocalStorage
- PWA
- Service Worker
- Web Manifest
- Capacitor
- Google Fonts
- API REST
- Vercel
- MySQL
- Git / GitHub

---

## 🚀 Executar localmente

Na raiz do projeto:

```bash
git clone https://github.com/RafaelOliveirxis/koramarketplace.git
cd koramarketplace
npm install
```

Para testar o frontend, recomenda-se utilizar o **Live Server** do VS Code ou outro servidor HTTP local.

Exemplo:

```text
FlashMarket/index.html
```

Para testar recursos como PWA, Service Worker e autenticação, prefira uma URL `http://localhost` em vez de abrir diretamente com `file://`.

---

## 🔄 Atualizar o projeto pelo Git

```bash
git pull origin main
git status
git add .
git commit -m "feat: atualizar projeto"
git push origin main
```

---

## 🎟️ Cupom demonstrativo

```text
FLASH10
```

O cupom faz parte do ambiente demonstrativo do e-commerce.

---

## ⚠️ Produção

Para colocar todos os recursos em produção, a API e os serviços externos precisam estar corretamente configurados, incluindo:

- banco MySQL;
- variáveis de ambiente da Vercel;
- autenticação;
- pagamentos;
- estoque;
- pedidos;
- transportadoras;
- e-mail;
- notificações;
- dados reais de afiliados e comissões.

A interface pode funcionar em modo demonstrativo quando determinados serviços externos não estiverem disponíveis.

---

## 🎓 Projeto acadêmico

O FlashMarket / KoraMarketplace é um projeto acadêmico/TCC desenvolvido para demonstrar conhecimentos de:

- desenvolvimento web;
- HTML5;
- CSS3;
- JavaScript;
- UI/UX;
- responsividade;
- PWA;
- APIs REST;
- autenticação;
- banco de dados;
- Git e GitHub;
- preparação para aplicações mobile.

---

## 👨‍💻 Autor

**Rafael Oliveira**

Projeto acadêmico — **KoraMarketplace / FlashMarket**

GitHub:
https://github.com/RafaelOliveirxis

---

## 📄 Licença

Projeto destinado a fins acadêmicos, educacionais e demonstrativos. Respeite a autoria e as licenças dos recursos de terceiros utilizados.

---

<p align="center">
  ⚡ <strong>FlashMarket / KoraMarketplace</strong>
</p>
