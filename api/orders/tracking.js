const { getPool } = require('../_lib/db');
const { applyCors } = require('../_lib/cors');
const { ensurePaymentsSchema } = require('../_lib/ensurePaymentsSchema');

const PROGRESS = { created:10, processing:25, ready_to_ship:40, shipped:55, in_transit:70, out_for_delivery:88, delivered:100, canceled:0, cancelled:0, failed:0, refunded:0, action_required:10, processed:40 };

function normalize(value){ return String(value || '').trim().toUpperCase().slice(0,80); }
function jsonDate(value){ return value ? new Date(value).toISOString() : null; }

module.exports = async (req,res) => {
  if (applyCors(req,res)) return;
  if (req.method !== 'GET') return res.status(405).json({error:'Método não permitido.'});
  const code=normalize(req.query?.code || req.query?.tracking || '');
  if (!code) return res.status(400).json({error:'Informe o código do pedido ou rastreio.'});
  try {
    const db=getPool();
    await ensurePaymentsSchema(db);
    const [orders]=await db.execute(
      'SELECT id,public_id,total_amount,shipping_amount,payment_method,status,status_detail,paid_at,created_at,updated_at,cep,state,city FROM fm_orders WHERE UPPER(public_id)=? OR id IN (SELECT order_id FROM fm_order_tracking WHERE UPPER(tracking_code)=?) LIMIT 1',
      [code,code]
    );
    if(!orders.length) return res.status(404).json({error:'Pedido não encontrado.'});
    const order=orders[0];
    const [events]=await db.execute(
      'SELECT status,title,description,tracking_code,carrier,event_at FROM fm_order_tracking WHERE order_id=? ORDER BY event_at ASC,id ASC',
      [order.id]
    );
    const [items]=await db.execute(
      'SELECT product_id,product_name,unit_price,quantity,total_amount FROM fm_order_items WHERE order_id=? ORDER BY id ASC',
      [order.id]
    );
    const latest=events[events.length-1] || null;
    const normalizedStatus=String(latest?.status || order.status || 'created').toLowerCase();
    const trackingEvent=[...events].reverse().find(e=>e.tracking_code) || null;
    const carrierEvent=[...events].reverse().find(e=>e.carrier) || null;
    return res.json({ok:true,order:{
      id:order.public_id,status:normalizedStatus,statusLabel:latest?.title || 'Pedido em processamento',
      statusDetail:order.status_detail || null,total:Number(order.total_amount||0),shipping:Number(order.shipping_amount||0),
      paymentMethod:order.payment_method || null,createdAt:jsonDate(order.created_at),paidAt:jsonDate(order.paid_at),updatedAt:jsonDate(order.updated_at),
      trackingCode:trackingEvent?.tracking_code || null,carrier:carrierEvent?.carrier || trackingEvent?.carrier || null,
      destination:{city:order.city || null,state:order.state || null,cep:order.cep || null},
      items:items.map(item=>({id:Number(item.product_id),name:item.product_name,unitPrice:Number(item.unit_price||0),quantity:Number(item.quantity||0),total:Number(item.total_amount||0)})),
      tracking:events.map(event=>({status:event.status,title:event.title,description:event.description||null,trackingCode:event.tracking_code||null,carrier:event.carrier||null,date:jsonDate(event.event_at)})),
      latest:latest?{status:latest.status,title:latest.title,description:latest.description||null,date:jsonDate(latest.event_at)}:null,
      progress:PROGRESS[normalizedStatus] ?? 15
    }});
  } catch(error) { console.error('orders/tracking',error); return res.status(500).json({error:'Não foi possível consultar o rastreamento.'}); }
};