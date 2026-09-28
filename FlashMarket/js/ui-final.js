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

  /* Ajustes SOMENTE no modal de conta. O restante do design original do marketplace é preservado. */
  function installAccountDesign() {
    if (document.getElementById('flashmarket-account-design')) return;
    const style = document.createElement('style');
    style.id = 'flashmarket-account-design';
    style.textContent = `
      #accountModal{padding:18px!important;background:rgba(20,20,20,.58)!important;backdrop-filter:blur(5px)!important}
      #accountModal .modal-box{width:min(1104px,94vw)!important;max-width:1104px!important;min-height:720px!important;border-radius:24px!important;overflow:hidden!important;box-shadow:0 28px 90px rgba(0,0,0,.34)!important}
      #accountModal .close{z-index:20!important;top:25px!important;right:25px!important;width:38px!important;height:38px!important;border-radius:50%!important;background:#fff!important;color:#657084!important;font-size:25px!important;line-height:38px!important;box-shadow:none!important}
      .auth-shell{grid-template-columns:44% 56%!important;min-height:720px!important}
      .auth-brand-panel{padding:55px 50px!important;justify-content:center!important;background:linear-gradient(145deg,#ffb31b 0%,#ff7a00 50%,#ff5b00 100%)!important;position:relative;overflow:hidden}
      .auth-brand-panel::before{width:330px!important;height:330px!important;right:-165px!important;top:-150px!important;background:rgba(255,255,255,.09)!important}
      .auth-brand-panel::after{width:250px!important;height:250px!important;left:-135px!important;bottom:-135px!important;background:rgba(255,255,255,.09)!important}
      .auth-brand-logo{width:100px!important;height:70px!important;margin-bottom:20px!important;position:relative;z-index:2}
      .auth-brand-logo img{max-width:100%!important;max-height:100%!important;object-fit:contain!important}
      .auth-kicker{font-size:12px!important;letter-spacing:.12em!important;font-weight:900!important;position:relative;z-index:2}
      .auth-brand-panel h2{font-size:40px!important;line-height:1.04!important;letter-spacing:-1.5px!important;margin:12px 0 18px!important;position:relative;z-index:2}
      .auth-brand-panel>p{max-width:400px!important;font-size:15px!important;line-height:1.55!important;margin-bottom:28px!important;position:relative;z-index:2}
      .auth-brand-panel ul{gap:17px!important;position:relative;z-index:2}
      .auth-brand-panel li{font-size:14px!important;gap:12px!important}
      .auth-brand-panel li span{width:27px!important;height:27px!important;font-size:13px!important;background:rgba(255,255,255,.18)!important}
      .auth-form-panel{padding:55px 60px 45px!important;background:#fff!important}
      .auth-mini-label{font-size:11px!important;letter-spacing:.15em!important;color:#ff5a00!important;font-weight:900!important}
      .auth-panel-head h3{font-size:34px!important;line-height:1.1!important;letter-spacing:-1px!important;margin:7px 0 9px!important;color:#172033!important}
      .auth-panel-head p{font-size:14px!important;color:#9aa4b2!important}
      .auth-form-panel .auth-tabs{height:58px!important;margin:30px 0 28px!important;padding:5px!important;border-radius:13px!important;background:#f1f3f6!important;gap:5px!important}
      .auth-form-panel .auth-tabs button{height:48px!important;border-radius:10px!important;font-size:13px!important;font-weight:900!important;color:#8b95a5!important}
      .auth-form-panel .auth-tabs button.active{background:#ff6500!important;color:#fff!important;box-shadow:0 7px 20px rgba(255,101,0,.24)!important}
      .auth-field{margin-bottom:20px!important}
      .auth-field>span{font-size:12px!important;margin-bottom:8px!important;color:#273248!important;font-weight:900!important}
      .auth-field input{height:56px!important;border:1px solid #dce3ec!important;border-radius:11px!important;background:#edf3fc!important;padding:0 16px!important;font-size:14px!important;color:#172033!important;box-shadow:none!important}
      .auth-field input:focus{border-color:#ff7a18!important;background:#fff!important;box-shadow:0 0 0 4px rgba(255,101,0,.10)!important}
      .auth-options{margin:8px 0 28px!important}
      .auth-options label,.auth-options .text-btn{font-size:11px!important;color:#99a2b0!important}
      .auth-options .text-btn{color:#ff5a00!important;font-weight:900!important}
      .auth-submit{height:58px!important;border-radius:11px!important;background:linear-gradient(90deg,#ff6500,#ff7000)!important;font-size:14px!important;box-shadow:0 10px 24px rgba(255,101,0,.22)!important}
      .auth-note{font-size:11px!important;color:#7c8796!important;margin-top:14px!important}
      .password-toggle{color:#8c98a8!important}
      @media(max-width:900px){
        .auth-shell{grid-template-columns:1fr!important;min-height:0!important}
        .auth-brand-panel{display:none!important}
        .auth-form-panel{padding:38px 28px!important}
        .auth-panel-head h3{font-size:30px!important}
      }
      @media(max-width:560px){
        #accountModal{padding:8px!important}
        #accountModal .modal-box{min-height:0!important;border-radius:18px!important}
        .auth-form-panel{padding:32px 20px!important}
        .auth-form-panel .auth-tabs{height:54px!important}
        .auth-form-panel .auth-tabs button{height:44px!important}
      }
    `;
    document.head.appendChild(style);
  }

  onReady(() => {
    connectAuthButtons();
    addTrustStrip();
    addAppMeta();
    polishHeader();
    installAccountDesign();
    window.addEventListener('storage', connectAuthButtons);
  });
})();
