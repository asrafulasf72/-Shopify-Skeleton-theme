(function () {


class ProductSwatch extends HTMLElement {
  connectedCallback() {
    this.addEventListener('click', this._onClick.bind(this));
  }

  disconnectedCallback() {
   
    this.removeEventListener('click', this._onClick);
  }

  _onClick() {

    this.dispatchEvent(new CustomEvent('swatch-change', {
      bubbles: true,        
      composed: false,    
      detail: {
        variantId:        this.dataset.variantId,
        price:            this.dataset.variantPrice,
        compareAtPrice:   this.dataset.variantCompareAtPrice,
        available:        this.dataset.variantAvailable === 'true',
        mediaId:          this.dataset.variantMediaId,
        swatchEl:         this 
      }
    }));
  }
}

customElements.define('product-swatch', ProductSwatch);

class ProductCard extends HTMLElement {
  connectedCallback() {
    
    this.addEventListener('swatch-change', this._onSwatchChange.bind(this));

    
    this.addEventListener('click', this._onClick.bind(this));
  }

  disconnectedCallback() {
    this.removeEventListener('swatch-change', this._onSwatchChange);
    this.removeEventListener('click', this._onClick);
  }

  _onSwatchChange(e) {
    const { variantId, price, compareAtPrice, available, mediaId, swatchEl } = e.detail;

    
    this.querySelectorAll('product-swatch').forEach(s => s.classList.remove('is-active'));
    swatchEl.classList.add('is-active');

    
    const variantInput = this.querySelector('[data-variant-input]');
    if (variantInput && variantId) variantInput.value = variantId;

    
    const priceContainer = this.querySelector('[data-product-price]');
    if (priceContainer) {
      const currentEl = priceContainer.querySelector('[data-price-current]');
      const compareEl = priceContainer.querySelector('[data-price-compare]');
      if (currentEl && price) {
        currentEl.textContent = price;
        currentEl.className   = compareAtPrice
          ? 'product-card__price--sale'
          : 'product-card__price--regular';
      }
      if (compareEl) {
        const showCompare = compareAtPrice && compareAtPrice !== price;
        compareEl.textContent   = showCompare ? compareAtPrice : '';
        compareEl.style.display = showCompare ? '' : 'none';
      }
    }

    
    const btn = this.querySelector('.product-card__button');
    if (btn) {
      btn.disabled = !available;
      btn.textContent = available ? 'Add to cart' : 'Out of stock';
      btn.classList.toggle('product-card__button--out-stock', !available);
    }

    
    if (mediaId) {
  const section = this.closest('[data-media-type]');
  const mediaType = section ? section.dataset.mediaType : 'hover';

  if (mediaType === 'click') {
    // Click mode: slide গুলো data-media-id দিয়ে match করো
    const slides = Array.from(this.querySelectorAll('.product-card__click-slide'));
    const dots   = Array.from(this.querySelectorAll('.product-card__dot'));

    // target slide খোঁজো — data-media-id attribute দিয়ে
    let targetIndex = slides.findIndex(s => s.dataset.mediaId == mediaId);

    // না পেলে প্রথম slide দেখাও
    if (targetIndex < 0) targetIndex = 0;

    slides.forEach((s, i) => s.classList.toggle('is-active', i === targetIndex));
    dots.forEach((d, i)   => d.classList.toggle('is-active', i === targetIndex));

  } else {
    // Hover mode: আগের মতোই কাজ করবে
    this.querySelectorAll('.product-card__image').forEach(img => {
      img.classList.remove('product-card__image--primary', 'is-active');
      img.classList.add('product-card__image--secondary');
    });
    const target = this.querySelector(`[data-media-id="${mediaId}"]`);
    if (target) {
      target.classList.remove('product-card__image--secondary');
      target.classList.add('product-card__image--primary', 'is-active');
    }
  }
}
  }

  _onClick(e) {
  const addBtn = e.target.closest('.product-card__button');
  if (!addBtn || addBtn.classList.contains('product-card__button--out-stock')) return;

  const form = addBtn.closest('form');
  if (!form) return;

  e.preventDefault(); // সবসময় prevent করো, startViewTransition check সরাও

  const variantId = form.querySelector('[data-variant-input]')?.value
                 || form.querySelector('[name="id"]')?.value;
  const quantity = form.querySelector('[name="quantity"]')?.value || 1;

  if (variantId && window.addToCart) {
    window.addToCart(variantId, quantity, addBtn);
  }
}
}

customElements.define('product-card', ProductCard);


class QuickViewModal extends HTMLElement {
  _cache = {};
  _currentSlide = 0;

  connectedCallback() {
    this._loading = this.querySelector('.qv-loading');
    this._content = this.querySelector('.qv-content');


    this.addEventListener('click', this._onOverlayClick.bind(this));


    this._openHandler = (e) => this.open(e.detail.handle);
    document.addEventListener('quick-view:open', this._openHandler);

 
    this._keyHandler = (e) => { if (e.key === 'Escape') this.close(); };
    document.addEventListener('keydown', this._keyHandler);
  }

  disconnectedCallback() {
    
    document.removeEventListener('quick-view:open', this._openHandler);
    document.removeEventListener('keydown', this._keyHandler);
  }

  open(handle) {
    document.body.style.overflow = 'hidden';
    this.removeAttribute('hidden');
    this.classList.remove('is-closing');
    this._showLoading();

    if (this._cache[handle]) {
      this._render(this._cache[handle]);
    } else {
      fetch('/products/' + handle + '.js')
        .then(r => r.json())
        .then(data => { this._cache[handle] = data; this._render(data); })
        .catch(() => this._showError());
    }
  }

  close() {
    if (this.hidden) return;
    this.classList.add('is-closing');
    setTimeout(() => {
      this.setAttribute('hidden', '');
      this.classList.remove('is-closing');
      document.body.style.overflow = '';
    }, 210);
  }

  _showLoading() {
    this._loading.removeAttribute('hidden');
    this._content.setAttribute('hidden', '');
    this._content.innerHTML = '';
  }

  _showError() {
    this._loading.setAttribute('hidden', '');
    this._content.removeAttribute('hidden');
    this._content.innerHTML =
      '<p style="padding:2rem;color:rgba(15,15,15,0.5);text-align:center;">Could not load product. Please try again.</p>';
  }

  _onOverlayClick(e) {
    
    if (e.target.closest('[data-qv-close]')) {
      this.close();
      return;
    }
 
  }



  _render(product) {
    this._currentSlide = 0;

    let optionsHTML = '';
    let colorOptionIndex = -1;

    product.options.forEach((opt, idx) => {
      const name = opt.name.toLowerCase();
      const isColor = name.includes('color') || name.includes('colour');
      if (isColor) colorOptionIndex = idx;

      if (isColor) {
        const uniqueColors = [...new Set(product.variants.map(v => v.options[idx]))];
        const swatchBtns = uniqueColors.map((col, i) => {
          const vari = product.variants.find(v => v.options[idx] === col);
          return `<button
            class="qv-swatch-btn ${i === 0 ? 'is-active' : ''}"
            data-option-index="${idx}"
            data-option-value="${this._esc(col)}"
            data-variant-id="${vari ? vari.id : ''}"
            style="background-color:${this._esc(col)};"
            aria-label="${this._esc(col)}"></button>`;
        }).join('');
        optionsHTML += `<div class="qv-option-block" data-option-index="${idx}">
          <p class="qv-option-label">${this._esc(opt.name)} — <strong data-option-display="${idx}">${this._esc(uniqueColors[0])}</strong></p>
          <div class="qv-swatch-grid">${swatchBtns}</div></div>`;
      } else {
        const values = [...new Set(product.variants.map(v => v.options[idx]))];
        const sizeBtns = values.map((val, i) => {
          const vari = product.variants.find(v => v.options[idx] === val);
          return `<button class="qv-size-btn ${i === 0 ? 'is-active' : ''}"
            data-option-index="${idx}" data-option-value="${this._esc(val)}"
            ${vari && !vari.available ? 'disabled' : ''}>${this._esc(val)}</button>`;
        }).join('');
        optionsHTML += `<div class="qv-option-block" data-option-index="${idx}">
          <p class="qv-option-label">${this._esc(opt.name)} — <strong data-option-display="${idx}">${this._esc(values[0])}</strong></p>
          <div class="qv-size-grid">${sizeBtns}</div></div>`;
      }
    });

    const images = product.images.slice(0, 8);
    const slidesHTML = images.length
      ? images.map(img => `<div class="qv-gallery-slide"><img src="${img}" alt="${this._esc(product.title)}" loading="lazy"></div>`).join('')
      : `<div class="qv-gallery-slide qv-gallery-placeholder"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(15,15,15,0.2)" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg></div>`;

    const dotsHTML = images.map((_, i) =>
      `<button class="qv-gallery-dot ${i === 0 ? 'is-active' : ''}" data-slide="${i}" aria-label="Image ${i + 1}"></button>`
    ).join('');

    const v0 = product.variants[0];
    const price = this._money(v0.price);
    const compareAt = v0.compare_at_price;
    let priceHTML = '', discountBadge = '';
    if (compareAt && compareAt > v0.price) {
      const pct = Math.round((1 - v0.price / compareAt) * 100);
      priceHTML = `<span class="qv-price-sale">${price}</span><span class="qv-price-compare">${this._money(compareAt)}</span>`;
      discountBadge = `<span class="qv-badge-discount">${pct}% off</span>`;
    } else {
      priceHTML = `<span class="qv-price-regular">${price}</span>`;
    }

    const navBtns = images.length > 1 ? `
      <button class="qv-gallery-nav qv-gallery-nav--prev" data-qv-prev aria-label="Previous image">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button class="qv-gallery-nav qv-gallery-nav--next" data-qv-next aria-label="Next image">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>` : '';

    const descText = product.description
      ? product.description.replace(/<[^>]+>/g, '').substring(0, 180) + (product.description.length > 180 ? '…' : '')
      : '';

    this._content.innerHTML = `
      <div class="qv-gallery">
        <div class="qv-gallery-track" data-qv-track>${slidesHTML}</div>
        ${navBtns}
        ${images.length > 1 ? `<div class="qv-gallery-dots">${dotsHTML}</div>` : ''}
      </div>
      <div class="qv-info">
        ${product.vendor ? `<p class="qv-vendor">${this._esc(product.vendor)}</p>` : ''}
        <h2 class="qv-title">${this._esc(product.title)}</h2>
        <div class="qv-price-row" data-qv-price>${priceHTML}${discountBadge}</div>
        <div class="qv-divider"></div>
        ${optionsHTML}
        ${descText ? `<p class="qv-description">${descText}</p>` : ''}
        <div class="qv-actions">
          <input type="hidden" data-qv-variant-input value="${v0.id}">
          ${v0.available
            ? `<button class="qv-add-btn" data-qv-add-cart>Add to cart</button>`
            : `<button class="qv-add-btn" disabled>Out of stock</button>`}
          <a href="${product.url}" class="qv-view-link">View full details →</a>
        </div>
      </div>`;

    this._loading.setAttribute('hidden', '');
    this._content.removeAttribute('hidden');
    this._bindModalEvents(product);
  }

  _bindModalEvents(product) {
    // All queries scoped to this._content — never the whole document
    this._content.addEventListener('click', (e) => {
      if (e.target.closest('[data-qv-prev]')) { this._goSlide(this._currentSlide - 1); return; }
      if (e.target.closest('[data-qv-next]')) { this._goSlide(this._currentSlide + 1); return; }

      const dot = e.target.closest('.qv-gallery-dot');
      if (dot) { this._goSlide(parseInt(dot.dataset.slide)); return; }

      const sizeBtn = e.target.closest('.qv-size-btn');
      if (sizeBtn && !sizeBtn.disabled) {
        const block = sizeBtn.closest('.qv-option-block');
        block.querySelectorAll('.qv-size-btn').forEach(b => b.classList.remove('is-active'));
        sizeBtn.classList.add('is-active');
        const label = block.querySelector('[data-option-display]');
        if (label) label.textContent = sizeBtn.dataset.optionValue;
        this._updateVariant(product);
        return;
      }

      const swatchBtn = e.target.closest('.qv-swatch-btn');
      if (swatchBtn) {
        const block = swatchBtn.closest('.qv-option-block');
        block.querySelectorAll('.qv-swatch-btn').forEach(b => b.classList.remove('is-active'));
        swatchBtn.classList.add('is-active');
        const label = block.querySelector('[data-option-display]');
        if (label) label.textContent = swatchBtn.dataset.optionValue;
        this._updateVariant(product);
        return;
      }

      if (e.target.closest('[data-qv-add-cart]')) {
        const variantInput = this._content.querySelector('[data-qv-variant-input]');
        if (variantInput) this._addToCart(variantInput.value, e.target.closest('[data-qv-add-cart]'));
      }
    });
  }

  _goSlide(idx) {
    const slides = this._content.querySelectorAll('.qv-gallery-slide');
    if (!slides.length) return;
    const count = slides.length;
    idx = ((idx % count) + count) % count;
    this._currentSlide = idx;
    const track = this._content.querySelector('[data-qv-track]');
    if (track) track.style.transform = `translateX(${-idx * 100}%)`;
    this._content.querySelectorAll('.qv-gallery-dot').forEach((d, i) =>
      d.classList.toggle('is-active', i === idx)
    );
  }

  _updateVariant(product) {
    const selectedOptions = [...this._content.querySelectorAll('.qv-option-block')]
      .map(block => block.querySelector('.is-active')?.dataset.optionValue ?? null);

    const matched = product.variants.find(v =>
      selectedOptions.every((val, i) => val === null || v.options[i] === val)
    );
    if (!matched) return;

    const variantInput = this._content.querySelector('[data-qv-variant-input]');
    if (variantInput) variantInput.value = matched.id;

    const priceRow = this._content.querySelector('[data-qv-price]');
    if (priceRow) {
      const price = this._money(matched.price);
      const compareAt = matched.compare_at_price;
      if (compareAt && compareAt > matched.price) {
        const pct = Math.round((1 - matched.price / compareAt) * 100);
        priceRow.innerHTML = `<span class="qv-price-sale">${price}</span>
          <span class="qv-price-compare">${this._money(compareAt)}</span>
          <span class="qv-badge-discount">${pct}% off</span>`;
      } else {
        priceRow.innerHTML = `<span class="qv-price-regular">${price}</span>`;
      }
    }

    const addBtn = this._content.querySelector('[data-qv-add-cart]');
    if (addBtn) {
      addBtn.disabled = !matched.available;
      addBtn.textContent = matched.available ? 'Add to cart' : 'Out of stock';
    }

    if (matched.featured_image) {
      const imgIndex = product.images.findIndex(src =>
        src.split('?')[0] === matched.featured_image.src.split('?')[0]
      );
      if (imgIndex >= 0) this._goSlide(imgIndex);
    }
  }

  _addToCart(variantId, btn) {
     if (window.addToCart) {
    window.addToCart(variantId, 1, btn);
    return;
  }
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Adding…';
    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: variantId, quantity: 1 })
    })
    .then(r => r.json())
    .then(() => {
      btn.textContent = '✓ Added!';
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = original;
        document.dispatchEvent(new CustomEvent('cart:refresh'));
      }, 1800);
    })
    .catch(() => { btn.disabled = false; btn.textContent = original; });
  }

  _money(cents) {
    if (!cents && cents !== 0) return '';
    return new Intl.NumberFormat(document.documentElement.lang || 'en', {
      style: 'currency',
      currency: window.Shopify?.currency?.active || 'USD',
      minimumFractionDigits: 2
    }).format(cents / 100);
  }

  _esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

customElements.define('quick-view-modal', QuickViewModal);

document.addEventListener('click', (e) => {
  const qvBtn = e.target.closest('.product-card__quick-view');
  if (qvBtn) {
    e.preventDefault();
    document.dispatchEvent(new CustomEvent('quick-view:open', {
      detail: { handle: qvBtn.dataset.productHandle }
    }));
  }
});

})();