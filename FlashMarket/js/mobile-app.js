/* KoraMarketplace — navegação mobile estilo aplicativo */
(() => {
  const path = window.location.pathname.toLowerCase();
  const isAccountPage = path.endsWith('/minha-conta.html');
  const isTrackingPage = path.endsWith('/rastrear-pedido.html');
  const isAffiliatePage = path.endsWith('/afiliado.html');

  const getSession = () => {
    try { return JSON.parse(localStorage.getItem('flashmarket_user_session') || 'null'); }
    catch (_) { return null; }
  };
  const hasSession = () => !!getSession()?.email;
  const go = page => { window.location.href = page; };

  function openAccount() {
    if (isAccountPage) return;
    if (hasSession()) { go('minha-conta.html'); return; }
    const accountButton = document.getElementById('accountBtn');
    if (accountButton) {
      accountButton.click();
      window.setTimeout(() => document.querySelector('#loginForm input[type="email"], #loginForm input')?.focus(), 150);
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
      <button type="button" data-mobile-action="home" aria-label="Início"><span>⌂</span><b>Início</b></button>
      <button type="button" data-mobile-action="tracking" aria-label="Rastrear pedido"><span>⌁</span><b>Rastrear</b><small>pedido</small></button>
      <button type="button" data-mobile-action="affiliate" aria-label="Área de afiliado"><span>⚡</span><b>Área de</b><small>afiliado</small></button>
      <button type="button" data-mobile-action="favorites" aria-label="Favoritos"><span>♡</span><b>Favoritos</b></button>
      <button type="button" data-mobile-action="account" aria-label="Conta"><span>♙</span><b>Conta</b></button>
    `;
    document.body.appendChild(nav);
    setActive(nav);

    nav.addEventListener('click', event => {
      const button = event.target.closest('button[data-mobile-action]');
      if (!button) return;
      const action = button.dataset.mobileAction;
      setActive(nav, action);
      if (action === 'home') {
        if (isAccountPage || isTrackingPage || isAffiliatePage) go('index.html');
        else document.getElementById('inicio')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (action === 'tracking' && !isTrackingPage) go('rastrear-pedido.html');
      if (action === 'affiliate' && !isAffiliatePage) go('afiliado.html');
      if (action === 'favorites') {
        if (isAccountPage) {
          const favoriteButton = document.querySelector('[data-section="favorites"], [data-target="favorites"]');
          if (favoriteButton) favoriteButton.click(); else go('index.html#ofertas');
        } else document.getElementById('favBtn')?.click();
      }
      if (action === 'account') openAccount();
    });
  }

  function setActive(nav, forcedAction = null) {
    const action = forcedAction || (isAccountPage ? 'account' : isTrackingPage ? 'tracking' : isAffiliatePage ? 'affiliate' : 'home');
    nav.querySelectorAll('button').forEach(button => button.classList.toggle('active', button.dataset.mobileAction === action));
  }

  function improveHeaderAccount() {
    const button = document.getElementById('accountBtn');
    const text = document.getElementById('accountText');
    if (!button || !text) return;
    const session = getSession();
    text.textContent = session?.name ? session.name.split(' ')[0].toUpperCase() : 'ENTRAR';
    button.setAttribute('aria-label', session ? 'Abrir minha conta' : 'Entrar ou criar conta');
    button.title = session ? 'Minha conta' : 'Entrar / Criar conta';
    button.classList.toggle('is-logged', !!session);
  }

  function improveMobileMenu() {
    const toggle = document.getElementById('mobileToggle');
    const mainNav = document.getElementById('mainNav');
    if (!toggle || toggle.dataset.mobileMenuReady) return;
    toggle.dataset.mobileMenuReady = 'true';
    toggle.setAttribute('aria-expanded', 'false');

    const drawer = document.createElement('aside');
    drawer.className = 'mobile-menu-drawer';
    drawer.setAttribute('aria-hidden', 'true');
    drawer.innerHTML = `
      <div class="mobile-menu-head">
        <div><strong>MENU</strong><span>KoraMarketplace</span></div>
        <button type="button" class="mobile-menu-close" aria-label="Fechar menu">×</button>
      </div>
      <div class="mobile-menu-user">
        <div class="mobile-menu-avatar">♙</div>
        <div><strong class="mobile-menu-user-name">Olá!</strong><small class="mobile-menu-user-status">Entre na sua conta</small></div>
        <button type="button" class="mobile-menu-login">ENTRAR</button>
      </div>
      <div class="mobile-menu-links">
        <a href="index.html#inicio"><span>⌂</span>Início</a>
        <a href="rastrear-pedido.html"><span>⌁</span>Rastrear pedido</a>
        <a href="afiliado.html"><span>⚡</span>Área de afiliado</a>
        <a href="index.html#ofertas"><span>🔥</span>Ofertas Flash</a>
        <a href="suporte.html"><span>?</span>Atendimento</a>
      </div>
    `;
    document.body.appendChild(drawer);

    const overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);

    const closeMenu = () => {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      toggle.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('mobile-menu-active');
    };
    const openMenu = () => {
      drawer.classList.add('open');
      overlay.classList.add('open');
      toggle.classList.add('menu-open');
      toggle.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.classList.add('mobile-menu-active');
      updateMenuUser();
    };

    toggle.addEventListener('click', () => drawer.classList.contains('open') ? closeMenu() : openMenu());
    drawer.querySelector('.mobile-menu-close').addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    drawer.querySelector('.mobile-menu-login').addEventListener('click', () => { closeMenu(); openAccount(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

    function updateMenuUser() {
      const session = getSession();
      const name = drawer.querySelector('.mobile-menu-user-name');
      const status = drawer.querySelector('.mobile-menu-user-status');
      const login = drawer.querySelector('.mobile-menu-login');
      name.textContent = session?.name ? `Olá, ${session.name.split(' ')[0]}!` : 'Olá!';
      status.textContent = session?.email || 'Entre na sua conta';
      login.textContent = session ? 'ABRIR CONTA' : 'ENTRAR';
    }
    updateMenuUser();

    if (mainNav) mainNav.classList.remove('mobile-menu-open');
  }

  function injectSmallPolish() {
    if (document.getElementById('mobile-app-polish')) return;
    const style = document.createElement('style');
    style.id = 'mobile-app-polish';
    style.textContent = `
      @media(max-width:700px){
        body.mobile-menu-active{overflow:hidden!important}
        .mobile-toggle{position:relative!important;z-index:6100!important;transition:.2s ease!important}
        .mobile-toggle.menu-open{background:#ffc400!important;color:#111!important;border-color:#ffc400!important}
        .mobile-toggle.menu-open{font-size:0!important}
        .mobile-toggle.menu-open:after{content:'×';font-size:30px!important;font-weight:300!important;line-height:1!important}
        .mobile-menu-overlay{position:fixed!important;inset:0!important;background:rgba(0,0,0,.72)!important;backdrop-filter:blur(3px)!important;z-index:5900!important;opacity:0!important;visibility:hidden!important;transition:opacity .22s ease,visibility .22s ease!important}
        .mobile-menu-overlay.open{opacity:1!important;visibility:visible!important}
        .mobile-menu-drawer{position:fixed!important;left:0!important;top:0!important;width:min(86vw,350px)!important;height:100dvh!important;z-index:6000!important;background:#101010!important;color:#fff!important;transform:translateX(-105%)!important;transition:transform .25s cubic-bezier(.2,.8,.2,1)!important;box-shadow:15px 0 45px rgba(0,0,0,.5)!important;overflow-y:auto!important;padding:env(safe-area-inset-top) 0 calc(90px + env(safe-area-inset-bottom))!important}
        .mobile-menu-drawer.open{transform:translateX(0)!important}
        .mobile-menu-head{height:78px!important;padding:13px 16px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;border-bottom:1px solid #2a2a2a!important;background:#080808!important}
        .mobile-menu-head strong{display:block!important;color:#ffc400!important;font:900 17px Inter,Arial,sans-serif!important;letter-spacing:1px!important}
        .mobile-menu-head span{display:block!important;margin-top:2px!important;color:#777!important;font:700 8px Inter,Arial,sans-serif!important}
        .mobile-menu-close{width:38px!important;height:38px!important;border-radius:50%!important;border:1px solid #333!important;background:#171717!important;color:#fff!important;font-size:27px!important}
        .mobile-menu-user{margin:12px!important;padding:12px!important;border:1px solid #2d2d2d!important;border-radius:12px!important;background:#171717!important;display:grid!important;grid-template-columns:42px 1fr auto!important;align-items:center!important;gap:9px!important}
        .mobile-menu-avatar{width:40px!important;height:40px!important;display:grid!important;place-items:center!important;border-radius:50%!important;background:#ffc400!important;color:#111!important;font-size:21px!important}
        .mobile-menu-user strong{display:block!important;font-size:11px!important}
        .mobile-menu-user small{display:block!important;margin-top:3px!important;color:#999!important;font-size:7px!important;max-width:125px!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
        .mobile-menu-login{border:0!important;border-radius:7px!important;padding:9px 9px!important;background:#ffc400!important;color:#111!important;font:900 7px Inter,Arial,sans-serif!important;white-space:nowrap!important}
        .mobile-menu-links{padding:3px 12px 10px!important}
        .mobile-menu-links a{height:48px!important;padding:0 12px!important;display:flex!important;align-items:center!important;gap:12px!important;border-bottom:1px solid #242424!important;color:#f5f5f5!important;text-decoration:none!important;font:800 10px Inter,Arial,sans-serif!important}
        .mobile-menu-links a span{width:26px!important;text-align:center!important;color:#ffc400!important;font-size:18px!important}
        .mobile-menu-links a:active{background:#1b1b1b!important}
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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
