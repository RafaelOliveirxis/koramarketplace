const CACHE_NAME = "flashmarket-shell-v20";
const APP_SHELL = [
  "./","./index.html","./afiliado.html","./minha-conta.html","./rastrear-pedido.html","./suporte.html","./login.html","./produtos.html","./produto.html","./carrinho.html","./checkout.html","./resetar-senha.html","./pagamento-retorno.html","./manifest.webmanifest",
  "./css/flashmarket.css","./css/design-system.css","./css/home-commerce.css","./css/home-proportional.css","./css/minha-conta.css","./css/mobile-affiliate.css","./css/affiliate-live.css",
  "./js/auth-real.js","./js/mobile-app.js","./js/ui-final.js","./js/rastreamento.js","./js/pedido-rastreio.js","./js/rastreio-pedidos-reais.js","./js/suporte.js","./js/pwa.js","./js/interno.js","./js/catalog-bridge.js","./js/minha-conta.js","./js/checkout-steps.js",
  "./assets/favicon.png","./assets/logo.FlashMarket.png","./assets/logo-kora.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).then(response => {
      if (response.ok && new URL(event.request.url).origin === self.location.origin) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => caches.match(event.request).then(response => response || caches.match("./index.html")))
  );
});
