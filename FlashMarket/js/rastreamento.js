/* =========================================================
   FLASHMARKET — RASTREAMENTO DE PEDIDOS
   Consulta pedidos simulados e pedidos criados no checkout.
========================================================= */

const pedidos = {
  "FM-20487": {
    numero: "FM-20487", rastreio: "FM204871BR", transportadora: "Flash Express",
    status: "Em transporte", statusAtual: "Pedido em transporte",
    descricao: "Seu pedido está a caminho do centro de distribuição da sua região.",
    progresso: 75, etapa: 3, previsao: "02/09/2026",
    endereco: "Rua das Flores, 125<br>Centro — Barueri/SP<br>CEP 06400-000",
    produtos: [
      {nome:"Moletom Street Flash",quantidade:1,preco:"R$ 119,90"},
      {nome:"Mouse Sem Fio Slim",quantidade:1,preco:"R$ 64,90"},
      {nome:"Kit Canetas",quantidade:1,preco:"R$ 24,90"}
    ],
    eventos: [
      {titulo:"Pedido confirmado",descricao:"Pagamento aprovado e pedido recebido pela FlashMarket.",data:"31/08/2026",hora:"09:14",local:"FlashMarket"},
      {titulo:"Pedido separado",descricao:"Os produtos foram separados e preparados para envio.",data:"31/08/2026",hora:"11:26",local:"Centro de distribuição — Barueri/SP"},
      {titulo:"Pedido em transporte",descricao:"A encomenda foi coletada pela transportadora e está em rota.",data:"31/08/2026",hora:"12:48",local:"Barueri/SP"},
      {titulo:"Entrega",descricao:"Previsão de entrega no endereço informado.",data:"02/09/2026",hora:"—",local:"Endereço do destinatário"}
    ]
  },
  "FM-31592": {
    numero:"FM-31592", rastreio:"FM315920BR", transportadora:"Flash Express",
    status:"Pedido confirmado", statusAtual:"Pagamento confirmado",
    descricao:"Recebemos seu pedido e estamos preparando os produtos para envio.",
    progresso:25, etapa:1, previsao:"04/09/2026",
    endereco:"Avenida Central, 890<br>Alphaville — Barueri/SP<br>CEP 06454-000",
    produtos:[{nome:"Tênis Urban Flash",quantidade:1,preco:"R$ 189,90"},{nome:"Boné Street",quantidade:1,preco:"R$ 49,90"}],
    eventos:[
      {titulo:"Pedido confirmado",descricao:"Pagamento aprovado e pedido recebido pela FlashMarket.",data:"31/08/2026",hora:"10:32",local:"FlashMarket"},
      {titulo:"Separação",descricao:"O pedido será preparado pela equipe logística.",data:"—",hora:"—",local:"Centro de distribuição"},
      {titulo:"Transporte",descricao:"A encomenda será encaminhada para a transportadora.",data:"—",hora:"—",local:"Aguardando postagem"},
      {titulo:"Entrega",descricao:"Previsão de entrega após o envio.",data:"04/09/2026",hora:"—",local:"Endereço do destinatário"}
    ]
  },
  "FM-78214": {
    numero:"FM-78214", rastreio:"FM782140BR", transportadora:"Flash Express",
    status:"Entregue", statusAtual:"Pedido entregue",
    descricao:"O pedido foi entregue com sucesso no endereço informado.",
    progresso:100, etapa:4, previsao:"29/08/2026",
    endereco:"Rua das Palmeiras, 245<br>Jardim Paulista — São Paulo/SP<br>CEP 01400-000",
    produtos:[{nome:"Camiseta Flash Basic",quantidade:2,preco:"R$ 89,90"},{nome:"Mochila Urban",quantidade:1,preco:"R$ 139,90"}],
    eventos:[
      {titulo:"Pedido confirmado",descricao:"Pagamento aprovado.",data:"26/08/2026",hora:"14:20",local:"FlashMarket"},
      {titulo:"Pedido separado",descricao:"Produtos separados e embalados.",data:"26/08/2026",hora:"16:41",local:"São Paulo/SP"},
      {titulo:"Em transporte",descricao:"Pedido encaminhado para entrega.",data:"27/08/2026",hora:"08:15",local:"São Paulo/SP"},
      {titulo:"Entregue",descricao:"Pedido entregue com sucesso.",data:"29/08/2026",hora:"13:47",local:"Endereço do destinatário"}
    ]
  }
};

const form=document.getElementById('trackingForm');
const input=document.getElementById('trackingCode');
const result=document.getElementById('trackingResult');
const loading=document.getElementById('loadingState');
const error=document.getElementById('errorState');
const timeline=document.getElementById('timeline');
const productsList=document.getElementById('productsList');

function readOrders(){
  try{
    const value=JSON.parse(localStorage.getItem('flashmarket_orders')||'[]');
    return Array.isArray(value)?value:[];
  }catch{return[];}
}

