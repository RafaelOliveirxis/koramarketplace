/* FLASHMARKET — rastreamento real de pedidos */
(function () {
  'use strict';
  function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-BR');
  }
  function init() {
    const original = document.getElementById('trackingForm');
    if (!original) return;
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
          pending: ['Pagamento pendente', 'O pagamento ainda está em processamento.', 10, 1],
          action_required: ['Ação necessária', 'É necessária uma ação para concluir o pagamento.', 10, 1],
          failed: ['Pagamento não concluído', 'O pagamento não foi concluído.', 0, 0],
          cancelled: ['Pedido cancelado', 'O pagamento/pedido foi cancelado.', 0, 0],
          refunded: ['Pagamento reembolsado', 'O pagamento consta como reembolsado.', 0, 0]
        };
        const info = labels[o.paymentStatus] || labels.pending;
        const hasShipping = Boolean(o.trackingCode);
        const events = Array.isArray(o.tracking) && o.tracking.length
          ? o.tracking.map(event => ({
              titulo: event.title || info[0],
              descricao: event.description || '',
              data: formatDate(event.date),
              hora: '—',
              local: event.carrier || 'FlashMarket'
            }))
          : [{ titulo: info[0], descricao: info[1], data: formatDate(o.createdAt), hora: '—', local: 'FlashMarket / Mercado Pago' }];

        if (window.loadingState) window.loadingState.classList.add('hidden');
        window.renderizarPedido({
          numero: o.id,
          rastreio: o.trackingCode || 'Ainda não gerado',
          transportadora: o.carrier || 'Aguardando postagem',
          status: hasShipping ? (o.tracking?.at(-1)?.title || info[0]) : info[0],
          statusAtual: hasShipping ? (o.tracking?.at(-1)?.title || 'Em preparação') : info[0],
          descricao: hasShipping ? 'O pedido possui dados logísticos reais registrados pela loja.' : info[1],
          progresso: hasShipping ? 50 : info[2],
          etapa: hasShipping ? 2 : info[3],
          previsao: hasShipping ? 'Acompanhe os próximos eventos de envio' : 'Após postagem',
          endereco: 'Disponível nos detalhes do pedido na sua conta.',
          produtos: [],
          eventos,
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
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();