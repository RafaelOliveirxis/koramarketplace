/* Checkout: usa uma API própria somente se FLASHMARKET_API_BASE estiver configurada.
   Sem API externa, cria o pedido localmente e mantém todo o fluxo navegável no GitHub Pages. */
(function(){
  const parse=v=>{try{return JSON.parse(v||'null')}catch{return null}};
  const cart=()=>{for(const s of [sessionStorage,localStorage])for(const k of ['flashmarket_checkout_cart','flashmarket_cart','FM_CART','cartItems','cart']){const v=parse(s.getItem(k));if(v){const a=Array.isArray(v)?v:Object.entries(v).map(([id,qty])=>({id,qty}));if(a.length)return a.map(x=>({id:Number(x.id),qty:Math.max(1,Math.floor(Number(x.qty)||1))})).filter(x=>x.id>0)}}return[]};
  function localOrder(body){
    const catalog=Array.isArray(window.FM_PRODUCTS)?window.FM_PRODUCTS:[];
    const products=cart().map(x=>{const p=catalog.find(y=>Number(y.id)===Number(x.id));return p?{id:Number(p.id),n:p.n,p:Number(p.p),i:p.i,c:p.c,qty:x.qty,total:Number(p.p)*x.qty}:null}).filter(Boolean);
    const subtotal=products.reduce((s,x)=>s+x.total,0),shipping=Number(body.shippingAmount||0),coupon=String(body.couponCode||'').toUpperCase();
    const discount=coupon==='FLASH10'&&subtotal>=99?Number((subtotal*.1).toFixed(2)):0;
    const total=Math.max(0,subtotal+shipping-discount);
    const user=JSON.parse(localStorage.getItem('flashmarket_user_profile')||'null');
    const id='KM-'+Date.now().toString().slice(-10);
    const order={id,userId:user?.id||null,email:body.customer.email,date:new Date().toISOString(),status:'a-pagar',statusDetail:'Pedido criado. Aguardando pagamento.',payment:body.paymentMethod||'pix',shipping,total,discount,items:products,address:body.address,tracking:[]};
    const orders=parse(localStorage.getItem('flashmarket_local_orders'))||[];
    orders.unshift(order);localStorage.setItem('flashmarket_local_orders',JSON.stringify(orders));
    localStorage.setItem('flashmarket_pending_order',JSON.stringify(order));
    localStorage.removeItem('flashmarket_cart');localStorage.removeItem('flashmarket_checkout_cart');sessionStorage.removeItem('flashmarket_checkout_cart');
    return order;
  }
  function go(){
    const old=document.querySelector('#confirm');if(!old)return;
    const b=old.cloneNode(true);old.replaceWith(b);
    b.addEventListener('click',async()=>{
      const q=id=>document.getElementById(id)?.value.trim()||'';
      if(['customerName','customerEmail','cep','uf','address','city'].some(id=>!q(id))){fmToast?.('Preencha os dados de entrega.');return}
      const items=cart();if(!items.length){fmToast?.('Seu carrinho está vazio.');return}
      const body={customer:{name:q('customerName'),email:q('customerEmail'),phone:q('customerPhone')},address:{cep:q('cep'),state:q('uf'),city:q('city'),address:q('address'),complement:q('complement')},items,shippingAmount:Number(document.querySelector('input[name="shipping"]:checked')?.value||0),paymentMethod:document.querySelector('input[name="payment"]:checked')?.value||'pix',couponCode:(localStorage.getItem('flashmarket_coupon')||'').trim().toUpperCase()};
      b.disabled=true;b.textContent='CRIANDO PEDIDO...';
      try{
        const base=String(window.FLASHMARKET_API_BASE||'').replace(/\/$/,'');
        if(base){
          const h={'Content-Type':'application/json'},t=localStorage.getItem('flashmarket_access_token');if(t)h.Authorization='Bearer '+t;
          const r=await fetch(base+'/api/payments/create',{method:'POST',headers:h,body:JSON.stringify(body)}),d=await r.json().catch(()=>({}));
          if(r.ok&&d.order?.checkoutUrl){localStorage.setItem('flashmarket_pending_order',JSON.stringify(d.order));localStorage.removeItem('flashmarket_cart');location.href=d.order.checkoutUrl;return}
        }
        const order=localOrder(body);
        location.href='pedido.html?pedido='+encodeURIComponent(order.id);
      }catch(error){b.disabled=false;b.textContent='CRIAR PEDIDO E PAGAR →';fmToast?.(error.message||'Não foi possível criar o pedido.')}
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(go,500),{once:true});else setTimeout(go,500);
})();