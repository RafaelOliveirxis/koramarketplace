/* KoraMarketplace — interações finais da interface */
(() => {
  const onReady = fn => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, { once: true })
    : fn();

  function openAccount(mode = 'login') {
    const normalizedMode = mode === 'register' ? 'register' : 'login';
    const account = document.getElementById('accountBtn');
    if (account) account.click();
    const selectTab = () => {
      const tab = document.querySelector(`[data-auth-tab="${normalizedMode}"]`);
      if (tab) {
        tab.click();
        const first = document.querySelector(normalizedMode === 'register' ? '#registerForm input' : '#loginForm input');
        first?.focus();
        return true;
      }
      return false;
    };
    if (!selectTab()) {
      window.setTimeout(selectTab, 80);
      window.setTimeout(selectTab, 180);
      window.setTimeout(selectTab, 350);
    }
  }

  window.openKoraAccount = openAccount;

  function connectAuthButtons() {
    const login = document.getElementById('loginTop');
    const register = document.getElementById('registerTop');
    if (login && !login.dataset.connected) {
      login.addEventListener('click', event => { event.preventDefault(); openAccount('login'); });
      login.dataset.connected = 'true';
      login.setAttribute('aria-haspopup', 'dialog');
    }
    if (register && !register.dataset.connected) {
      register.addEventListener('click', event => { event.preventDefault(); openAccount('register'); });
      register.dataset.connected = 'true';
      register.setAttribute('aria-haspopup', 'dialog');
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
    trust.innerHTML = `
      <div class="trust-item"><div class="trust-icon">🔒</div><div><strong>Compra protegida</strong><span>Seus dados com segurança</span></div></div>
      <div class="trust-item"><div class="trust-icon">🚚</div><div><strong>Frete para todo o Brasil</strong><span>Consulte condições por produto</span></div></div>
      <div class="trust-item"><div class="trust-icon">💳</div><div><strong>Pagamento facilitado</strong><span>Opções de pagamento online</span></div></div>
      <div class="trust-item"><div class="trust-icon">💬</div><div><strong>Atendimento</strong><span>Ajuda quando precisar</span></div></div>`;
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

  function installDesign() {
    if (document.getElementById('flashmarket-design-fix')) return;
    const style = document.createElement('style');
    style.id = 'flashmarket-design-fix';
    style.textContent = `
      :root{--yellow:#ffbf16;--red:#ed1c24;--black:#050505}
      body{background:#f4f4f2!important;color:#111!important;font-size:15px!important}
      .top-strip{height:38px!important;background:#050505!important;border-bottom:1px solid #242424!important}
      .site-header{background:#080808!important;box-shadow:0 10px 28px rgba(0,0,0,.22)!important;border-bottom:1px solid #222!important}
      .header-main{min-height:86px!important;grid-template-columns:230px minmax(300px,1fr) auto!important;gap:22px!important;padding:12px 0!important}
      .brand-logo{width:210px!important;max-height:68px!important}
      .search,.kora-search{height:48px!important;border:2px solid #ffbf16!important;border-radius:12px!important;box-shadow:0 8px 22px rgba(0,0,0,.18)!important}
      .search input,.kora-search input{font-size:14px!important}
      .search button,.kora-search button{width:58px!important;background:linear-gradient(#ffd85c,#ffbf16)!important;color:#111!important}
      .head-action{min-height:46px!important;border-radius:11px!important;background:#151515!important;border:1px solid #303030!important;box-shadow:none!important;padding:8px 12px!important}
      .head-action:hover{border-color:#ffbf16!important}
      .main-nav{background:#242424!important;border-bottom:3px solid #ed1c24!important}
      .nav-inner a{padding:13px 17px!important;font-size:12px!important}
      .nav-inner a:hover,.nav-inner a.active{background:linear-gradient(#ffd75a,#ffbf16)!important;color:#111!important}
      .nav-inner a.hot{background:linear-gradient(#ed3037,#c8101b)!important;color:#fff!important}
      .hero{background:#2b2b2b!important;color:#fff!important}
      .hero-content{min-height:510px!important}
      .hero h1{font-size:clamp(56px,7vw,82px)!important;text-shadow:5px 5px 0 #000!important}
      .hero-tag{color:#ffbf16!important}
      .btn.yellow,.marketplace-cta{background:#ffbf16!important;color:#111!important;border-radius:9px!important}
      .promo-card{border-radius:15px!important}
      .categories-section,.products-section,.benefits,.newsletter,.map-section{padding:64px 0!important}
      .products-section{background:#101010!important}
      .product-card{border-radius:14px!important;box-shadow:0 10px 26px rgba(0,0,0,.08)!important}
      .product-card:hover{transform:translateY(-5px)!important;box-shadow:0 20px 38px rgba(0,0,0,.14)!important}
      .product-info h3{font-size:14px!important}
      .price{font-size:20px!important}
      .add-cart{background:#ed1c24!important;border-color:#ed1c24!important;border-radius:8px!important;height:40px!important;font-size:11px!important}
      .detail-btn{border-radius:8px!important;height:38px!important}

      #accountModal{padding:24px!important;background:rgba(5,5,5,.66)!important;backdrop-filter:blur(7px)!important}
      #accountModal .modal-box{width:min(1080px,94vw)!important;max-width:1080px!important;min-height:620px!important;border-radius:24px!important;overflow:hidden!important;box-shadow:0 35px 100px rgba(0,0,0,.42)!important}
      #accountModal .close{z-index:20!important;top:22px!important;right:22px!important;width:40px!important;height:40px!important;border-radius:50%!important;background:#fff!important;color:#657084!important;font-size:25px!important;line-height:40px!important;box-shadow:0 5px 15px rgba(0,0,0,.08)!important}
      .auth-shell{grid-template-columns:47% 53%!important;min-height:620px!important}
      .auth-brand-panel{padding:64px 50px!important;justify-content:center!important;background:linear-gradient(145deg,#ffb31b 0%,#ff6500 52%,#ff4d00 100%)!important;position:relative;overflow:hidden}
      .auth-brand-panel::before{width:320px!important;height:320px!important;right:-160px!important;top:-150px!important;background:rgba(255,255,255,.10)!important}
      .auth-brand-panel::after{width:260px!important;height:260px!important;left:-145px!important;bottom:-150px!important;background:rgba(255,255,255,.10)!important}
      .auth-brand-logo{width:100px!important;height:70px!important;margin-bottom:24px!important;position:relative;z-index:2}
      .auth-brand-logo img{max-width:100%!important;max-height:100%!important;object-fit:contain!important}
      .auth-kicker{font-size:13px!important;letter-spacing:.12em!important;font-weight:900!important;position:relative;z-index:2}
      .auth-brand-panel h2{font-size:42px!important;line-height:1.02!important;letter-spacing:-1.5px!important;margin:12px 0 18px!important;position:relative;z-index:2}
      .auth-brand-panel>p{max-width:390px!important;font-size:15px!important;line-height:1.55!important;margin-bottom:28px!important;position:relative;z-index:2}
      .auth-brand-panel ul{gap:17px!important;position:relative;z-index:2}
      .auth-brand-panel li{font-size:14px!important;gap:12px!important}
      .auth-brand-panel li span{width:27px!important;height:27px!important;font-size:13px!important;background:rgba(255,255,255,.2)!important}
      .auth-form-panel{padding:55px 58px 45px!important;background:#fff!important}
      .auth-mini-label{font-size:11px!important;letter-spacing:.15em!important;color:#ff5a00!important;font-weight:900!important}
      .auth-panel-head h3{font-size:34px!important;line-height:1.1!important;letter-spacing:-1px!important;margin:7px 0 9px!important;color:#162033!important}
      .auth-panel-head p{font-size:14px!important;color:#9aa4b2!important}
      .auth-form-panel .auth-tabs{height:58px!important;margin:30px 0 28px!important;padding:5px!important;border-radius:13px!important;background:#f1f3f6!important;gap:5px!important}
      .auth-form-panel .auth-tabs button{height:48px!important;border-radius:10px!important;font-size:13px!important;font-weight:900!important;color:#8b95a5!important}
      .auth-form-panel .auth-tabs button.active{background:#ff6500!important;color:#fff!important;box-shadow:0 7px 20px rgba(255,101,0,.24)!important}
      .auth-field{margin-bottom:20px!important}
      .auth-field>span{font-size:12px!important;margin-bottom:8px!important;color:#273248!important;font-weight:900!important}
      .auth-field input{height:56px!important;border:1px solid #dce3ec!important;border-radius:11px!important;background:#f5f7fa!important;padding:0 16px!important;font-size:14px!important;color:#172033!important;box-shadow:none!important}
      .auth-field input:focus{border-color:#ff7a18!important;background:#fff!important;box-shadow:0 0 0 4px rgba(255,101,0,.10)!important}
      .auth-options{margin:8px 0 28px!important}
      .auth-options label,.auth-options .text-btn{font-size:11px!important;color:#99a2b0!important}
      .auth-options .text-btn{color:#ff5a00!important;font-weight:900!important}
      .auth-submit{height:58px!important;border-radius:11px!important;background:linear-gradient(90deg,#ff6500,#ff7000)!important;font-size:14px!important;box-shadow:0 10px 24px rgba(255,101,0,.22)!important}
      .auth-note{font-size:11px!important;color:#7c8796!important;margin-top:14px!important}
      .password-toggle{color:#8c98a8!important}
      @media(max-width:900px){.header-main{grid-template-columns:1fr auto!important;min-height:72px!important}.brand-logo{width:170px!important}.search,.kora-search{grid-column:1/-1!important;order:3}.header-actions{gap:5px!important}.head-action b{display:none}.hero-content{grid-template-columns:1fr!important;min-height:620px!important}.hero-product{display:none}.auth-shell{grid-template-columns:1fr!important}.auth-brand-panel{display:none!important}.auth-form-panel{padding:38px 28px!important}.auth-panel-head h3{font-size:30px!important}.category-grid,.product-grid{grid-template-columns:repeat(2,1fr)!important}}
      @media(max-width:560px){.wrap{width:94%!important}.brand-logo{width:150px!important}.top-links{display:none}.hero h1{font-size:50px!important}.category-grid,.product-grid{grid-template-columns:1fr!important}.auth-form-panel{padding:32px 20px!important}.auth-panel-head h3{font-size:28px!important}#accountModal{padding:8px!important}#accountModal .modal-box{min-height:0!important;border-radius:18px!important}.auth-form-panel .auth-tabs{height:54px!important}.auth-form-panel .auth-tabs button{height:44px!important}}
    `;
    document.head.appendChild(style);
  }

  onReady(() => {
    connectAuthButtons();
    addTrustStrip();
    addAppMeta();
    polishHeader();
    installDesign();
    window.addEventListener('storage', connectAuthButtons);
  });
})();
