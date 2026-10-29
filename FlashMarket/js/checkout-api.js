/* Checkout: usa uma API própria somente se FLASHMARKET_API_BASE estiver configurada.
   Sem API externa, cria o pedido localmente e mantém todo o fluxo navegável no GitHub Pages. */
(function(){
  const parse=v=>{try{return JSON.parse(v||'null')}catch{return null}};
  const cart=()=>{try{const encoded=new URLSearchParams(location.search).get('cart');if(encoded){const decoded=decodeURIComponent(escape(atob(encoded)));const v=parse(decoded);if(Array.isArray(v)&&v.length)return v.map(x=>({id:Number(x.id),qty:Math.max(1,Math.floor(Number(x.qty)||1)),product:x.product||x.p||null})).filter(x=>x.id>0)}}catch{}for(const s of [sessionStorage,localStorage])for(const k of ['flashmarket_checkout_snapshot','flashmarket_checkout_cart','flashmarket_cart','FM_CART','cartItems','cart']){const v=parse(s.getItem(k));if(v){const a=Array.isArray(v)?v:Object.entries(v).map(([id,qty])=>({id,qty}));if(a.length)return a.map(x=>({id:Number(x.id),qty:Math.max(1,Math.floor(Number(x.qty)||1)),product:x.product||x.p||null})).filter(x=>x.id>0)}}return[]};
  function localOrder(body,simulation=false){
    const catalog=Array.isArray(window.FM_PRODUCTS)?window.FM_PRODUCTS:[];
    const products=cart().map(x=>{const raw=x.product||{},p=catalog.find(y=>Number(y.id)===Number(x.id))||raw;const price=Number(p.p??p.price??p.unitPrice??0),name=p.n||p.name||p.product_name||('Produto #'+x.id);if(!price)return null;return{id:Number(x.id),n:name,p:price,i:p.i||p.image||'assets/logo-flashmarket.png',c:p.c||p.category||'Produto',qty:x.qty,total:Number((price*x.qty).toFixed(2))}}).filter(Boolean);
    const subtotal=products.reduce((s,x)=>s+x.total,0),coupon=String(body.couponCode||'').toUpperCase(),couponResult=coupon?window.FlashMarketCoupons.evaluate(coupon,subtotal):null;
    if(couponResult&&!couponResult.valid)throw new Error(couponResult.message);
    const discount=couponResult?.discount||0,shipping=Number(body.shippingAmount||0);
    const total=Math.max(0,subtotal+shipping-discount);
    const user=JSON.parse(localStorage.getItem('flashmarket_user_profile')||'null');
    const id='FM-'+Date.now().toString(36).slice(-7).toUpperCase();
    const order={id,userId:user?.id||null,email:body.customer.email,date:new Date().toISOString(),affiliateCode:body.affiliateCode||null,status:simulation?'simulacao':'a-pagar',statusDetail:simulation?'Pedido de demonstração criado neste navegador. Não foi gravado no banco e nenhum pagamento foi processado.':'Pedido criado. Aguardando pagamento.',payment:body.paymentMethod||'pix',shipping,total,discount,items:products,address:body.address,tracking:[{title:'Pedido criado (simulação)',description:'Pedido de demonstração criado neste navegador. Nenhuma cobrança foi realizada.',date:new Date().toISOString()}]};
    const orders=parse(localStorage.getItem('flashmarket_local_orders'))||[];
    orders.unshift(order);localStorage.setItem('flashmarket_local_orders',JSON.stringify(orders));
    localStorage.setItem('flashmarket_pending_order',JSON.stringify(order));
    localStorage.removeItem('flashmarket_cart');localStorage.removeItem('flashmarket_checkout_cart');localStorage.removeItem('flashmarket_checkout_snapshot');sessionStorage.removeItem('flashmarket_checkout_cart');
    return order;
  }
  function go(){
    const old=document.querySelector('#confirm');if(!old)return;
    const b=old.cloneNode(true);old.replaceWith(b);
    b.addEventListener('click',async()=>{
      const q=id=>document.getElementById(id)?.value.trim()||'';
      if(['customerName','customerEmail','cep','uf','address','city'].some(id=>!q(id))){fmToast?.('Preencha os dados de entrega.');return}
      const items=cart();if(!items.length){fmToast?.('Seu carrinho está vazio.');return}
      const body={customer:{name:q('customerName'),email:q('customerEmail'),phone:q('customerPhone')},address:{cep:q('cep'),state:q('uf'),city:q('city'),address:q('address'),complement:q('complement')},items,shippingAmount:Number(document.querySelector('input[name="shipping"]:checked')?.value||0),paymentMethod:document.querySelector('input[name="payment"]:checked')?.value||'pix',couponCode:(localStorage.getItem('flashmarket_coupon')||'').trim().toUpperCase(),affiliateCode:(localStorage.getItem('flashmarket_affiliate_code')||'').trim().slice(0,80)};
      b.disabled=true;b.textContent='CRIANDO PEDIDO...';
      try{
        // Este botão é explicitamente de SIMULAÇÃO: não deve depender do Mercado Pago,
        // credenciais de produção ou disponibilidade da API para concluir a demonstração.
        const order=localOrder(body,true);
        if(!order.items.length) throw new Error('Não foi possível identificar os produtos do carrinho. Volte ao carrinho e tente novamente.');
        location.href='pedido.html?pedido='+encodeURIComponent(order.id);
      }catch(error){b.disabled=false;b.textContent='CRIAR PEDIDO (SIMULAÇÃO) →';fmToast?.(error.message||'Não foi possível criar o pedido.')}
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(go,500),{once:true});else setTimeout(go,500);
})();