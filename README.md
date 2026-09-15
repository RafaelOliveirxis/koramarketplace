# ⚡ KoraMarketplace

> **Marketplace digital responsivo, moderno e preparado para Web, PWA e aplicativo mobile**, desenvolvido como projeto acadêmico/TCC a partir do FlashMarket.

O **KoraMarketplace** reúne frontend de e-commerce, autenticação, área do usuário, rastreamento de pedidos, área de afiliados, atendimento e estrutura de API/backend em um único repositório.

## 🌐 Acessos

**GitHub:**  
https://github.com/RafaelOliveirxis/koramarketplace

**GitHub Pages:**  
https://rafaeloliveirxis.github.io/koramarketplace/

**Frontend:**  
`FlashMarket/`

**API:**  
`api/`

---

## 🛍️ Sobre o projeto

O KoraMarketplace foi desenvolvido para oferecer uma experiência de compra simples e visualmente semelhante a um aplicativo de marketplace.

A interface possui versões adaptadas para desktop, tablet e smartphone. No celular, a navegação utiliza cabeçalho compacto, menu lateral pelo botão **☰**, barra inferior de aplicativo e acesso rápido a **Início, Rastrear pedido, Área de afiliado, Favoritos e Conta**.

O projeto também mantém a identidade **FlashMarket** utilizada na interface e nos recursos promocionais.

---

## ✨ Principais funcionalidades

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
- Pix, cartão e boleto em modo de simulação

### 👤 Conta e autenticação

- Cadastro de usuário
- Login
- Logout
- Recuperação de senha
- Perfil do usuário
- Página **Minha Conta**
- Área de pedidos
- Favoritos
- Sessão persistida no frontend
- Integração preparada com API de autenticação
- Fallback local para ambientes em que a API não esteja disponível

> O fallback local é destinado à experiência do frontend. Para autenticação persistente entre dispositivos, a API e o banco de dados precisam estar configurados corretamente.

### 📦 Pedidos

- Rastreamento de pedido
- Página de acompanhamento
- Estrutura preparada para integração com pedidos reais

### 🤝 Área de afiliado

- Página de afiliados
- Dashboard visual
- Estrutura para campanhas e divulgação de produtos

### 💬 Atendimento

- Central de suporte
- Flash IA
- Newsletter
- Formulários de contato

### 📱 Experiência mobile

- Layout responsivo
- Cabeçalho compacto
- Menu lateral no botão **☰**
- Categorias acessíveis pelo menu lateral
- Barra inferior fixa no app
- Atalhos para rastreamento, afiliados, favoritos e conta
- Rodapé tradicional oculto no modo aplicativo
- Hero promocional adaptado para proporções de celular
- Interface preparada para instalação como PWA

---

## 🧰 Tecnologias

### Frontend

- HTML5
- CSS3
- JavaScript ES6+
- LocalStorage
- PWA / Service Worker
- Manifest Web App
- Google Fonts

### Backend / API

- Node.js
- API serverless
- MySQL / MySQL2
- JWT
- bcryptjs
- CORS
- Estrutura de autenticação e perfil em `api/auth/`

### Aplicativo

- Capacitor
- Android
- iOS

### Deploy e versionamento

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
│   └── workflows/              # Automação e deploy
├── FlashMarket/
│   ├── assets/                 # Imagens, logos e ícones
│   ├── css/                    # Estilos desktop e mobile
│   ├── js/                     # Scripts do frontend
│   ├── index.html              # Página inicial
│   ├── minha-conta.html        # Área do usuário
│   ├── rastrear-pedido.html    # Rastreamento
│   ├── afiliado.html           # Área de afiliados
│   ├── suporte.html            # Atendimento
│   ├── manifest.webmanifest    # Manifest PWA
│   ├── sw.js                   # Service Worker
│   └── README.md               # Documentação do frontend
├── api/
│   ├── _lib/                   # Banco, autenticação e CORS
│   ├── auth/                   # Endpoints de autenticação
│   └── README.md               # Documentação da API
├── capacitor.config.ts         # Configuração Capacitor
├── package.json                # Scripts e dependências
├── package-lock.json           # Lockfile
├── vercel.json                 # Configuração Vercel
├── .gitignore
└── README.md                   # Documentação principal
```

---

## 🚀 Executar localmente

### Pré-requisitos

- Node.js LTS
- npm
- Git
- VS Code (recomendado)
- Live Server (opcional para o frontend)

Verifique a instalação:

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

### Instalar dependências

```bash
npm install
```

### Abrir o frontend

Abra:

```text
FlashMarket/index.html
```

Para desenvolvimento, recomenda-se o **Live Server** do VS Code.

---

## 🔐 API e autenticação

A pasta `api/` contém os endpoints utilizados pela autenticação e pelo perfil do usuário.

Principais rotas:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
PUT  /api/auth/profile
POST /api/auth/request-reset
POST /api/auth/reset-password
```

A configuração do banco, JWT e serviços de e-mail está documentada em:

`api/README.md`

**Nunca publique:**

- senha do banco;
- JWT secret;
- tokens OAuth;
- chaves privadas;
- arquivos `.env`.

---

## 📲 PWA

O frontend possui estrutura para instalação como aplicativo web.

Arquivos principais:

```text
FlashMarket/manifest.webmanifest
FlashMarket/sw.js
FlashMarket/js/pwa.js
```

No Android/Chrome, o navegador pode disponibilizar a opção de instalar o app.

No iPhone/iPad, utilize **Compartilhar → Adicionar à Tela de Início**.

---

## 📱 Capacitor

A aplicação web também possui configuração para evolução para aplicativo Android/iOS.

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

O frontend publicado está disponível em:

https://rafaeloliveirxis.github.io/koramarketplace/

### Vercel

A estrutura `api/` pode ser publicada como funções serverless na Vercel.

As variáveis sensíveis devem ser configuradas no painel da Vercel, nunca no repositório.

---

## 🔄 Atualizar o projeto pelo terminal

Depois de alterar os arquivos:

```bash
git status
git add .
git commit -m "feat: atualizar KoraMarketplace"
git push origin main
```

Para atualizar o projeto local antes de trabalhar:

```bash
git pull origin main
```

---

## 🧪 Status do projeto

O projeto está em **desenvolvimento ativo**.

A interface frontend, experiência mobile, PWA e estrutura de autenticação estão em evolução. Recursos de produção, como pagamentos reais, estoque, pedidos e integrações logísticas, dependem de serviços externos e configuração do backend.

---

## 🔮 Próximas evoluções

- Persistência completa de pedidos
- Rastreamento integrado com transportadoras
- Gateway de pagamento real
- Estoque real
- Painel administrativo
- Gestão de vendedores
- Notificações push
- Analytics
- Testes automatizados
- Melhorias contínuas de segurança
- Publicação de aplicativos Android/iOS

---

## 👨‍💻 Autor

**Rafael Oliveira**  
Projeto acadêmico / TCC — KoraMarketplace / FlashMarket

GitHub:  
https://github.com/RafaelOliveirxis

---

## 📄 Licença

Projeto desenvolvido para fins acadêmicos, educacionais e demonstrativos. Respeite a autoria e as licenças dos recursos de terceiros utilizados no projeto.

---

<p align="center">
  ⚡ <strong>KoraMarketplace</strong> — experiência de marketplace para Web e Mobile.
</p>
