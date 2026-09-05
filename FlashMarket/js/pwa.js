(() => {
  const installButton = document.createElement("button");
  installButton.type = "button";
  installButton.className = "pwa-install";
  installButton.textContent = "INSTALAR APP";
  installButton.hidden = true;
  document.body.appendChild(installButton);
  const footerInstallButton = document.querySelector(".footer-install");

  const style = document.createElement("style");
  style.textContent = `
    .pwa-install{position:fixed;right:16px;bottom:16px;z-index:80;border:0;border-radius:999px;
      padding:13px 18px;background:#ffbf16;color:#111;font:800 12px Inter,Arial,sans-serif;
      box-shadow:0 8px 25px #0004}
    .pwa-install[hidden]{display:none}
    .footer-install{display:inline-flex;align-items:center;gap:7px;border:1px solid #3a3a3a;
      border-radius:7px;padding:9px 13px;background:#111;color:#fff;font:800 10px Inter,Arial,sans-serif}
    .footer-install:hover{background:#ffbf16;border-color:#ffbf16;color:#111}
    @media(max-width:560px){.pwa-install{right:12px;bottom:calc(12px + env(safe-area-inset-bottom))}}
  `;
  document.head.appendChild(style);

  let deferredPrompt;
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredPrompt = event;
    installButton.hidden = false;
  });

  async function requestInstall() {
    if (!deferredPrompt) {
      alert("No iPhone/iPad, use Compartilhar > Adicionar à Tela de Início. No Android, abra o menu do navegador e escolha Instalar app.");
      return;
    }
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installButton.hidden = true;
  }

  installButton.addEventListener("click", requestInstall);
  if (footerInstallButton) footerInstallButton.addEventListener("click", requestInstall);

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    installButton.hidden = true;
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(error => {
        console.error("Não foi possível ativar o modo offline da FlashMarket.", error);
      });
    });
  }
})();
