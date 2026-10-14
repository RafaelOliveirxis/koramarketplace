(() => {
  let deferredPrompt = null;

  const isInstalled = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  const installButton = document.createElement('button');
  installButton.type = 'button';
  installButton.className = 'pwa-install';
  installButton.innerHTML = '<span aria-hidden="true">↓</span><span>BAIXAR APP</span>';
  installButton.setAttribute('aria-label', 'Baixar ou instalar o aplicativo FlashMarket');
  installButton.hidden = isInstalled();
  document.body.appendChild(installButton);

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    installButton.hidden = isInstalled();
  });

  async function requestInstall() {
    if (isInstalled()) {
      installButton.hidden = true;
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        await deferredPrompt.userChoice;
      } catch (error) {
        console.info('Instalação do FlashMarket:', error);
      }
      deferredPrompt = null;
      return;
    }

    if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
      alert('Para instalar o FlashMarket no iPhone/iPad:\n1. Toque em Compartilhar no Safari.\n2. Escolha “Adicionar à Tela de Início”.\n3. Toque em Adicionar.');
    } else if (/android/i.test(navigator.userAgent)) {
      alert('Para instalar o FlashMarket no Android:\n1. Abra este site no Google Chrome.\n2. Toque no menu ⋮.\n3. Escolha “Instalar app” ou “Adicionar à tela inicial”.');
    } else {
      alert('Abra este site no navegador do celular e use o menu para escolher “Instalar app” ou “Adicionar à tela inicial”.');
    }
  }

  installButton.addEventListener('click', requestInstall);
  document.querySelectorAll('.footer-install').forEach((element) => {
    element.addEventListener('click', requestInstall);
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installButton.hidden = true;
  });

  const style = document.createElement('style');
  style.textContent = '.pwa-install{position:fixed;right:14px;bottom:16px;z-index:1100;display:flex;align-items:center;gap:8px;border:0;border-radius:999px;padding:13px 18px;background:#ff3b20;color:#fff;font:900 11px Inter,Arial,sans-serif;letter-spacing:.04em;box-shadow:0 10px 28px #0004;cursor:pointer}.pwa-install:hover{background:#d92b20;transform:translateY(-2px)}.pwa-install[hidden]{display:none}@media(max-width:700px){.pwa-install{right:12px;bottom:calc(82px + env(safe-area-inset-bottom));padding:12px 15px}}@media(display-mode:standalone){.pwa-install{display:none}}';
  document.head.appendChild(style);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch((error) => {
        console.error('PWA FlashMarket:', error);
      });
    });
  }
})();
