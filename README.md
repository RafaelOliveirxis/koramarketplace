# ⚡ FlashMarket — KoraMarketplace

> **Marketplace digital moderno, responsivo e preparado para Web, PWA e Mobile.**

O **FlashMarket** é um projeto acadêmico/TCC de e-commerce desenvolvido com foco em uma experiência de compra rápida, organizada e adaptada para **desktop, tablet e smartphones**.

A aplicação reúne catálogo, ofertas, carrinho, favoritos, autenticação, pedidos, área de afiliados, atendimento, PWA e API serverless.

---

## 🌐 Acesse o projeto

| Recurso | Acesso |
|---|---|
| 🛍️ **Site publicado** | https://rafaeloliveirxis.github.io/koramarketplace/ |
| 💻 **GitHub** | https://github.com/RafaelOliveirxis/koramarketplace |
| ⚡ **Frontend** | `FlashMarket/` |
| 🔐 **API** | `api/` |

---

## ✨ Destaques

### 🛒 Marketplace
- Catálogo de produtos
- Busca e categorias
- Ofertas Flash
- Carrinho de compras
- Favoritos
- Cupons demonstrativos
- Avaliações
- Checkout demonstrativo
- Estrutura para Pix e cartão

### 👤 Conta
- Cadastro e login
- Logout
- Recuperação de senha
- Perfil e Minha Conta
- Sessão persistida
- Autenticação via API
- JWT e bcryptjs

### 📦 Pedidos
- Rastreamento
- Página de acompanhamento
- Estrutura para pedidos reais
- Estrutura para integração com transportadoras

### 🤝 Área de Afiliados
- Login e cadastro
- Dashboard
- Produtos afiliados
- Pedidos
- Cliques e conversões
- Comissão e receita
- Link exclusivo
- Filtros por período
- Atualização dos dados via API

---

## 📱 Design Mobile

O FlashMarket possui uma experiência específica para telas pequenas, sem alterar a estrutura principal do desktop.

No celular, o layout foi organizado para facilitar navegação e compra:

- Header compacto
- Logo centralizada
- Menu **☰**
- Busca em largura total
- Acesso rápido à conta, favoritos e carrinho
- Navegação adaptada para toque
- Hero responsivo
- Ofertas em **2 colunas**
- Cards compactos
- Categorias com rolagem horizontal
- Abas e filtros adaptados para celular
- Botões maiores para toque
- Modais responsivos
- Suporte/Flash IA adaptado
- Correção de overflow horizontal
- Suporte a diferentes tamanhos de tela
- Preservação do modo escuro quando disponível

> As alterações de design mobile ficam concentradas em regras responsivas, mantendo a experiência desktop independente.

---

## 📲 PWA

O projeto pode ser instalado como aplicativo em navegadores compatíveis.

Arquivos principais:

```text
FlashMarket/manifest.webmanifest
FlashMarket/sw.js
FlashMarket/js/pwa.js
```

### Android / Chrome

Abra o site e utilize a opção **Instalar aplicativo** ou **Adicionar à tela inicial**, quando disponível.

### iPhone / iPad

Abra no Safari e utilize:

**Compartilhar → Adicionar à Tela de Início**

---

## 🧰 Tecnologias

### Frontend
- HTML5
- CSS3
- JavaScript ES6+
- LocalStorage
- Fetch API
- Responsive Design
- PWA
- Service Worker
- Web App Manifest
- Google Fonts

### Backend
- Node.js
- Vercel Serverless Functions
- MySQL
- MySQL2
- JWT
- bcryptjs
- CORS
- REST API

### Mobile
- PWA
- Capacitor
- Android
- iOS

### Deploy
- Git
- GitHub
- GitHub Pages
- Vercel

---

## 📁 Estrutura

```text
koramarketplace/
├── .github/
│   └── workflows/
├── FlashMarket/
│   ├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── auth-real.js
│   │   ├── affiliate-live.js
│   │   ├── mobile-app.js
│   │   └── pwa.js
│   ├── index.html
│   ├── minha-conta.html
│   ├── rastrear-pedido.html
│   ├── afiliado.html
│   ├── suporte.html
│   ├── manifest.webmanifest
│   └── sw.js
├── api/
│   ├── _lib/
│   ├── auth/
│   ├── affiliate/
│   └── README.md
├── capacitor.config.ts
├── package.json
├── package-lock.json
├── vercel.json
├── .gitignore
└── README.md
```

---

## 🚀 Executar localmente

### Pré-requisitos

- Node.js LTS
- npm
- Git
- VS Code
- Live Server

Verifique:

```bash
node -v
npm -v
npx -v
```

### Clonar

```bash
git clone https://github.com/RafaelOliveirxis/koramarketplace.git
cd koramarketplace
```

### Instalar

```bash
npm install
```

### Executar frontend

Abra:

```text
FlashMarket/index.html
```

preferencialmente usando o **Live Server** do VS Code.

---

## 🔐 API

