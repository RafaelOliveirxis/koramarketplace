(() => {
  // Este arquivo cuida somente do botão de instalação em celulares.
  // Não carrega nem modifica os estilos, scripts ou a estrutura do desktop.
  const mobile = window.matchMedia('(max-width: 700px)');
  const installCss = document.createElement('link');
  installCss.rel = 'stylesheet';
  installCss.href = 'css/mobile-app-polish.css?v=2';
  document.head.appendChild(installCss);

  let deferredPrompt = null;
  let button = null;
  const installed = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  function ensureButton() {
    if (!mobile.matches || installed()) {
      if (button) button.remove();
      button = null;
      return;
    }
    if (button) return;
    button = document.createElement('button');
    button.type = 'button';
    button.className = 'pwa-install';
    button.innerHTML = '<span aria-hidden="true">↓</span><span>BAIXAR APP</span>';
    button.setAttribute('aria-label', 'Baixar ou instalar o aplicativo FlashMarket');
    button.addEventListener('click', async () => {
      if (installed()) {
        button?.remove();
        button = null;
        return;
      }
      if (deferredPrompt) {
        deferredPrompt.prompt();
        try { await deferredPrompt.userChoice; } catch (error) {}
        deferredPrompt = null;
        return;
      }
      if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
        alert('Para instalar o FlashMarket no iPhone/iPad:\\n1. Toque em Compartilhar no Safari.\\n2. Escolha “Adicionar à Tela de Início”.\\n3. Toque em Adicionar.');
      } else {
        alert('Para instalar o FlashMarket no Android:\\n1. Abra este site no Google Chrome.\\n2. Toque no menu ⋮.\\n3. Escolha “Instalar app” ou “Adicionar à tela inicial”.');
      }
    });
    document.body.appendChild(button);
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    ensureButton();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    if (button) button.remove();
    button = null;
  });
  mobile.addEventListener?.('change', ensureButton);
  ensureButton();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }
})();