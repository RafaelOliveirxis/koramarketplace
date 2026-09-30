(function(){
  'use strict';
  const el=id=>document.getElementById(id);
  const money=window.fmMoney||((v)=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}));

  // O checkout aceita o carrinho normal e o pacote enriquecido enviado pelo carrinho.
  function parse(raw){if(!raw)return null;try{return typeof raw==='string'?JSON.parse(raw):raw}catch{return null}}
  function normalize(raw){
    const value=parse(raw);if(!value)return [];
    const list=Array.isArray(value)?value:Object.entries(value).map(([id,qty])=>({id,qty}));
    return list.map(x=>({id:Number(x.id),qty:Math.max(1,Number(x.qty)||1),product:x.product||x.p||null})).filter(x=>Number.isFinite(x.id));
  }
  function readCart(){
    const keys=['flashmarket_checkout_cart','flashmarket_cart','FM_CART','cartItems','cart'];
    for(const storage of [sessionStorage,localStorage]){
      for(const key of keys){const items=normalize(storage.getItem(key));if(items.length)return items;}
    }
    return [];
  }

  const cart=readCart();
  const catalog=Array.isArray(window.FM_PRODUCTS)?window.FM_PRODUCTS:[];
  const products=cart.map(x=>{
    const p=x.product||catalog.find(item=>Number(item.id)===Number(x.id));
    if(!p)return null;
    return {id:Number(x.id),qty:x.qty,p:{id:Number(p.id),n:p.n||p.name,p:Number(p.p??p.price),i:p.i||p.image,c:p.c||p.category}};
  }).filter(Boolean);
  let subtotal=products.reduce((s,x)=>s+x.p.p*x.qty,0),currentStep=1;

  // O GitHub Pages publica apenas o frontend. O pagamento real precisa de uma URL de API.
  const configuredApi=(localStorage.getItem('flashmarket_api_url')||'').replace(/\/$/,'');
  const isGithubPages=location.hostname.endsWith('github.io');
  const API_BASE=configuredApi||((!isGithubPages&&location.origin)?location.origin:'');

  function injectHeaderFallback(){
    const host=document.querySelector('[data-fm-header]');
    if(host&&!host.innerHTML.trim())host.innerHTML='<div class="fm-top"><div class="fm-container"><strong>⚡ FlashMarket</strong><span>Compra rápida, segura e prática</span></div></div><header class="fm-header"><div class="fm-container fm-header-main"><a class="fm-logo" href="index.html">Flash<span>Market</span></a><a class="fm-icon-btn" href="carrinho.html">🛒 Carrinho</a></div></header>';
  }
  setTimeout(injectHeaderFallback,300);

  if(!products.length){
    const savedCount=cart.reduce((s,x)=>s+x.qty,0);
    el('checkoutApp').innerHTML='<section class="flow-card order-success-card"><div class="order-success-icon">🛍️</div><h2>Não conseguimos carregar os produtos</h2><p class="flow-muted">O navegador encontrou '+savedCount+' item(ns) no carrinho, mas os dados do produto não foram carregados. Volte ao carrinho e clique novamente em <b>IR PARA CHECKOUT</b>.</p><br><a class="fm-btn orange" href="carrinho.html">VOLTAR AO CARRINHO</a></section>';
    return;
  }

  el('items').innerHTML=products.map(x=>'<div class="summary-item"><img src="'+x.p.i+'" alt="'+x.p.n+'" loading="lazy"><div><strong>'+x.p.n+'</strong><small>Qtd. '+x.qty+'</small></div><b>'+money(x.p.p*x.qty)+'</b></div>').join('');
  const totalQty=products.reduce((s,x)=>s+x.qty,0);
  el('subtotal').textContent=money(subtotal);el('summaryCount').textContent=totalQty+' '+(totalQty===1?'item':'itens');

  const fieldIds=['customerName','customerEmail','customerCpf','customerPhone','cep','uf','address','city'];
  fieldIds.forEach(id=>{const input=el(id);if(!input)return;const field=input.closest('.field');if(!field)return;let error=field.querySelector('.field-error');if(!error){error=document.createElement('span');error.className='field-error';field.appendChild(error)}input.addEventListener('blur',()=>validateField(id,true));input.addEventListener('input',()=>{field.classList.remove('is-invalid');if(input.value.trim())field.classList.add('is-valid')})});
  function digits(v){return String(v||'').replace(/\D/g,'')}
  function cpf(v){let d=digits(v).slice(0,11);if(d.length>9)return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4');if(d.length>6)return d.replace(/(\d{3})(\d{3})(\d{1,3})/,'$1.$2.$3');if(d.length>3)return d.replace(/(\d{3})(\d{1,3})/,'$1.$2');return d}
  function cep(v){let d=digits(v).slice(0,8);return d.length>5?d.slice(0,5)+'-'+d.slice(5):d}
  function phone(v){let d=digits(v).slice(0,11);if(d.length>10)return '('+d.slice(0,2)+') '+d.slice(2,7)+'-'+d.slice(7);if(d.length>6)return '('+d.slice(0,2)+') '+d.slice(2,6)+'-'+d.slice(6);if(d.length>2)return '('+d.slice(0,2)+') '+d.slice(2);return d}
  function validCPF(v){const d=digits(v);if(d.length!==11||/^([0-9])\1+$/.test(d))return false;let s=0;for(let i=0;i<9;i++)s+=+d[i]*(10-i);let r=(s*10)%11;if(r===10)r=0;if(r!==+d[9])return false;s=0;for(let i=0;i<10;i++)s+=+d[i]*(11-i);r=(s*10)%11;if(r===10)r=0;return r===+d[10]}
  el('customerCpf').addEventListener('input',e=>e.target.value=cpf(e.target.value));
  el('cep').addEventListener('input',e=>{e.target.value=cep(e.target.value);if(digits(e.target.value).length===8)lookupCEP(e.target.value)});
  el('customerPhone').addEventListener('input',e=>e.target.value=phone(e.target.value));
  async function lookupCEP(v){try{const r=await fetch('https://viacep.com.br/ws/'+digits(v)+'/json/');const d=await r.json();if(d.erro){mark('cep',false,'CEP não encontrado.');return}if(d.logradouro&&!el('address').value)el('address').value=d.logradouro;if(d.localidade)el('city').value=d.localidade;if(d.uf)el('uf').value=d.uf;['cep','address','city','uf'].forEach(id=>{if(el(id).value.trim())mark(id,true)})}catch{mark('cep',false,'Não foi possível consultar o CEP agora.')}}
  function mark(id,ok,msg=''){const i=el(id);if(!i)return false;const f=i.closest('.field'),e=f&&f.querySelector('.field-error');f.classList.toggle('is-valid',ok);f.classList.toggle('is-invalid',!ok);if(e)e.textContent=msg;return ok}
  function validateField(id,show){const v=el(id).value.trim();let ok=true,msg='';if(!v){ok=false;msg='Campo obrigatório.'}if(id==='customerName'&&v&&v.split(/\s+/).length<2){ok=false;msg='Informe nome e sobrenome.'}if(id==='customerEmail'&&v&&!/^\S+@\S+\.\S+$/.test(v)){ok=false;msg='Informe um e-mail válido.'}if(id==='customerCpf'&&v&&!validCPF(v)){ok=false;msg='CPF inválido.'}if(id==='customerPhone'&&v&&digits(v).length<10){ok=false;msg='Celular inválido.'}if(id==='cep'&&v&&digits(v).length!==8){ok=false;msg='CEP inválido.'}if(show||v)mark(id,ok,msg);return ok}
  function shipping(){const v=Number(document.querySelector('input[name=shipping]:checked').value);el('shipping').textContent=v?'R$ 19,90':'Grátis';el('total').textContent=money(subtotal+v);document.querySelectorAll('input[name=shipping]').forEach(r=>r.closest('.checkout-option').classList.toggle('selected',r.checked));if(el('confirmShipping'))el('confirmShipping').textContent=v?'Entrega expressa · 2 a 5 dias úteis · R$ 19,90':'Frete grátis · 5 a 10 dias úteis';return v}
  function payment(){const r=document.querySelector('input[name=payment]:checked'),names={pix:'PIX',card:'Cartão de crédito',boleto:'Boleto bancário'},desc={pix:'Pagamento instantâneo pelo Mercado Pago.',card:'Pagamento seguro no ambiente do Mercado Pago.',boleto:'O vencimento será informado no Mercado Pago.'};document.querySelectorAll('.payment-option').forEach(x=>x.classList.toggle('selected',x.querySelector('input').checked));if(el('confirmPayment'))el('confirmPayment').textContent=names[r.value];if(el('paymentInfo'))el('paymentInfo').innerHTML='<strong>'+names[r.value]+' selecionado</strong><span>'+desc[r.value]+'</span>'}
  function deliveryOK(){let ok=true;fieldIds.forEach(id=>{if(!validateField(id,true))ok=false});if(!ok){const first=document.querySelector('.field.is-invalid input,.field.is-invalid select');if(first)first.focus();if(window.fmToast)fmToast('Revise os campos destacados antes de continuar.')}return ok}
  function go(step){if(step===2&&!deliveryOK())return;if(step===3){payment();shipping();el('confirmCustomer').textContent=el('customerName').value+' · '+el('customerEmail').value;el('confirmAddress').textContent=[el('address').value,el('complement').value,el('city').value,el('uf').value,el('cep').value].filter(Boolean).join(', ')}currentStep=step;document.querySelectorAll('.checkout-section').forEach(p=>{const active=Number(p.dataset.panel)===step;p.hidden=!active;p.classList.toggle('active',active)});document.querySelectorAll('.checkout-step').forEach(s=>{const n=Number(s.dataset.step);s.classList.toggle('active',n===step);s.classList.toggle('done',n<step)});window.scrollTo({top:0,behavior:'smooth'})}
  document.querySelectorAll('[data-next]').forEach(b=>b.addEventListener('click',()=>go(Number(b.dataset.next))));document.querySelectorAll('[data-back]').forEach(b=>b.addEventListener('click',()=>go(Number(b.dataset.back))));document.querySelectorAll('.checkout-step').forEach(b=>b.addEventListener('click',()=>{const n=Number(b.dataset.step);if(n<=currentStep)go(n)}));document.querySelectorAll('input[name=shipping]').forEach(x=>x.addEventListener('change',shipping));document.querySelectorAll('input[name=payment]').forEach(x=>x.addEventListener('change',payment));

  async function createPayment(){
    if(!deliveryOK())return;
    if(!API_BASE){
      const message=isGithubPages?'O site está aberto pelo GitHub Pages. Essa versão hospeda apenas o frontend; para criar pedidos e cobrar pelo Mercado Pago, configure a API em uma hospedagem com Node/Vercel e informe a URL em localStorage.flashmarket_api_url.':'A API de pagamentos ainda não está configurada.';
      if(window.fmToast)fmToast(message);else alert(message);return;
    }
    const button=el('confirm'),shippingAmount=shipping(),paymentMethod=document.querySelector('input[name=payment]:checked').value;button.disabled=true;button.innerHTML='CRIANDO PEDIDO <span class="loading-dot"></span><span class="loading-dot"></span><span class="loading-dot"></span>';
    const token=localStorage.getItem('flashmarket_token');
    const payload={customer:{name:el('customerName').value.trim(),email:el('customerEmail').value.trim(),phone:el('customerPhone').value.trim()},address:{cep:el('cep').value.trim(),state:el('uf').value.trim(),city:el('city').value.trim(),address:el('address').value.trim(),complement:el('complement').value.trim()},shippingAmount,paymentMethod,items:products.map(x=>({id:x.id,qty:x.qty}))};
    try{const response=await fetch(API_BASE+'/api/payments/create',{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(payload)});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||'Não foi possível criar o pedido.');const localOrder={id:data.order.id,total:data.order.total,status:data.order.status,date:new Date().toISOString(),items:products.map(x=>({id:x.id,n:x.p.n,qty:x.qty,p:x.p.p,i:x.p.i})),shipping:shippingAmount,payment:paymentMethod,address:payload.address,customer:payload.customer,mercadoPagoOrderId:data.order.mercadoPagoOrderId};const orders=JSON.parse(localStorage.getItem('flashmarket_orders')||'[]');orders.unshift(localOrder);localStorage.setItem('flashmarket_orders',JSON.stringify(orders));localStorage.setItem('flashmarket_last_order',JSON.stringify(localOrder));localStorage.removeItem('flashmarket_cart');localStorage.removeItem('flashmarket_checkout_cart');sessionStorage.removeItem('flashmarket_checkout_cart');el('checkoutApp').classList.add('hidden');el('success').classList.remove('hidden');el('successText').textContent='Pedido '+data.order.id+' criado. Você será direcionado ao ambiente seguro do Mercado Pago.';el('orderNumber').textContent='Pedido '+data.order.id;el('payAgain').href=data.order.checkoutUrl||'pagamento-retorno.html?order='+encodeURIComponent(data.order.id);if(data.order.checkoutUrl){window.location.href=data.order.checkoutUrl;return}window.scrollTo({top:0,behavior:'smooth'})}catch(error){if(window.fmToast)fmToast(error.message||'Não foi possível iniciar o pagamento.');else alert(error.message);button.disabled=false;button.innerHTML='CRIAR PEDIDO E PAGAR <b>→</b>')}
  }
  el('confirm').addEventListener('click',createPayment);shipping();payment();
})();