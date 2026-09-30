(function(){
  const el=id=>document.getElementById(id), money=window.fmMoney;
  const cart=window.fmGetCart(), products=cart.map(x=>({...x,p:window.FM_PRODUCTS.find(p=>p.id===x.id)})).filter(x=>x.p);
  let subtotal=products.reduce((s,x)=>s+x.p.p*x.qty,0), currentStep=1;

  if(!products.length){
    el('checkoutApp').innerHTML='<section class="flow-card order-success-card"><div class="order-success-icon">🛍️</div><h2>Seu carrinho está vazio</h2><p class="flow-muted">Adicione produtos antes de finalizar a compra.</p><br><a class="fm-btn orange" href="produtos.html">VOLTAR PARA PRODUTOS</a></section>';
    return;
  }

  el('items').innerHTML=products.map(x=>'<div class="summary-item"><img src="'+x.p.i+'" alt="'+x.p.n+'"><div><strong>'+x.p.n+'</strong><small>Qtd. '+x.qty+'</small></div><b>'+money(x.p.p*x.qty)+'</b></div>').join('');
  const totalQty=products.reduce((s,x)=>s+x.qty,0);
  el('subtotal').textContent=money(subtotal);
  el('summaryCount').textContent=totalQty+' '+(totalQty===1?'item':'itens');

  function updateShipping(){
    const ship=Number(document.querySelector('input[name=shipping]:checked').value);
    el('shipping').textContent=ship?'R$ 19,90':'Grátis';
    el('total').textContent=money(subtotal+ship);
    document.querySelectorAll('input[name=shipping]').forEach(r=>r.closest('.checkout-option').classList.toggle('selected',r.checked));
    if(el('confirmShipping'))el('confirmShipping').textContent=ship?'Entrega expressa · 2 a 5 dias úteis · R$ 19,90':'Frete grátis · 5 a 10 dias úteis';
  }

  function updatePayment(){
    const r=document.querySelector('input[name=payment]:checked');
    document.querySelectorAll('.payment-option').forEach(x=>x.classList.toggle('selected',x.querySelector('input').checked));
    const names={pix:'PIX',card:'Cartão de crédito',boleto:'Boleto bancário'};
    const desc={pix:'Pagamento instantâneo pelo Mercado Pago.',card:'Pagamento seguro no ambiente do Mercado Pago.',boleto:'O vencimento será informado no Mercado Pago.'};
    if(el('confirmPayment'))el('confirmPayment').textContent=names[r.value];
    if(el('paymentInfo'))el('paymentInfo').innerHTML='<strong>'+names[r.value]+' selecionado</strong><span>'+desc[r.value]+'</span>';
  }

  function validateDelivery(){
    const required=['customerName','customerEmail','cep','address','city','uf'];
    if(required.some(id=>!el(id).value.trim())){window.fmToast('Preencha nome, e-mail, CEP, estado, endereço e cidade.');return false;}
    if(!/^\S+@\S+\.\S+$/.test(el('customerEmail').value.trim())){window.fmToast('Informe um e-mail válido.');return false;}
    if(el('cep').value.replace(/\D/g,'').length!==8){window.fmToast('Informe um CEP válido.');return false;}
    return true;
  }

  function go(step){
    if(step===2&&!validateDelivery())return;
    if(step===3){
      updatePayment();
      el('confirmCustomer').textContent=el('customerName').value+' · '+el('customerEmail').value;
      el('confirmAddress').textContent=[el('address').value,el('complement').value,el('city').value,el('uf').value,el('cep').value].filter(Boolean).join(', ');
      updateShipping();
    }
    currentStep=step;
    document.querySelectorAll('.checkout-section').forEach(p=>{const active=Number(p.dataset.panel)===step;p.hidden=!active;p.classList.toggle('active',active);});
    document.querySelectorAll('.checkout-step').forEach(s=>{const n=Number(s.dataset.step);s.classList.toggle('active',n===step);s.classList.toggle('done',n<step);});
    window.scrollTo({top:0,behavior:'smooth'});
  }

  document.querySelectorAll('[data-next]').forEach(b=>b.addEventListener('click',()=>go(Number(b.dataset.next))));
  document.querySelectorAll('[data-back]').forEach(b=>b.addEventListener('click',()=>go(Number(b.dataset.back))));
  document.querySelectorAll('.checkout-step').forEach(b=>b.addEventListener('click',()=>{const n=Number(b.dataset.step);if(n<=currentStep)go(n);}));
  document.querySelectorAll('input[name=shipping]').forEach(x=>x.addEventListener('change',updateShipping));
  document.querySelectorAll('input[name=payment]').forEach(x=>x.addEventListener('change',updatePayment));

  el('cep').addEventListener('input',e=>{let v=e.target.value.replace(/\D/g,'').slice(0,8);if(v.length>5)v=v.slice(0,5)+'-'+v.slice(5);e.target.value=v;});
  el('customerPhone').addEventListener('input',e=>{let v=e.target.value.replace(/\D/g,'').slice(0,11);if(v.length>6)v='('+v.slice(0,2)+') '+v.slice(2,7)+'-'+v.slice(7);else if(v.length>2)v='('+v.slice(0,2)+') '+v.slice(2);e.target.value=v;});

  async function createPayment(){
    if(!validateDelivery())return;
    const button=el('confirm');
    const shippingAmount=Number(document.querySelector('input[name=shipping]:checked').value);
    const paymentMethod=document.querySelector('input[name=payment]:checked').value;
    button.disabled=true;
    button.innerHTML='CRIANDO PEDIDO...';

    const token=localStorage.getItem('flashmarket_token');
    const payload={
      customer:{name:el('customerName').value.trim(),email:el('customerEmail').value.trim(),phone:el('customerPhone').value.trim()},
      address:{cep:el('cep').value.trim(),state:el('uf').value.trim(),city:el('city').value.trim(),address:el('address').value.trim(),complement:el('complement').value.trim()},
      shippingAmount,
      paymentMethod,
      items:cart.map(item=>({id:item.id,qty:item.qty}))
    };

    try{
      const response=await fetch('/api/payments/create',{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(payload)});
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.error||'Não foi possível criar o pedido.');

      const localOrder={id:data.order.id,total:data.order.total,status:data.order.status,date:new Date().toISOString(),items:products.map(x=>({id:x.id,n:x.p.n,qty:x.qty,p:x.p.p,i:x.p.i})),shipping:shippingAmount,payment:paymentMethod,address:payload.address,customer:payload.customer,mercadoPagoOrderId:data.order.mercadoPagoOrderId};
      const orders=JSON.parse(localStorage.getItem('flashmarket_orders')||'[]');
      orders.unshift(localOrder);
      localStorage.setItem('flashmarket_orders',JSON.stringify(orders));
      localStorage.setItem('flashmarket_last_order',JSON.stringify(localOrder));
      localStorage.removeItem('flashmarket_cart');

      el('checkoutApp').classList.add('hidden');
      el('success').classList.remove('hidden');
      el('successText').textContent='Pedido '+data.order.id+' criado. Você será direcionado ao ambiente seguro do Mercado Pago para concluir o pagamento.';
      el('orderNumber').textContent='Pedido '+data.order.id;
      el('payAgain').href=data.order.checkoutUrl||'pagamento-retorno.html?order='+encodeURIComponent(data.order.id);
      if(data.order.checkoutUrl){window.location.href=data.order.checkoutUrl;return;}
      window.scrollTo({top:0,behavior:'smooth'});
    }catch(error){
      window.fmToast(error.message||'Não foi possível iniciar o pagamento.');
      button.disabled=false;
      button.innerHTML='CRIAR PEDIDO E PAGAR <b>→</b>';
    }
  }

  el('confirm').addEventListener('click',createPayment);
  updateShipping();updatePayment();
})();