const FM_PRODUCTS=[
{id:1,n:'Luminária LED de Mesa',c:'Casa & Decor',p:89.9,o:129.9,i:'assets/luminaria de led.png'},
{id:2,n:'Organizador Multiuso Minimalista',c:'Casa & Decor',p:39.9,o:59.9,i:'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=700&q=80'},
{id:3,n:'Moletom Street Flash',c:'Vestuário',p:119.9,o:169.9,i:'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=700&q=80'},
{id:4,n:'Caderno Criativo Premium',c:'Papelaria',p:34.9,o:49.9,i:'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=700&q=80'},
{id:5,n:'Fone Bluetooth Pocket',c:'Eletrônicos',p:149.9,o:199.9,i:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80'},
{id:6,n:'Camiseta Básica Oversized',c:'Vestuário',p:59.9,o:79.9,i:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80'},
{id:7,n:'Mouse Sem Fio Slim',c:'Eletrônicos',p:64.9,o:89.9,i:'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=700&q=80'},
{id:8,n:'Vaso Decorativo Geométrico',c:'Casa & Decor',p:44.9,o:69.9,i:'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=700&q=80'}];
const fmMoney=v=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const fmGetCart=()=>{try{return JSON.parse(localStorage.getItem('flashmarket_cart')||'[]')}catch{return[]}};
const fmSetCart=c=>localStorage.setItem('flashmarket_cart',JSON.stringify(c));
function fmAdd(id,qty=1){const c=fmGetCart(),x=c.find(a=>a.id===id);if(x)x.qty+=qty;else c.push({id,qty});fmSetCart(c);fmToast('Produto adicionado ao carrinho');fmUpdateCount()}
function fmRemove(id){fmSetCart(fmGetCart().filter(x=>x.id!==id));location.reload()}
function fmChange(id,d){const c=fmGetCart(),x=c.find(a=>a.id===id);if(!x)return;x.qty+=d;if(x.qty<1)return fmRemove(id);fmSetCart(c);location.reload()}
function fmUpdateCount(){const n=fmGetCart().reduce((s,x)=>s+x.qty,0);document.querySelectorAll('[data-cart-count]').forEach(e=>e.textContent=n)}
function fmToast(t){let e=document.querySelector('.fm-toast');if(!e){e=document.createElement('div');e.className='fm-toast';document.body.appendChild(e)}e.textContent=t;e.classList.add('show');clearTimeout(window.fmToastTimer);window.fmToastTimer=setTimeout(()=>e.classList.remove('show'),2200)}
function fmHeader(){return `<div class="fm-top"><div class="fm-container"><strong>⚡ FlashMarket</strong><span>Compra rápida, segura e prática</span></div></div><header class="fm-header"><div class="fm-container fm-header-main"><a class="fm-logo" href="index.html">Flash<span>Market</span></a><form class="fm-search" action="produtos.html"><input name="q" placeholder="Buscar produtos, categorias e ofertas..."><button>⌕</button></form><div class="fm-actions"><a class="fm-icon-btn" href="minha-conta.html">👤 Minha conta</a><a class="fm-icon-btn" href="carrinho.html">🛒 <span data-cart-count>0</span></a></div></div></header><nav class="fm-nav"><div class="fm-container"><a href="index.html">Início</a><a href="produtos.html">Produtos</a><a href="produtos.html?c=Eletrônicos">Eletrônicos</a><a href="produtos.html?c=Vestuário">Moda</a><a href="produtos.html?c=Casa%20%26%20Decor">Casa</a><a href="suporte.html">Suporte</a><a href="afiliado.html">Afiliados</a></div></nav>`}
document.addEventListener('DOMContentLoaded',()=>{const h=document.querySelector('[data-fm-header]');if(h)h.innerHTML=fmHeader();fmUpdateCount()});