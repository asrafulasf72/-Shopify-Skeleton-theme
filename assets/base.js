class LenisManager {
  constructor() {
    this.init();
  }

  init() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced) {
      window.lenis = new Lenis({
        autoRaf: true,
        smoothWheel: true,
        gestureOrientation: 'vertical',
        prevent: (node) =>
          !!(
            node.closest('[data-lenis-prevent]') ||
            node.closest('dialog') ||
            document.documentElement.classList.contains('lenis-stop')
          ),
        anchors: true,
        duration: 1.5,
      });
    }

    this.addLenisPrevent();
    this.observeAppBlocks();
  }

  addLenisPrevent(root = document) {
    root.querySelectorAll('.shopify-block.shopify-app-block:not([data-lenis-prevent])').forEach((el) => {
      el.setAttribute('data-lenis-prevent', '');
    });
  }

  observeAppBlocks() {
    new MutationObserver((mutations) => {
      mutations.forEach((m) =>
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (node.matches('.shopify-block.shopify-app-block')) node.setAttribute('data-lenis-prevent', '');
          this.addLenisPrevent(node);
        })
      );
    }).observe(document.body, { childList: true, subtree: true });
  }
}

class AnnouncementBarManager {
  constructor() {
    this.selector = '.nv-marque';
    this.init();
  }

  setHeight() {
    const bar = document.querySelector(this.selector);
    const height = bar && bar.offsetParent !== null ? bar.offsetHeight : 0;
    document.documentElement.style.setProperty('--nv-announcement-height', height + 'px');
  }

  init() {
    this.setHeight();
    window.addEventListener('resize', () => this.setHeight(), { passive: true });

    const bar = document.querySelector(this.selector);
    if (bar) {
      new MutationObserver(() => this.setHeight()).observe(bar, {
        attributes: true,
        attributeFilter: ['style', 'class'],
        childList: true,
        subtree: false,
      });
    }

    new MutationObserver(() => this.setHeight()).observe(document.body, {
      childList: true,
      subtree: false,
    });

    if (window.Shopify?.designMode) {
      ['shopify:section:load', 'shopify:section:unload', 'shopify:section:select',
        'shopify:section:deselect', 'shopify:section:reorder',
      ].forEach((evt) => document.addEventListener(evt, () => this.setHeight()));
    }
  }
}

class ArrowAnimationManager {
  constructor() {
    this.selectors = ['.exit-left', '.exit-right', '.exit-up', '.exit-down'];
    this.init();
  }

  bindArrow(el) {
    if (el.dataset.arrowBound) return;
    el.dataset.arrowBound = 'true';

    let cooldown = false;
    el.addEventListener('mouseenter', () => {
      if (cooldown) return;
      cooldown = true;
      el.classList.add('animating');
      el.addEventListener('animationend', () => {
        el.classList.remove('animating');
        setTimeout(() => (cooldown = false), 100);
      }, { once: true });
    });
  }

  init(root = document) {
    root.querySelectorAll(this.selectors.join(',')).forEach((el) => this.bindArrow(el));
  }
}