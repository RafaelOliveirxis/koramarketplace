(() => {
  const loadCss = (href, marker) => {
    if (document.querySelector(`link[data-${marker}]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset[marker] = 'true';
    document.head.appendChild(link);
  };

  loadCss('css/mobile-app.css', 'mobileAppCss');
  loadCss('css/mobile-fix.css', 'mobileFixCss');
  loadCss('css/mobile-app-v3.css', 'mobileAppV3Css');
  loadCss('css/mobile-app-final.css', 'mobileAppFinalCss');

  const isAffiliatePage = /\/afiliado\.html$/i.test(window.location.pathname);
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

  if (isAffiliatePage && !document.querySelector('script[data-affiliate-live-js]')) {
    const affiliateJs = document.createElement('script');
    affiliateJs.src = 'js/affiliate-live.js';
    affiliateJs.defer = true;
    affiliateJs.dataset.affiliateLiveJs = 'true';
    document.head.appendChild(affiliateJs);
  }

  const installButton = document.createElement('button');
  installButton.type = 'button';
  installButton.className = 'pwa-install';
  installButton.textContent = 'INSTALAR APP';
  installButton.hidden = true;
  document.body.appendChild(installButton);

  const footerInstallButton = document.querySelector('.footer-install');
  const style = document.createElement('style');
  style.textContent = `.pwa-install{position:fixed;right:16px;bottom:16px;z-index:80;border:0;border-radius:999px;padding:13px 18px;background:#ffbf16;color:#111;font:800 12px Inter,Arial,sans-serif;box-shadow:0 8px 25px #0004}.pwa-install[hidden]{display:none}.footer-install{display:inline-flex;align-items:center;gap:7px;border:1px solid #3a3a3a;border-radius:7px;padding:9px 13px;background:#111;color:#fff;font:800 10px Inter,Arial,sans-serif}.footer-install:hover{background:#ffbf16;border-color:#ffbf16;color:#111}@media(max-width:700px){.pwa-install{right:12px;bottom:calc(82px + env(safe-area-inset-bottom));padding:11px 15px;font-size:10px}}`;
  document.head.appendChild(style);

  function initAffiliateSessionUI() {
    if (!isAffiliatePage) return;
    const authArea = document.getElementById('authArea') || document.querySelector('.auth-box');
    const dashboard = document.getElementById('affiliatePanel') || document.querySelector('.affiliate-card');
    if (!authArea || !dashboard) return;

    // A lista promocional do login não faz parte do painel real.
    document.querySelectorAll('.auth-benefits').forEach(el => el.remove());

    const loggedIn = () => localStorage.getItem('flashmarket_affiliate_session') === 'true' && !!localStorage.getItem('flashmarket_access_token');
    const sync = () => {
      const active = loggedIn();
      authArea.hidden = active;
      dashboard.hidden = !active;
      authArea.setAttribute('aria-hidden', String(active));
      dashboard.setAttribute('aria-hidden', String(!active));
      authArea.style.display = active ? 'none' : '';
      dashboard.style.display = active ? '' : 'none';
      document.body.classList.toggle('affiliate-logged-in', active);
    };

    const addStyle = document.createElement('style');
    addStyle.textContent = `.affiliate-card[hidden],#affiliatePanel[hidden],.auth-box[hidden]{display:none!important}.auth-benefits{display:none!important}body.affiliate-logged-in .affiliate-layout{max-width:1420px!important;display:block!important}body.affiliate-logged-in #affiliatePanel{width:100%!important}`;
    document.head.appendChild(addStyle);
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
  window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); deferredPrompt = event; installButton.hidden = false; });
  async function requestInstall() {
    if (!deferredPrompt) { alert('No iPhone/iPad, use Compartilhar > Adicionar à Tela de Início. No Android, abra o menu do navegador e escolha Instalar app.'); return; }
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installButton.hidden = true;
  }
  installButton.addEventListener('click', requestInstall);
  if (footerInstallButton) footerInstallButton.addEventListener('click', requestInstall);
  window.addEventListener('appinstalled', () => { deferredPrompt = null; installButton.hidden = true; });
  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(error => console.error('Não foi possível ativar o modo offline da FlashMarket.', error)));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAffiliateSessionUI, { once: true }); else initAffiliateSessionUI();
})();
