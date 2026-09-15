/* KoraMarketplace — navegação mobile estilo aplicativo */
(() => {
  const path = window.location.pathname.toLowerCase();
  const isAccountPage = path.endsWith('/minha-conta.html');
  const isTrackingPage = path.endsWith('/rastrear-pedido.html');
  const isAffiliatePage = path.endsWith('/afiliado.html');

  const getSession = () => { try { return JSON.parse(localStorage.getItem('flashmarket_user_session') || 'null'); } catch (_) { return null; } };
  const hasSession = () => !!getSession()?.email;
  const go = page => { window.location.href = page; };

  function openAccount() {
    if (isAccountPage) return;
    if (hasSession()) { go('minha-conta.html'); return; }
    const accountButton = document.getElementById('accountBtn');
    if (accountButton) { accountButton.click(); window.setTimeout(() => document.querySelector('#loginForm input[type="email"], #loginForm input')?.focus(), 150); return; }
    go('minha-conta.html');
  }

  function closeMenu() {
    const drawer = document.querySelector('.mobile-menu-drawer');
    const overlay = document.querySelector('.mobile-menu-overlay');
    drawer?.classList.remove('open');
    overlay?.classList.remove('open');
    drawer?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('mobile-menu-open');
  }

  function openMenu() {
    const drawer = document.querySelector('.mobile-menu-drawer');
    const overlay = document.querySelector('.mobile-menu-overlay');
    if (!drawer || !overlay) return;
    drawer.classList.add('open');
    overlay.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('mobile-menu-open');
  }

  function createMenu() {
    if (document.querySelector('.mobile-menu-drawer')) return;
    const session = getSession();
    const name = session?.name || 'Visitante';
    const email = session?.email || 'Entre ou crie sua conta';
    const drawer = document.createElement('aside');
    drawer.className = 'mobile-menu-drawer';
    drawer.setAttribute('aria-hidden', 'true');
    drawer.innerHTML = `
      <div class="mobile-menu-head">
        <div><strong>MENU</strong><small>KoraMarketplace</small></div>
        <button type="button" class="mobile-menu-close" aria-label="Fechar menu">×</button>
      </div>
      <div class="mobile-menu-user">
        <div class="mobile-user-avatar">♙</div>
        <div class="mobile-user-copy"><strong>Olá, ${name}!</strong><span>${email}</span></div>
        <button type="button" class="mobile-account-open">ABRIR CONTA</button>
      </div>
      <nav class="mobile-menu-links" aria-label="Menu principal">
        <a href="index.html"><span>⌂</span><b>Início</b></a>
        <a href="rastrear-pedido.html"><span>⌁</span><b>Rastrear pedido</b></a>
        <a href="afiliado.html"><span>⚡</span><b>Área de afiliado</b></a>
        <a href="index.html#ofertas"><span>🔥</span><b>Ofertas Flash</b></a>
        <a href="suporte.html"><span>?</span><b>Atendimento</b></a>
      </nav>`;
    const overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    drawer.querySelector('.mobile-menu-close')?.addEventListener('click', closeMenu);
    drawer.querySelector('.mobile-account-open')?.addEventListener('click', () => { closeMenu(); window.setTimeout(openAccount, 80); });
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    overlay.addEventListener('click', closeMenu);
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
    document.body.appendChild(nav); setActive(nav);
    nav.addEventListener('click', event => {
      const button = event.target.closest('button[data-mobile-action]'); if (!button) return;
      const action = button.dataset.mobileAction; setActive(nav, action);
      if (action === 'home') { if (isAccountPage || isTrackingPage || isAffiliatePage) go('index.html'); else document.getElementById('inicio')?.scrollIntoView({behavior:'smooth',block:'start'}); }
      if (action === 'tracking' && !isTrackingPage) go('rastrear-pedido.html');
      if (action === 'affiliate' && !isAffiliatePage) go('afiliado.html');
      if (action === 'favorites') { if (isAccountPage) { const favoriteButton=document.querySelector('[data-section="favorites"], [data-target="favorites"]'); if (favoriteButton) favoriteButton.click(); else go('index.html#ofertas'); } else document.getElementById('favBtn')?.click(); }
      if (action === 'account') openAccount();
    });
  }

  function setActive(nav, forcedAction = null) {
    const action = forcedAction || (isAccountPage ? 'account' : isTrackingPage ? 'tracking' : isAffiliatePage ? 'affiliate' : 'home');
    nav.querySelectorAll('button').forEach(button => button.classList.toggle('active', button.dataset.mobileAction === action));
  }

  function improveHeaderAccount() {
    const button=document.getElementById('accountBtn'), text=document.getElementById('accountText'); if (!button || !text) return;
    const session=getSession(); text.textContent=session?.name ? session.name.split(' ')[0].toUpperCase() : 'ENTRAR'; button.setAttribute('aria-label',session?'Abrir minha conta':'Entrar ou criar conta'); button.title=session?'Minha conta':'Entrar / Criar conta'; button.classList.toggle('is-logged',!!session);
  }

  function improveMobileMenu() {
    createMenu();
    const toggle=document.getElementById('mobileToggle');
    if (!toggle) return;
    toggle.style.display='grid';
    toggle.onclick = event => { event.preventDefault(); openMenu(); };
    toggle.setAttribute('aria-expanded', 'false');
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  }

  function injectSmallPolish() {
    if (document.getElementById('mobile-app-polish')) return;
    const style=document.createElement('style'); style.id='mobile-app-polish';
    style.textContent=`@media(max-width:700px){.mobile-toggle{display:grid!important}.mobile-menu-drawer{display:block!important}.mobile-menu-overlay{display:block!important}.mobile-app-nav{touch-action:manipulation}}`;
    document.head.appendChild(style);
  }

  function init(){ createNav(); improveHeaderAccount(); improveMobileMenu(); injectSmallPolish(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
