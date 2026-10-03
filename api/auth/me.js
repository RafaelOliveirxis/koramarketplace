const { getPool } = require('../_lib/db');
const { requireAuth } = require('../_lib/auth');
const { applyCors } = require('../_lib/cors');
const { ensurePaymentsSchema } = require('../_lib/ensurePaymentsSchema');
const { sendOrderEventEmail } = require('../_lib/mailer');

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;
  if (!['GET','POST'].includes(req.method)) return res.status(405).json({ error: 'Método não permitido.' });
  const auth = requireAuth(req, res);
  if (!auth) return;
  try {
    const db = getPool();
    await ensurePaymentsSchema(db);
    if (req.method === 'POST') {
      const action = String(req.body?.action || '').trim().toLowerCase();

      if (action === 'support_create' || action === 'cancel_request' || action === 'return_request' || action === 'admin_support_update') {
        const admins = String(process.env.ADMIN_EMAILS || '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
        const isAdmin = admins.includes(String(auth.email || '').toLowerCase());
        if (action === 'admin_support_update') {
          if (!isAdmin) return res.status(403).json({ error: 'Acesso administrativo não autorizado.' });
          const ticketId = String(req.body?.ticketId || '').trim();
          const status = String(req.body?.status || '').trim().toLowerCase();
          const message = String(req.body?.message || '').trim().slice(0, 4000);
          if (!ticketId || !['open','in_progress','waiting_customer','resolved','closed'].includes(status)) return res.status(400).json({ error: 'Atualização de chamado inválida.' });
          const [tickets] = await db.execute('SELECT id,public_id,order_id,user_id FROM fm_support_tickets WHERE public_id=? LIMIT 1',[ticketId]);
          if (!tickets.length) return res.status(404).json({ error: 'Chamado não encontrado.' });
          await db.execute('UPDATE fm_support_tickets SET status=? WHERE id=?',[status,tickets[0].id]);
          if (message) await db.execute('INSERT INTO fm_support_messages (ticket_id,author_type,author_id,message) VALUES (?,?,?,?)',[tickets[0].id,'admin',auth.id,message]);
          const [customerRows] = await db.execute('SELECT o.public_id,o.customer_name,o.customer_email,t.subject FROM fm_support_tickets t INNER JOIN fm_orders o ON o.id=t.order_id WHERE t.id=? LIMIT 1',[tickets[0].id]);
          if (customerRows.length) {
            try { await sendOrderEventEmail({email:customerRows[0].customer_email,name:customerRows[0].customer_name,orderId:customerRows[0].public_id,title:'Atualização do atendimento',description:(message || ('Status do chamado: '+status))}); } catch(emailError){ console.error('support/update email',emailError); }
          }
          return res.json({ ok:true });
        }
        if (action === 'support_create' || action === 'cancel_request' || action === 'return_request') {
          const publicId = String(req.body?.publicId || '').trim();
          const message = String(req.body?.message || '').trim().slice(0, 4000);
          const type = action === 'cancel_request' ? 'cancelamento' : action === 'return_request' ? 'devolucao' : String(req.body?.type || 'duvida').trim().slice(0,30);
          if (!publicId || !message) return res.status(400).json({ error: 'Informe o pedido e a mensagem.' });
          const [orders] = await db.execute('SELECT id,public_id,customer_name,customer_email,total_amount,status FROM fm_orders WHERE public_id=? AND user_id=? LIMIT 1',[publicId,auth.id]);
          if (!orders.length) return res.status(404).json({ error: 'Pedido não encontrado.' });
          const [existing] = await db.execute('SELECT id,public_id FROM fm_support_tickets WHERE order_id=? AND user_id=? AND status NOT IN ("resolved","closed") ORDER BY id DESC LIMIT 1',[orders[0].id,auth.id]);
          let ticket;
          if (existing.length) {
            ticket=existing[0];
            await db.execute('INSERT INTO fm_support_messages (ticket_id,author_type,author_id,message) VALUES (?,?,?,?)',[ticket.id,'customer',auth.id,message]);
          } else {
            const publicTicket='SUP-'+Date.now().toString(36).toUpperCase();
            const subject=type==='cancelamento'?'Solicitação de cancelamento':type==='devolucao'?'Solicitação de devolução':'Atendimento sobre o pedido';
            const [ins]=await db.execute('INSERT INTO fm_support_tickets (public_id,user_id,order_id,type,status,subject) VALUES (?,?,?,?,?,?)',[publicTicket,auth.id,orders[0].id,type,'open',subject]);
            ticket={id:ins.insertId,public_id:publicTicket};
            await db.execute('INSERT INTO fm_support_messages (ticket_id,author_type,author_id,message) VALUES (?,?,?,?)',[ticket.id,'customer',auth.id,message]);
          }
          try { await sendOrderEventEmail({email:orders[0].customer_email,name:orders[0].customer_name,orderId:orders[0].public_id,title:'Atendimento aberto',description:'Seu chamado '+ticket.public_id+' foi registrado. Nossa equipe poderá responder pelo pedido.'}); } catch(emailError){ console.error('support/create email',emailError); }
          return res.json({ok:true,ticketId:ticket.public_id});
        }
        if (action === 'support_reply') {
          const ticketId=String(req.body?.ticketId||'').trim(), message=String(req.body?.message||'').trim().slice(0,4000);
          if(!ticketId||!message)return res.status(400).json({error:'Informe o chamado e a mensagem.'});
          const [tickets]=await db.execute('SELECT id FROM fm_support_tickets WHERE public_id=? AND user_id=? LIMIT 1',[ticketId,auth.id]);
          if(!tickets.length)return res.status(404).json({error:'Chamado não encontrado.'});
          await db.execute('INSERT INTO fm_support_messages (ticket_id,author_type,author_id,message) VALUES (?,?,?,?)',[tickets[0].id,'customer',auth.id,message]);
          await db.execute('UPDATE fm_support_tickets SET status="open" WHERE id=? AND status="waiting_customer"',[tickets[0].id]);
          return res.json({ok:true});
        }
      }

    if (action === 'admin_tracking') {
        const admins = String(process.env.ADMIN_EMAILS || '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
        if (!admins.length || !admins.includes(String(auth.email || '').toLowerCase())) {
          return res.status(403).json({ error: 'Acesso administrativo não autorizado.' });
        }
        const publicId = String(req.body?.publicId || '').trim();
        const status = String(req.body?.status || '').trim().toLowerCase();
        const title = String(req.body?.title || '').trim();
        const description = String(req.body?.description || '').trim();
        const carrier = String(req.body?.carrier || '').trim().slice(0, 120);
        const trackingCode = String(req.body?.trackingCode || '').trim().slice(0, 80);
        const allowedStatuses = ['processing','ready_to_ship','shipped','in_transit','out_for_delivery','delivered'];
        if (!publicId || !allowedStatuses.includes(status) || !title) {
          return res.status(400).json({ error: 'Dados de expedição inválidos.' });
        }
        const [orders] = await db.execute('SELECT id,public_id,customer_name,customer_email FROM fm_orders WHERE public_id=? LIMIT 1', [publicId]);
        if (!orders.length) return res.status(404).json({ error: 'Pedido não encontrado.' });
        await db.execute(
          'INSERT INTO fm_order_tracking (order_id,status,title,description,tracking_code,carrier,event_at) VALUES (?,?,?,?,?,?,CURRENT_TIMESTAMP)',
          [orders[0].id,status,title,description || null,trackingCode || null,carrier || null]
        );
        try {
          await sendOrderEventEmail({ email: orders[0].customer_email, name: orders[0].customer_name, orderId: orders[0].public_id, title, description, trackingCode, carrier });
        } catch (emailError) {
          console.error('admin/tracking email', emailError);
        }
        return res.json({
          ok: true,
          event: { status, title, description: description || null, trackingCode: trackingCode || null, carrier: carrier || null }
        });
      }
      const productId = Number(req.body?.productId);
      if (!['add','remove','toggle'].includes(action) || !Number.isInteger(productId) || productId <= 0) {
        return res.status(400).json({ error: 'Favorito inválido.' });
      }
      const [product] = await db.execute('SELECT product_id FROM fm_catalog WHERE product_id=? AND active=1 LIMIT 1', [productId]);
      if (!product.length) return res.status(404).json({ error: 'Produto não encontrado.' });
      const [existing] = await db.execute('SELECT product_id FROM fm_favorites WHERE user_id=? AND product_id=? LIMIT 1', [auth.id, productId]);
      const shouldAdd = action === 'add' || (action === 'toggle' && !existing.length);
      if (shouldAdd) await db.execute('INSERT IGNORE INTO fm_favorites (user_id,product_id) VALUES (?,?)', [auth.id, productId]);
      else await db.execute('DELETE FROM fm_favorites WHERE user_id=? AND product_id=?', [auth.id, productId]);
      const [favorites] = await db.execute('SELECT product_id FROM fm_favorites WHERE user_id=? ORDER BY created_at DESC', [auth.id]);
      return res.json({ favorites: favorites.map(row => Number(row.product_id)), favorite: shouldAdd });
    }
    const [rows] = await db.execute('SELECT id,name,email,phone,email_verified,created_at,updated_at FROM users WHERE id = ? LIMIT 1', [auth.id]);
    if (!rows.length) return res.status(404).json({ error: 'Usuário não encontrado.' });
    const includes = String(req.query?.include || '').split(',').map(x => x.trim());
    const includeFavorites = includes.includes('favorites');
    const includeOrders = includes.includes('orders');
    const includeAdminOrders = includes.includes('admin-orders');
    const includeNotifications = includes.includes('notifications');
    const includeSupport = includes.includes('support');
    const includeAdminSupport = includes.includes('admin-support');
    const admins = String(process.env.ADMIN_EMAILS || '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
    const isAdmin = admins.includes(String(rows[0].email || '').toLowerCase());
    if (includeAdminSupport) {
      if (!isAdmin) return res.status(403).json({ error: 'Acesso administrativo não autorizado.' });
      const [tickets]=await db.execute(`SELECT t.id,t.public_id,t.type,t.status,t.subject,t.created_at,t.updated_at,o.public_id AS order_public_id,o.customer_name,o.customer_email
        FROM fm_support_tickets t INNER JOIN fm_orders o ON o.id=t.order_id ORDER BY t.updated_at DESC LIMIT 100`);
      const ids=tickets.map(t=>t.id);
      let messages=[];
      if(ids.length){ const [rows]=await db.execute(`SELECT ticket_id,author_type,message,created_at FROM fm_support_messages WHERE ticket_id IN (${ids.map(()=>'?').join(',')}) ORDER BY created_at ASC,id ASC`,ids); messages=rows; }
      const grouped=new Map(); for(const m of messages){if(!grouped.has(m.ticket_id))grouped.set(m.ticket_id,[]);grouped.get(m.ticket_id).push({author:m.author_type,message:m.message,date:m.created_at});}
      return res.json({user:rows[0],isAdmin:true,tickets:tickets.map(t=>({id:t.public_id,type:t.type,status:t.status,subject:t.subject,orderId:t.order_public_id,customerName:t.customer_name,customerEmail:t.customer_email,createdAt:t.created_at,updatedAt:t.updated_at,messages:grouped.get(t.id)||[]}))});
    }
    if (includeSupport) {
      const [tickets]=await db.execute(`SELECT t.id,t.public_id,t.type,t.status,t.subject,t.created_at,t.updated_at,o.public_id AS order_public_id
        FROM fm_support_tickets t INNER JOIN fm_orders o ON o.id=t.order_id WHERE t.user_id=? ORDER BY t.updated_at DESC LIMIT 50`,[auth.id]);
      const ids=tickets.map(t=>t.id); let messages=[];
      if(ids.length){const [rows]=await db.execute(`SELECT ticket_id,author_type,message,created_at FROM fm_support_messages WHERE ticket_id IN (${ids.map(()=>'?').join(',')}) ORDER BY created_at ASC,id ASC`,ids);messages=rows;}
      const grouped=new Map();for(const m of messages){if(!grouped.has(m.ticket_id))grouped.set(m.ticket_id,[]);grouped.get(m.ticket_id).push({author:m.author_type,message:m.message,date:m.created_at});}
      return res.json({user:rows[0],tickets:tickets.map(t=>({id:t.public_id,type:t.type,status:t.status,subject:t.subject,orderId:t.order_public_id,createdAt:t.created_at,updatedAt:t.updated_at,messages:grouped.get(t.id)||[]}))});
    }
    if (includeNotifications) {
      const [events] = await db.execute(
        `SELECT t.order_id,t.status,t.title,t.description,t.tracking_code,t.carrier,t.event_at,o.public_id
         FROM fm_order_tracking t INNER JOIN fm_orders o ON o.id=t.order_id
         WHERE o.user_id=? ORDER BY t.event_at DESC,t.id DESC LIMIT 30`, [auth.id]
      );
      return res.json({
        user: rows[0],
        notifications: events.map(e => ({
          orderId: e.public_id, status: e.status, title: e.title,
          description: e.description || null, trackingCode: e.tracking_code || null,
          carrier: e.carrier || null, date: e.event_at
        }))
      });
    }
    if (includeAdminOrders) {
      if (!isAdmin) return res.status(403).json({ error: 'Acesso administrativo não autorizado.' });
      const [adminOrders] = await db.execute(
        'SELECT id,public_id,total_amount,status,status_detail,mp_order_id,created_at,paid_at FROM fm_orders ORDER BY created_at DESC LIMIT 100'
      );
      if (!adminOrders.length) return res.json({ user: rows[0], isAdmin: true, orders: [] });
      const adminIds = adminOrders.map(o => o.id);
      const [adminTracking] = await db.execute(
        `SELECT order_id,status,title,description,tracking_code,carrier,event_at FROM fm_order_tracking WHERE order_id IN (${adminIds.map(() => '?').join(',')}) ORDER BY event_at DESC,id DESC`,
        adminIds
      );
      const latest = new Map();
      for (const e of adminTracking) if (!latest.has(e.order_id)) latest.set(e.order_id, e);
      return res.json({
        user: rows[0],
        isAdmin: true,
        orders: adminOrders.map(o => {
          const e = latest.get(o.id);
          return {
            id: o.public_id, total: Number(o.total_amount), paymentStatus: o.status,
            statusDetail: o.status_detail || null, mpOrderId: o.mp_order_id || null,
            date: o.created_at, paidAt: o.paid_at,
            shippingStatus: e?.status || 'processing',
            trackingCode: e?.tracking_code || null, carrier: e?.carrier || null,
            latestTracking: e ? { title: e.title, description: e.description || null, date: e.event_at } : null
          };
        })
      });
    }
    if (!includeOrders && !includeFavorites) return res.json({ user: rows[0], isAdmin });
    if (includeFavorites && !includeOrders) {
      const [favorites] = await db.execute('SELECT product_id FROM fm_favorites WHERE user_id=? ORDER BY created_at DESC', [auth.id]);
      return res.json({ user: rows[0], favorites: favorites.map(row => Number(row.product_id)) });
    }

    const [orders] = await db.execute(
      'SELECT id,public_id,total_amount,shipping_amount,payment_method,status,status_detail,mp_order_id,created_at,paid_at FROM fm_orders WHERE user_id=? ORDER BY created_at DESC LIMIT 100',
      [auth.id]
    );
    if (!orders.length) return res.json({ user: rows[0], orders: [] });

    const ids = orders.map(o => o.id);
    const [trackingRows] = await db.execute(
      `SELECT order_id,status,title,description,tracking_code,carrier,event_at FROM fm_order_tracking WHERE order_id IN (${ids.map(() => '?').join(',')}) ORDER BY event_at ASC,id ASC`,
      ids
    );
    const trackingGrouped = new Map();
    for (const event of trackingRows) {
      if (!trackingGrouped.has(event.order_id)) trackingGrouped.set(event.order_id, []);
      trackingGrouped.get(event.order_id).push({
        status: event.status, title: event.title, description: event.description || null,
        trackingCode: event.tracking_code || null, carrier: event.carrier || null, date: event.event_at
      });
    }
    const placeholders = ids.map(() => '?').join(',');
    const [items] = await db.execute(
      `SELECT order_id,product_id,product_name,unit_price,quantity,total_amount FROM fm_order_items WHERE order_id IN (${placeholders}) ORDER BY id ASC`,
      ids
    );
    const grouped = new Map();
    for (const item of items) {
      if (!grouped.has(item.order_id)) grouped.set(item.order_id, []);
      grouped.get(item.order_id).push({
        id: Number(item.product_id),
        n: item.product_name,
        p: Number(item.unit_price),
        qty: Number(item.quantity),
        total: Number(item.total_amount)
      });
    }
    const labels = {
      created: 'a-pagar',
      processing: 'preparando',
      action_required: 'a-pagar',
      processed: 'finalizado',
      canceled: 'cancelado',
      cancelled: 'cancelado',
      failed: 'cancelado',
      refunded: 'reembolso'
    };
    return res.json({
      user: rows[0],
      orders: orders.map(order => ({
        id: order.public_id,
        total: Number(order.total_amount),
        shipping: Number(order.shipping_amount),
        payment: order.payment_method,
        status: labels[String(order.status).toLowerCase()] || 'preparando',
        realStatus: order.status,
        statusDetail: order.status_detail || null,
        mercadoPagoOrderId: order.mp_order_id || null,
        paidAt: order.paid_at,
        date: order.created_at,
        items: grouped.get(order.id) || [],
        tracking: trackingGrouped.get(order.id) || []
      }))
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Não foi possível carregar a conta.' });
  }
};
