/* =========================================================
   FLASHMARKET — CONSULTA DOS PEDIDOS GERADOS NO NAVEGADOR
   Permite pesquisar por número do pedido ou código de rastreio.
========================================================= */
(function () {
  'use strict';

  function readOrders() {
    try {
      const value = JSON.parse(localStorage.getItem('flashmarket_orders') || '[]');
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function money(value) {
    return Number(value || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('pt-BR');
  }

  function dynamicOrder(order) {
    const total = Number(order.total || 0);
    const tracking = order.trackingCode || order.tracking?.code || 'Aguardando geração';
    const items = Array.isArray(order.items) ? order.items : [];
    const created = formatDate(order.date);

    const events = [
      {
        titulo: 'Pedido confirmado',
        descricao: 'Pagamento aprovado na simulação e pedido registrado pela FlashMarket.',
        data: created,
        hora: '—',
        local: 'FlashMarket'
      },
      {
        titulo: 'Pedido separado',
        descricao: 'Os produtos serão separados e preparados para envio.',
        data: 'Próxima etapa',
        hora: '—',
        local: 'Centro de distribuição FlashMarket'
      },
      {
        titulo: 'Em transporte',
        descricao: 'Após a postagem, o pedido seguirá para a transportadora.',
        data: 'Aguardando envio',
        hora: '—',
        local: 'Centro de distribuição'
      },
      {
        titulo: 'Entrega',
        descricao: 'Entrega no endereço informado no checkout.',
        data: 'Após postagem',
        hora: '—',
        local: order.address?.city ? `${order.address.city}/${order.address.state || ''}` : 'Endereço do destinatário'
      }
    ];

    return {
      numero: order.id,
      rastreio: tracking,
      transportadora: order.tracking?.carrier || 'Flash Express',
      status: order.statusLabel || 'Pagamento aprovado (simulação)',
      statusAtual: 'Pedido confirmado',
      descricao: 'Seu pedido foi criado e o código de rastreio foi gerado. A próxima atualização acontecerá quando o pedido avançar para envio.',
      progresso: 25,
      etapa: 1,
      previsao: 'Após postagem',
      endereco: [
        order.address?.address,
        order.address?.complement,
        order.address?.city && order.address?.state ? `${order.address.city}/${order.address.state}` : order.address?.city,
        order.address?.cep ? `CEP ${order.address.cep}` : ''
      ].filter(Boolean).join('<br>'),
      produtos: items.map(item => ({
        nome: item.n || item.name || 'Produto',
        quantidade: Number(item.qty || item.quantity || 1),
        preco: money(Number(item.p || item.price || 0))
      })),
      eventos,
      total
    };
  }

  function findOrder(code) {
    const normalized = String(code || '').trim().toUpperCase();
    return readOrders().find(order => {
      const id = String(order.id || '').toUpperCase();
      const tracking = String(order.trackingCode || order.tracking?.code || '').toUpperCase();
      return normalized === id || normalized === tracking;
    });
  }

  function showDynamicOrder(order) {
    if (typeof window.renderizarPedido === 'function') {
      window.renderizarPedido(dynamicOrder(order));
      localStorage.setItem('flashmarket_ultimo_pedido', order.id);
      return true;
    }
    return false;
  }

  function init() {
    const original = document.getElementById('trackingForm');
    if (!original) return;

    /* Remove o listener antigo sem alterar o visual do formulário. */
    const form = original.cloneNode(true);
    original.replaceWith(form);

    const input = form.querySelector('#trackingCode');

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      const code = input.value.trim().toUpperCase();
      if (!code) { if (typeof window.mostrarErro === 'function') window.mostrarErro(); return; }
      if (window.loadingState) window.loadingState.classList.remove('hidden');
      try {
        const base = window.FLASHMARKET_API_BASE || (location.hostname.endsWith('github.io') ? 'https://koramarketplace.vercel.app' : '');
        const response = await fetch(base + '/api/payments/status?order=' + encodeURIComponent(code), { cache: 'no-store' });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Pedido não encontrado.');
        const o = data.order || {};
        const labels = {
          paid: ['Pagamento confirmado', 'O pagamento foi confirmado. O pedido está registrado e aguardando processamento logístico.', 25, 1],
          pending: ['Pagamento pendente', 'O pagamento ainda está em processamento. O status será atualizado automaticamente.', 10, 1],
          action_required: ['Ação necessária', 'O Mercado Pago solicitou uma ação para concluir o pagamento.', 10, 1],
          failed: ['Pagamento recusado', 'O pagamento não foi concluído.', 0, 0],
          cancelled: ['Pedido cancelado', 'O pagamento/pedido foi cancelado.', 0, 0],
          refunded: ['Pagamento reembolsado', 'O pagamento consta como reembolsado.', 0, 0]
        };
        const info = labels[o.paymentStatus] || labels.pending;
        if (window.loadingState) window.loadingState.classList.add('hidden');
        window.renderizarPedido({
          numero: o.id, rastreio: 'Ainda não gerado', transportadora: 'Aguardando postagem',
          status: info[0], statusAtual: info[0], descricao: info[1], progresso: info[2], etapa: info[3],
          previsao: 'Após postagem', endereco: 'Disponível nos detalhes do pedido na sua conta.',
          produtos: [], eventos: [{ titulo: info[0], descricao: info[1], data: new Date(o.createdAt || Date.now()).toLocaleDateString('pt-BR'), hora: '—', local: 'FlashMarket / Mercado Pago' }],
          total: Number(o.total || 0)
        });
        localStorage.setItem('flashmarket_ultimo_pedido', code);
      } catch (error) {
        if (window.loadingState) window.loadingState.classList.add('hidden');
        if (typeof window.mostrarErro === 'function') window.mostrarErro();
      }
    });

    form.querySelectorAll('[data-example]').forEach(button => {
      button.addEventListener('click', function () {
        input.value = button.dataset.example || '';
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });
    });

    const last = localStorage.getItem('flashmarket_last_order');
    const lastOrder = (() => {
      try { return JSON.parse(last || 'null'); } catch { return null; }
    })();

    if (lastOrder?.trackingCode) {
      input.value = lastOrder.trackingCode;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
