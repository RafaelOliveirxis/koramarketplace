(() => {
  const loadCss = (href, marker) => {
    if (document.querySelector(`link[data-${marker}]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset[marker] = 'true';
    document.head.appendChild(link);
  };

  /* Camada visual final: carregada por último para evitar conflitos entre os vários CSS antigos. */
  loadCss('css/mobile-app.css', 'mobileAppCss');
  loadCss('css/mobile-fix.css', 'mobileFixCss');
  loadCss('css/mobile-app-v3.css', 'mobileAppV3Css');
  loadCss('css/mobile-app-final.css', 'mobileAppFinalCss');
  loadCss('css/marketplace-final.css', 'marketplaceFinalCss');
  loadCss('css/catalog-footer.css', 'catalogFooterCss');
  loadCss('css/kora-redesign.css', 'koraRedesignCss');
  loadCss('css/kora-logo.css', 'koraLogoCss');
  loadCss('css/auth-reference.css', 'authReferenceCss');
  loadCss('css/site-system.css', 'siteSystemCss');

  const isAffiliatePage = /\/afiliado\.html$/i.test(window.location.pathname);
  const isHomePage = /\/index\.html$/i.test(window.location.pathname) || /\/$/.test(window.location.pathname);

  if (isAffiliatePage) {
    loadCss('css/mobile-affiliate.css', 'mobileAffiliateCss');
    loadCss('css/affiliate-live.css', 'affiliateLiveCss');
  }

  if (!document.querySelector('script[data-mobile-app-js]')) {
    const mobileJs = document.createElement('script');
    mobileJs.src = 'js/mobile-app.js';
    mobileJs.defer = true;
    mobileJs.dataset.mobileAppJs = 'true';
    document.head.appendChild(mobileJs);
  }

  if (!document.querySelector('script[data-ui-final-js]')) {
    const uiJs = document.createElement('script');
    uiJs.src = 'js/ui-final.js';
    uiJs.defer = true;
    uiJs.dataset.uiFinalJs = 'true';
    document.head.appendChild(uiJs);
  }

  if (isAffiliatePage && !document.querySelector('script[data-affiliate-live-js]')) {
    const affiliateJs = document.createElement('script');
    affiliateJs.src = 'js/affiliate-live.js';
    affiliateJs.defer = true;
    affiliateJs.dataset.affiliateLiveJs = 'true';
    document.head.appendChild(affiliateJs);
  }

  /* Normaliza logos e evita elementos duplicados criados por versões anteriores. */
  function normalizeSharedUI() {
    document.querySelectorAll('.brand-logo,.logo img,.logo-image,.site-logo,.footer-logo,img[alt*="FlashMarket" i],img[alt*="FLASH MARKET" i]').forEach(img => {
      if (img.tagName === 'IMG') img.src = 'assets/logo-kora.svg';
    });

    const footers = [...document.querySelectorAll('footer')];
    if (footers.length > 1) footers.slice(1).forEach(el => el.remove());
  }

  const installButton = document.createElement('button');
  installButton.type = 'button';
  installButton.className = 'pwa-install';
  installButton.textContent = 'INSTALAR APP';
  installButton.hidden = true;
  document.body.appendChild(installButton);

  const footerInstallButton = document.querySelector('.footer-install');
  const style = document.createElement('style');
  style.textContent = `.pwa-install{position:fixed;right:16px;bottom:16px;z-index:80;border:0;border-radius:999px;padding:13px 18px;background:#ee4d2d;color:#fff;font:800 12px Inter,Arial,sans-serif;box-shadow:0 8px 25px #0004}.pwa-install[hidden]{display:none}.footer-install{display:inline-flex;align-items:center;gap:7px;border:1px solid #3a3a3a;border-radius:7px;padding:9px 13px;background:#111;color:#fff;font:800 10px Inter,Arial,sans-serif}.footer-install:hover{background:#ee4d2d;border-color:#ee4d2d;color:#fff}@media(max-width:700px){.pwa-install{right:12px;bottom:calc(82px + env(safe-area-inset-bottom));padding:11px 15px;font-size:10px}}`;
  document.head.appendChild(style);

  function arrangeHomeSections() {
    if (!isHomePage) return;
    const main = document.querySelector('main#inicio');
    const offers = document.querySelector('#ofertas');
    const products = document.querySelector('#produtos, #mais-produtos');
    const catalog = document.querySelector('#catalogo, #categorias');
    if (!main || !offers || !products || !catalog) return;

    main.style.display = 'flex';
    main.style.flexDirection = 'column';
    main.style.alignItems = 'stretch';
    [offers, products, catalog].forEach(section => { section.style.order = ''; });
    offers.style.order = '1';
    products.style.order = '2';
    catalog.style.order = '3';

    const title = products.querySelector('.section-head h2');
    if (title) title.textContent = 'Mais produtos';
    const catalogTitle = catalog.querySelector('.section-head h2');
    if (catalogTitle) catalogTitle.textContent = 'Compre por categoria';
  }

  function initAffiliateSessionUI() {
    if (!isAffiliatePage) return;
    const authArea = document.getElementById('authArea') || document.querySelector('.auth-box');
    const dashboard = document.getElementById('affiliatePanel') || document.querySelector('.affiliate-card');
    if (!authArea || !dashboard) return;
    document.querySelectorAll('.auth-benefits').forEach(el => el.remove());
    const loggedIn = () => localStorage.getItem('flashmarket_affiliate_session') === 'true' && !!localStorage.getItem('flashmarket_access_token');
    const sync = () => {
      const active = loggedIn();
      authArea.hidden = active;
      dashboard.hidden = !active;
      authArea.style.display = active ? 'none' : '';
      dashboard.style.display = active ? '' : 'none';
      document.body.classList.toggle('affiliate-logged-in', active);
    };
    sync();
    document.addEventListener('submit', event => {
      if (event.target?.closest('#authForm, .auth-form')) {
        window.setTimeout(sync, 150);
        window.setTimeout(sync, 800);
      }
    });
    window.addEventListener('storage', sync);
    window.setInterval(sync, 700);
  }

  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    installButton.hidden = false;
  });
  async function requestInstall() {
    if (!deferredPrompt) {
      alert('No iPhone/iPad, use Compartilhar > Adicionar à Tela de Início. No Android, abra o menu do navegador e escolha Instalar app.');
      return;
    }
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installButton.hidden = true;
  }
  installButton.addEventListener('click', requestInstall);
  if (footerInstallButton) footerInstallButton.addEventListener('click', requestInstall);
  window.addEventListener('appinstalled', () => { deferredPrompt = null; installButton.hidden = true; });
  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(error => console.error('Não foi possível ativar o modo offline do FlashMarket.', error)));

  const init = () => {
    normalizeSharedUI();
    arrangeHomeSections();
    initAffiliateSessionUI();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
