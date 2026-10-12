/* FlashMarket/KoraMarketplace — autenticação local, sem dependência da Vercel.
   Opcionalmente, defina window.FLASHMARKET_API_BASE antes deste arquivo para usar uma API própria. */
(() => {
  'use strict';
  const TOKEN_KEY='flashmarket_access_token';
  const PROFILE_KEY='flashmarket_user_profile';
  const SESSION_KEY='flashmarket_user_session';
  const USERS_KEY='flashmarket_local_users';
  const ORDERS_KEY='flashmarket_local_orders';

  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));}catch{return fallback;}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const configuredBase=String(window.FLASHMARKET_API_BASE||'').replace(/\/$/,'');
  const apiUrl=path=>configuredBase+path;
  const localUser=()=>read(PROFILE_KEY,null);
  const token=()=>localStorage.getItem(TOKEN_KEY)||'';
  const users=()=>read(USERS_KEY,[]);
  const makeToken=()=>crypto?.randomUUID?.()||('local-'+Date.now()+'-'+Math.random().toString(36).slice(2));
  const hash=async value=>{
    if(window.crypto?.subtle){
      const bytes=new TextEncoder().encode(value);
      const digest=await crypto.subtle.digest('SHA-256',bytes);
      return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
    }
    return btoa(unescape(encodeURIComponent(value)));
  };
  const saveAuth=(user,remember=true)=>{
    const data={...user,loggedInAt:new Date().toISOString()};
    localStorage.setItem(TOKEN_KEY,makeToken());
    write(PROFILE_KEY,data); write(SESSION_KEY,data);
    localStorage.setItem('flashmarket_user',data.name);
    if(!remember) sessionStorage.setItem('flashmarket_session_only','1');
  };
  const clearAuth=()=>[TOKEN_KEY,PROFILE_KEY,SESSION_KEY,'flashmarket_user'].forEach(k=>localStorage.removeItem(k));

  async function localRequest(path,options={}){
    const method=(options.method||'GET').toUpperCase();
    const body=options.body?JSON.parse(options.body):{};
    const current=localUser();
    if(path==='/api/auth/logout'){clearAuth();return{success:true};}
    if(path==='/api/auth/register'&&method==='POST'){
      const email=String(body.email||'').trim().toLowerCase(), name=String(body.name||'').trim(), password=String(body.password||'');
      if(!name||!email||password.length<8) throw Error('Informe nome, e-mail e uma senha com pelo menos 8 caracteres.');
      const list=users();
      if(list.some(u=>u.email===email)) throw Object.assign(new Error('Este e-mail já está cadastrado.'),{status:409});
      const user={id:'local-'+Date.now(),name,email,passwordHash:await hash(password),phone:'',createdAt:new Date().toISOString()};
      list.push(user);write(USERS_KEY,list);
      const safe={id:user.id,name,email,phone:user.phone};
      saveAuth(safe,true);
      return{token:token(),user:safe};
    }
    if(path==='/api/auth/login'&&method==='POST'){
      const email=String(body.email||'').trim().toLowerCase(),password=String(body.password||'');
      const found=users().find(u=>u.email===email);
      if(!found||found.passwordHash!==await hash(password)) throw Object.assign(new Error('E-mail ou senha incorretos.'),{status:401});
      const safe={id:found.id,name:found.name,email:found.email,phone:found.phone||''};
      saveAuth(safe,body.remember!==false);return{token:token(),user:safe};
    }
    if(path.startsWith('/api/auth/me')){
      if(!token()||!current) throw Object.assign(new Error('Usuário não autenticado.'),{status:401});
      const query=path.includes('?')?new URLSearchParams(path.split('?')[1]):new URLSearchParams();
      const result={user:current};
      if(query.get('include')?.includes('favorites')) result.favorites=read('flashmarket_favorites',[]);
      if(query.get('include')?.includes('orders')) result.orders=read(ORDERS_KEY,[]).filter(o=>o.userId===current.id||o.email===current.email);
      if(query.get('include')?.includes('notifications')) result.notifications=read('flashmarket_notifications',[]).filter(n=>!n.email||n.email===current.email);
      return result;
    }
    if(path==='/api/auth/profile'&&method==='PUT'){
      if(!current) throw Object.assign(new Error('Usuário não autenticado.'),{status:401});
      const list=users(),idx=list.findIndex(u=>u.id===current.id);
      const next={...current,name:String(body.name||current.name).trim(),email:String(body.email||current.email).trim().toLowerCase(),phone:String(body.phone||'').trim()};
      if(idx>=0){list[idx]={...list[idx],name:next.name,email:next.email,phone:next.phone};write(USERS_KEY,list);}
      saveAuth(next,true);return{token:token(),user:next};
    }
    if(path==='/api/auth/request-reset'&&method==='POST'){
      const email=String(body.email||'').trim().toLowerCase();
      const exists=users().some(u=>u.email===email);
      return{success:true,exists,message:exists?'Conta encontrada. Você poderá definir uma nova senha nesta página.':'Se o e-mail estiver cadastrado, a recuperação poderá continuar.'};
    }
    if(path==='/api/auth/reset-password'&&method==='POST'){
      const email=String(body.email||'').trim().toLowerCase(),password=String(body.password||'');
      if(!email||password.length<8) throw Error('Informe o e-mail e uma nova senha com pelo menos 8 caracteres.');
      const list=users(),idx=list.findIndex(u=>u.email===email);
      if(idx<0) throw Object.assign(new Error('Não encontramos uma conta com este e-mail.'),{status:404});
      list[idx].passwordHash=await hash(password);write(USERS_KEY,list);
      return{success:true};
    }
    if(path==='/api/auth/me'&&method==='POST') return{success:true};
    throw Object.assign(new Error('Recurso indisponível neste modo local.'),{status:404});
  }

  async function request(path,options={}){
    if(configuredBase){
      const headers={'Content-Type':'application/json',...(options.headers||{})};
      if(token())headers.Authorization='Bearer '+token();
      try{
        const r=await fetch(apiUrl(path),{...options,headers,credentials:'omit'});
        const data=await r.json().catch(()=>({}));
        if(!r.ok)throw Object.assign(new Error(data.error||data.message||'Falha na API.'),{status:r.status});
        return data;
      }catch(error){
        if(error?.status&&error.status<500)throw error;
      }
    }
    return localRequest(path,options);
  }

  window.KoraAuth={request,apiUrl,logout:async()=>{try{await request('/api/auth/logout',{method:'POST'});}catch{}clearAuth();location.href='index.html';},
    me:async()=>{const data=await request('/api/auth/me');if(data.user){write(PROFILE_KEY,data.user);localStorage.setItem('flashmarket_user',data.user.name);}return data.user;}};

  document.addEventListener('submit',async event=>{
    const form=event.target;if(!form||(form.id!=='loginForm'&&form.id!=='registerForm'))return;
    event.preventDefault();event.stopImmediatePropagation();
    const note=document.querySelector('#authNote'),button=form.querySelector('button[type="submit"]'),isLogin=form.id==='loginForm';
    if(button){button.disabled=true;button.textContent=isLogin?'ENTRANDO...':'CRIANDO CONTA...';}
    if(note){note.className='auth-note';note.textContent='Validando seus dados...';}
    try{
      const get=s=>form.querySelector(s)?.value.trim()||'';
      const payload=isLogin?{email:get('input[type="email"]'),password:form.querySelector('input[type="password"]')?.value||'',remember:!!form.querySelector('#remember')?.checked}:{name:get('input[name="name"]')||get('input[autocomplete="name"]'),email:get('input[type="email"]'),password:form.querySelector('input[type="password"]')?.value||''};
      if(!payload.email||!payload.password||(!isLogin&&!payload.name))throw Error('Preencha todos os campos obrigatórios.');
      const data=await request(isLogin?'/api/auth/login':'/api/auth/register',{method:'POST',body:JSON.stringify(payload)});
      if(!data?.token||!data?.user)throw Error('Não foi possível criar a sessão.');
      const params=new URLSearchParams(location.search),returnTo=params.get('return');
      const safe=returnTo&&/^[a-zA-Z0-9_./?=&%-]+$/.test(returnTo)&&!returnTo.startsWith('http')&&!returnTo.startsWith('//')?returnTo:'minha-conta.html';
      location.href=safe;
    }catch(error){
      if(note){note.className='auth-note error';note.textContent=error.message||'Não foi possível concluir o acesso.';}
      if(button){button.disabled=false;button.textContent=isLogin?'ENTRAR':'CRIAR CONTA';}
    }
  },true);
})();