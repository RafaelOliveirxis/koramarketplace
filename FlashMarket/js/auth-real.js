/* Autenticação do KoraMarketplace: API real + fallback local para o GitHub Pages. */
(() => {
  const TOKEN_KEY = 'flashmarket_access_token';
  const PROFILE_KEY = 'flashmarket_user_profile';
  const SESSION_KEY = 'flashmarket_user_session';
  const USERS_KEY = 'flashmarket_local_users';
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
    if (response.status === 404 || response.status >= 500) {
      const unavailable = new Error(data.error || 'A API de autenticação está indisponível no momento.');
      unavailable.code = API_UNAVAILABLE;
      throw unavailable;
    }
    if (!response.ok) throw new Error(data.error || 'Não foi possível concluir a operação.');
    return data;
  };

  const readLocalUsers = () => {
    try {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      return Array.isArray(users) ? users : [];
    } catch (_) {
      return [];
    }
  };

  const writeLocalUsers = (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const hashPassword = async (password) => {
    if (window.crypto?.subtle) {
      const bytes = new TextEncoder().encode(password);
      const digest = await crypto.subtle.digest('SHA-256', bytes);
      return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
    }
    return btoa(unescape(encodeURIComponent(password)));
  };

  const localRegister = async ({ name, email, password, phone = null }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const users = readLocalUsers();
    if (users.some(user => user.email === normalizedEmail)) {
      throw new Error('Este e-mail já está cadastrado neste navegador.');
    }
    const user = {
      id: `local-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone || null,
      email_verified: false,
      passwordHash: await hashPassword(password)
    };
    users.push(user);
    writeLocalUsers(users);
    const publicUser = { id: user.id, name: user.name, email: user.email, phone: user.phone, email_verified: false };
    saveAuth({ token: null, user: publicUser });
    return publicUser;
  };

  const localLogin = async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const users = readLocalUsers();
    const user = users.find(item => item.email === normalizedEmail);
    if (!user) throw new Error('Conta não encontrada neste navegador. Clique em CRIAR CONTA para cadastrar-se.');
    if (user.passwordHash !== await hashPassword(password)) throw new Error('E-mail ou senha inválidos.');
    const publicUser = { id: user.id, name: user.name, email: user.email, phone: user.phone || null, email_verified: false };
    saveAuth({ token: null, user: publicUser });
    return publicUser;
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
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
        if (session?.email) return session;
        throw new Error('Usuário não autenticado.');
      }
      const data = await request('/api/auth/me');
      saveAuth({ token, user: data.user });
      return data.user;
    },
    saveLocalSession,
    localRegister,
    localLogin
  };

  document.addEventListener('submit', async (event) => {
    const form = event.target;
    if (form.id !== 'loginForm' && form.id !== 'registerForm') return;
    event.preventDefault();
    event.stopImmediatePropagation();

    const note = document.querySelector('#authNote');
    const button = form.querySelector('button[type="submit"], button:not(.text-btn)');
    if (button) { button.disabled = true; button.textContent = 'AGUARDE...'; }
    if (note) note.textContent = 'Conectando ao servidor...';

    try {
      const inputs = form.querySelectorAll('input');
      const isLogin = form.id === 'loginForm';
      const payload = isLogin
        ? { email: inputs[0].value.trim(), password: inputs[1].value }
        : { name: inputs[0].value.trim(), email: inputs[1].value.trim(), password: inputs[2].value };
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

      let data;
      try {
        data = await request(endpoint, { method: 'POST', body: JSON.stringify(payload) });
      } catch (error) {
        if (error.code !== API_UNAVAILABLE) throw error;
        if (note) note.textContent = 'Servidor indisponível. Usando cadastro seguro neste navegador...';
        data = { user: isLogin ? await localLogin(payload) : await localRegister(payload), token: null };
      }

      saveAuth(data);
      window.location.href = 'minha-conta.html';
    } catch (error) {
      if (note) note.textContent = error.message;
      if (button) { button.disabled = false; button.textContent = form.id === 'loginForm' ? 'ENTRAR' : 'CRIAR CONTA'; }
    }
  }, true);
})();
