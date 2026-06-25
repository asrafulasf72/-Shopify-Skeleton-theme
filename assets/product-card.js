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

  disconnectedCallback() {
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = null;
    }
  }

  cacheElements() {
    this.swiperEl       = this.querySelector(PRODUCT_CARD_SELECTORS.swiperEl);
    this.sliderControls = this.querySelector(PRODUCT_CARD_SELECTORS.sliderControls);
    this.prevButton     = this.querySelector(PRODUCT_CARD_SELECTORS.previousButton);
    this.nextButton     = this.querySelector(PRODUCT_CARD_SELECTORS.nextButton);
    this.dots           = Array.from(this.querySelectorAll(PRODUCT_CARD_SELECTORS.dots));
    this.addToCartForm  = this.querySelector(PRODUCT_CARD_SELECTORS.addToCartForm);
  }

  initSwiper() {
    if (this.swiper) return;

    this.swiper = new Swiper(this.swiperEl, {
      slidesPerView: 1,
      loop:          false,
      threshold:     8,
      grabCursor:    true,

      // ── Wire the existing product-card arrows ──────────────
      navigation: {
        prevEl: this.prevButton,
        nextEl: this.nextButton,
      },

      on: {
        afterInit:   (swiper) => {
          this.syncDots(swiper.activeIndex);
          this.syncDotsDirection(swiper.activeIndex, swiper.activeIndex);
          this.updateFlyToCartImage(swiper);
        },
        slideChange: (swiper) => {
          this.syncDots(swiper.activeIndex);
          this.syncDotsDirection(swiper.previousIndex, swiper.activeIndex);
          this.syncVideoPlayback(swiper);
          this.updateFlyToCartImage(swiper);
        },
      },
    });

}

if (!customElements.get('product-card')) {
  customElements.define('product-card', ProductCard);
}