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

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const code = input.value.trim().toUpperCase();
      if (!code) {
        if (typeof window.mostrarErro === 'function') window.mostrarErro();
        return;
      }

      const dynamic = findOrder(code);
      if (dynamic) {
        if (window.loadingState) window.loadingState.classList.add('hidden');
        showDynamicOrder(dynamic);
        return;
      }

      /* Mantém os códigos demonstrativos antigos funcionando. */
      if (typeof window.consultarPedido === 'function') {
        window.consultarPedido(code);
      } else if (typeof window.mostrarErro === 'function') {
        window.mostrarErro();
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
