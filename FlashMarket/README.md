# ⚡ FlashMarket Oficial

> **Marketplace digital responsivo, moderno e interativo**, desenvolvido como projeto acadêmico de frontend e TCC.

O **FlashMarket Oficial** é uma plataforma de e-commerce inspirada em grandes marketplaces, com foco em experiência do usuário, responsividade, organização visual e recursos de compra simulados.

O projeto foi desenvolvido para funcionar em **computadores, tablets e celulares**, mantendo uma interface adaptada a diferentes tamanhos de tela.

---

## 🌐 Projeto publicado

**GitHub Pages:**

https://rafaeloliveirxis.github.io/koramarketplace/FlashMarket/

**Repositório:**

https://github.com/RafaelOliveirxis/koramarketplace

---

## ✨ Principais funcionalidades

### 🛍️ Experiência de compra

- Catálogo de produtos
- Busca de produtos
- Filtros por categoria
- Ordenação por preço e avaliação
- Visualização detalhada dos produtos
- Carrinho de compras interativo
- Cálculo de subtotal, desconto e frete
- Cupom demonstrativo `FLASH10`
- Sistema de favoritos
- Avaliações de produtos
- Lojas oficiais
- Seções promocionais e ofertas

### 👤 Conta do usuário

- Login e cadastro
- Área Minha Conta
- Perfil do usuário
- Persistência de dados no navegador
- Fallback local para ambientes de hospedagem estática

### 📦 Pedidos

- Página de rastreamento de pedido
- Interface preparada para acompanhamento de pedidos
- Estrutura para integração futura com backend

### 🤝 Afiliados

- Área do afiliado
- Dashboard visual
- Estrutura para divulgação de produtos e campanhas

### 💬 Atendimento

- Central de atendimento
- Newsletter
- Interfaces de suporte
- Elementos interativos de contato

### 🤖 Flash IA

O projeto possui estrutura visual para recursos de assistência inteligente, permitindo futuras integrações com serviços de IA e atendimento automatizado.

---

## 📱 Responsividade

O FlashMarket foi desenvolvido com abordagem **mobile-first e responsiva**, adaptando sua interface para:

- 📱 Smartphones
- 📲 Tablets
- 💻 Notebooks
- 🖥️ Desktops

A navegação, os cards de produtos, o menu, o carrinho e as áreas de conteúdo são ajustados conforme o tamanho da tela.

---

## 📲 PWA e aplicativo

O projeto possui estrutura para utilização como **Progressive Web App (PWA)**, permitindo que o usuário instale o FlashMarket no dispositivo compatível.

### Android / Chrome

Abra o site pelo Chrome e utilize a opção de instalação disponibilizada pelo navegador.

### iPhone / iPad

Abra o site pelo Safari, toque em **Compartilhar** e selecione **Adicionar à Tela de Início**.

### Capacitor

Também existe estrutura para transformar o projeto web em aplicativo utilizando Capacitor:

```bash
npm install
npx cap add android
npx cap add ios
npm run cap:sync
npm run cap:android
npm run cap:ios
```

> O Android requer Android Studio. A compilação para iOS requer macOS com Xcode.

---

## 🛠️ Tecnologias utilizadas

| Tecnologia | Utilização |
|---|---|
| **HTML5** | Estrutura semântica das páginas |
| **CSS3** | Layout, responsividade e identidade visual |
| **JavaScript ES6+** | Interatividade e regras do frontend |
| **LocalStorage** | Persistência local de dados |
| **PWA** | Instalação e experiência semelhante a aplicativo |
| **Capacitor** | Estrutura para aplicativos Android/iOS |
| **Git** | Controle de versão |
| **GitHub** | Hospedagem e gerenciamento do código |
| **GitHub Pages** | Publicação do frontend |

---

## 📁 Estrutura do projeto

```text
FlashMarket/
├── index.html
├── afiliado.html
├── minha-conta.html
├── rastrear-pedido.html
├── suporte.html
├── README.md
│
├── assets/
│   ├── imagens
│   ├── ícones
│   └── outros recursos visuais
│
├── css/
│   └── style.css
│
└── js/
    └── app.js
```

---

## 🚀 Como executar localmente

### 1. Clonar o repositório

```bash
git clone https://github.com/RafaelOliveirxis/koramarketplace.git
```

### 2. Entrar na pasta

```bash
cd koramarketplace
```

### 3. Abrir o projeto

Entre na pasta:

```text
FlashMarket/
```

Abra o arquivo:

```text
index.html
```

Você também pode utilizar a extensão **Live Server** no Visual Studio Code para executar o projeto localmente.

---

## 🔄 Atualizando o projeto pelo Git

Depois de realizar alterações nos arquivos:

```bash
git status
```

Adicionar as alterações:

```bash
git add .
```

Criar o commit:

```bash
git commit -m "Atualiza projeto FlashMarket"
```

Enviar para o GitHub:

```bash
git push origin main
```

---

## 💾 Persistência de dados

O FlashMarket utiliza **LocalStorage** para manter determinados dados no navegador, incluindo recursos como:

- Carrinho
- Favoritos
- Preferências do usuário
- Dados de sessão utilizados pelo frontend
- Informações da newsletter

Isso permite que determinados estados continuem disponíveis mesmo após atualizar ou fechar a página.

---

## 🎟️ Cupom demonstrativo

Para testar o sistema de desconto do carrinho, utilize:

```text
FLASH10
```

> O cupom é demonstrativo e faz parte da simulação do ambiente de e-commerce.

---

## ⚠️ Limitações atuais

O projeto possui funcionalidades simuladas e não deve ser considerado uma plataforma de comércio eletrônico pronta para produção.

Atualmente, recursos como:

- Processamento real de pagamentos
- Gateway de pagamento
- Processamento real de pedidos
- Integração completa com transportadoras
- Banco de dados de produção
- Autenticação comercial
- Estoque real

dependem de integrações com backend e serviços externos.

---

## 🎓 Projeto acadêmico / TCC

O **FlashMarket Oficial** foi desenvolvido como projeto acadêmico, com o objetivo de demonstrar conhecimentos de:

- Desenvolvimento Web
- Frontend
- HTML5
- CSS3
- JavaScript
- Design responsivo
- Experiência do usuário (UX)
- Interface do usuário (UI)
- Controle de versão com Git/GitHub
- Publicação de aplicações web

O projeto também serve como demonstração prática da criação de uma plataforma de marketplace desde a estrutura visual até funcionalidades interativas do frontend.

---

## 🔮 Próximas melhorias

Entre as evoluções planejadas estão:

- Integração completa com banco de dados
- API própria para produtos e usuários
- Sistema real de autenticação
- Gateway de pagamento
- Painel administrativo completo
- Gestão real de estoque
- Sistema de pedidos integrado
- Rastreamento em tempo real
- Integração com transportadoras
- Melhorias na Flash IA
- Notificações push
- Aplicativos Android e iOS publicados nas lojas

---

## 👨‍💻 Autor

**Rafael Oliveira**

Projeto acadêmico desenvolvido para estudos e apresentação de conclusão de curso.

**Repositório:**
https://github.com/RafaelOliveirxis/koramarketplace

---

## 📄 Licença

Este projeto possui finalidade **acadêmica, educacional e demonstrativa**.

O código pode ser estudado e utilizado como referência para aprendizado e desenvolvimento de projetos semelhantes, respeitando os recursos e materiais de terceiros utilizados no projeto.

---

## ⚡ FlashMarket

**Compra rápida. Experiência simples. Marketplace conectado.**

> Projeto acadêmico — FlashMarket Oficial — 2026.
