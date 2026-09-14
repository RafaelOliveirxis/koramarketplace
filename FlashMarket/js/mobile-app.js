/* Navegação mobile do KoraMarketplace */
(() => {
  const path = window.location.pathname.toLowerCase();
  const isAccountPage = path.endsWith('/minha-conta.html');

  function hasSession() {
    try {
      const session = JSON.parse(localStorage.getItem('flashmarket_user_session') || 'null');
      return !!session?.email;
    } catch (_) {
      return false;
    }
  }

  function openAccount() {
    if (isAccountPage) return;
    if (hasSession()) {
      window.location.href = 'minha-conta.html';
      return;
    }
    const accountButton = document.getElementById('accountBtn');
    if (accountButton) {
      accountButton.click();
      setTimeout(() => document.querySelector('#loginForm input')?.focus(), 120);
    } else {
      window.location.href = 'minha-conta.html';
    }
  }

  function createNav() {
    if (document.querySelector('.mobile-app-nav')) return;
    const nav = document.createElement('nav');
    nav.className = 'mobile-app-nav';
    nav.setAttribute('aria-label', 'Navegação do aplicativo');
    nav.innerHTML = `
      <button type="button" data-mobile-action="home" class="active"><span>⌂</span>Início</button>
      <button type="button" data-mobile-action="categories"><span>☷</span>Categorias</button>
      <button type="button" data-mobile-action="offers" class="nav-offer"><span>⚡</span>Ofertas</button>
      <button type="button" data-mobile-action="favorites"><span>♡</span>Favoritos</button>
      <button type="button" data-mobile-action="account"><span>♙</span>Conta</button>
    `;
    document.body.appendChild(nav);

    nav.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-mobile-action]');
      if (!button) return;
      nav.querySelectorAll('button').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      const action = button.dataset.mobileAction;

      if (action === 'home') {
        if (isAccountPage) window.location.href = 'index.html';
        else document.getElementById('inicio')?.scrollIntoView({ behavior: 'smooth' });
      }
      if (action === 'categories') {
        if (isAccountPage) window.location.href = 'index.html#catalogo';
        else document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
      }
      if (action === 'offers') {
        if (isAccountPage) window.location.href = 'index.html#ofertas';
        else document.getElementById('ofertas')?.scrollIntoView({ behavior: 'smooth' });
      }
      if (action === 'favorites') {
        if (isAccountPage) {
          document.querySelector('[data-section="favorites"], [data-target="favorites"]')?.click();
        } else {
          document.getElementById('favBtn')?.click();
        }
      }
      if (action === 'account') openAccount();
    });
  }

  function improveHeaderAccount() {
    const button = document.getElementById('accountBtn');
    const text = document.getElementById('accountText');
    if (!button || !text) return;
    if (hasSession()) text.textContent = 'MINHA CONTA';
    button.setAttribute('aria-label', hasSession() ? 'Abrir minha conta' : 'Entrar ou criar conta');
  }

  function improveMobileMenu() {
    const toggle = document.getElementById('mobileToggle');
    const nav = document.getElementById('mainNav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', () => {
      nav.classList.toggle('mobile-menu-open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('mobile-menu-open') ? 'true' : 'false');
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    createNav();
    improveHeaderAccount();
    improveMobileMenu();
  });
})();
