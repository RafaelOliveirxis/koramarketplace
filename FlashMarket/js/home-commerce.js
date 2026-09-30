/* FlashMarket — Home Commerce v3
   Evolução visual e UX da página inicial sem quebrar o fluxo existente.
*/
(() => {
  const home = /\/index\.html$/i.test(location.pathname) || /\/$/.test(location.pathname);
  if (!home) return;

  const go = (url) => { location.href = url; };

  function injectEvolutionStyles() {
    if (document.getElementById('home-evolution-styles')) return;
    const style = document.createElement('style');
    style.id = 'home-evolution-styles';
    style.textContent = `
      .fm-home-livebar{display:flex;align-items:center;justify-content:center;gap:18px;min-height:36px;padding:7px 15px;background:#111;color:#fff;font-size:10px;font-weight:800;letter-spacing:.15px;position:relative;z-index:2}
      .fm-home-livebar b{color:#ffd400}.fm-home-livebar span{opacity:.72}.fm-home-livebar a{color:#ff8068;text-decoration:none}.fm-home-livebar .dot{width:6px;height:6px;border-radius:50%;background:#38d996;box-shadow:0 0 0 5px rgba(56,217,150,.12)}
      .home-section-badge{display:inline-flex;align-items:center;gap:6px;margin-bottom:7px;padding:5px 9px;border-radius:99px;background:#fff0eb;color:#ef321a;font-size:8px;font-weight:900;letter-spacing:.7px;text-transform:uppercase}
      .home-premium-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:7px 0 4px}.home-premium-item{display:flex;align-items:center;gap:11px;padding:14px 15px;border:1px solid #e8e8e8;background:#fff;border-radius:13px;box-shadow:0 5px 18px rgba(20,20,20,.035);transition:.2s}.home-premium-item:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(20,20,20,.07)}.home-premium-icon{width:34px;height:34px;display:grid;place-items:center;border-radius:10px;background:#fff0eb;font-size:16px;flex:0 0 auto}.home-premium-item strong{display:block;font-size:10px}.home-premium-item small{display:block;color:#888;font-size:8px;margin-top:2px}
      .home-reveal{opacity:0;transform:translateY(16px);transition:opacity .55s ease,transform .55s ease}.home-reveal.home-visible{opacity:1;transform:none}
      .home-deal-chip{display:inline-flex;align-items:center;margin-left:7px;padding:4px 7px;border-radius:5px;background:#171717;color:#fff;font-size:8px;font-weight:900;vertical-align:middle}.home-deal-chip b{color:#ffd400}
      .home-float-help{position:fixed;right:18px;bottom:18px;z-index:900;width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:#ff3b1f;color:#fff;box-shadow:0 10px 28px rgba(255,59,31,.32);font-size:20px;cursor:pointer;transition:.2s}.home-float-help:hover{transform:translateY(-3px) scale(1.03)}
      .home-toast{position:fixed;left:50%;bottom:20px;transform:translate(-50%,20px);opacity:0;pointer-events:none;z-index:1500;background:#171717;color:#fff;padding:11px 15px;border-radius:10px;font-size:10px;font-weight:800;transition:.25s;box-shadow:0 12px 30px rgba(0,0,0,.2)}.home-toast.show{opacity:1;transform:translate(-50%,0)}
      @media(max-width:820px){.fm-home-livebar{font-size:9px;gap:8px}.fm-home-livebar span{display:none}.home-premium-strip{grid-template-columns:1fr 1fr}.home-premium-item{padding:11px}.home-float-help{right:13px;bottom:13px}}
      @media(max-width:480px){.home-premium-strip{grid-template-columns:1fr}.home-premium-item:nth-child(n+3){display:none}}
    `;
    document.head.appendChild(style);
  }

  function addLiveBar() {
    if (document.querySelector('.fm-home-livebar')) return;
    const bar = document.createElement('div');
    bar.className = 'fm-home-livebar';
    bar.innerHTML = '<i class="dot"></i><b>FLASHMARKET</b><span>Ofertas atualizadas • compra rápida • experiência otimizada</span><a href="ofertas.html">Ver ofertas →</a>';
    const header = document.querySelector('.site-header');
    if (header) header.parentNode.insertBefore(bar, header);
    else document.body.prepend(bar);
    // O header já é fixo; reposiciona o conteúdo sem alterar a estrutura principal.
    const root = document.documentElement;
    const current = parseInt(getComputedStyle(root).getPropertyValue('--header-h')) || 196;
    root.style.setProperty('--header-h', `${current + bar.offsetHeight}px`);
    document.body.style.paddingTop = `${current + bar.offsetHeight}px`;
  }

  function addPremiumStrip() {
    if (document.querySelector('.home-premium-strip')) return;
    const target = document.querySelector('.hero');
    if (!target) return;
    const strip = document.createElement('div');
    strip.className = 'wrap home-premium-strip home-reveal';
    strip.innerHTML = `
      <div class="home-premium-item"><span class="home-premium-icon">🚚</span><div><strong>Frete grátis</strong><small>Confira as condições</small></div></div>
      <div class="home-premium-item"><span class="home-premium-icon">🔒</span><div><strong>Compra segura</strong><small>Checkout protegido</small></div></div>
      <div class="home-premium-item"><span class="home-premium-icon">🎟️</span><div><strong>Cupons exclusivos</strong><small>Economize na compra</small></div></div>
      <div class="home-premium-item"><span class="home-premium-icon">💬</span><div><strong>Suporte rápido</strong><small>Estamos aqui para ajudar</small></div></div>`;
    target.insertAdjacentElement('afterend', strip);
  }

  function addDealChips() {
    document.querySelectorAll('#ofertas .section-head h2, #mais-produtos .section-head h2').forEach((h) => {
      if (h.querySelector('.home-deal-chip')) return;
      const chip = document.createElement('span');
      chip.className = 'home-deal-chip';
      chip.innerHTML = '● <b>ATUALIZADO</b>';
      h.appendChild(chip);
    });
  }

  function addReveal() {
    const selectors = ['.hero-main','.hero-side','.benefits','.section','.banner','.newsletter','.footer'];
    selectors.forEach(sel => document.querySelectorAll(sel).forEach(el => {
      if (!el.classList.contains('home-reveal')) el.classList.add('home-reveal');
    }));
    const items = document.querySelectorAll('.product,.category,.benefit,.hero-card');
    items.forEach((el,i) => { el.classList.add('home-reveal'); el.style.transitionDelay = `${Math.min(i * 35, 280)}ms`; });
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.home-reveal').forEach(el => el.classList.add('home-visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('home-visible'); observer.unobserve(entry.target); }
    }), { threshold:.08, rootMargin:'0px 0px -25px 0px' });
    document.querySelectorAll('.home-reveal').forEach(el => observer.observe(el));
  }

  function addHelpButton() {
    if (document.querySelector('.home-float-help')) return;
    const button = document.createElement('button');
    button.className = 'home-float-help';
    button.type = 'button';
    button.title = 'Abrir suporte';
    button.textContent = '💬';
    button.onclick = () => go('suporte.html');
    document.body.appendChild(button);
  }

  function improveSearch() {
    const input = document.querySelector('.search input');
    if (!input || input.dataset.evolutionReady) return;
    input.dataset.evolutionReady = 'true';
    input.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      const value = input.value.trim();
      if (value) go(`busca.html?q=${encodeURIComponent(value)}`);
    });
  }

  function wireHomeNavigation() {
    const account = document.getElementById('accountBtn');
    const topLogin = document.getElementById('topLogin');
    const topRegister = document.getElementById('topRegister');
    const cart = document.getElementById('cartBtn');
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
      badge.textContent = Array.isArray(cart) ? cart.reduce((sum, item) => sum + Number(item.qty || item.quantidade || 1), 0) : 0;
    } catch (_) { badge.textContent = '0'; }
  }

  function syncAfterStorageChange() {
    window.addEventListener('storage', updateCartBadge);
    window.addEventListener('pageshow', updateCartBadge);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) updateCartBadge(); });
  }

  function init() {
    injectEvolutionStyles();
    addLiveBar();
    wireHomeNavigation();
    addQuickLinks();
    improveSectionLabels();
    addPremiumStrip();
    addDealChips();
    addReveal();
    addHelpButton();
    improveSearch();
    updateCartBadge();
    syncAfterStorageChange();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
