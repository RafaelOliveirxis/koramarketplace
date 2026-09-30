(function(){
  const el=id=>document.getElementById(id), money=window.fmMoney;

  // O carrinho precisa ser compartilhado entre carrinho.html e checkout.html.
  // Usamos o localStorage como fonte principal e o sessionStorage como fallback
  // para evitar que uma navegação para o checkout perca os itens.
  function normalizeCart(raw){
    if(!raw) return [];
    let value=raw;
    try{ if(typeof value==='string') value=JSON.parse(value); }catch{return []}
    if(Array.isArray(value)) return value.map(x=>({id:Number(x.id),qty:Math.max(1,Number(x.qty)||1)})).filter(x=>Number.isFinite(x.id));
    if(value && typeof value==='object') return Object.entries(value).map(([id,qty])=>({id:Number(id),qty:Math.max(1,Number(qty)||1)})).filter(x=>Number.isFinite(x.id));
    return [];
  }

  function readCheckoutCart(){
    const primary=normalizeCart(localStorage.getItem('flashmarket_cart'));
    if(primary.length) return primary;
    const handoff=normalizeCart(sessionStorage.getItem('flashmarket_checkout_cart'));
    if(handoff.length){
      localStorage.setItem('flashmarket_cart',JSON.stringify(handoff));
      return handoff;
    }
    // Compatibilidade com versões anteriores do projeto.
    for(const key of ['FM_CART','cartItems','cart']){
      const legacy=normalizeCart(localStorage.getItem(key));
      if(legacy.length){
        localStorage.setItem('flashmarket_cart',JSON.stringify(legacy));
        return legacy;
      }
    }
    return [];
  }

  const cart=readCheckoutCart();
  const products=cart.map(x=>({...x,p:window.FM_PRODUCTS.find(p=>Number(p.id)===Number(x.id))})).filter(x=>x.p);
  let subtotal=products.reduce((s,x)=>s+x.p.p*x.qty,0), currentStep=1;

  if(!products.length){
    el('checkoutApp').innerHTML='<section class="flow-card order-success-card"><div class="order-success-icon">🛍️</div><h2>Seu carrinho está vazio</h2><p class="flow-muted">Não encontramos os itens do carrinho nesta sessão. Volte ao carrinho e tente novamente.</p><br><a class="fm-btn orange" href="carrinho.html">VOLTAR AO CARRINHO</a> <a class="fm-btn light" href="produtos.html">VER PRODUTOS</a></section>';
    return;
  }

  el('items').innerHTML=products.map(x=>'<div class="summary-item"><img src="'+x.p.i+'" alt="'+x.p.n+'" loading="lazy"><div><strong>'+x.p.n+'</strong><small>Qtd. '+x.qty+'</small></div><b>'+money(x.p.p*x.qty)+'</b></div>').join('');
  const totalQty=products.reduce((s,x)=>s+x.qty,0);
  el('subtotal').textContent=money(subtotal);
  el('summaryCount').textContent=totalQty+' '+(totalQty===1?'item':'itens');

  const fieldIds=['customerName','customerEmail','customerCpf','customerPhone','cep','uf','address','city'];
  fieldIds.forEach(id=>{
    const input=el(id);if(!input)return;
    const field=input.closest('.field');const error=document.createElement('span');error.className='field-error';field.appendChild(error);
    input.addEventListener('blur',()=>validateField(id,true));
    input.addEventListener('input',()=>{field.classList.remove('is-invalid');if(input.value.trim())field.classList.add('is-valid');});
  });

  function onlyDigits(v){return String(v||'').replace(/\D/g,'');}
  function formatCPF(v){let d=onlyDigits(v).slice(0,11);if(d.length>9)return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4');if(d.length>6)return d.replace(/(\d{3})(\d{3})(\d{1,3})/,'$1.$2.$3');if(d.length>3)return d.replace(/(\d{3})(\d{1,3})/,'$1.$2');return d;}
  function formatCEP(v){let d=onlyDigits(v).slice(0,8);return d.length>5?d.slice(0,5)+'-'+d.slice(5):d;}
  function formatPhone(v){let d=onlyDigits(v).slice(0,11);if(d.length>10)return '('+d.slice(0,2)+') '+d.slice(2,7)+'-'+d.slice(7);if(d.length>6)return '('+d.slice(0,2)+') '+d.slice(2,6)+'-'+d.slice(6);if(d.length>2)return '('+d.slice(0,2)+') '+d.slice(2);return d;}
  function validCPF(v){const d=onlyDigits(v);if(d.length!==11||/^([0-9])\1+$/.test(d))return false;let sum=0;for(let i=0;i<9;i++)sum+=Number(d[i])*(10-i);let r=(sum*10)%11;if(r===10)r=0;if(r!==Number(d[9]))return false;sum=0;for(let i=0;i<10;i++)sum+=Number(d[i])*(11-i);r=(sum*10)%11;if(r===10)r=0;return r===Number(d[10]);}

  el('customerCpf').addEventListener('input',e=>e.target.value=formatCPF(e.target.value));
  el('cep').addEventListener('input',e=>{e.target.value=formatCEP(e.target.value);if(onlyDigits(e.target.value).length===8)lookupCEP(e.target.value);});
  el('customerPhone').addEventListener('input',e=>e.target.value=formatPhone(e.target.value));

  async function lookupCEP(value){try{const response=await fetch('https://viacep.com.br/ws/'+onlyDigits(value)+'/json/');const data=await response.json();if(data.erro){markField('cep',false,'CEP não encontrado.');return;}if(data.logradouro&&!el('address').value)el('address').value=data.logradouro;if(data.bairro&&!el('complement').value)el('complement').value='Bairro: '+data.bairro;if(data.localidade)el('city').value=data.localidade;if(data.uf)el('uf').value=data.uf;['cep','address','city','uf'].forEach(id=>{if(el(id).value.trim())markField(id,true);});}catch{markField('cep',false,'Não foi possível consultar o CEP agora.');}}
  function markField(id,valid,message=''){const input=el(id);if(!input)return true;const field=input.closest('.field');const error=field.querySelector('.field-error');field.classList.toggle('is-valid',valid);field.classList.toggle('is-invalid',!valid);if(error)error.textContent=message;return valid;}
  function validateField(id,show=true){const value=el(id).value.trim();let valid=true,message='';if(['customerName','customerEmail','customerCpf','customerPhone','cep','uf','address','city'].includes(id)&&!value){valid=false;message='Campo obrigatório.';}if(id==='customerName'&&value&&value.split(/\s+/).length<2){valid=false;message='Informe nome e sobrenome.';}if(id==='customerEmail'&&value&&!/^\S+@\S+\.\S+$/.test(value)){valid=false;message='Informe um e-mail válido.';}if(id==='customerCpf'&&value&&!validCPF(value)){valid=false;message='CPF inválido.';}if(id==='customerPhone'&&value&&onlyDigits(value).length<10){valid=false;message='Informe um celular válido.';}if(id==='cep'&&value&&onlyDigits(value).length!==8){valid=false;message='CEP inválido.';}if(show||value)markField(id,valid,message);return valid;}

  function updateShipping(){const ship=Number(document.querySelector('input[name=shipping]:checked').value);el('shipping').textContent=ship?'R$ 19,90':'Grátis';el('total').textContent=money(subtotal+ship);document.querySelectorAll('input[name=shipping]').forEach(r=>r.closest('.checkout-option').classList.toggle('selected',r.checked));if(el('confirmShipping'))el('confirmShipping').textContent=ship?'Entrega expressa · 2 a 5 dias úteis · R$ 19,90':'Frete grátis · 5 a 10 dias úteis';}
  function updatePayment(){const r=document.querySelector('input[name=payment]:checked');document.querySelectorAll('.payment-option').forEach(x=>x.classList.toggle('selected',x.querySelector('input').checked));const names={pix:'PIX',card:'Cartão de crédito',boleto:'Boleto bancário'};const desc={pix:'Pagamento instantâneo pelo Mercado Pago.',card:'Pagamento seguro no ambiente do Mercado Pago.',boleto:'O vencimento será informado no Mercado Pago.'};if(el('confirmPayment'))el('confirmPayment').textContent=names[r.value];if(el('paymentInfo'))el('paymentInfo').innerHTML='<strong>'+names[r.value]+' selecionado</strong><span>'+desc[r.value]+'</span>';}
  function validateDelivery(){const required=['customerName','customerEmail','customerCpf','customerPhone','cep','address','city','uf'];let valid=true;required.forEach(id=>{if(!validateField(id,true))valid=false;});if(!valid){const first=document.querySelector('.field.is-invalid input,.field.is-invalid select');if(first)first.focus();window.fmToast('Revise os campos destacados antes de continuar.');}return valid;}
  function go(step){if(step===2&&!validateDelivery())return;if(step===3){updatePayment();el('confirmCustomer').textContent=el('customerName').value+' · '+el('customerEmail').value;el('confirmAddress').textContent=[el('address').value,el('complement').value,el('city').value,el('uf').value,el('cep').value].filter(Boolean).join(', ');updateShipping();}currentStep=step;document.querySelectorAll('.checkout-section').forEach(p=>{const active=Number(p.dataset.panel)===step;p.hidden=!active;p.classList.toggle('active',active);});document.querySelectorAll('.checkout-step').forEach(s=>{const n=Number(s.dataset.step);s.classList.toggle('active',n===step);s.classList.toggle('done',n<step);s.setAttribute('aria-current',n===step?'step':'false');});window.scrollTo({top:0,behavior:'smooth'});}

  document.querySelectorAll('[data-next]').forEach(b=>b.addEventListener('click',()=>go(Number(b.dataset.next))));
  document.querySelectorAll('[data-back]').forEach(b=>b.addEventListener('click',()=>go(Number(b.dataset.back))));
  document.querySelectorAll('.checkout-step').forEach(b=>b.addEventListener('click',()=>{const n=Number(b.dataset.step);if(n<=currentStep)go(n);}));
  document.querySelectorAll('input[name=shipping]').forEach(x=>x.addEventListener('change',updateShipping));
  document.querySelectorAll('input[name=payment]').forEach(x=>x.addEventListener('change',updatePayment));

  async function createPayment(){
    if(!validateDelivery())return;
    const button=el('confirm'),shippingAmount=Number(document.querySelector('input[name=shipping]:checked').value),paymentMethod=document.querySelector('input[name=payment]:checked').value;
    button.disabled=true;button.innerHTML='CRIANDO PEDIDO <span class="loading-dot"></span><span class="loading-dot"></span><span class="loading-dot"></span>';
    const token=localStorage.getItem('flashmarket_token');
    const payload={customer:{name:el('customerName').value.trim(),email:el('customerEmail').value.trim(),phone:el('customerPhone').value.trim()},address:{cep:el('cep').value.trim(),state:el('uf').value.trim(),city:el('city').value.trim(),address:el('address').value.trim(),complement:el('complement').value.trim()},shippingAmount,paymentMethod,items:cart.map(item=>({id:item.id,qty:item.qty}))};
    try{
      const response=await fetch('/api/payments/create',{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(payload)});
      const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||'Não foi possível criar o pedido.');
      const localOrder={id:data.order.id,total:data.order.total,status:data.order.status,date:new Date().toISOString(),items:products.map(x=>({id:x.id,n:x.p.n,qty:x.qty,p:x.p.p,i:x.p.i})),shipping:shippingAmount,payment:paymentMethod,address:payload.address,customer:payload.customer,mercadoPagoOrderId:data.order.mercadoPagoOrderId};
      const orders=JSON.parse(localStorage.getItem('flashmarket_orders')||'[]');orders.unshift(localOrder);localStorage.setItem('flashmarket_orders',JSON.stringify(orders));localStorage.setItem('flashmarket_last_order',JSON.stringify(localOrder));localStorage.removeItem('flashmarket_cart');sessionStorage.removeItem('flashmarket_checkout_cart');
      el('checkoutApp').classList.add('hidden');el('success').classList.remove('hidden');el('successText').textContent='Pedido '+data.order.id+' criado. Você será direcionado ao ambiente seguro do Mercado Pago para concluir o pagamento.';el('orderNumber').textContent='Pedido '+data.order.id;el('payAgain').href=data.order.checkoutUrl||'pagamento-retorno.html?order='+encodeURIComponent(data.order.id);
      if(data.order.checkoutUrl){window.location.href=data.order.checkoutUrl;return;}window.scrollTo({top:0,behavior:'smooth'});
    }catch(error){window.fmToast(error.message||'Não foi possível iniciar o pagamento.');button.disabled=false;button.innerHTML='CRIAR PEDIDO E PAGAR <b>→</b>';}
  }
  el('confirm').addEventListener('click',createPayment);updateShipping();updatePayment();
})();