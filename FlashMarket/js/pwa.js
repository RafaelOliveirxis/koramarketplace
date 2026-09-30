(() => {
  const SHARED_CSS = [
    'style.css','interno.css','site-system.css','mobile-app.css','mobile-fix.css',
    'mobile-app-v3.css','mobile-app-final.css','marketplace-final.css','catalog-footer.css',
    'kora-redesign.css','kora-logo.css','auth-reference.css','flashmarket-premium.css','design-system.css'
  ];

  const loadCss = (href, marker) => {
    if (document.querySelector(`link[data-${marker}]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = href; link.dataset[marker] = 'true';
    document.head.appendChild(link);
  };

  // Remove links individuais da camada compartilhada para impedir CSS duplicado.
  const removeSharedLinks = () => {
    document.querySelectorAll('link[rel="stylesheet"][href]').forEach(link => {
      const clean = link.getAttribute('href').split('?')[0].split('/').pop();
      if (SHARED_CSS.includes(clean)) link.remove();
    });
  };

  // Um único ponto de entrada para a camada visual compartilhada.
  removeSharedLinks();
  loadCss('css/flashmarket.css?v=20', 'flashmarketCoreCss');

  const isAffiliatePage = /\/afiliado\.html$/i.test(window.location.pathname);
  const isHomePage = /\/index\.html$/i.test(window.location.pathname) || /\/$/.test(window.location.pathname);

  if (isHomePage) loadCss('css/home-commerce.css?v=20', 'homeCommerceCss');
  if (isAffiliatePage) {
    loadCss('css/mobile-affiliate.css?v=20', 'mobileAffiliateCss');
    loadCss('css/affiliate-live.css?v=20', 'affiliateLiveCss');
  }

  const loadScript = (src, marker) => {
    if (document.querySelector(`script[data-${marker}]`)) return;
    const script = document.createElement('script'); script.src = src; script.defer = true; script.dataset[marker] = 'true';
    document.head.appendChild(script);
  };
  loadScript('js/mobile-app.js', 'mobileAppJs');
  loadScript('js/ui-final.js', 'uiFinalJs');
  if (isHomePage) loadScript('js/home-commerce.js', 'homeCommerceJs');
  if (isAffiliatePage) loadScript('js/affiliate-live.js', 'affiliateLiveJs');

  function normalizeSharedUI() {
    document.querySelectorAll('.brand-logo,.logo img,.logo-image,.site-logo,.footer-logo,img[alt*="FlashMarket" i],img[alt*="FLASH MARKET" i]').forEach(img => {
      if (img.tagName === 'IMG') img.src = 'assets/logo-kora.svg';
    });
    const footers = [...document.querySelectorAll('footer')];
    if (footers.length > 1) footers.slice(1).forEach(el => el.remove());
  }

  function arrangeHomeSections() {
    if (!isHomePage) return;
    const main = document.querySelector('main#inicio');
    const offers = document.querySelector('#ofertas');
    const products = document.querySelector('#produtos, #mais-produtos');
    const catalog = document.querySelector('#catalogo, #categorias');
    if (!main || !offers || !products || !catalog) return;
    main.style.display = 'flex'; main.style.flexDirection = 'column'; main.style.alignItems = 'stretch';
    offers.style.order = '1'; products.style.order = '2'; catalog.style.order = '3';
    const title = products.querySelector('.section-head h2'); if (title) title.textContent = 'Mais produtos';
    const catalogTitle = catalog.querySelector('.section-head h2'); if (catalogTitle) catalogTitle.textContent = 'Compre por categoria';
  }

  function initAffiliateSessionUI() {
    if (!isAffiliatePage) return;
    const authArea = document.getElementById('authArea') || document.querySelector('.auth-box');
    const dashboard = document.getElementById('affiliatePanel') || document.querySelector('.affiliate-card');
    if (!authArea || !dashboard) return;
    document.querySelectorAll('.auth-benefits').forEach(el => el.remove());
    const loggedIn = () => localStorage.getItem('flashmarket_affiliate_session') === 'true' && !!localStorage.getItem('flashmarket_access_token');
    const sync = () => { const active = loggedIn(); authArea.hidden = active; dashboard.hidden = !active; authArea.style.display = active ? 'none' : ''; dashboard.style.display = active ? '' : 'none'; document.body.classList.toggle('affiliate-logged-in', active); };
    sync();
    document.addEventListener('submit', event => { if (event.target?.closest('#authForm, .auth-form')) { setTimeout(sync,150); setTimeout(sync,800); } });
    window.addEventListener('storage', sync); window.setInterval(sync, 700);
  }

  const installButton = document.createElement('button');
  installButton.type='button'; installButton.className='pwa-install'; installButton.textContent='INSTALAR APP'; installButton.hidden=true; document.body.appendChild(installButton);
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); deferredPrompt=event; installButton.hidden=false; });
  async function requestInstall(){ if(!deferredPrompt){ alert('No iPhone/iPad, use Compartilhar > Adicionar à Tela de Início. No Android, abra o menu do navegador e escolha Instalar app.'); return; } deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null; installButton.hidden=true; }
  installButton.addEventListener('click', requestInstall);
  const footerInstallButton=document.querySelector('.footer-install'); if(footerInstallButton) footerInstallButton.addEventListener('click',requestInstall);
  window.addEventListener('appinstalled',()=>{deferredPrompt=null;installButton.hidden=true;});

  if ('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(error=>console.error('Não foi possível ativar o modo offline do FlashMarket.',error)));
  const style=document.createElement('style'); style.textContent='.pwa-install{position:fixed;right:16px;bottom:16px;z-index:80;border:0;border-radius:999px;padding:13px 18px;background:#ee4d2d;color:#fff;font:800 12px Inter,Arial,sans-serif;box-shadow:0 8px 25px #0004}.pwa-install[hidden]{display:none}@media(max-width:700px){.pwa-install{right:12px;bottom:calc(82px + env(safe-area-inset-bottom));padding:11px 15px;font-size:10px}}'; document.head.appendChild(style);

  const init=()=>{normalizeSharedUI();arrangeHomeSections();initAffiliateSessionUI();};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
