(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const safeJSON = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } };
  const setJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const userKey = 'flashmarket_user';
  const profileKey = 'flashmarket_user_profile';
  const photoKey = 'flashmarket_profile_photo';
  const notifKey = 'flashmarket_notification_settings';
  const couponsKey = 'flashmarket_used_coupons';
  const raw = localStorage.getItem(userKey);
  const accessToken = localStorage.getItem('flashmarket_access_token');
  if (!raw || !accessToken) { location.href = 'login.html?return=minha-conta.html'; return; }

  let profile = safeJSON(profileKey, {});
  const fallbackName = typeof raw === 'string' ? raw : 'Cliente';
  let name = profile.name || fallbackName;

  const notificationDefaults = {
    order: true,
    shipping: true,
    promotions: true,
    coupons: true,
    wishlist: true,
    security: true,
    email: true,
    push: false
  };

  function toast(message) {
    let node = $('.toast-account');
    if (!node) {
      node = document.createElement('div');
      node.className = 'toast-account';
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.classList.add('show');
    clearTimeout(window.__accountToast);
    window.__accountToast = setTimeout(() => node.classList.remove('show'), 2300);
  }

  function getPhoto() { return localStorage.getItem(photoKey) || ''; }
  function initials(value) { return (value || 'C').trim().split(/\s+/).map(x => x[0]).slice(0, 2).join('').toUpperCase() || 'C'; }

  function renderAvatar() {
    const photo = getPhoto();
    const targets = ['#avatarMini', '#profilePhoto', '#heroAvatar'];
    targets.forEach(selector => {
      const el = $(selector);
      if (!el) return;
      if (photo) el.innerHTML = `<img src="${photo}" alt="Foto de perfil">`;
      else el.textContent = initials(name);
    });
  }

  function renderIdentity() {
    const first = name.split(' ')[0] || 'cliente';
    ['#nameSide', '#profileName', '#firstName'].forEach(id => { const e = $(id); if (e) e.textContent = name; });
    const firstEl = $('#first'); if (firstEl) firstEl.textContent = first;
    const pName = $('#pname'); if (pName) pName.value = name;
    const pEmail = $('#pemail'); if (pEmail) pEmail.value = profile.email || '';
    const phone = $('#phone'); if (phone) phone.value = profile.phone || '';
    renderAvatar();
  }

  let realOrders = [];
  function getOrders() { return realOrders; }

  async function loadRealOrders() {
    try {
      if (!window.KoraAuth?.request) return;
      const data = await window.KoraAuth.request('/api/auth/me?include=orders');
      realOrders = Array.isArray(data.orders) ? data.orders : [];
      renderOrders();
      updateStats();
    } catch (error) {
      if (error.status === 401) {
        localStorage.removeItem('flashmarket_access_token');
        location.href = 'login.html?return=minha-conta.html';
        return;
      }
      toast(error.message || 'Não foi possível carregar seus pedidos.');
    }
  }
  function getCartCount() { try { return typeof fmGetCart === 'function' ? fmGetCart().reduce((s, x) => s + Number(x.qty || 0), 0) : safeJSON('flashmarket_cart', []).reduce((s, x) => s + Number(x.qty || 0), 0); } catch { return 0; } }
  let accountFavorites = safeJSON('flashmarket_favorites', []);
  function getFavs() { return accountFavorites; }
  async function loadRealFavorites() {
    try {
      const data = await window.KoraAuth.request('/api/auth/me?include=favorites');
      accountFavorites = Array.isArray(data.favorites) ? data.favorites.map(Number).filter(Number.isInteger) : [];
      setJSON('flashmarket_favorites', accountFavorites);
      renderFavs(); updateStats();
    } catch (error) {
      if (error.status === 401) { localStorage.removeItem('flashmarket_access_token'); location.href='login.html?return=minha-conta.html'; return; }
      toast(error.message || 'Não foi possível sincronizar favoritos.');
    }
  }

  function updateStats() {
    const orders = getOrders();
    const set = (id, value) => { const e = $(id); if (e) e.textContent = value; };
    set('#ordersN', orders.length);
    set('#progressN', orders.filter(o => !['finalizado', 'cancelado', 'reembolso'].includes(o.status)).length);
    set('#favN', getFavs().length);
    set('#cartN', getCartCount());
  }

  const statusLabel = s => ({'a-pagar':'A pagar',preparando:'Preparando','a-caminho':'A caminho',finalizado:'Finalizado',cancelado:'Cancelado',reembolso:'Reembolso'})[s] || s || 'Pedido';
  const money = v => typeof fmMoney === 'function' ? fmMoney(Number(v) || 0) : Number(v || 0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

  function progress(status) {
    if (['cancelado','reembolso'].includes(status)) return '';
    const index = {'a-pagar':1,preparando:2,'a-caminho':3,finalizado:4}[status] || 1;
    return `<div class="account-progress">${['Pedido','Preparação','Transporte','Entrega'].map((label,i) => `<div class="${i < index ? 'done' : ''}"><i></i>${label}</div>`).join('')}</div>`;
  }

  let currentStatus = 'all';
  function renderOrders() {
    const q = ($('#orderSearch')?.value || '').toLowerCase().trim();
    const orders = getOrders().filter(o => {
      const matchStatus = currentStatus === 'all' || o.status === currentStatus;
      const matchSearch = !q || String(o.id || '').toLowerCase().includes(q) || (o.items || []).some(i => String(i.n || '').toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
    const list = $('#orderList'); if (!list) return;
    if (!orders.length) {
      list.innerHTML = `<div class="account-empty"><div class="empty-icon">📦</div><b>${q || currentStatus !== 'all' ? 'Nenhum pedido encontrado' : 'Você ainda não tem pedidos'}</b><p>Quando finalizar uma compra, ela aparecerá automaticamente aqui.</p><a class="account-btn primary" href="produtos.html">COMEÇAR A COMPRAR</a></div>`;
      return;
    }
    list.innerHTML = orders.map(o => {
      const items = (o.items || []).map(i => `<div class="order-item"><img src="${i.i || 'assets/favicon.png'}" alt="${i.n || 'Produto'}"><div><b>${i.n || 'Produto'}</b><small>Quantidade: ${i.qty || 1} · ${money((Number(i.p)||0) * (Number(i.qty)||1))}</small></div></div>`).join('');
      return `<article class="order-card"><div class="order-card-head"><div><b>Pedido #${o.id || '---'}</b><br><span>${o.date ? new Date(o.date).toLocaleDateString('pt-BR') : ''}</span></div><span class="order-status ${o.status || ''}">${statusLabel(o.status)}</span></div><div class="order-card-body">${progress(o.status)}${items}<div class="order-total-row"><span>Total:</span><b>${money(o.total)}</b></div><div class="order-actions"><a class="order-actions-link" href="pedido.html?pedido=${encodeURIComponent(o.id)}">Ver detalhes</a>${o.status === 'a-pagar' ? `<button class="orange" data-advance="${o.id}">Pagar pedido</button>` : ''}</div><div class="order-detail" id="detail-${o.id}" hidden><div style="margin-top:12px;padding:12px;background:#f7f8f9;border-radius:10px;font-size:10px;line-height:1.8"><b>Pagamento:</b> ${(o.payment || 'não informado').toUpperCase()}<br><b>Frete:</b> ${o.shipping ? 'R$ 19,90' : 'Grátis'}<br><b>Status:</b> ${statusLabel(o.status)}<br><b>Criado em:</b> ${o.date ? new Date(o.date).toLocaleString('pt-BR') : '-'}</div></div></div></article>`;
    }).join('');
    updateStats();
    $$('[data-detail]').forEach(btn => btn.onclick = () => { const box = $(`#detail-${btn.dataset.detail}`); if (box) box.hidden = !box.hidden; });
    $$('[data-advance]').forEach(btn => btn.onclick = () => advanceOrder(btn.dataset.advance));
  }

  function advanceOrder() {
    toast('O status do pedido é atualizado automaticamente pelo pagamento e pelo processamento da loja.');
  }

  function tab(id) {
    $$('.account-tab').forEach(x => x.classList.toggle('active', x.id === id));
    $$('.account-nav button[data-tab]').forEach(x => x.classList.toggle('active', x.dataset.tab === id));
    if (id === 'favoritos') renderFavs();
    if (id === 'notificacoes') renderNotifications();
    if (id === 'cupons') renderCoupons();
    if (id === 'dados') renderIdentity();
    window.scrollTo({top:0, behavior:'smooth'});
  }
  window.accountTab = tab;

  function renderFavs() {
    const box = $('#favs'); if (!box) return;
    const ids = getFavs(); const products = Array.isArray(window.FM_PRODUCTS) ? FM_PRODUCTS.filter(x => ids.includes(x.id) || ids.includes(String(x.id))) : [];
    box.innerHTML = products.length ? `<div class="account-quick-products">${products.map(x => `<div style="display:flex;align-items:center;gap:10px;padding:10px;border:1px solid #eee;border-radius:11px;margin-bottom:8px"><img src="${x.i}" style="width:52px;height:52px;border-radius:9px;object-fit:cover"><div style="flex:1"><b style="font-size:11px">${x.n}</b><small style="display:block;color:#777;margin-top:3px">${money(x.p)}</small></div><button class="account-btn primary" style="padding:8px 10px" data-fav-add="${x.id}">Adicionar</button></div>`).join('')}</div>` : `<div class="account-empty"><div class="empty-icon">♡</div><b>Nenhum favorito salvo</b><p>Explore o catálogo e salve produtos para encontrá-los aqui.</p><a class="account-btn primary" href="produtos.html">EXPLORAR PRODUTOS</a></div>`;
    $$('[data-fav-add]').forEach(btn => btn.onclick = () => { if (typeof fmAdd === 'function') fmAdd(Number(btn.dataset.favAdd)); toast('Produto adicionado ao carrinho.'); updateStats(); });
  }

  const coupons = [
    {code:'FLASH10',title:'10% OFF',desc:'10% de desconto em produtos selecionados.',min:'Compra mínima de R$ 99',valid:'Válido até 31/10/2026'},
    {code:'FRETEGRATIS',title:'FRETE GRÁTIS',desc:'Frete grátis em pedidos participantes.',min:'A partir de R$ 149',valid:'Válido até 15/10/2026'},
    {code:'BEMVINDO15',title:'15% OFF',desc:'Seu benefício especial para uma nova compra.',min:'Compra mínima de R$ 129',valid:'Válido até 20/10/2026'},
    {code:'FLASH20',title:'R$ 20 OFF',desc:'Economize R$ 20 em uma compra selecionada.',min:'Compra mínima de R$ 199',valid:'Válido até 05/11/2026'},
    {code:'TECNO10',title:'10% OFF',desc:'Oferta especial para eletrônicos participantes.',min:'Categoria Eletrônicos',valid:'Válido até 12/10/2026'},
    {code:'CASA15',title:'15% OFF',desc:'Desconto em itens de Casa & Decor.',min:'Categoria Casa & Decor',valid:'Válido até 18/10/2026'}
  ];
  function renderCoupons() {
    const box = $('#couponGrid'); if (!box) return;
    const used = safeJSON(couponsKey, []);
    box.innerHTML = coupons.map(c => `<article class="coupon-card"><span class="coupon-badge">OFERTA</span><h3>${c.title}</h3><p>${c.desc}</p><div class="coupon-code-row"><b>${c.code}</b><button class="coupon-copy" data-copy="${c.code}">${used.includes(c.code) ? 'COPIADO' : 'COPIAR'}</button></div><div class="coupon-expiry">${c.min} · ${c.valid}</div></article>`).join('');
    $$('[data-copy]').forEach(btn => btn.onclick = async () => { const code = btn.dataset.copy; try { await navigator.clipboard.writeText(code); } catch {} const next = [...new Set([...used, code])]; setJSON(couponsKey,next); btn.textContent='COPIADO'; toast(`Cupom ${code} copiado.`); });
  }

  let realNotifications = [];
  async function loadRealNotifications() {
    try { const data = await window.KoraAuth.request('/api/auth/me?include=notifications'); realNotifications = Array.isArray(data.notifications) ? data.notifications : []; renderNotifications(); }
    catch (error) { if (error.status === 401) { localStorage.removeItem('flashmarket_access_token'); location.href='login.html?return=minha-conta.html'; return; } toast(error.message || 'Não foi possível carregar as notificações.'); }
  }

  function renderNotifications() {
    const saved = {...notificationDefaults, ...safeJSON(notifKey, {})};
    $$('[data-notification]').forEach(input => { input.checked = Boolean(saved[input.dataset.notification]); });
    const enabled = Object.values(saved).filter(Boolean).length;
    const counter = $('#notificationCount'); if (counter) counter.textContent = `${enabled} ativadas`;
    const box = $('.notification-settings'); if (!box) return;
    const old = $('#realNotifications'); if (old) old.remove();
    const feed = document.createElement('div'); feed.id='realNotifications'; feed.style='margin-top:16px;padding-top:16px;border-top:1px solid #eee';
    feed.innerHTML = '<h3 style="font-size:14px;margin:0 0 10px">Atualizações reais</h3>' + (realNotifications.length ? realNotifications.map(n => `<article style="padding:11px;border:1px solid #eee;border-radius:10px;margin-bottom:8px"><b>${n.title}</b><div style="font-size:11px;color:#777;margin-top:4px">Pedido #${n.orderId} · ${new Date(n.date).toLocaleString('pt-BR')}</div>${n.description ? `<p style="font-size:11px;margin:6px 0 0;color:#555">${n.description}</p>` : ''}${n.trackingCode ? `<small style="display:block;margin-top:6px">${n.carrier || 'Rastreio'}: <b>${n.trackingCode}</b></small>` : ''}</article>`).join('') : '<p style="font-size:11px;color:#888">Nenhuma atualização de pedido disponível.</p>');
    box.appendChild(feed);
  }
  $$('.account-nav button[data-tab]').forEach(btn => btn.addEventListener('click', () => tab(btn.dataset.tab)));
  $$('.account-quick [data-tab]').forEach(btn => btn.addEventListener('click', () => tab(btn.dataset.tab)));
  $$('[data-notification]').forEach(input => input.addEventListener('change', () => { const current = {...notificationDefaults, ...safeJSON(notifKey,{})}; current[input.dataset.notification] = input.checked; setJSON(notifKey,current); renderNotifications(); toast(`${input.closest('.notification-row')?.querySelector('strong')?.textContent || 'Preferência'} ${input.checked ? 'ativada' : 'desativada'}.`); }));

  $('#orderSearch')?.addEventListener('input', renderOrders);
  $$('.orders-tabs button').forEach(btn => btn.addEventListener('click', () => { $$('.orders-tabs button').forEach(x=>x.classList.remove('active')); btn.classList.add('active'); currentStatus = btn.dataset.status; renderOrders(); }));

  $('#profilePhotoInput')?.addEventListener('change', event => {
    const file = event.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith('image/')) return toast('Selecione uma imagem válida.');
    if (file.size > 2 * 1024 * 1024) return toast('Use uma imagem de até 2 MB.');
    const reader = new FileReader(); reader.onload = () => { localStorage.setItem(photoKey, reader.result); renderAvatar(); toast('Foto de perfil atualizada.'); }; reader.readAsDataURL(file);
  });
  $('#removePhoto')?.addEventListener('click', () => { localStorage.removeItem(photoKey); renderAvatar(); toast('Foto de perfil removida.'); });
  $('#profileForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    const nextName = ($('#pname')?.value || '').trim() || name;
    const nextPhone = ($('#phone')?.value || '').trim();
    try {
      const data = await window.KoraAuth.request('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: nextName, email: profile.email || '', phone: nextPhone })
      });
      if (data.token && data.user) {
        localStorage.setItem('flashmarket_access_token', data.token);
        localStorage.setItem(profileKey, JSON.stringify(data.user));
        localStorage.setItem('flashmarket_user_session', JSON.stringify(data.user));
        localStorage.setItem(userKey, data.user.name);
        profile = data.user;
        name = data.user.name;
        renderIdentity();
        toast('Perfil atualizado com sucesso.');
      }
    } catch (error) {
      toast(error.message || 'Não foi possível atualizar o perfil.');
    }
  });
  $('#copyProfile')?.addEventListener('click', () => { const email = profile.email || ''; if (email) { navigator.clipboard?.writeText(email); toast('E-mail copiado.'); } });
  $('#logoutBtn')?.addEventListener('click', () => { if (window.KoraAuth?.logout) window.KoraAuth.logout(); else { localStorage.removeItem(userKey); localStorage.removeItem(profileKey); localStorage.removeItem('flashmarket_access_token'); location.href='index.html'; } });

  renderIdentity(); updateStats(); renderOrders(); renderNotifications(); renderCoupons(); renderFavs(); loadRealOrders(); loadRealFavorites(); loadRealNotifications();
})();