document.addEventListener('DOMContentLoaded', function () {
  const sections = document.querySelectorAll('[data-section-type="recommendations"]');

  sections.forEach(function (sectionEl) {
    const productsContainer = sectionEl.querySelector('.nv-product-list__products');
    if (!productsContainer) return;

    const sectionId = productsContainer.getAttribute('data-section-id');
    const productId = productsContainer.getAttribute('data-product-id');
    const limit = productsContainer.getAttribute('data-limit');
    const baseUrl = productsContainer.getAttribute('data-url');

    if (!productId || !baseUrl) return;

    const url = `${baseUrl}?section_id=${sectionId}&product_id=${productId}&limit=${limit}&intent=related`;
});