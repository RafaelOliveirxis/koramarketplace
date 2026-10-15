# ⚡ FlashMarket — Frontend da loja

Este diretório contém a interface web do **FlashMarket**, frontend do projeto acadêmico **KoraMarketplace**. A aplicação utiliza HTML, CSS e JavaScript e reúne as páginas da loja, estilos responsivos, interações de usuário e a estrutura necessária para PWA.

## 📌 Links úteis

- **Site publicado:** https://koramarketplace.vercel.app/
- **Versão estática:** https://rafaeloliveirxis.github.io/koramarketplace/
- **Repositório:** https://github.com/RafaelOliveirxis/koramarketplace
- **README principal:** [../README.md](../README.md)
- **Documentação da API:** [../api/README.md](../api/README.md)

## Índice

- [Responsabilidades do frontend](#-responsabilidades-do-frontend)
- [Funcionalidades](#-funcionalidades)
- [Estrutura de arquivos](#-estrutura-de-arquivos)
- [Executar localmente](#-executar-localmente)
- [Como funciona a persistência](#-como-funciona-a-persistência)
- [Checkout, pedidos e rastreamento](#-checkout-pedidos-e-rastreamento)
- [PWA e instalação](#-pwa-e-instalação)
- [Integração com API](#-integração-com-api)
- [Acessibilidade e responsividade](#-acessibilidade-e-responsividade)
- [Diagnóstico de problemas](#-diagnóstico-de-problemas)
- [Segurança](#-segurança)
- [Checklist de publicação](#-checklist-de-publicação)

## 🎯 Responsabilidades do frontend

O frontend é responsável por renderizar as páginas, apresentar produtos e ofertas, receber interações, validar campos para melhorar a experiência e enviar requisições ao backend quando a integração estiver configurada. Regras críticas — autorização, preço final, estoque, pagamentos e permissões — devem ser verificadas no servidor, nunca confiadas apenas ao JavaScript do navegador.

## ✨ Funcionalidades

Dependendo da página e da configuração da API, o frontend pode oferecer:

- Página inicial com catálogo, categorias, pesquisa e ofertas.
- Filtros e navegação entre áreas.
- Carrinho e favoritos com armazenamento local quando implementado.
- Cadastro, login, conta e perfil.
- Checkout em etapas, integrado ao endpoint de criação de pedido quando a API estiver configurada.
- Página de detalhes de pedido.
- Consulta/rastreamento de pedido.
- Área de afiliados.
- Central de suporte e elementos de interface do assistente Flash IA.
- Layout adaptado para desktop, tablet e celular.
- Manifest e Service Worker para experiência instalável.

A lista descreve o escopo da interface; a presença de uma página não garante que todos os dados ou serviços estejam conectados a um backend operacional.

## 📁 Estrutura de arquivos

```text
FlashMarket/
├── index.html                  # Página inicial
├── checkout.html               # Checkout e início do pagamento
├── pedido.html                 # Detalhes de pedido
├── rastrear-pedido.html         # Consulta/rastreamento
├── minha-conta.html             # Área da conta
├── afiliado.html                # Área de afiliados
├── suporte.html                 # Central de suporte
├── assets/                      # Imagens, logos, ícones e recursos
├── css/                         # Estilos gerais e mobile
├── js/                          # Interações, dados e integração com API
├── manifest.webmanifest         # Metadados de instalação PWA
└── sw.js                        # Service Worker/cache
```

A estrutura exata pode mudar. Antes de adicionar referências a novos arquivos, confirme que eles existem na branch e use caminhos relativos compatíveis com a página.

## 🚀 Executar localmente

Execute os comandos na raiz do repositório:

```bash
npm install
npm run web:check
npm run web:serve
```

Abra o endereço local exibido pelo terminal. Se preferir VS Code, utilize Live Server e selecione `FlashMarket/index.html`.

**Observações:**
- Para testar Service Worker e instalação PWA, use localhost ou HTTPS.
- Abrir diretamente por `file://` pode bloquear recursos do navegador.
- Se uma página não carregar dados, confira o caminho dos arquivos, o console do navegador e a URL da API.

## 💾 Como funciona a persistência

O frontend pode utilizar `localStorage` para manter dados como carrinho e favoritos no mesmo navegador. Quando a API de checkout está configurada, os pedidos são persistidos no MySQL; dados de interface mantidos apenas no navegador continuam sujeitos a estas limitações:

- Os dados não são compartilhados automaticamente entre dispositivos ou navegadores.
- Limpar os dados do site pode remover essas informações.
- O usuário pode alterar dados locais pelas ferramentas do navegador.
- LocalStorage não é uma fonte confiável para autorizar usuários, calcular valores comerciais ou confirmar pagamentos.

Para dados compartilhados e confiáveis, a aplicação precisa consultar o backend e persistir os registros no banco de dados.

## 🛒 Checkout, pedidos e rastreamento

Quando API, MySQL e credenciais do Mercado Pago estiverem configurados, o frontend envia o carrinho para `POST /api/payments/create`. O backend valida os itens e preços com o catálogo do banco, registra o pedido e inicia uma Order no Mercado Pago. O cliente é redirecionado para o checkout do provedor; o retorno ao site, por si só, não confirma o pagamento.

O status é consultado por `GET /api/payments/status` e atualizado pelo webhook `POST /api/payments/webhook`, que valida a assinatura do Mercado Pago. O histórico e os dados de pedido podem ser consultados por `GET /api/orders/tracking`. Endpoints, variáveis, esquemas e limitações estão detalhados em [../api/README.md](../api/README.md) e [../PAGAMENTO-MERCADOPAGO-MYSQL.md](../PAGAMENTO-MERCADOPAGO-MYSQL.md).

Sem backend e credenciais configurados, o checkout não conclui uma compra. Não trate o redirecionamento nem um estado exibido pelo navegador como comprovante de pagamento. A API grava eventos de pagamento; eventos reais de entrega exigem integração logística adicional.

## 📲 PWA e instalação

Os arquivos `manifest.webmanifest` e `sw.js` apoiam a experiência PWA. A instalação depende do navegador e do cumprimento dos requisitos técnicos.

Para testar:
1. Publique em HTTPS ou use localhost.
2. Confirme que o manifesto e seus ícones carregam sem erro.
3. Verifique o registro e a atualização do Service Worker.
4. Abra o site em um navegador compatível.
5. No Android/Chrome, utilize a opção de instalar o app quando disponível.
6. No iPhone/iPad, abra no Safari, toque em **Compartilhar** e selecione **Adicionar à Tela de Início**.

PWA não é o mesmo que aplicativo publicado na Google Play. Para Android nativo, confira as instruções de Capacitor e de release no README principal e nos documentos de publicação.

## 🔌 Integração com API

O backend fica em [../api/](../api/). As rotas e variáveis estão descritas em [../api/README.md](../api/README.md).

Ao investigar uma chamada que falha:
- Confira a URL e o método HTTP usados pelo frontend.
- Confira o corpo JSON e o cabeçalho `Content-Type`.
- Verifique a resposta HTTP e a mensagem retornada.
- Confira CORS, autenticação, variáveis de ambiente e logs do backend.
- Confirme se a rota existe na versão implantada.

O GitHub Pages serve arquivos estáticos e não executa as funções serverless do diretório `api/`. Para usar API a partir dele, configure uma URL de backend válida e CORS adequado.

## 📱 Acessibilidade e responsividade

Ao alterar o layout:
- Preserve o comportamento desktop ao ajustar estilos específicos para celular.
- Agrupe as mudanças mobile em media queries adequadas e teste larguras pequenas e grandes.
- Use botões e links semânticos, rótulos acessíveis e foco de teclado visível.
- Mantenha contraste suficiente, textos legíveis e áreas de toque adequadas.
- Verifique rolagem horizontal, sobreposição de elementos fixos e espaço para a barra inferior do navegador.
- Teste formulários, estados vazios, carregamento e mensagens de erro.

## 🛠️ Diagnóstico de problemas

**Estilos não aparecem:** confira o caminho relativo do CSS, erros 404 e cache do navegador.

**Alterações não aparecem após deploy:** confirme o commit implantado, recarregue sem cache e confira se um Service Worker está servindo arquivos antigos.

**Login ou dados não carregam:** confira a URL da API, método HTTP, status da resposta, CORS, variáveis e banco.

**PWA não instala:** verifique HTTPS/localhost, manifesto, ícones, Service Worker e compatibilidade do navegador.

**Pedido só aparece no dispositivo atual:** provavelmente está sendo mantido localmente; a sincronização exige backend e banco.

## 🔐 Segurança

- Não coloque chaves secretas ou senhas no JavaScript entregue ao navegador.
- Nunca considere valores do LocalStorage confiáveis.
- Não armazene senhas em texto puro.
- Evite expor dados pessoais em logs, URLs ou mensagens de erro.
- Faça a validação definitiva de permissões e dados no backend.
- Utilize HTTPS e política de privacidade adequada ao uso previsto.

## ✅ Checklist de publicação

- [ ] Conferir links e navegação de todas as páginas.
- [ ] Testar em desktop, tablet e celular sem regressões visuais.
- [ ] Testar formulários, mensagens de erro e estados vazios.
- [ ] Verificar console e requisições de rede.
- [ ] Testar carrinho, favoritos e checkout em ambiente de teste do Mercado Pago.
- [ ] Conferir a confirmação do pagamento pela resposta do backend/webhook, nunca somente pelo retorno do navegador.
- [ ] Identificar claramente dados simulados.
- [ ] Validar integração com a API, quando utilizada.
- [ ] Verificar manifesto, ícones e Service Worker.
- [ ] Confirmar que nenhuma credencial está no frontend.

## 👨‍💻 Autor

**Rafael Oliveira** — projeto acadêmico/TCC **KoraMarketplace / FlashMarket**.
