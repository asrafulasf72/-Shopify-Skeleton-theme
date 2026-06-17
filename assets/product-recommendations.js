document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-section-type="recommendations"]').forEach(initRecommendations);
});

['shopify:section:load', 'shopify:section:select', 'shopify:section:reorder'].forEach(eventName => {
  document.addEventListener(eventName, function (e) {
    const sectionEl = e.target.querySelector('[data-section-type="recommendations"]');
    if (sectionEl) initRecommendations(sectionEl);
  });
});

function initRecommendations(sectionEl) {
  const productsContainer = sectionEl.querySelector('.nv-product-list__products');
  if (!productsContainer) return;

  const sectionId = productsContainer.getAttribute('data-section-id');
  const productId = productsContainer.getAttribute('data-product-id');
  const limit = productsContainer.getAttribute('data-limit');
  const baseUrl = productsContainer.getAttribute('data-url');

  if (!productId || !baseUrl) return;

  const url = `${baseUrl}?section_id=${sectionId}&product_id=${productId}&limit=${limit}&intent=related`;

  fetch(url)
    .then(res => res.text())
    .then(text => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');

      const newSection = doc.querySelector('[data-section-type="recommendations"]');
      const newProducts = doc.getElementById('recommendations-' + sectionId);

      if (
        !newSection ||
        newSection.getAttribute('data-empty') === 'true' ||
        !newProducts ||
        newProducts.children.length === 0
      ) {
        sectionEl.setAttribute('data-empty', 'true');
        return;
      }

      productsContainer.innerHTML = newProducts.innerHTML;
      productsContainer.setAttribute('aria-busy', 'false');
      sectionEl.removeAttribute('data-empty');

      if (window.nvProductListController && typeof window.nvProductListController.initAll === 'function') {
        window.nvProductListController.initAll();
      }
    })
    .catch(err => {
      console.error('Recommendation fetch error:', err);
      sectionEl.setAttribute('data-empty', 'true');
    });
}