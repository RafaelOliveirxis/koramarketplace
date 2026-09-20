# ⚡ FlashMarket — Frontend do KoraMarketplace

> **Frontend principal do FlashMarket / KoraMarketplace**, um marketplace acadêmico desenvolvido com HTML5, CSS3 e JavaScript, com experiência responsiva para desktop e smartphones, PWA, autenticação integrada à API, área de afiliados e estrutura preparada para evolução para aplicativo mobile.

O diretório `FlashMarket/` concentra a interface visual e as principais páginas da plataforma. O projeto foi organizado para funcionar como **site responsivo**, **PWA instalável** e base para futuras versões mobile.

---

## 📌 Visão geral

O **FlashMarket** foi desenvolvido com a proposta de simular uma plataforma moderna de comércio eletrônico, reunindo catálogo de produtos, pesquisa, categorias, ofertas, carrinho, favoritos, conta do usuário, pedidos, atendimento e Área de Afiliado em uma única experiência.

O projeto faz parte do **KoraMarketplace**, cujo código-fonte está disponível no GitHub.

### Principais objetivos

- Criar uma experiência de e-commerce moderna e responsiva.
- Adaptar a interface para computadores, tablets e smartphones.
- Oferecer navegação semelhante a aplicativos em telas pequenas.
- Integrar autenticação real com API e banco de dados.
- Disponibilizar recursos de PWA.
- Criar uma base organizada para futura evolução para Android e iOS.
- Demonstrar conhecimentos de desenvolvimento web, UI/UX, APIs, banco de dados e Git/GitHub.

---

## 🌐 Links do projeto

| Recurso | Acesso |
|---|---|
| 📦 Repositório | https://github.com/RafaelOliveirxis/koramarketplace |
| 🌍 Site / GitHub Pages | https://rafaeloliveirxis.github.io/koramarketplace/ |
| 🚀 API / Backend | https://koramarketplace.vercel.app |
| 👨‍💻 GitHub do autor | https://github.com/RafaelOliveirxis |

---

# ✨ Funcionalidades

## 🛍️ Marketplace

O frontend reúne recursos de uma loja virtual completa:

- Catálogo de produtos.
- Busca de produtos.
- Pesquisa por texto.
- Categorias.
- Filtros.
- Ofertas Flash.
- Produtos em destaque.
- Lojas oficiais.
- Avaliações.
- Favoritos.
- Carrinho de compras.
- Cupons promocionais.
- Cashback.
- Benefícios da plataforma.
- Newsletter.
- Estrutura de checkout.
- Área de pedidos.
- Rastreamento.
- Atendimento ao cliente.

---

## 🔎 Pesquisa e navegação

A interface foi estruturada para facilitar a descoberta de produtos.

Recursos previstos no frontend:

- Campo de pesquisa.
- Busca por nome.
- Navegação por categorias.
- Filtros de produtos.
- Seções de ofertas.
- Cards responsivos.
- Links rápidos.
- Menu principal.
- Menu mobile.
- Navegação inferior em smartphones.

---

# 👤 Conta do usuário

A plataforma possui uma área dedicada ao usuário.

### Recursos

- Cadastro.
- Login.
- Logout.
- Perfil.
- Minha Conta.
- Persistência de sessão.
- Consulta de usuário autenticado.
- Atualização de perfil.
- Recuperação de senha.
- Integração com API.
- Token de autenticação.

### Arquivo principal

```text
js/auth-real.js
```

A autenticação de produção utiliza a API hospedada na Vercel e o banco de dados MySQL configurado no backend.

---

# 🔐 Autenticação e segurança

A autenticação é feita por API REST.

### Endpoints principais

```text
POST /auth/register
POST /auth/login
POST /auth/logout
GET  /auth/me
PUT  /auth/profile
POST /auth/request-reset
POST /auth/reset-password
```

O backend utiliza:

- JWT para sessão autenticada.
- bcrypt para proteção de senhas.
- CORS configurado.
- MySQL para persistência.
- Variáveis de ambiente para credenciais.
- Separação entre frontend e backend.

### Importante

**Nunca coloque no GitHub:**

- senha do banco;
- JWT_SECRET;
- tokens;
- chaves privadas;
- senhas de usuários;
- arquivos `.env` com credenciais reais.

As credenciais devem permanecer nas variáveis de ambiente da plataforma de hospedagem.

---

# 🤝 Área de Afiliado

A Área de Afiliado possui autenticação e integração própria com a API.

### Recursos

- Cadastro de afiliado.
- Login.
- Sessão persistida.
- Dashboard.
- Nome do afiliado.
- Saldo disponível.
- Comissão.
- Faturamento.
- Conversão.
- Retenção.
- Produtos ativos.
- Pedidos.
- Links de afiliado.
- Lista de produtos.
- Atualização dos dados.
- Encerramento da sessão.