Endpoints principais:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
PUT  /api/auth/profile
POST /api/auth/request-reset
POST /api/auth/reset-password
```

Área de afiliados:

```text
GET  /api/affiliate/dashboard
GET  /api/affiliate/products
POST /api/affiliate/products
POST /api/affiliate/click
```

### Variáveis de ambiente

A API utiliza:

```text
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
DB_SSL
JWT_SECRET
```

**Nunca envie essas informações para o GitHub.**

Não publique:

- senhas;
- arquivos `.env`;
- JWT secrets;
- tokens;
- chaves privadas;
- credenciais do banco.

---

## 🗄️ Banco de dados

O projeto utiliza MySQL.

Estruturas relacionadas à Área de Afiliados:

```text
api/affiliate/setup.sql
```

O repositório também possui o dump estrutural:

```text
flashmarket.sql
```

O arquivo deve ser tratado como material de desenvolvimento/banco de dados e não deve conter credenciais ou dados sensíveis.

---

## 🌐 Deploy

### GitHub Pages

Frontend:

https://rafaeloliveirxis.github.io/koramarketplace/

### Vercel

A API utiliza funções serverless da Vercel.

As credenciais devem ser configuradas em:

**Vercel → Project → Settings → Environment Variables**

e nunca dentro do código-fonte.

---

## 📱 Capacitor

A estrutura também permite evolução para aplicativos Android/iOS.

```bash
npm install
npx cap add android
npx cap add ios
npm run cap:sync
npm run cap:android
npm run cap:ios
```

**Android:** requer Android Studio.

**iOS:** requer macOS + Xcode.

---

## 🔄 Atualizar o projeto

Depois de modificar os arquivos:

```bash
git status
git add .
git commit -m "feat: atualizar FlashMarket"
git push origin main
```

Para sincronizar antes de começar:

```bash
git pull origin main
```

---

## 📊 Status

**Em desenvolvimento ativo.**

O projeto possui frontend responsivo, experiência mobile, PWA, autenticação, API e Área de Afiliados em evolução.

Recursos que dependem de serviços externos precisam estar corretamente configurados para produção, incluindo banco de dados, pagamentos, estoque, transportadoras e notificações.

---

## 🔮 Próximas evoluções

- Integração de pagamentos reais
- Estoque em tempo real
- Pedidos completos
- Transportadoras
- Painel administrativo
- Gestão de vendedores
- Comissões e saques
- Analytics
- Notificações push
- Testes automatizados
- Melhorias de segurança
- Evolução dos aplicativos Android/iOS

---

## 👨‍💻 Autor

**Rafael Oliveira**

Projeto acadêmico / TCC  
**FlashMarket / KoraMarketplace**

GitHub: https://github.com/RafaelOliveirxis

---

## 📄 Licença

Projeto desenvolvido para fins acadêmicos, educacionais e demonstrativos.

Respeite a autoria e as licenças dos recursos de terceiros utilizados no projeto.

---

<p align="center">
  ⚡ <strong>FlashMarket</strong><br>
  Marketplace moderno para Web, PWA e Mobile.
</p>


---

# 📚 Atividade — Funcionalidades, Layout e Versionamento

Esta versão do **KoraMarketplace / FlashMarket** foi organizada para atender à atividade solicitada em sala.

## 1. Funcionalidades obrigatórias

### CRUD de produtos
A página **Gerenciar Produtos** implementa as quatro operações solicitadas:

- **Cadastro:** inclusão de novos produtos.
- **Consulta:** listagem dos produtos cadastrados.
- **Alteração:** edição dos dados de um produto existente.
- **Exclusão:** remoção de produtos com confirmação.

A implementação é responsiva e utiliza **Bootstrap 5**, **Bootstrap Icons**, HTML5, CSS3 e JavaScript.

Acesso direto:

`FlashMarket/gerenciar-produtos.html`

Os dados da demonstração são armazenados no `localStorage`, permitindo executar e apresentar o CRUD mesmo sem configurar um banco de dados.

## 2. Layout e interface

O projeto possui:

- Cabeçalho e navegação organizados;
- Menu de categorias;
- Cards de produtos;
- Botões e formulários responsivos;
- Imagens de produtos;
- Ícones;
- Layout adaptado para desktop, tablet e celular;
- PWA e estrutura para uso mobile.

## 3. Responsividade

O sistema foi preparado para diferentes tamanhos de tela. A página de CRUD utiliza o sistema de grid do **Bootstrap 5** e regras CSS adicionais para celulares.

Teste recomendado:

1. Abrir o site no computador.
2. Abrir o mesmo endereço no celular.
3. Acessar **Gerenciar Produtos**.
4. Cadastrar um produto.
5. Consultar a lista.
6. Editar o produto.
7. Excluir o produto.

## 4. Versionamento

O repositório utiliza **Git + GitHub** para controle de versão. O histórico atual possui mais de 20 commits, atendendo ao requisito de versionamento mínimo indicado na atividade.

Repositório:

https://github.com/RafaelOliveirxis/koramarketplace

## 5. README

Este arquivo contém:

- Nome do projeto;
- Objetivo;
- Tecnologias utilizadas;
- Estrutura do sistema;
- Como executar;
- Funcionalidades;
- Informações de API e banco;
- Orientações de deploy;
- Informações de versionamento.

## 6. Prints do sistema

Para a apresentação, recomenda-se incluir prints das seguintes telas:

1. Página inicial / Home;
2. Menu de categorias;
3. Catálogo de produtos;
4. Tela de cadastro no CRUD;
5. Lista/consulta de produtos;
6. Tela de alteração;
7. Confirmação de exclusão;
8. Versão mobile.

> Os prints devem ser capturados com o projeto publicado e inseridos na entrega conforme a orientação do professor.

## 7. Grupo

**Grupo: 5 pessoas**

- Rafael Oliveira
- Integrante 2
- Integrante 3
- Integrante 4
- Integrante 5

Substitua os nomes dos integrantes 2 a 5 pelos nomes reais do grupo antes da entrega.

## 8. Checklist da entrega

- [x] Link do GitHub
- [x] Projeto funcionando
- [x] README completo
- [x] Cadastro
- [x] Consulta
- [x] Alteração
- [x] Exclusão
- [x] Layout responsivo
- [x] Menu
- [x] Bootstrap
- [x] Ícones
- [x] Imagens
- [x] Versionamento Git/GitHub
- [ ] Inserir os 4 nomes restantes do grupo
- [ ] Capturar e inserir os prints finais da apresentação

