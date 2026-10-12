# ⚡ FlashMarket — Frontend

Frontend do KoraMarketplace, desenvolvido com HTML, CSS e JavaScript. Reúne a interface do marketplace, experiência responsiva, páginas de checkout e pedidos, área de afiliados e estrutura PWA.

## Links
- **Site publicado:** https://koramarketplace.vercel.app/
- **Versão estática (GitHub Pages):** https://rafaeloliveirxis.github.io/koramarketplace/
- **Repositório:** https://github.com/RafaelOliveirxis/koramarketplace
- **README principal:** [../README.md](../README.md)
- **Documentação da API:** [../api/README.md](../api/README.md)

## Funcionalidades da interface
- Catálogo, pesquisa, categorias, filtros e ofertas.
- Carrinho, favoritos e cupons demonstrativos.
- Conta do usuário e integração opcional com API.
- Área de afiliados.
- Checkout em etapas, com frete e pagamento demonstrativos.
- Criação de pedido em modo simulação e página de detalhes.
- Página de rastreamento e central de atendimento.
- Layout responsivo, atalhos mobile e modo PWA.

## Importante sobre checkout e pedidos
O botão **“CRIAR PEDIDO (SIMULAÇÃO)”** foi projetado para criar um pedido demonstrativo no navegador e encaminhar para a página de detalhes. Esse fluxo **não processa pagamentos, não cobra o cliente e não confirma uma venda comercial**. Pedidos guardados em `localStorage` pertencem ao navegador/dispositivo e não equivalem a pedidos persistidos no banco de produção.

O rastreamento real depende de pedidos disponíveis no backend e de uma integração de transportadora. Não considere dados demonstrativos como eventos logísticos reais.

## Executar localmente

Na raiz do repositório:

```bash
npm install
npm run web:check
npm run web:serve
```

Abra o endereço local exibido pelo terminal. Alternativamente, use Live Server no VS Code apontando para este diretório.

## Arquivos principais

```text
FlashMarket/
├── index.html
├── checkout.html
├── pedido.html
├── rastrear-pedido.html
├── minha-conta.html
├── afiliado.html
├── suporte.html
├── assets/
├── css/
├── js/
├── manifest.webmanifest
└── sw.js
```

A estrutura pode mudar conforme a evolução do projeto. Consulte os arquivos atuais para confirmar os nomes e a disponibilidade de cada recurso.

## PWA
O Manifest e o Service Worker permitem preparar a instalação em navegadores compatíveis. Para testes de instalação, sirva o site por localhost ou HTTPS. No celular, use a opção de instalar aplicativo do navegador; no iOS, abra pelo Safari e escolha **Compartilhar → Adicionar à Tela de Início**.

## Integração com a API
O backend opcional fica em `../api/`. Rotas, variáveis de ambiente e configuração do banco estão descritas em [../api/README.md](../api/README.md). Uma versão estática no GitHub Pages não executa funções serverless por conta própria.

## Segurança
Não armazene senhas, tokens, chaves privadas ou credenciais no frontend. Tudo o que é entregue ao navegador pode ser inspecionado. Segredos devem ficar exclusivamente no backend e nas variáveis de ambiente do provedor.

## Autor
**Rafael Oliveira** — projeto acadêmico/TCC **KoraMarketplace / FlashMarket**.