### Arquivos

```text
afiliado.html
js/affiliate-live.js
css/affiliate-live.css
```

### Dashboard

A página consulta os dados através de:

```text
GET /affiliate/dashboard
```

Após a autenticação, a interface permanece na própria página de afiliado e apresenta o painel correspondente à sessão.

---

# 📦 Pedidos e rastreamento

O projeto possui estrutura para acompanhamento de pedidos.

### Recursos

- Página de rastreamento.
- Consulta de pedido.
- Área relacionada à conta.
- Estrutura para integração futura com transportadoras.
- Preparação para dados reais de pedidos.

Arquivo relacionado:

```text
rastrear-pedido.html
js/rastreamento.js
```

---

# 💬 Atendimento

O FlashMarket possui uma área dedicada ao suporte.

### Recursos

- Central de atendimento.
- Formulários.
- Flash IA.
- Newsletter.
- Links de suporte.
- Estrutura para comunicação com o usuário.

Arquivo relacionado:

```text
suporte.html
js/suporte.js
```

---

# 📱 Design responsivo

O frontend possui tratamento específico para diferentes tamanhos de tela.

## 🖥️ Desktop

Em telas maiores, a interface mantém:

- Header completo.
- Navegação tradicional.
- Pesquisa em destaque.
- Menu de categorias.
- Banner/hero.
- Grade de produtos.
- Seções promocionais.
- Benefícios.
- Newsletter.
- Rodapé completo.

## 📱 Smartphone

O design mobile foi atualizado para proporcionar uma experiência mais próxima de um aplicativo.

### Recursos mobile

- Header compacto.
- Logo centralizada.
- Menu mobile.
- Pesquisa em largura adaptada.
- Ícones de usuário, favoritos e carrinho.
- Navegação por toque.
- Menu lateral.
- Cards responsivos.
- Grade adaptada para telas pequenas.
- Ofertas organizadas para mobile.
- Categorias com rolagem horizontal.
- Botões maiores para toque.
- Espaçamento adaptado.
- Suporte a áreas seguras de aparelhos com notch.
- Prevenção de overflow horizontal.
- Navegação inferior em modo aplicativo.

### Desktop preservado

As alterações de responsividade foram direcionadas às telas menores para evitar mudanças desnecessárias na experiência desktop.

---

# 📲 PWA — Progressive Web App

O FlashMarket possui estrutura de **Progressive Web App**.

Principais arquivos:

```text
manifest.webmanifest
sw.js
js/pwa.js
```

### Recursos

- Web App Manifest.
- Service Worker.
- Instalação pelo navegador.
- Ícone de aplicativo.
- Experiência semelhante a aplicativo.
- Cache de recursos compatível com a estratégia definida pelo projeto.
- Adaptação para smartphones.

### Android

Em navegadores compatíveis:

```text
Site → Menu do navegador → Instalar aplicativo
```

### iPhone / iPad

```text
Safari → Compartilhar → Adicionar à Tela de Início
```

> A disponibilidade da opção de instalação depende do navegador, sistema operacional e requisitos do PWA.

---

# 🧭 Navegação mobile

O modo mobile foi pensado para facilitar o uso com uma mão.

### Menu lateral

Pode reunir atalhos como:

- Início.
- Rastrear pedido.
- Área de afiliado.
- Ofertas Flash.
- Atendimento.
- Conta.
- Outros recursos da plataforma.

### Navegação inferior

A experiência mobile utiliza uma navegação rápida para áreas importantes, como:

```text
┌────────┬────────────┬──────────────────┬───────────┬────────┐
│ Início │ Rastrear   │ Afiliado         │ Favoritos │ Conta  │
└────────┴────────────┴──────────────────┴───────────┴────────┘
```

O objetivo é reduzir a quantidade de passos necessários para acessar os principais recursos.

---

# 🧠 Flash IA

A interface possui integração visual com o conceito de **Flash IA**, utilizado como assistente dentro da experiência do marketplace.

A funcionalidade pode ser expandida futuramente para:

- dúvidas sobre produtos;
- suporte;
- busca inteligente;
- recomendações;
- acompanhamento de pedidos;
- perguntas frequentes.

---

# 💾 Armazenamento local

Alguns recursos de experiência utilizam `localStorage`.

Exemplos:

- Carrinho.
- Favoritos.
- Preferências.
- Sessão local.
- Dados de demonstração.
- Estado de componentes da interface.
- Preferências de tema.

