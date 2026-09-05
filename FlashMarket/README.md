# 🛒 FlashMarket Oficial

O **FlashMarket Oficial** é uma landing page de e-commerce premium baseada em um marketplace moderno. O foco do projeto é oferecer uma experiência de compra interativa, fluida e totalmente responsiva no frontend.

---

## 🚀 Funcionalidades Principais

* **Busca Inteligente**: Barra de pesquisa funcional para filtragem de produtos.
* **Filtros e Ordenação**: Organização de itens por categoria, preço e avaliação.
* **Carrinho Dinâmico**: Adição, remoção e cálculo automático de subtotal, frete e cupons (Use o cupom: `FLASH10`).
* **Sistema de Favoritos**: Salvamento de produtos favoritos persistido via `localStorage`.
* **Modais Detalhados**: Janelas interativas para visualização rápida das especificações do produto.
* **Interface Responsiva**: Layout otimizado para dispositivos móveis, tablets e desktops.

---

## 🛠️ Tecnologias Utilizadas

* **HTML5**: Estruturação semântica da página.
* **CSS3**: Estilização moderna e layout responsivo.
* **JavaScript (ES6+)**: Manipulação do DOM e lógica de interatividade.
* **LocalStorage**: Persistência de dados local para o carrinho e favoritos.

---

## 📁 Estrutura do Projeto

...
FlashMarket/
    ├── index.html
    ├── afiliado.html
    ├── minha-conta.html
    ├── rastrear-pedido.html
    ├── suporte.html
    ├── README.md
    ├──assets/
    ├── css/
    │   └── style.css
    └── js/
        └── app.js
...

---

## 💻 Como Executar o Projeto

1. Abra a pasta do projeto no VS Code.
2. Localize o arquivo `index.html`.
3. Abra-o no navegador, ou use uma extensão como Live Server.

## 📱 Instalação no celular

O site agora é uma **PWA**: em Android use o botão `INSTALAR APP` ou o menu do Chrome. No
iPhone/iPad, abra a página no Safari, toque em **Compartilhar** e escolha **Adicionar à
Tela de Início**. O carrinho, favoritos e demais estados continuam persistidos no aparelho.

Para gerar os aplicativos distribuíveis nativos com Capacitor:

```bash
npm install
npx cap add android
npx cap add ios
npm run cap:sync
npm run cap:android
npm run cap:ios
```

O Android requer Android Studio. O iOS requer macOS com Xcode e assinatura Apple para
publicação na App Store. O conteúdo web compartilhado pelos dois aplicativos fica em
`FlashMarket/`, evitando duplicar regras de negócio e mantendo todas as funções ativas.

## Funcionalidades principais

- Busca por produtos
- Filtros por categoria
- Ordenação por preço e avaliação
- Favoritos para produtos salvos
- Carrinho interativo com cálculo de subtotal, desconto e frete
- Cupom de desconto demonstrativo: "FLASH10"
- Modal de detalhes do produto
- Login/cadastro ilustrativos em frontend
- Newsletter com armazenamento local

## Observação

A autenticação, o checkout e o processamento de pedidos são demonstrativos e não representam integração com backend, banco de dados ou gateway de pagamento.

## Licença

Este projeto foi desenvolvido como exemplo de front-end e pode ser usado para estudos, demonstrações e personalizações.

'''
