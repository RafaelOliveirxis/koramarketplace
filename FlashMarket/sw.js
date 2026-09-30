const CACHE_NAME = "flashmarket-shell-v18";
const APP_SHELL = [
  "./","./index.html","./afiliado.html","./minha-conta.html","./rastrear-pedido.html","./suporte.html","./login.html","./produtos.html","./produto.html","./carrinho.html","./checkout.html","./resetar-senha.html","./manifest.webmanifest",
  "./css/style.css","./css/interno.css","./css/site-system.css","./css/mobile-app.css","./css/mobile-fix.css","./css/mobile-app-v3.css","./css/mobile-app-final.css","./css/marketplace-final.css","./css/catalog-footer.css","./css/kora-redesign.css","./css/kora-logo.css","./css/auth-reference.css","./css/home-proportional.css","./css/minha-conta.css",
  "./js/auth-real.js","./js/mobile-app.js","./js/ui-final.js","./js/rastreamento.js","./js/pedido-rastreio.js","./js/rastreio-pedidos-reais.js","./js/suporte.js","./js/pwa.js","./js/interno.js","./js/catalog-bridge.js","./js/minha-conta.js","./js/checkout-steps.js",
  "./assets/favicon.png","./assets/logo.FlashMarket.png","./assets/logo-kora.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
  )));
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).then(async response => {
      const url = new URL(event.request.url);
      const isHome = url.origin === self.location.origin &&
        (url.pathname.endsWith("/FlashMarket/") || url.pathname.endsWith("/FlashMarket/index.html"));
      const type = response.headers.get("content-type") || "";
      if (response.ok && isHome && type.includes("text/html")) {
        const html = await response.text();
        const css = '<link rel="stylesheet" href="./css/home-proportional.css?v=18">';
        const updated = html.includes("home-proportional.css") ? html : html.replace("</head>", css + "</head>");
        response = new Response(updated, {status: response.status, statusText: response.statusText, headers: response.headers});
      }
      if (response.ok && url.origin === self.location.origin) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => caches.match(event.request).then(response => response || caches.match("./index.html")))
  );
});
