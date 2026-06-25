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

class ProductCard extends HTMLElement {
  constructor() {
    super();
    this.swiper              = null;
    this.defaultFlyToCartImage = '';
  }

  connectedCallback() {
    this.cacheElements();

    if (!(this.swiperEl instanceof HTMLElement)) return;

    const slideCount = this.swiperEl.querySelectorAll('.swiper-slide').length;

    if (slideCount < 2) {
      if (this.sliderControls) this.sliderControls.hidden = true;
      return;
    }

    if (this.sliderControls) this.sliderControls.hidden = false;
    this.defaultFlyToCartImage = this.addToCartForm?.dataset.flyToCartImage || '';

    runWhenSwiperReady(() => this.initSwiper());
}

if (!customElements.get('product-card')) {
  customElements.define('product-card', ProductCard);
}