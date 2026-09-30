(function(){
  'use strict';
  const el=id=>document.getElementById(id);
  const money=window.fmMoney||((v)=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}));
  const DEMO_PAYMENT=true;

  function parse(raw){if(!raw)return null;try{return typeof raw==='string'?JSON.parse(raw):raw}catch{return null}}
  function normalize(raw){
    const value=parse(raw);if(!value)return [];
    const list=Array.isArray(value)?value:Object.entries(value).map(([id,qty])=>({id,qty}));
    return list.map(x=>({id:Number(x.id),qty:Math.max(1,Number(x.qty)||1),product:x.product||x.p||null})).filter(x=>Number.isFinite(x.id)&&x.id>0);
  }
  function readCart(){
    const keys=['flashmarket_checkout_cart','flashmarket_cart','FM_CART','cartItems','cart'];
    const storages=[sessionStorage,localStorage];
    for(const storage of storages){
      for(const key of keys){const items=normalize(storage.getItem(key));if(items.length)return items;}
    }
    return [];
  }

  const cart=readCart();
  // interno.js declares FM_PRODUCTS with `const`, so it is available in the
  // global lexical scope but is NOT exposed as window.FM_PRODUCTS.
  const catalog=(typeof FM_PRODUCTS!=='undefined'&&Array.isArray(FM_PRODUCTS))?FM_PRODUCTS:[];
  const products=cart.map(x=>{
    const raw=x.product||x.p||{};
    const p=Object.keys(raw).length?raw:catalog.find(item=>Number(item.id)===Number(x.id));
    if(!p)return null;
    const price=Number(p.p??p.price??0);
    const name=p.n||p.name||'Produto';
    const image=p.i||p.image||'assets/logo-flashmarket.png';
    const category=p.c||p.category||'Produto';
    if(!price)return null;
    return {id:Number(x.id),qty:x.qty,p:{id:Number(x.id),n:name,p:price,i:image,c:category}};
  }).filter(Boolean);

  let subtotal=products.reduce((s,x)=>s+x.p.p*x.qty,0),currentStep=1;

  function injectHeaderFallback(){
    const host=document.querySelector('[data-fm-header]');
    if(host&&!host.innerHTML.trim())host.innerHTML='<div class="fm-top"><div class="fm-container"><strong>⚡ FlashMarket</strong><span>Compra rápida, segura e prática</span></div></div><header class="fm-header"><div class="fm-container fm-header-main"><a class="fm-logo" href="index.html">Flash<span>Market</span></a><a class="fm-icon-btn" href="carrinho.html">🛒 Carrinho</a></div></header>';
  }
  setTimeout(injectHeaderFallback,300);

  if(!products.length){
    el('checkoutApp').innerHTML='<section class="flow-card order-success-card"><div class="order-success-icon">🛍️</div><h2>Seu carrinho está vazio</h2><p class="flow-muted">Não encontramos produtos disponíveis para finalizar. Volte ao carrinho, adicione um produto e clique novamente em <b>IR PARA CHECKOUT</b>.</p><br><a class="fm-btn orange" href="carrinho.html">VOLTAR AO CARRINHO</a></section>';
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
  function shipping(){const input=document.querySelector('input[name=shipping]:checked');const v=input?Number(input.value):0;el('shipping').textContent=v?'R$ 19,90':'Grátis';el('total').textContent=money(subtotal+v);document.querySelectorAll('input[name=shipping]').forEach(r=>r.closest('.checkout-option').classList.toggle('selected',r.checked));if(el('confirmShipping'))el('confirmShipping').textContent=v?'Entrega expressa · 2 a 5 dias úteis · R$ 19,90':'Frete grátis · 5 a 10 dias úteis';return v}
  function payment(){const r=document.querySelector('input[name=payment]:checked');if(!r)return;const names={pix:'PIX',card:'Cartão de crédito',boleto:'Boleto bancário'},desc={pix:'Pagamento simulado instantâneo.',card:'Pagamento simulado com cartão.',boleto:'Boleto simulado para demonstração.'};document.querySelectorAll('.payment-option').forEach(x=>x.classList.toggle('selected',x.querySelector('input').checked));if(el('confirmPayment'))el('confirmPayment').textContent=names[r.value];if(el('paymentInfo'))el('paymentInfo').innerHTML='<strong>'+names[r.value]+' selecionado</strong><span>'+desc[r.value]+'</span>'}
  function deliveryOK(){let ok=true;fieldIds.forEach(id=>{if(!validateField(id,true))ok=false});if(!ok){const first=document.querySelector('.field.is-invalid input,.field.is-invalid select');if(first)first.focus();if(window.fmToast)fmToast('Revise os campos destacados antes de continuar.')}return ok}
  function go(step){if(step===2&&!deliveryOK())return;if(step===3){payment();shipping();el('confirmCustomer').textContent=el('customerName').value+' · '+el('customerEmail').value;el('confirmAddress').textContent=[el('address').value,el('complement').value,el('city').value,el('uf').value,el('cep').value].filter(Boolean).join(', ')}currentStep=step;document.querySelectorAll('.checkout-section').forEach(p=>{const active=Number(p.dataset.panel)===step;p.hidden=!active;p.classList.toggle('active',active)});document.querySelectorAll('.checkout-step').forEach(s=>{const n=Number(s.dataset.step);s.classList.toggle('active',n===step);s.classList.toggle('done',n<step)});window.scrollTo({top:0,behavior:'smooth'})}
  document.querySelectorAll('[data-next]').forEach(b=>b.addEventListener('click',()=>go(Number(b.dataset.next))));document.querySelectorAll('[data-back]').forEach(b=>b.addEventListener('click',()=>go(Number(b.dataset.back))));document.querySelectorAll('.checkout-step').forEach(b=>b.addEventListener('click',()=>{const n=Number(b.dataset.step);if(n<=currentStep)go(n)}));document.querySelectorAll('input[name=shipping]').forEach(x=>x.addEventListener('change',shipping));document.querySelectorAll('input[name=payment]').forEach(x=>x.addEventListener('change',payment));

  function saveDemoOrder(){
    const shippingAmount=shipping();
    const paymentMethod=document.querySelector('input[name=payment]:checked')?.value||'pix';
    const now=new Date();
    const stamp=now.getFullYear().toString()+String(now.getMonth()+1).padStart(2,'0')+String(now.getDate()).padStart(2,'0');
    const seq=String(Date.now()).slice(-6);
    const orderId='FM-'+stamp+'-'+seq;
    const payload={customer:{name:el('customerName').value.trim(),email:el('customerEmail').value.trim(),phone:el('customerPhone').value.trim()},address:{cep:el('cep').value.trim(),state:el('uf').value.trim(),city:el('city').value.trim(),address:el('address').value.trim(),complement:el('complement').value.trim()},shipping:shippingAmount,payment:paymentMethod};
    const order={id:orderId,total:Number((subtotal+shippingAmount).toFixed(2)),status:'approved_demo',statusLabel:'Pagamento aprovado (simulação)',date:now.toISOString(),items:products.map(x=>({id:x.id,n:x.p.n,qty:x.qty,p:x.p.p,i:x.p.i,c:x.p.c})),shipping:shippingAmount,payment:paymentMethod,address:payload.address,customer:payload.customer,demo:true};
    const orders=parse(localStorage.getItem('flashmarket_orders'))||[];orders.unshift(order);localStorage.setItem('flashmarket_orders',JSON.stringify(orders));localStorage.setItem('flashmarket_last_order',JSON.stringify(order));
    localStorage.removeItem('flashmarket_cart');localStorage.removeItem('flashmarket_checkout_cart');sessionStorage.removeItem('flashmarket_checkout_cart');
    return order;
  }

  function createPayment(){
    if(!deliveryOK())return;
    if(!DEMO_PAYMENT)return;
    const button=el('confirm');button.disabled=true;button.innerHTML='PROCESSANDO PAGAMENTO <span class="loading-dot"></span><span class="loading-dot"></span><span class="loading-dot"></span>';
    setTimeout(()=>{
      const order=saveDemoOrder();
      el('checkoutApp').classList.add('hidden');el('success').classList.remove('hidden');
      el('successText').textContent='Seu pedido foi registrado com sucesso em modo demonstração. Nenhuma cobrança real foi realizada.';
      el('orderNumber').textContent='Pedido '+order.id;
      el('payAgain').textContent='VER PEDIDO';el('payAgain').href='minha-conta.html';
      window.scrollTo({top:0,behavior:'smooth'});
      if(window.fmToast)fmToast('Pagamento simulado aprovado!');
    },1100);
  }

  const demo=document.createElement('div');demo.className='secure large';demo.style.marginBottom='16px';demo.innerHTML='🧪 <b>Modo demonstração</b> · pagamento simulado, sem cobrança real.';const panel=document.querySelector('.checkout-panel[data-panel="2"]');if(panel)panel.insertBefore(demo,panel.querySelector('.payment-methods'));
  el('confirm').textContent='CRIAR PEDIDO E SIMULAR PAGAMENTO →';
  shipping();payment();
  el('confirm').addEventListener('click',createPayment);
})();