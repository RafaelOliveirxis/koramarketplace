(function (root, factory) {
  const coupons = factory();
  if (typeof module === 'object' && module.exports) module.exports = coupons;
  if (root) root.FlashMarketCoupons = coupons;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const coupons = [
    { code: 'FLASH10', title: '10% OFF', description: 'Desconto extra em compras a partir de R$ 99.', type: 'percent', value: 10, minimum: 99 },
    { code: 'FRETEGRATIS', title: 'FRETE GRÁTIS', description: 'Frete econômico grátis em pedidos a partir de R$ 149.', type: 'free_shipping', value: 0, minimum: 149 },
    { code: 'BEMVINDO15', title: '15% OFF', description: 'Economize 15% em compras a partir de R$ 129.', type: 'percent', value: 15, minimum: 129 },
    { code: 'FLASH20', title: 'R$ 20 OFF', description: 'Desconto de R$ 20 em compras a partir de R$ 199.', type: 'fixed', value: 20, minimum: 199 },
    { code: 'TECNO10', title: '10% OFF', description: 'Desconto extra em compras a partir de R$ 99.', type: 'percent', value: 10, minimum: 99 },
    { code: 'CASA15', title: '15% OFF', description: 'Desconto de 15% em compras a partir de R$ 149.', type: 'percent', value: 15, minimum: 149 },
    { code: 'ECONOMIZE10', title: '10% OFF', description: 'Oferta especial em compras a partir de R$ 79.', type: 'percent', value: 10, minimum: 79 },
    { code: 'FLASH5', title: '5% OFF', description: 'Um desconto extra em compras a partir de R$ 49.', type: 'percent', value: 5, minimum: 49 },
    { code: 'SUPER25', title: 'R$ 25 OFF', description: 'Desconto de R$ 25 em compras a partir de R$ 249.', type: 'fixed', value: 25, minimum: 249 },
    { code: 'COMBO30', title: 'R$ 30 OFF', description: 'Desconto de R$ 30 em compras a partir de R$ 349.', type: 'fixed', value: 30, minimum: 349 }
  ].map(coupon => Object.freeze({
    ...coupon,
    startsAt: '2026-10-01T00:00:00-03:00',
    validUntil: '2026-12-31T23:59:59-03:00'
  }));
  const byCode = new Map(coupons.map(coupon => [coupon.code, coupon]));
  const currency = value => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  function isActive(coupon, now = new Date()) {
    return now.getTime() >= Date.parse(coupon.startsAt) && now.getTime() <= Date.parse(coupon.validUntil);
  }

  function evaluate(code, subtotal, now = new Date()) {
    const normalizedCode = String(code || '').trim().toUpperCase();
    const coupon = byCode.get(normalizedCode);
    if (!coupon) {
      return { valid: false, code: normalizedCode, discount: 0, freeShipping: false, message: 'Cupom não encontrado. Confira o código e tente novamente.' };
    }
    if (!isActive(coupon, now)) {
      return { valid: false, code: normalizedCode, discount: 0, freeShipping: false, message: 'Este cupom não está mais ativo.' };
    }
    const amount = Number(subtotal);
    if (!Number.isFinite(amount) || amount < coupon.minimum) {
      return {
        valid: false,
        code: normalizedCode,
        discount: 0,
        freeShipping: false,
        message: `Este cupom exige uma compra mínima de ${currency(coupon.minimum)}.`
      };
    }
    const discount = coupon.type === 'percent'
      ? Number((amount * coupon.value / 100).toFixed(2))
      : coupon.type === 'fixed' ? Math.min(amount, coupon.value) : 0;
    const benefit = coupon.type === 'free_shipping' ? 'frete grátis' : `${coupon.title} aplicado`;
    return {
      valid: true,
      code: normalizedCode,
      coupon,
      discount,
      freeShipping: coupon.type === 'free_shipping',
      message: `Cupom ${normalizedCode}: ${benefit}.`
    };
  }

  return Object.freeze({
    listActive(now = new Date()) {
      return coupons.filter(coupon => isActive(coupon, now));
    },
    get(code) {
      return byCode.get(String(code || '').trim().toUpperCase()) || null;
    },
    evaluate,
    formatCurrency: currency,
    formatExpiry(date) {
      const [year, month, day] = date.slice(0, 10).split('-').map(Number);
      return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
    }
  });
});
