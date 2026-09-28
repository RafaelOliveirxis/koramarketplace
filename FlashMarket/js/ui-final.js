/* KoraMarketplace — interações finais da interface */
(() => {
  const onReady = fn => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn();

  function openAccount(mode = 'login') {
    const account = document.getElementById('accountBtn');
    if (account) account.click();
    window.setTimeout(() => {
      const tab = document.querySelector(`[data-auth-tab="${mode}"]`);
      if (tab) tab.click();
      const first = document.querySelector(mode === 'register' ? '#registerForm input' : '#loginForm input');
      first?.focus();
    }, 120);
  }

  function connectAuthButtons() {
    const login = document.getElementById('loginTop');
    const register = document.getElementById('registerTop');
    if (login && !login.dataset.connected) {
      login.addEventListener('click', event => { event.preventDefault(); openAccount('login'); });
      login.dataset.connected = 'true';
    }
    if (register && !register.dataset.connected) {
      register.addEventListener('click', event => { event.preventDefault(); openAccount('register'); });
      register.dataset.connected = 'true';
    }
    document.querySelectorAll('.head-action#accountBtn').forEach(button => {
      button.title = localStorage.getItem('flashmarket_user_session') ? 'Minha conta' : 'Entrar ou criar conta';
    });
  }

  function addTrustStrip() {
    if (document.querySelector('.trust-strip')) return;
    const footer = document.querySelector('.footer-shopee-style');
    const products = document.querySelector('.products-section');
    if (!footer || !products) return;
    const trust = document.createElement('section');
    trust.className = 'trust-strip';
    trust.setAttribute('aria-label', 'Benefícios da KoraMarketplace');
    trust.innerHTML = `
      <div class="trust-item"><div class="trust-icon">🔒</div><div><strong>Compra protegida</strong><span>Seus dados com segurança</span></div></div>
      <div class="trust-item"><div class="trust-icon">🚚</div><div><strong>Frete para todo o Brasil</strong><span>Consulte condições por produto</span></div></div>
      <div class="trust-item"><div class="trust-icon">💳</div><div><strong>Pagamento facilitado</strong><span>Opções de pagamento online</span></div></div>
      <div class="trust-item"><div class="trust-icon">💬</div><div><strong>Atendimento</strong><span>Ajuda quando precisar</span></div></div>
    `;
    footer.parentNode.insertBefore(trust, footer);
  }

  function addAppMeta() {
    const add = (name, content) => {
      if (document.querySelector(`meta[name="${name}"]`)) return;
      const meta = document.createElement('meta'); meta.name = name; meta.content = content; document.head.appendChild(meta);
    };
    add('mobile-web-app-capable', 'yes');
    add('apple-mobile-web-app-capable', 'yes');
    add('apple-mobile-web-app-title', 'KoraMarketplace');
    add('application-name', 'KoraMarketplace');
    if (!document.querySelector('link[rel="apple-touch-icon"]')) {
      const link = document.createElement('link'); link.rel = 'apple-touch-icon'; link.href = 'assets/favicon.png'; document.head.appendChild(link);
    }
  }

  function polishHeader() {
    const account = document.getElementById('accountBtn');
    const session = (() => { try { return JSON.parse(localStorage.getItem('flashmarket_user_session') || 'null'); } catch (_) { return null; } })();
    if (account && session?.name) {
      account.classList.add('is-logged');
      const text = document.getElementById('accountText');
      if (text) text.textContent = session.name.split(' ')[0].toUpperCase();
    }
  }

  onReady(() => {
    connectAuthButtons();
    addTrustStrip();
    addAppMeta();
    polishHeader();
    window.addEventListener('storage', connectAuthButtons);
  });
})();