O `localStorage` é utilizado como recurso do frontend e **não substitui o banco de dados de produção**.

---

# 🗄️ Backend e API

O backend está localizado no diretório:

```text
api/
```

A API é preparada para execução em ambiente serverless/Vercel.

## Estrutura principal

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

---

# 🛠️ Tecnologias utilizadas

## Frontend

- HTML5.
- CSS3.
- JavaScript ES6+.
- Responsive Design.
- LocalStorage.
- Web Manifest.
- Service Worker.
- PWA.

## Backend

- Node.js.
- Express.
- API REST.
- JWT.
- bcryptjs.
- MySQL.
- Vercel Functions.

## Desenvolvimento

- Git.
- GitHub.
- Visual Studio Code.
- Vercel.
- MySQL.
- Capacitor.
- Google Fonts.

---

# 📁 Estrutura do projeto

A estrutura principal é semelhante a:

```text
koramarketplace/
│
├── FlashMarket/
│   ├── index.html
│   ├── minha-conta.html
│   ├── rastrear-pedido.html
│   ├── afiliado.html
│   ├── suporte.html
│   ├── manifest.webmanifest
│   ├── sw.js
│   ├── README.md
│   │
│   ├── assets/
│   │   ├── imagens
│   │   ├── logos
│   │   └── ícones
│   │
│   ├── css/
│   │   ├── style.css
│   │   ├── mobile-app.css
│   │   ├── mobile-fix.css
│   │   ├── mobile-app-v3.css
│   │   ├── mobile-app-final.css
│   │   └── affiliate-live.css
│   │
│   └── js/
│       ├── app.js
│       ├── auth-real.js
│       ├── affiliate-live.js
│       ├── mobile-app.js
│       ├── pwa.js
│       ├── rastreamento.js
│       └── suporte.js
│
├── api/
│   ├── _lib/
│   ├── auth/
│   └── affiliate/
│
├── flashmarket.sql
├── vercel.json
├── package.json
└── README.md
```

> A estrutura pode receber novos arquivos conforme novas funcionalidades sejam implementadas.

---

# 🗃️ Banco de dados

O projeto utiliza MySQL para persistência dos dados da aplicação.

O dump estrutural do projeto está disponível na raiz:

```text
flashmarket.sql
```

Entre as estruturas existentes estão:

```text
categorias
cupons
enderecos
favoritos
itens_pedido
password_reset_tokens
pedidos
produtos
users
usuarios
```

O arquivo SQL serve como referência para estrutura e inicialização do banco.

### Segurança

O dump publicado no projeto não deve conter:

- senhas reais;
- tokens ativos;
- credenciais do banco;
- chaves privadas;
- dados pessoais reais de usuários.

---

# 🔧 Variáveis de ambiente

No ambiente de produção, a API utiliza variáveis como:

```text
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
DB_SSL
JWT_SECRET
```

### Exemplo conceitual

```env
DB_HOST=seu-host
DB_PORT=3306
DB_USER=seu-usuario
DB_PASSWORD=sua-senha
DB_NAME=seu-banco
DB_SSL=true
JWT_SECRET=uma-chave-secreta
```

**Não utilize esse exemplo com valores reais no GitHub.**

---

# 🚀 Executar localmente

## 1. Clonar o repositório

```bash
git clone https://github.com/RafaelOliveirxis/koramarketplace.git
cd koramarketplace
```

## 2. Instalar dependências

```bash
npm install
```

## 3. Abrir o frontend

Acesse:

```text
FlashMarket/index.html
```

Para recursos como PWA, Service Worker e autenticação, é recomendado utilizar um servidor HTTP local.

### VS Code

Uma opção prática é utilizar o **Live Server**.

Exemplo:

```text
http://localhost:5500/FlashMarket/
```

Evite testar PWA e Service Worker abrindo somente:

```text
file:///
```

---

# 🔄 Fluxo de desenvolvimento

Uma rotina recomendada para alterações é:

```bash
git pull origin main
git status
```

Depois de modificar os arquivos:

```bash
git add .
git commit -m "feat: descrever alteração"
git push origin main
```

Para verificar o histórico:

```bash
git log --oneline --decorate --graph -20
```

---

# ☁️ Deploy

## GitHub Pages

O frontend pode ser publicado gratuitamente através do GitHub Pages.

Site atual:

```text
https://rafaeloliveirxis.github.io/koramarketplace/
```

## Vercel

A API/backend utiliza a Vercel.

Endpoint principal:

```text
https://koramarketplace.vercel.app
```

Para produção, as variáveis de ambiente devem estar configuradas no projeto da Vercel.

---

# 📦 Capacitor e evolução para aplicativo

