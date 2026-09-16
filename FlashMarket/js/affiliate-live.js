/* Área de Afiliado — autenticação real via API + sessão */
(() => {
  if (!/\/afiliado\.html$/i.test(window.location.pathname)) return;

  const API = 'https://koramarketplace.vercel.app';
  const $ = id => document.getElementById(id);
  const money = value => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(value || 0));
  const getToken = () => localStorage.getItem('flashmarket_access_token') || '';

  function setMessage(text, ok = false) {
    const el = $('authMessage');
    if (el) {
      el.textContent = text;
      el.style.color = ok ? '#98f5c2' : '#ffc21c';
    }
  }

  async function api(path, options = {}) {
    const headers = {'Content-Type':'application/json', ...(options.headers || {})};
    const authToken = getToken();
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    let response;
    try {
      response = await fetch(`${API}${path}`, {...options, headers});
    } catch {
      throw new Error('Não foi possível conectar ao servidor. Verifique se a API da Vercel está online.');
    }

    let data = {};
    try { data = await response.json(); } catch {}
    if (!response.ok) throw new Error(data.error || 'E-mail ou senha inválidos.');
    return data;
  }

  function setScreen(logged) {
    const auth = $('authArea') || document.querySelector('.auth-box');
    const panel = $('affiliatePanel') || document.querySelector('.affiliate-card');

    document.querySelectorAll('.auth-benefits').forEach(el => {
      el.hidden = true;
      el.style.display = 'none';
    });

    document.body.classList.add('affiliate-live-page');
    document.body.classList.toggle('affiliate-logged-in', logged);

    if (auth) {
      auth.hidden = logged;
      auth.setAttribute('aria-hidden', String(logged));
      auth.style.display = logged ? 'none' : '';
    }
    if (panel) {
      panel.hidden = !logged;
      panel.setAttribute('aria-hidden', String(!logged));
      panel.style.display = logged ? '' : 'none';
    }
  }

  function showDashboardUser(user) {
    const name = user?.name || localStorage.getItem('flashmarket_affiliate_user') || 'Afiliado';
    if ($('dashboardUserName')) $('dashboardUserName').textContent = name;
  }

  function updateLink(code) {
    if (!code || !$('affiliateLink')) return;
    const base = `${location.origin}${location.pathname.replace(/[^/]+$/,'')}`;
    $('affiliateLink').textContent = `${base}index.html?af=${encodeURIComponent(code)}`;
  }

  function renderOrders(orders) {
    const body = $('ordersTableBody');
    if (!body) return;
    if (!orders?.length) {
      body.innerHTML = '<tr><td colspan="6"><div class="affiliate-empty-state">Nenhum pedido registrado neste período. As vendas reais aparecerão aqui quando forem vinculadas ao seu código.</div></td></tr>';
      return;
    }
    body.innerHTML = orders.map(o => `<tr><td>${o.external_id || o.id}</td><td>${o.customer_name || '—'}</td><td>${o.product_name || 'Produto afiliado'}</td><td>${money(o.value)}</td><td>${new Date(o.ordered_at).toLocaleDateString('pt-BR')}</td><td><span class="status-chip">${o.status}</span></td></tr>`).join('');
  }

  function renderProducts(products) {
    const list = $('productList');
    if (!list) return;
    if (!products?.length) {
      list.innerHTML = '<div class="affiliate-empty-state">Nenhum produto afiliado cadastrado ainda.</div>';
      return;
    }
    list.innerHTML = products.map(p => `<article class="product-item"><span class="badge">${p.status}</span><strong>${p.name}</strong><div class="product-meta"><span>${p.category}</span><span>${money(p.price)}</span></div></article>`).join('');
  }

  function clearMetrics(message) {
    ['metricRevenue','liquidRevenue','totalCommission','availableBalance'].forEach(id => { if ($(id)) $(id).textContent = money(0); });
    ['metricProducts','activeOrders'].forEach(id => { if ($(id)) $(id).textContent = '0'; });
    ['metricConversion','retentionRate'].forEach(id => { if ($(id)) $(id).textContent = '0.0%'; });
    renderOrders([]);
    renderProducts([]);
    const status = $('affiliateLiveStatus');
    if (status) status.textContent = message;
  }

  async function refreshDashboard(showStatus = true) {
    if (!getToken()) return;
    const button = document.querySelector('.affiliate-live-refresh');
    if (button) button.classList.add('loading');
    try {
      const range = $('rangeFilter')?.value || '30';
      const data = await api(`/affiliate/dashboard?days=${encodeURIComponent(range)}`);
      const m = data.metrics || {};
      if ($('metricRevenue')) $('metricRevenue').textContent = money(m.revenue);
      if ($('metricProducts')) $('metricProducts').textContent = String(m.activeProducts || 0);
      if ($('metricConversion')) $('metricConversion').textContent = `${Number(m.conversion || 0).toFixed(1)}%`;
      if ($('liquidRevenue')) $('liquidRevenue').textContent = money(m.liquidRevenue);
      if ($('totalCommission')) $('totalCommission').textContent = money(m.totalCommission);
      if ($('activeOrders')) $('activeOrders').textContent = String(m.activeOrders || 0);
      if ($('retentionRate')) $('retentionRate').textContent = `${Number(m.retention || 0).toFixed(1)}%`;
      if ($('availableBalance')) $('availableBalance').textContent = money(m.liquidRevenue);
      updateLink(data.profile?.code);
      renderOrders(data.orders || []);
      renderProducts(data.products || []);
      const saved = JSON.parse(localStorage.getItem('flashmarket_affiliate_user_data') || 'null');
      showDashboardUser(saved);
      setScreen(true);
      if (showStatus && $('affiliateLiveStatus')) $('affiliateLiveStatus').textContent = `Atualizado às ${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`;
    } catch (error) {
      clearMetrics(error.message);
      // Se o afiliado já está autenticado, mantém o painel aberto mesmo quando a API de dados estiver temporariamente indisponível.
      setScreen(true);
    } finally {
      if (button) button.classList.remove('loading');
    }
  }

  function isRegisterMode() {
    const fields = $('registerFields');
    return !!fields && fields.style.display !== 'none';
  }

  function setAuthMode(mode) {
    const register = mode === 'register';
    const fields = $('registerFields');
    if (fields) fields.style.display = register ? '' : 'none';

    document.querySelectorAll('[data-auth-tab]').forEach(button => {
      button.classList.toggle('active', button.dataset.authTab === mode);
    });

    const submit = $('authSubmit');
    if (submit) submit.textContent = register ? 'Criar conta e entrar' : 'Entrar no painel';
    setMessage('');
  }

  async function handleAuth(event) {
    const form = event.target;
    if (!form || form.id !== 'authForm') return;
    event.preventDefault();
    event.stopImmediatePropagation();

    const register = isRegisterMode();
    const email = $('authEmail')?.value.trim().toLowerCase();
    const password = $('authPassword')?.value || '';
    const name = $('authName')?.value.trim();
    const phone = $('authPhone')?.value.trim();

    if (!email || !password || (register && !name)) {
      setMessage(register ? 'Preencha nome, e-mail e senha.' : 'Preencha e-mail e senha.');
      return;
    }
    if (password.length < 6) {
      setMessage('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    const submit = $('authSubmit');
    if (submit) {
      submit.disabled = true;
      submit.textContent = register ? 'Criando conta...' : 'Entrando...';
    }

    try {
      const data = await api(register ? '/auth/register' : '/auth/login', {
        method:'POST',
        body:JSON.stringify(register ? {name,email,password,phone} : {email,password})
      });

      if (!data.token || !data.user) throw new Error('A API não retornou uma sessão válida.');

      localStorage.setItem('flashmarket_access_token', data.token);
      localStorage.setItem('flashmarket_affiliate_session', 'true');
      localStorage.setItem('flashmarket_affiliate_user', data.user.name || name || email.split('@')[0]);
      localStorage.setItem('flashmarket_affiliate_email', data.user.email || email);
      localStorage.setItem('flashmarket_affiliate_user_data', JSON.stringify(data.user));

      // Troca imediata: remove a área de login e deixa somente o painel nesta página.
      setScreen(true);
      showDashboardUser(data.user);
      const auth = $('authArea') || document.querySelector('.auth-box');
      if (auth) auth.remove();
      setMessage('', true);
      await refreshDashboard(false);
    } catch (error) {
      localStorage.removeItem('flashmarket_affiliate_session');
      localStorage.removeItem('flashmarket_access_token');
      setScreen(false);
      setMessage(error.message);
    } finally {
      if (submit && document.body.contains(submit)) {
        submit.disabled = false;
        submit.textContent = register ? 'Criar conta e entrar' : 'Entrar no painel';
      }
    }
  }

  function addRefreshControl() {
    const actions = document.querySelector('.dashboard-actions');
    if (!actions || document.querySelector('.affiliate-live-refresh')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'affiliate-live-refresh secondary-btn';
    button.textContent = '↻ Atualizar';
    const status = document.createElement('span');
    status.id = 'affiliateLiveStatus';
    status.className = 'affiliate-live-status';
    actions.insertBefore(button, actions.firstChild);
    actions.appendChild(status);
    button.addEventListener('click', () => refreshDashboard());
  }

  function init() {
    document.body.classList.add('affiliate-live-page');
    document.querySelectorAll('.auth-benefits').forEach(el => { el.hidden = true; el.style.display = 'none'; });

    const form = $('authForm');
    if (form) form.addEventListener('submit', handleAuth, true);

    document.querySelectorAll('[data-auth-tab]').forEach(button => {
      button.addEventListener('click', () => setAuthMode(button.dataset.authTab || 'login'));
    });
    setAuthMode('login');

    const hasAuth = !!getToken() && localStorage.getItem('flashmarket_affiliate_session') === 'true';
    setScreen(hasAuth);
    addRefreshControl();
    $('rangeFilter')?.addEventListener('change', () => refreshDashboard());

    $('logoutBtn')?.addEventListener('click', () => {
      localStorage.removeItem('flashmarket_affiliate_session');
      localStorage.removeItem('flashmarket_affiliate_user');
      localStorage.removeItem('flashmarket_affiliate_email');
      localStorage.removeItem('flashmarket_affiliate_user_data');
      localStorage.removeItem('flashmarket_access_token');
      setScreen(false);
      setAuthMode('login');
      setMessage('Sessão encerrada.');
    }, true);

    if (hasAuth) refreshDashboard(false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
