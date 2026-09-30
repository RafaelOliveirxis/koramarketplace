/* =========================================================
   FLASHMARKET — RASTREIO AUTOMÁTICO DE PEDIDOS
   Modo atual: demonstração/localStorage.
   Cada compra aprovada recebe um código único de rastreio.
========================================================= */
(function () {
  'use strict';

  const originalSetItem = Storage.prototype.setItem;

  function createTrackingCode(orderId) {
    const raw = String(orderId || '') + Date.now() + Math.random();
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash) + raw.charCodeAt(i);
      hash |= 0;
    }
    const digits = String(Math.abs(hash)).padStart(9, '0').slice(-9);
    return 'FM' + digits + 'BR';
  }

  function enrich(order) {
    if (!order || typeof order !== 'object') return order;
    if (!order.trackingCode) order.trackingCode = createTrackingCode(order.id);
    order.tracking = {
      code: order.trackingCode,
      carrier: order.tracking?.carrier || 'Flash Express',
      status: order.tracking?.status || 'Pedido confirmado'
    };
    return order;
  }

  function showTrackingOnSuccess(order) {
    setTimeout(() => {
      const number = document.getElementById('orderNumber');
      const success = document.getElementById('success');
      if (!number || !order?.trackingCode) return;
      number.innerHTML = `Pedido ${order.id}<br><small style="display:block;margin-top:8px;font-size:13px;font-weight:700;opacity:.85">Código de rastreio: ${order.trackingCode}</small>`;
      if (success) success.dataset.trackingCode = order.trackingCode;
    }, 0);
  }

  Storage.prototype.setItem = function (key, value) {
    let savedOrder = null;
    try {
      if (key === 'flashmarket_orders') {
        const orders = JSON.parse(value || '[]');
        if (Array.isArray(orders)) value = JSON.stringify(orders.map(enrich));
      }
      if (key === 'flashmarket_last_order') {
        const order = JSON.parse(value || 'null');
        if (order) {
          savedOrder = enrich(order);
          value = JSON.stringify(savedOrder);
        }
      }
    } catch (error) {
      console.warn('[FlashMarket] Não foi possível adicionar o rastreio:', error);
    }

    const result = originalSetItem.call(this, key, value);
    if (key === 'flashmarket_last_order' && savedOrder) showTrackingOnSuccess(savedOrder);
    return result;
  };
})();
