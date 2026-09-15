(() => {
  // Camadas visuais e navegação mobile carregadas em todas as páginas do PWA.
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

  if (!document.querySelector('script[data-mobile-app-js]')) {
    const mobileJs = document.createElement('script');
    mobileJs.src = 'js/mobile-app.js';
    mobileJs.defer = true;
    mobileJs.dataset.mobileAppJs = 'true';
    document.head.appendChild(mobileJs);
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
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installButton.hidden = true;
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(error =>
        console.error('Não foi possível ativar o modo offline da FlashMarket.', error)
      );
    });
  }
})();
