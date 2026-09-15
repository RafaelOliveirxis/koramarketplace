# ⚡ FlashMarket — Frontend

> **Frontend responsivo do KoraMarketplace**, com experiência de e-commerce para Web, smartphone, PWA e futura aplicação mobile.

O diretório `FlashMarket/` contém a interface principal do marketplace, incluindo página inicial, produtos, conta do usuário, rastreamento, afiliados, suporte e recursos de instalação como aplicativo.

---

## 🌐 Acessos

**GitHub Pages:**  
https://rafaeloliveirxis.github.io/koramarketplace/

**Repositório:**  
https://github.com/RafaelOliveirxis/koramarketplace

---

## ✨ Funcionalidades

### 🛍️ Loja

- Catálogo de produtos
- Busca
- Categorias
- Ofertas Flash
- Carrinho
- Favoritos
- Cupons demonstrativos
- Avaliações
- Checkout demonstrativo

### 👤 Usuário

- Login
- Cadastro
- Logout
- Recuperação de senha
- Perfil
- Minha Conta
- Pedidos
- Favoritos
- Sessão persistida
- Integração com API de autenticação
- Fallback local para ambientes sem API disponível

### 📦 Pedidos

- Rastrear pedido
- Página de acompanhamento
- Estrutura preparada para integração com pedidos reais

### 🤝 Afiliados

- Área do afiliado
- Dashboard
- Estrutura para campanhas e divulgação

### 💬 Atendimento

- Suporte
- Flash IA
- Newsletter
- Formulários de contato

---

## 📱 Layout mobile / app

O frontend possui um layout específico para smartphones.

### Cabeçalho

- Botão **☰** para abrir o menu lateral
- Logo centralizada
- Acesso ao usuário
- Favoritos
- Carrinho
- Campo de pesquisa

### Menu ☰

O menu concentra os principais atalhos da aplicação, evitando duplicar categorias na parte superior da tela.

O acesso à conta permanece no cabeçalho, associado ao usuário logado.

### Barra inferior

No modo aplicativo, a navegação principal fica na barra inferior:

```text
┌────────┬────────────┬──────────────┬───────────┬────────┐
│ Início │  Rastrear  │ Área de      │ Favoritos │ Conta  │
│        │   pedido   │ afiliado     │           │        │
└────────┴────────────┴──────────────┴───────────┴────────┘
```

### Rodapé

O rodapé tradicional do site é ocultado no modo aplicativo/mobile para deixar a interface mais limpa e semelhante a um app nativo.

### Hero mobile

O banner principal possui composição adaptada para telas pequenas, preservando texto, CTA e elementos promocionais sem exigir o layout completo de desktop.

---

## 📲 PWA

Arquivos principais:

```text
manifest.webmanifest
sw.js
js/pwa.js
```

O usuário pode instalar o frontend como aplicativo compatível com o navegador.

### Android / Chrome

Abra o site e utilize a opção **Instalar app** quando disponibilizada pelo navegador.

### iPhone / iPad

Utilize:

**Compartilhar → Adicionar à Tela de Início**

---

## 🛠️ Tecnologias

- HTML5
- CSS3
- JavaScript ES6+
- LocalStorage
- PWA
- Service Worker
- Web Manifest
- Google Fonts
- Capacitor

---

## 📁 Estrutura

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
│   └── mobile-app-v3.css
│
└── js/
    ├── app.js
    ├── auth-real.js
    ├── mobile-app.js
    ├── pwa.js
    ├── rastreamento.js
    └── suporte.js
```

---

## 🔐 Autenticação

O frontend possui integração com os endpoints da API:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
PUT  /api/auth/profile
POST /api/auth/request-reset
POST /api/auth/reset-password
```

O arquivo principal de integração é:

```text
js/auth-real.js
```

Quando a API está disponível, o frontend utiliza a autenticação do backend. Quando o ambiente estático não consegue acessar a API, existe um fallback local para permitir a demonstração da interface.

> O fallback local não substitui autenticação real de produção.

---

## 💾 Dados locais

O navegador pode armazenar dados da experiência do usuário usando LocalStorage, como:

- carrinho;
- favoritos;
- sessão local;
- preferências;
- dados de demonstração.

Não armazene informações sensíveis em LocalStorage em uma aplicação de produção sem uma estratégia adequada de segurança.

---

## 🚀 Executar localmente

Na raiz do projeto:

```bash
git clone https://github.com/RafaelOliveirxis/koramarketplace.git
cd koramarketplace
npm install
```

Depois abra:

```text
FlashMarket/index.html
```

O **Live Server** do VS Code é recomendado para testar PWA, Service Worker e recursos que dependem de servidor local.

---

## 🔄 Atualizar pelo Git

```bash
git pull origin main
git status
git add .
git commit -m "feat: atualizar frontend"
git push origin main
```

---

## 🎟️ Cupom demonstrativo

```text
FLASH10
```

O cupom faz parte do ambiente demonstrativo do e-commerce.

---

## ⚠️ Limitações

O frontend ainda depende de integrações externas para recursos de produção, incluindo:

- pagamentos reais;
- estoque real;
- pedidos reais;
- transportadoras;
- notificações push;
- serviços de e-mail;
- banco de dados de produção.

A disponibilidade desses recursos depende da configuração da API e dos serviços externos correspondentes.

---

## 🎓 Projeto acadêmico

O FlashMarket/KoraMarketplace é um projeto acadêmico/TCC utilizado para demonstrar conhecimentos de:

- HTML5
- CSS3
- JavaScript
- UI/UX
- responsividade
- PWA
- Git/GitHub
- APIs
- autenticação
- preparação para aplicações mobile

---

## 👨‍💻 Autor

**Rafael Oliveira**  
Projeto acadêmico — KoraMarketplace / FlashMarket

GitHub:  
https://github.com/RafaelOliveirxis

---

## 📄 Licença

Projeto destinado a fins acadêmicos, educacionais e demonstrativos. Respeite a autoria e as licenças dos recursos de terceiros utilizados.

---

<p align="center">
  ⚡ <strong>FlashMarket / KoraMarketplace</strong>
</p>