function money(value){return Number(value||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
function dateBR(value){
  if(!value)return '—';
  const d=new Date(value);
  return Number.isNaN(d.getTime())?'—':d.toLocaleDateString('pt-BR');
}

function findSavedOrder(code){
  const q=String(code||'').trim().toUpperCase();
  return readOrders().find(o=>String(o.id||'').toUpperCase()===q || String(o.trackingCode||o.tracking?.code||'').toUpperCase()===q);
}

function convertSavedOrder(order){
  const address=order.address||{};
  const items=Array.isArray(order.items)?order.items:[];
  const cityState=address.city&&address.state?`${address.city}/${address.state}`:(address.city||'');
  const local=cityState||'Centro de distribuição';
  const created=dateBR(order.date);
  return {
    numero:order.id,
    rastreio:order.trackingCode||order.tracking?.code||'Aguardando geração',
    transportadora:order.tracking?.carrier||'Flash Express',
    status:order.statusLabel||'Pagamento aprovado (simulação)',
    statusAtual:'Pedido confirmado',
    descricao:'Seu pedido foi registrado. O código de rastreio foi gerado e ficará vinculado a esta compra.',
    progresso:25,
    etapa:1,
    previsao:'Após postagem',
    endereco:[address.address,address.complement,cityState,address.cep?`CEP ${address.cep}`:''].filter(Boolean).join('<br>'),
    produtos:items.map(i=>({nome:i.n||i.name||'Produto',quantidade:Number(i.qty||i.quantity||1),preco:money(i.p||i.price||0)})),
    eventos:[
      {titulo:'Pedido confirmado',descricao:'Pagamento aprovado na simulação e pedido recebido pela FlashMarket.',data:created,hora:'—',local:'FlashMarket'},
      {titulo:'Pedido separado',descricao:'Os produtos serão separados e preparados para envio.',data:'Aguardando',hora:'—',local:'Centro de distribuição FlashMarket'},
      {titulo:'Em transporte',descricao:'Após a postagem, o pedido seguirá para a transportadora.',data:'Aguardando envio',hora:'—',local:'Centro de distribuição'},
      {titulo:'Entrega',descricao:'Entrega no endereço informado no checkout.',data:'Após postagem',hora:'—',local:local}
    ]
  };
}

function esconderTudo(){result.classList.add('hidden');loading.classList.add('hidden');error.classList.add('hidden');}
function mostrarErro(){esconderTudo();error.classList.remove('hidden');}

function consultarPedido(codigo){
  esconderTudo();
  loading.classList.remove('hidden');
  setTimeout(()=>{
    const salvo=findSavedOrder(codigo);
    const pedido=salvo?convertSavedOrder(salvo):pedidos[codigo];
    loading.classList.add('hidden');
    if(!pedido){mostrarErro();return;}
    renderizarPedido(pedido);
    localStorage.setItem('flashmarket_ultimo_pedido',codigo);
  },450);
}

function renderizarPedido(pedido){
  result.classList.remove('hidden');
  document.getElementById('orderNumber').textContent=pedido.numero;
  document.getElementById('trackingNumber').textContent=pedido.rastreio;
  document.getElementById('carrier').textContent=pedido.transportadora;
  document.getElementById('deliveryDate').textContent=pedido.previsao;
  document.getElementById('orderStatus').textContent=pedido.status;
  document.getElementById('currentTitle').textContent=pedido.statusAtual;
  document.getElementById('currentDescription').textContent=pedido.descricao;
  document.getElementById('progressPercentage').textContent=`${pedido.progresso}%`;
  document.getElementById('progressBar').style.width=`${pedido.progresso}%`;
  document.getElementById('progressText').textContent=`${pedido.etapa} de 4 etapas concluídas`;
  document.getElementById('deliveryAddress').innerHTML=pedido.endereco||'Endereço não informado';
  renderizarTimeline(pedido.eventos||[],pedido.etapa||1);
  renderizarProdutos(pedido.produtos||[]);
}

function renderizarTimeline(eventos,etapaAtual){
  timeline.innerHTML='';
  eventos.forEach((evento,index)=>{
    const concluido=index<etapaAtual;
    const atual=index===etapaAtual-1;
    const div=document.createElement('div');
    div.className='timeline-item'+(concluido?' completed':'')+(atual?' current':'');
    div.innerHTML=`<div class="timeline-marker">${concluido?'✓':index+1}</div><div class="timeline-content"><div class="timeline-top"><strong>${evento.titulo}</strong><span>${evento.data}${evento.hora!=='—'?` • ${evento.hora}`:''}</span></div><p>${evento.descricao}</p><small>📍 ${evento.local}</small></div>`;
    timeline.appendChild(div);
  });
}

function renderizarProdutos(produtos){
  productsList.innerHTML='';
  produtos.forEach(produto=>{
    const item=document.createElement('div');
    item.className='product-track-item';
    item.innerHTML=`<div class="product-track-icon">📦</div><div class="product-track-info"><strong>${produto.nome}</strong><span>Quantidade: ${produto.quantidade}</span></div><strong>${produto.preco}</strong>`;
    productsList.appendChild(item);
  });
}

if(form){
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const codigo=input.value.trim().toUpperCase();
    if(!codigo){mostrarErro();return;}
    consultarPedido(codigo);
  });
}

document.querySelectorAll('[data-example]').forEach(button=>button.addEventListener('click',()=>{
  input.value=button.dataset.example||'';
  consultarPedido(input.value);
}));

window.addEventListener('DOMContentLoaded',()=>{
  let ultimo=localStorage.getItem('flashmarket_ultimo_pedido');
  try{
    const last=JSON.parse(localStorage.getItem('flashmarket_last_order')||'null');
    if(last?.trackingCode) ultimo=last.trackingCode;
  }catch{}
  if(ultimo)input.value=ultimo;
});
