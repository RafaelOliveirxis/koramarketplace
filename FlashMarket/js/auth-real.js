/* Autenticacao real do KoraMarketplace. */
(() => {
  const TOKEN_KEY = 'flashmarket_access_token';
  const PROFILE_KEY = 'flashmarket_user_profile';
  const SESSION_KEY = 'flashmarket_user_session';
  const API_UNAVAILABLE = 'API_UNAVAILABLE';
  const API_BASE = window.location.hostname.endsWith('github.io')
    ? 'https://koramarketplace.vercel.app'
    : '';
  const apiUrl = (url) => `${API_BASE}${url}`;

  const saveAuth = (data) => {
    if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
    else localStorage.removeItem(TOKEN_KEY);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(data.user));
    localStorage.setItem(SESSION_KEY, JSON.stringify({ ...data.user, loggedInAt: new Date().toISOString() }));
    localStorage.setItem('flashmarket_user', data.user.name);
  };

  const clearAuth = () => {
    [TOKEN_KEY, PROFILE_KEY, SESSION_KEY, 'flashmarket_user'].forEach(k => localStorage.removeItem(k));
  };

  const request = async (url, options = {}) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers.Authorization = 'Bearer ' + token;
    let response;
    try {
      response = await fetch(apiUrl(url), { ...options, headers });
    } catch (error) {
      const unavailable = new Error('A API de autenticação não está disponível.');
      unavailable.code = API_UNAVAILABLE;
      unavailable.cause = error;
      throw unavailable;
    }
    const data = await response.json().catch(() => ({}));
    if (response.status === 404) {
      const unavailable = new Error('A API de autenticação não está publicada neste endereço.');
      unavailable.code = API_UNAVAILABLE;
      throw unavailable;
    }
    if (!response.ok) throw new Error(data.error || 'Não foi possível concluir a operação.');
    return data;
  };

  const saveLocalSession = (payload) => {
    const email = payload.email.trim().toLowerCase();
    const name = payload.name?.trim() || email.split('@')[0];
    const user = { id: `local-${email}`, name, email, phone: payload.phone || null };
    saveAuth({ token: null, user });
    return user;
  };

  window.KoraAuth = {
    request,
    apiUrl,
    logout: async () => {
      try { await request('/api/auth/logout', { method: 'POST' }); } catch (_) {}
      clearAuth();
      window.location.href = 'index.html';
    },
    me: async () => {
      const data = await request('/api/auth/me');
      saveAuth({ token: localStorage.getItem(TOKEN_KEY), user: data.user });
      return data.user;
    },
    saveLocalSession
  };

  document.addEventListener('submit', async (event) => {
    const form = event.target;
    if (form.id !== 'loginForm' && form.id !== 'registerForm') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const note = document.querySelector('#authNote');
    const button = form.querySelector('button');
    if (button) { button.disabled = true; button.textContent = 'AGUARDE...'; }
    if (note) note.textContent = 'Conectando ao servidor...';
    try {
      const inputs = form.querySelectorAll('input');
      const isLogin = form.id === 'loginForm';
      const payload = isLogin
        ? { email: inputs[0].value.trim(), password: inputs[1].value }
        : { name: inputs[0].value.trim(), email: inputs[1].value.trim(), password: inputs[2].value };
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const data = await request(endpoint, { method: 'POST', body: JSON.stringify(payload) });
      saveAuth(data);
      window.location.href = 'minha-conta.html';
    } catch (error) {
      if (note) note.textContent = error.message;
      if (button) { button.disabled = false; button.textContent = form.id === 'loginForm' ? 'ENTRAR' : 'CRIAR CONTA'; }
    }
  }, true);
})();
