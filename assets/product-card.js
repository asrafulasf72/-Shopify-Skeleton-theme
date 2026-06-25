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

    // ── Dot clicks → Swiper.slideTo ───────────────────────────
    this.dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        this.swiper?.slideTo(Number(dot.dataset.slideIndex || 0));
      });
    });
  }

  // ── Helpers ────────────────────────────────────────────────

  syncDots(activeIndex) {
    this.dots.forEach((dot, i) => {
      const isActive = i === activeIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  // Mirrors the existing CSS data-direction trick from base.css
  syncDotsDirection(prevIndex, nextIndex) {
    const dotsContainer = this.sliderControls?.querySelector('.product-slider-dots');
    if (!dotsContainer) return;
    dotsContainer.dataset.direction = nextIndex > prevIndex ? 'next' : 'prev';
    void dotsContainer.offsetHeight; // force reflow so transform-origin updates
  }

  syncVideoPlayback(swiper) {
    swiper.slides.forEach((slide, i) => {
      const video = slide.querySelector('video');
      if (!video) return;
      if (i === swiper.activeIndex) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }

  updateFlyToCartImage(swiper) {
    if (!(this.addToCartForm instanceof HTMLFormElement)) return;
    const activeSlide = swiper.slides[swiper.activeIndex];
    const img = activeSlide?.querySelector('img');
    const src = img?.currentSrc || img?.getAttribute('src') || this.defaultFlyToCartImage;
    if (src) this.addToCartForm.dataset.flyToCartImage = src;
  }
}

if (!customElements.get('product-card')) {
  customElements.define('product-card', ProductCard);
}