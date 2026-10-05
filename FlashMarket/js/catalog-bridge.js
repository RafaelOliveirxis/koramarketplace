/* FlashMarket shared catalog + cart compatibility layer. */
(function(){
  'use strict';
  const CART_KEYS=['flashmarket_cart','FM_CART','cartItems','cart'];
  function parse(value){try{return value?JSON.parse(value):null}catch{return null}}
  function normalizeCart(value){
    const raw=typeof value==='string'?parse(value):value;
    if(!raw)return [];
    const list=Array.isArray(raw)?raw:Object.entries(raw).map(([id,qty])=>({id,qty}));
    return list.map(item=>({id:Number(item.id),qty:Math.max(1,Number(item.qty)||1)})).filter(item=>Number.isFinite(item.id)&&item.id>0);
  }
  function exposeCatalog(){
    try{
      const catalog=(typeof FM_PRODUCTS!=='undefined'&&Array.isArray(FM_PRODUCTS))?FM_PRODUCTS:(Array.isArray(window.FM_PRODUCTS)?window.FM_PRODUCTS:[]);
      if(catalog.length){
        window.FM_PRODUCTS=catalog;
        window.FM_CATALOG_VERSION='2026.09.30';
        window.dispatchEvent(new CustomEvent('flashmarket:catalog-ready',{detail:{count:catalog.length}}));
        return true;
      }
    }catch(error){console.warn('[FlashMarket] catálogo indisponível:',error)}
    return false;
  }
  function getCart(){
    const sources=[];
    try{if(typeof fmGetCart==='function')sources.push(fmGetCart())}catch{}
    for(const key of CART_KEYS){try{sources.push(normalizeCart(localStorage.getItem(key)))}catch{}}
    for(const value of sources){const cart=normalizeCart(value);if(cart.length)return cart}
    return [];
  }
  window.fmGetCartSafe=getCart;
  window.fmPrepareCheckout=function(){
    const cart=getCart();
    if(!cart.length)return false;
    const catalog=Array.isArray(window.FM_PRODUCTS)?window.FM_PRODUCTS:[];
    const enriched=cart.map(item=>{
      const p=catalog.find(product=>Number(product.id)===Number(item.id));
      return p?{id:Number(item.id),qty:item.qty,product:{id:Number(p.id),name:p.n,price:Number(p.p),image:p.i,category:p.c}}:null;
    }).filter(Boolean);
    if(!enriched.length)return false;
    sessionStorage.setItem('flashmarket_checkout_cart',JSON.stringify(enriched));
    localStorage.setItem('flashmarket_checkout_cart',JSON.stringify(enriched));
    localStorage.setItem('flashmarket_checkout_snapshot',JSON.stringify(enriched));
    localStorage.setItem('flashmarket_cart',JSON.stringify(cart));
    return true;
  };
  if(!exposeCatalog()){
    [0,50,150,300,600].forEach(delay=>setTimeout(exposeCatalog,delay));
  }
})();
