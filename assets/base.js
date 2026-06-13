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