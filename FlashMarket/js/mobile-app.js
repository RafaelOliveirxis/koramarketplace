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

  /* Menu lateral removido: o app usa somente a navegação inferior e os atalhos do cabeçalho. */
  function improveMobileMenu() {
    const toggle=document.getElementById('mobileToggle');
    if (!toggle) return;
    toggle.style.display='none';
  }

  function injectSmallPolish() {
    if (document.getElementById('mobile-app-polish')) return;
    const style=document.createElement('style'); style.id='mobile-app-polish';
    style.textContent=`@media(max-width:700px){.mobile-toggle{display:none!important}.mobile-menu-drawer,.mobile-menu-overlay{display:none!important}.mobile-app-nav{touch-action:manipulation}}`;
    document.head.appendChild(style);
  }

  function init(){ createNav(); improveHeaderAccount(); improveMobileMenu(); injectSmallPolish(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
