/* FlashMarket catalog compatibility layer.
 * Keeps the single catalog available to legacy modules that read window.FM_PRODUCTS.
 * Safe to load after interno.js.
 */
(function(){
  function expose(){
    try {
      if (typeof FM_PRODUCTS !== 'undefined' && Array.isArray(FM_PRODUCTS)) {
        window.FM_PRODUCTS = FM_PRODUCTS;
        window.FM_CATALOG_VERSION = '2026.09.30';
        window.dispatchEvent(new CustomEvent('flashmarket:catalog-ready', {detail:{count:FM_PRODUCTS.length}}));
        return true;
      }
    } catch (error) {
      console.warn('[FlashMarket] catálogo indisponível:', error);
    }
    return false;
  }
  if (!expose()) setTimeout(expose, 0);
})();
