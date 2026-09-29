/* FlashMarket — autenticação real via API + MySQL + JWT. */
(() => {
  const TOKEN_KEY = 'flashmarket_access_token';
  const PROFILE_KEY = 'flashmarket_user_profile';
  const SESSION_KEY = 'flashmarket_user_session';
  const API_BASE = window.FLASHMARKET_API_BASE || (
    window.location.hostname.endsWith('github.io')
      ? 'https://koramarketplace.vercel.app'
      : ''
  );

  const apiUrl = (path) => `${API_BASE}${path}`;

  const saveAuth = (data) => {
    if (!data?.token || !data?.user) throw new Error('Resposta de autenticação inválida.');
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(data.user));
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      ...data.user,
      loggedInAt: new Date().toISOString()
    }));
    localStorage.setItem('flashmarket_user', data.user.name);
  };

  const clearAuth = () => {
    [TOKEN_KEY, PROFILE_KEY, SESSION_KEY, 'flashmarket_user'].forEach((key) => localStorage.removeItem(key));
  };

  const request = async (path, options = {}) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    let response;
    try {
      response = await fetch(apiUrl(path), {
        ...options,
        headers,
        credentials: 'omit'
      });
    } catch (error) {
      const unavailable = new Error('Não foi possível conectar ao servidor de autenticação.');
      unavailable.code = 'API_UNAVAILABLE';
      unavailable.cause = error;
      throw unavailable;
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || 'Não foi possível concluir a operação.');
      error.status = response.status;
      error.code = response.status >= 500 ? 'API_UNAVAILABLE' : 'API_ERROR';
      throw error;
    }
    return data;
  };

  window.KoraAuth = {
    request,
    apiUrl,
    logout: async () => {
      try {
        await request('/api/auth/logout', { method: 'POST' });
      } catch (_) {
        // O token local será removido mesmo se a API estiver indisponível.
      }
      clearAuth();
      window.location.href = 'index.html';
    },
    me: async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) throw new Error('Usuário não autenticado.');
      const data = await request('/api/auth/me');
      if (data.user) {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(data.user));
        localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
        localStorage.setItem('flashmarket_user', data.user.name);
      }
      return data.user;
    }
  };

  document.addEventListener('submit', async (event) => {
    const form = event.target;
    if (!form || (form.id !== 'loginForm' && form.id !== 'registerForm')) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const note = document.querySelector('#authNote');
    const button = form.querySelector('button[type="submit"]');
    const isLogin = form.id === 'loginForm';

    if (button) {
      button.disabled = true;
      button.textContent = isLogin ? 'ENTRANDO...' : 'CRIANDO CONTA...';
    }
    if (note) {
      note.className = 'auth-note';
      note.textContent = 'Conectando com o servidor seguro...';
    }

    try {
      const get = (selector) => form.querySelector(selector)?.value.trim() || '';
      const payload = isLogin
        ? { email: get('input[type="email"]'), password: form.querySelector('input[type="password"]')?.value || '' }
        : {
            name: get('input[name="name"]') || get('input[autocomplete="name"]') || get('input[type="text"]'),
            email: get('input[type="email"]'),
            password: form.querySelector('input[type="password"]')?.value || ''
          };

      if (!payload.email || !payload.password || (!isLogin && !payload.name)) {
        throw new Error('Preencha todos os campos obrigatórios.');
      }

      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const data = await request(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      saveAuth(data);
      window.location.href = 'minha-conta.html';
    } catch (error) {
      if (note) {
        note.className = 'auth-note error';
        note.textContent = error.message || 'Não foi possível concluir o acesso.';
      }
      if (button) {
        button.disabled = false;
        button.textContent = isLogin ? 'ENTRAR' : 'CRIAR CONTA';
      }
    }
  }, true);
})();
