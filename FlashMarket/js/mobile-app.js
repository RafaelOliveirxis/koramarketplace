/* Navegação mobile do KoraMarketplace — app bar + acesso à conta */
(() => {
  const path = window.location.pathname.toLowerCase();
  const isAccountPage = path.endsWith('/minha-conta.html');
  const isTrackingPage = path.endsWith('/rastrear-pedido.html');
  const isAffiliatePage = path.endsWith('/afiliado.html');

  function hasSession() {
    try {
      const session = JSON.parse(localStorage.getItem('flashmarket_user_session') || 'null');
      return !!session?.email;
    } catch (_) {
      return false;
    }
  }

  function go(page) {
    window.location.href = page;
  }

  function openAccount() {
    if (isAccountPage) return;

    if (hasSession()) {
      go('minha-conta.html');
      return;
    }

    const accountButton = document.getElementById('accountBtn');
    if (accountButton) {
      accountButton.click();
      setTimeout(() => document.querySelector('#loginForm input')?.focus(), 120);
      return;
    }

    go('minha-conta.html');
  }

  function createNav() {
    if (document.querySelector('.mobile-app-nav')) return;

    const nav = document.createElement('nav');
    nav.className = 'mobile-app-nav';
    nav.setAttribute('aria-label', 'Navegação do aplicativo');
    nav.innerHTML = `
      <button type="button" data-mobile-action="home" data-label="Início">
        <span>⌂</span><b>Início</b>
      </button>
      <button type="button" data-mobile-action="tracking" data-label="Rastrear pedido">
        <span>⌁</span><b>Rastrear pedido</b>
      </button>
      <button type="button" data-mobile-action="affiliate" data-label="Área de afiliado">
        <span>⚡</span><b>Área de afiliado</b>
      </button>
      <button type="button" data-mobile-action="favorites" data-label="Favoritos">
        <span>♡</span><b>Favoritos</b>
      </button>
      <button type="button" data-mobile-action="account" data-label="Conta">
        <span>♙</span><b>Conta</b>
      </button>
    `;

    document.body.appendChild(nav);
    setActive(nav);

    nav.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-mobile-action]');
      if (!button) return;

      const action = button.dataset.mobileAction;
      setActive(nav, action);

      if (action === 'home') {
        if (isAccountPage || isTrackingPage || isAffiliatePage) go('index.html');
        else document.getElementById('inicio')?.scrollIntoView({ behavior: 'smooth' });
      }

      if (action === 'tracking') {
        if (!isTrackingPage) go('rastrear-pedido.html');
      }

      if (action === 'affiliate') {
        if (!isAffiliatePage) go('afiliado.html');
      }

      if (action === 'favorites') {
        if (isAccountPage) {
          const favoriteButton = document.querySelector('[data-section="favorites"], [data-target="favorites"]');
          if (favoriteButton) favoriteButton.click();
          else go('index.html#ofertas');
        } else {
          document.getElementById('favBtn')?.click();
        }
      }

      if (action === 'account') openAccount();
    });
  }

  function setActive(nav, forcedAction = null) {
    const action = forcedAction || (
      isAccountPage ? 'account' :
      isTrackingPage ? 'tracking' :
      isAffiliatePage ? 'affiliate' :
      'home'
    );

    nav.querySelectorAll('button').forEach(button => {
      button.classList.toggle('active', button.dataset.mobileAction === action);
    });
  }

  function improveHeaderAccount() {
    const button = document.getElementById('accountBtn');
    const text = document.getElementById('accountText');
    if (!button || !text) return;

    if (hasSession()) text.textContent = 'MINHA CONTA';
    button.setAttribute('aria-label', hasSession() ? 'Abrir minha conta' : 'Entrar ou criar conta');
    button.title = hasSession() ? 'Minha conta' : 'Entrar / Criar conta';
  }

  function improveMobileMenu() {
    const toggle = document.getElementById('mobileToggle');
    const nav = document.getElementById('mainNav');
    if (!toggle || !nav || toggle.dataset.mobileMenuReady) return;

    toggle.dataset.mobileMenuReady = 'true';
    toggle.setAttribute('aria-expanded', 'false');

    toggle.addEventListener('click', () => {
      nav.classList.toggle('mobile-menu-open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('mobile-menu-open') ? 'true' : 'false');
    });
  }

  function injectSmallPolish() {
    if (document.getElementById('mobile-app-polish')) return;

    const style = document.createElement('style');
    style.id = 'mobile-app-polish';
    style.textContent = `
      @media(max-width:700px){
        .mobile-app-nav button b{font:800 6.5px/1.05 Inter,Arial,sans-serif;text-align:center;max-width:58px;}
        .mobile-app-nav button span{font-size:18px;line-height:1;}
        .mobile-app-nav button.active span{transform:translateY(-1px);}
        .mobile-app-nav button.active b{color:#ffc400;}
        #accountBtn{outline:none;}
        #accountBtn:focus-visible{box-shadow:0 0 0 2px #ffc400;}
      }
    `;
    document.head.appendChild(style);
  }

  function init() {
    createNav();
    improveHeaderAccount();
    improveMobileMenu();
    injectSmallPolish();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