O projeto também pode servir como base para empacotamento mobile utilizando tecnologias como **Capacitor**.

A arquitetura permite uma evolução futura para:

- Android.
- iOS.
- APK/AAB.
- Integração com recursos nativos.
- Notificações.
- Ícone de aplicativo.
- Splash screen.
- Deep links.

O PWA continua sendo uma alternativa para disponibilizar a experiência de aplicativo diretamente pela web.

---

# 🎟️ Cupom demonstrativo

O projeto possui o cupom demonstrativo:

```text
FLASH10
```

Sua utilização depende da implementação atual do frontend e da lógica de cupons disponível no ambiente.

---

# 🧪 Testes recomendados

Antes de publicar alterações, verificar:

### Desktop

- [ ] Header.
- [ ] Pesquisa.
- [ ] Menu.
- [ ] Banner.
- [ ] Produtos.
- [ ] Carrinho.
- [ ] Favoritos.
- [ ] Conta.
- [ ] Footer.

### Mobile

- [ ] Header.
- [ ] Menu lateral.
- [ ] Pesquisa.
- [ ] Cards.
- [ ] Categorias.
- [ ] Ofertas.
- [ ] Navegação inferior.
- [ ] Botões de toque.
- [ ] Rolagem horizontal.
- [ ] Ausência de overflow lateral.

### Autenticação

- [ ] Cadastro.
- [ ] Login.
- [ ] Logout.
- [ ] Minha Conta.
- [ ] Recuperação de senha.
- [ ] Sessão.
- [ ] API.
- [ ] Banco de dados.

### Afiliado

- [ ] Cadastro.
- [ ] Login.
- [ ] Dashboard.
- [ ] Produtos.
- [ ] Pedidos.
- [ ] Comissão.
- [ ] Logout.

### PWA

- [ ] Manifest.
- [ ] Service Worker.
- [ ] Ícones.
- [ ] Instalação.
- [ ] Responsividade.

---

# ⚠️ Produção

A interface do projeto possui diversas funcionalidades implementadas, porém determinados recursos dependem de serviços externos e configuração de produção.

Para uma operação comercial real, ainda podem ser necessários:

- gateway de pagamento;
- estoque real;
- processamento de pedidos;
- transportadoras;
- cálculo de frete;
- envio de e-mails;
- notificações;
- sistema antifraude;
- políticas de privacidade;
- termos de uso;
- gestão de dados pessoais;
- monitoramento;
- backups;
- infraestrutura de produção;
- regras reais de comissão para afiliados.

A disponibilidade de cada recurso depende da configuração atual do backend e dos serviços integrados.

---

# 🎓 Projeto acadêmico / TCC

O FlashMarket / KoraMarketplace foi desenvolvido como projeto acadêmico e demonstra a aplicação prática de diferentes conhecimentos de tecnologia.

### Conteúdos demonstrados

- Desenvolvimento Web.
- HTML5.
- CSS3.
- JavaScript.
- Responsividade.
- UI/UX.
- PWA.
- APIs REST.
- Autenticação.
- JWT.
- Criptografia de senhas com bcrypt.
- Banco de dados MySQL.
- Git.
- GitHub.
- Deploy.
- Vercel.
- Organização de projeto.
- Preparação para aplicativos mobile.

---

# 🗺️ Roadmap

Possíveis evoluções do projeto:

- [ ] Melhorias contínuas no mobile.
- [ ] Melhorias de acessibilidade.
- [ ] Busca mais avançada.
- [ ] Checkout completo.
- [ ] Integração de pagamentos.
- [ ] Estoque em tempo real.
- [ ] Sistema completo de pedidos.
- [ ] Integração com transportadoras.
- [ ] Notificações.
- [ ] Expansão da Flash IA.
- [ ] Dashboard administrativo.
- [ ] Métricas avançadas para afiliados.
- [ ] Aplicativo Android.
- [ ] Aplicativo iOS.
- [ ] Publicação em lojas de aplicativos.

---

# 👨‍💻 Autor

**Rafael Oliveira**

Projeto acadêmico:

**KoraMarketplace / FlashMarket**

GitHub:

https://github.com/RafaelOliveirxis

---

# 📄 Licença e uso

Projeto desenvolvido para fins **acadêmicos, educacionais e demonstrativos**.

Recursos de terceiros, imagens, fontes, bibliotecas e demais materiais utilizados no projeto devem respeitar suas respectivas licenças e condições de uso.

---

## ⚡ FlashMarket / KoraMarketplace

**Marketplace responsivo • PWA • API • MySQL • Área de Afiliados • Experiência Mobile**

<p align="center">
  <strong>⚡ Desenvolvido por Rafael Oliveira</strong>
</p>
