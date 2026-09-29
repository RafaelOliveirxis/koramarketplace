/* FlashMarket — Home Commerce v2
   Integra a experiência da home com os recursos já existentes.
*/
(() => {
  const home = /\/index\.html$/i.test(location.pathname) || /\/$/.test(location.pathname);
  if (!home) return;

  const go = (url) => { location.href = url; };

  function wireHomeNavigation() {
    const account = document.getElementById('accountBtn');
    const topLogin = document.getElementById('topLogin');
    const topRegister = document.getElementById('topRegister');
    const cart = document.getElementById('cartBtn');

    // A home passa a usar as páginas reais do fluxo, em vez de autenticação demonstrativa.
    [account, topLogin].forEach(el => {
      if (!el) return;
      el.onclick = e => { e?.preventDefault?.(); go('login.html'); };
    });
    if (topRegister) topRegister.onclick = e => { e.preventDefault(); go('login.html?mode=register'); };
    if (cart) cart.onclick = e => { e?.preventDefault?.(); go('carrinho.html'); };
  }

  function addQuickLinks() {
    const nav = document.querySelector('.nav .wrap');
    if (!nav || nav.querySelector('[data-home-account-link]')) return;
    const link = document.createElement('a');
    link.href = 'minha-conta.html';
    link.textContent = 'Minha conta';
    link.dataset.homeAccountLink = 'true';
    nav.appendChild(link);
  }

  function improveSectionLabels() {
    const labels = [
      ['#categorias', '🛍️ COMPRE POR CATEGORIA'],
      ['#ofertas', '🔥 OFERTAS POR TEMPO LIMITADO'],
      ['#mais-produtos', '⭐ SELEÇÃO FLASHMARKET']
    ];
    labels.forEach(([selector, text]) => {
      const section = document.querySelector(selector);
      const head = section?.querySelector('.section-head');
      if (!head || head.querySelector('.home-section-badge')) return;
      const badge = document.createElement('span');
      badge.className = 'home-section-badge';
      badge.textContent = text;
      const first = head.firstElementChild;
      if (first) first.insertBefore(badge, first.firstChild);
    });
  }

  function updateCartBadge() {
    const badge = document.getElementById('cartCount');
    if (!badge) return;
    try {
      const cart = JSON.parse(localStorage.getItem('flashmarket_cart') || '[]');
      badge.textContent = Array.isArray(cart) ? cart.length : 0;
    } catch (_) { badge.textContent = '0'; }
  }

  function syncAfterStorageChange() {
    window.addEventListener('storage', updateCartBadge);
    window.addEventListener('pageshow', updateCartBadge);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) updateCartBadge(); });
  }

  function init() {
    wireHomeNavigation();
    addQuickLinks();
    improveSectionLabels();
    updateCartBadge();
    syncAfterStorageChange();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
