# ⚡ FlashMarket

> **Marketplace digital desenvolvido como projeto acadêmico / TCC**, com foco em experiência de compra, responsividade, recursos de e-commerce e evolução para aplicativo mobile.

[![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)](https://github.com/RafaelOliveirxis/koramarketplace)
[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-blue)](https://rafaeloliveirxis.github.io/koramarketplace/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![Capacitor](https://img.shields.io/badge/Capacitor-7.x-119EFF?logo=capacitor&logoColor=white)](https://capacitorjs.com/)

## 🌐 Demonstração

**Versão web publicada:**

👉 https://rafaeloliveirxis.github.io/koramarketplace/

## 📖 Sobre o projeto

O **FlashMarket** é uma plataforma de marketplace criada para simular uma experiência moderna de comércio eletrônico. A interface foi desenvolvida com foco em navegação simples, visual responsivo e adaptação para computadores, tablets e smartphones.

O projeto reúne recursos de catálogo, ofertas, busca, categorias, carrinho, favoritos, cupons, checkout, acompanhamento de pedidos, área de afiliados e atendimento com **Flash IA**.

A estrutura do repositório também está preparada para evolução com **API/backend**, autenticação e empacotamento da aplicação web como aplicativo por meio do **Capacitor**.

## ✨ Principais funcionalidades

- 🛍️ Catálogo de produtos
- 🔎 Pesquisa de produtos
- 🗂️ Categorias
- 🛒 Carrinho de compras
- ❤️ Favoritos
- 💰 Cupons de desconto
- 🎁 Cashback
- ⚡ Ofertas Flash
- ⭐ Avaliações
- 🏪 Área de lojas
- 👤 Login e cadastro
- 📦 Rastreamento de pedidos
- 🤝 Área de afiliado
- 💬 Central de atendimento
- 🤖 Flash IA com atendimento orientativo
- 🌙 Alternância de tema
- 📱 Layout responsivo
- 🔔 Mensagens e notificações de interação
- 💾 Persistência de recursos no navegador com LocalStorage
- 📲 Estrutura PWA
- 🔍 Meta tags e recursos de SEO
- 🗺️ Seção de localização
- 💳 Simulação de checkout com Pix, cartão e boleto

## 🧰 Tecnologias utilizadas

### Front-end

- **HTML5** — estrutura das páginas
- **CSS3** — estilização, responsividade e animações
- **JavaScript** — lógica e interatividade
- **Google Fonts** — tipografia

### Aplicativo e backend

- **Node.js / npm** — ambiente e gerenciamento de dependências
- **Capacitor 7** — integração da aplicação web com Android/iOS
- **TypeScript** — configuração e suporte ao ambiente Capacitor
- **MySQL2** — conexão com banco de dados no backend
- **bcryptjs** — suporte a hash de senhas
- **jsonwebtoken** — suporte a autenticação baseada em JWT
- **API** — estrutura disponível em `api/`

### Deploy e versionamento

- **Git**
- **GitHub**
- **GitHub Pages**
- **Vercel**
- **GitHub Actions**

## 📁 Estrutura do projeto

```text
koramarketplace/
├── .github/
│   └── workflows/             # Automações e workflows
├── FlashMarket/
│   ├── assets/                # Imagens, logos, ícones e recursos
│   ├── css/                   # Folhas de estilo
│   ├── js/                    # Scripts da aplicação
│   ├── index.html             # Página principal
│   └── ...                    # Demais páginas do marketplace
├── api/                       # Estrutura da API/backend
├── capacitor.config.ts        # Configuração do Capacitor
├── package.json               # Dependências e scripts
├── package-lock.json           # Lockfile das dependências
├── vercel.json                # Configuração de deploy
├── .gitignore                 # Arquivos ignorados
└── README.md                  # Documentação
```

## 🚀 Como executar localmente

### Pré-requisitos

Instale:

- **Node.js LTS**
- **npm**
- **Git**
- **VS Code** (recomendado)

Depois de instalar o Node.js, confirme:

```bash
node -v
npm -v
npx -v
```

### 1. Clonar o repositório

```bash
git clone https://github.com/RafaelOliveirxis/koramarketplace.git
cd koramarketplace
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Executar a versão web

Abra:

```text
FlashMarket/index.html
```

Para desenvolvimento, recomenda-se utilizar o **Live Server** do VS Code.

## 🌐 Versão Web

A versão web do **FlashMarket** continua disponível diretamente pelo navegador e é publicada automaticamente a cada atualização da branch `main`.

**Acessar o FlashMarket:**

👉 https://rafaeloliveirxis.github.io/koramarketplace/

A mesma aplicação web localizada em `FlashMarket/` é utilizada como base para o aplicativo Android/iOS através do Capacitor. Assim, o projeto mantém **uma única base de interface para Web, Android e iOS**.

Para executar localmente:

```bash
npm run web:serve
```

Para validar se a página principal existe:

```bash
npm run web:check
```

## 📱 Capacitor / aplicativo

O projeto possui configuração do Capacitor para evolução da versão web para aplicativo.

Após instalar as dependências:

```bash
npm run cap:sync
```

Para abrir o projeto Android:

```bash
npm run cap:android
```

Para iOS:

```bash
npm run cap:ios
```

> O desenvolvimento/compilação para Android e iOS depende das ferramentas nativas correspondentes, como Android Studio e Xcode.

## 🔄 Fluxo de versionamento

Depois de realizar alterações:

```bash
git status
git add .
git commit -m "feat: atualizar FlashMarket"
git push origin main
```

O branch principal utilizado pelo projeto é **main**.

## 🔍 SEO, PWA e publicação

A página principal possui recursos voltados para descoberta e compartilhamento, incluindo:

- descrição da página;
- palavras-chave;
- canonical;
- robots;
- Google Search Console;
- Open Graph;
- Twitter/X Cards;
- manifest da aplicação;
- configurações para experiência mobile;
- estrutura preparada para publicação web.

A versão publicada pode ser acessada pelo GitHub Pages:

👉 https://rafaeloliveirxis.github.io/koramarketplace/

## 📱 Responsividade

O FlashMarket foi planejado para diferentes dispositivos:

- 🖥️ Desktop
- 💻 Notebook
- 📱 Smartphone
- 📲 Tablet

A interface utiliza CSS responsivo para adaptar navegação, catálogo, carrinho, modais e demais componentes.

## 🤖 Flash IA

A página principal conta com um widget de atendimento chamado **Flash IA**, com respostas orientativas para temas como:

- pedidos;
- frete e entrega;
- pagamentos;
- afiliados;
- trocas e devoluções;
- login e acesso à conta;
- encaminhamento para atendimento humano.

As mensagens do widget podem ser mantidas no navegador por meio do **LocalStorage**.

## 🔐 Segurança e evolução

O projeto possui dependências e estrutura destinadas à futura implementação de autenticação e backend, incluindo JWT, bcrypt e MySQL.

> **Importante:** recursos de demonstração do front-end, como checkout e autenticação, não devem ser considerados um sistema de produção até que sejam integrados a um backend seguro, banco de dados e serviços de pagamento reais.

## 🎨 Identidade visual

A identidade do FlashMarket utiliza o conceito de **velocidade, praticidade e ofertas**, representado principalmente pelo símbolo ⚡.

A interface busca destacar:

- velocidade;
- organização;
- facilidade de navegação;
- ofertas;
- produtos;
- experiência de compra;
- identidade visual própria.

## 🎓 Contexto acadêmico

O FlashMarket faz parte de um projeto acadêmico desenvolvido como **Trabalho de Conclusão de Curso (TCC)**.

O projeto permite aplicar conhecimentos de:

- desenvolvimento web;
- HTML, CSS e JavaScript;
- design de interfaces;
- responsividade;
- versionamento com Git;
- publicação de aplicações;
- conceitos de API e backend;
- preparação para aplicações mobile.

## 🛠️ Próximas melhorias

- integração completa com banco de dados;
- autenticação real de usuários;
- API de produtos;
- pagamentos reais com provedor seguro;
- painel administrativo completo;
- gerenciamento real de pedidos;
- integração de e-mail;
- melhorias de segurança;
- aplicativo mobile completo;
- otimização contínua de SEO;
- analytics e monitoramento;
- testes automatizados.

## 👨‍💻 Autor

**Rafael Oliveira**

Projeto acadêmico — FlashMarket

GitHub: https://github.com/RafaelOliveirxis

## 📄 Licença

Este projeto possui finalidade **acadêmica e educacional**. O código pode ser utilizado como referência para estudos, respeitando a autoria e os direitos sobre os materiais utilizados no projeto.

---

<p align="center">
  Desenvolvido com ⚡ por <strong>Rafael Oliveira</strong>
</p>
