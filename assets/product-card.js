const PRODUCT_CARD_SELECTORS = {
  swiperEl:       '.nv-product-card-swiper',
  sliderControls: '.product-slider-controls',
  previousButton: '[data-slider-prev]',
  nextButton:     '[data-slider-next]',
  dots:           '[data-slider-dot]',
  addToCartForm:  'form[action*="/cart/add"]',
};

function runWhenSwiperReady(callback, attempts) {
  attempts = attempts || 0;
  if (window.Swiper) { callback(); return; }
  if (attempts > 40) return;
  window.setTimeout(function () { runWhenSwiperReady(callback, attempts + 1); }, 100);
}


if (!customElements.get('product-card')) {
  customElements.define('product-card', ProductCard);
}