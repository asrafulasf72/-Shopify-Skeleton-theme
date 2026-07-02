(function () {
    'use strict';

    /** -- UTILITIES -- */

    function getFocusable(container) {
        return Array.from(
            container.querySelectorAll(
                'a[herf], button:not([disabled]), input:not([disabled]), ' +
                'select:not([disabled]), textarea:not([disabled])', +
            '[tabindex]:not([tabindex="-1"])'
            )
        ).filter(function (el) {
            return !el.closest('[aria-hidden="true"]') && el.offsetParent !== null;
        });
    }
    function createFocusTrap(panel) {
        function handleKeydown(e) {
            if (e.key !== 'Tab') return;
            let focusable = getFocusable(panel);
            if (!focusable.length) { e.preventDefault(); return; }
            let first = focusable[0];
            let last = focusable[focusable.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }

        return {
            activate: function () {
                panel.addEventListener('keydown', handleKeydown);
                let focusable = getFocusable(panel);
                if (focusable.length) focusable[0].focus();
            },
            deactivate: function () {
                panel.removeEventListener('keydown', handleKeydown);
            }
        };
    }

      /* STICKY HEADER */
  (function initSticky() {
    let header = document.getElementById('nv-header');
    if (!header || header.dataset.sticky !== 'true') return;

    let section = header.closest('.section-header');
    if (section) section.style.position = 'sticky';

    function handleScroll() {
      header.classList.toggle('is-scrolled', window.scrollY > 4);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  })();

    /* --- SHARED STATE --- */
  let mobileMenu = document.getElementById('nv-mobile-menu');
  let overlay = document.querySelector('[data-overlay]');
  let localeDrawer = document.getElementById('nv-locale-drawer');
  let localeTrigger = document.querySelector('[data-locale-toggle]');
  let dim = document.querySelector('[data-locale-dim]');
  let toggleBtns = document.querySelectorAll('[data-mobile-toggle]');

  let mobileTrap = mobileMenu ? createFocusTrap(mobileMenu) : null;
  let localeTrap = localeDrawer ? createFocusTrap(localeDrawer) : null;

    /* --- LOCALE DRAWER -- */
  function showLocaleView(viewName) {
    if (!localeDrawer) return;

    const views = localeDrawer.querySelectorAll('[data-view]');
    views.forEach(function (view) {
      const isTarget = view.getAttribute('data-view') === viewName;
      view.setAttribute('aria-hidden', String(!isTarget));
      view.style.display = isTarget ? 'flex' : 'none';
    });

    localeDrawer.setAttribute('data-locale-view', viewName);

    // Focus the first meaningful element in the new view
    const activeView = localeDrawer.querySelector('[data-view="' + viewName + '"]');
    if (activeView) {
      const firstFocusable = activeView.querySelector('button:not([disabled]), a[href], input:not([disabled])');
      if (firstFocusable) setTimeout(() => firstFocusable.focus(), 50);
    }
  }

    function openLocaleDrawer() {
    if (!localeDrawer) return;
    localeDrawer.classList.add('is-open');
    localeDrawer.setAttribute('aria-hidden', 'false');
    if (localeTrigger) localeTrigger.setAttribute('aria-expanded', 'true');
    if (dim) dim.classList.add('is-visible');

    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('lenis-stop');
    if (window.lenis) window.lenis.stop();
    showLocaleView('main');

    if (localeTrap) localeTrap.activate();
    setTimeout(() => localeDrawer.focus(), 100);
  }
  function closeLocaleDrawer() {
    if (!localeDrawer) return;
    if (localeTrap) localeTrap.deactivate();
    localeDrawer.classList.remove('is-open');
    localeDrawer.setAttribute('aria-hidden', 'true');
    if (localeTrigger) localeTrigger.setAttribute('aria-expanded', 'false');
    if (dim) dim.classList.remove('is-visible');

    // Only unlock scroll if mobile menu is also closed
    if (!mobileMenu || !mobileMenu.classList.contains('is-open')) {
      document.body.style.overflow = '';
      document.documentElement.classList.remove('lenis-stop');
      if (window.lenis) window.lenis.start();
    }

    if (localeTrigger) localeTrigger.focus();
  }

    /* -- MOBILE MENU -- */
  function openMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    if (overlay) overlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('lenis-stop');
    if (window.lenis) window.lenis.stop();
    toggleBtns.forEach(function (btn) { btn.setAttribute('aria-expanded', 'true'); });
    if (mobileTrap) mobileTrap.activate();
  }

    function closeMobileMenu() {
    if (!mobileMenu) return;
    if (mobileTrap) mobileTrap.deactivate();
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    if (overlay) overlay.classList.remove('is-visible');
    // Only unlock scroll if localization drawer is also closed
    if (!localeDrawer || !localeDrawer.classList.contains('is-open')) {
      document.body.style.overflow = '';
      document.documentElement.classList.remove('lenis-stop');
      if (window.lenis) window.lenis.start();
    }
    toggleBtns.forEach(function (btn) { btn.setAttribute('aria-expanded', 'false'); });
  }

    /* -- MOBILE MENU EVENTS --- */
  (function initMobileMenu() {
    if (!mobileMenu) return;

    toggleBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        mobileMenu.classList.contains('is-open') ? closeMobileMenu() : openMobileMenu();
      });
    });

    let closeBtn = document.querySelector('[data-mobile-close]');
    if (closeBtn) closeBtn.addEventListener('click', closeMobileMenu);

    if (overlay) {
      overlay.addEventListener('click', function () {
        // Cart drawer manages its own overlay — let cart-drawer.liquid handle it
        let cartDrawer = document.getElementById('nv-cart-drawer');
        if (cartDrawer && cartDrawer.classList.contains('is-open')) {
          return;
        }

        // Search drawer: close it, then hide overlay (was: incorrectly re-added is-visible)
        let searchDrawer = document.getElementById('nv-search-drawer');
        if (searchDrawer && searchDrawer.classList.contains('is-open')) {
          searchDrawer.classList.remove('is-open');
          searchDrawer.setAttribute('aria-hidden', 'true');
          setTimeout(function () {
            if (dim) dim.classList.remove('is-visible');
            if (overlay) overlay.classList.remove('is-visible');
          }, 450);
          return;
        }

        // Locale drawer: close it; overlay will auto-hide (was: incorrectly re-added is-visible)
        if (localeDrawer && localeDrawer.classList.contains('is-open')) {
          closeLocaleDrawer();
          if (overlay) overlay.classList.remove('is-visible');
          return;
        }

        // Product page collapsible drawer (size guide, accordion, store location)
        let collapsibleDrawer = document.getElementById('nv-collapsible-drawer');
        if (collapsibleDrawer && collapsibleDrawer.classList.contains('open')) {
          collapsibleDrawer.classList.remove('open');
          collapsibleDrawer.setAttribute('aria-hidden', 'true');
          if (overlay) overlay.classList.remove('is-visible');
          // Unlock scroll if no other drawer is open
          let anyOtherOpen = document.querySelector(
            '#nv-cart-drawer.is-open, #nv-mobile-menu.is-open, #nv-locale-drawer.is-open, #nv-search-drawer.is-open, #nv-drawer.open'
          );
          if (!anyOtherOpen) {
            document.body.style.overflow = '';
            document.documentElement.classList.remove('lenis-stop');
            if (window.lenis) window.lenis.start();
          }
          return;
        }

        // Product page ask-question / store-location drawer
        let simpleDrawer = document.getElementById('nv-drawer');
        if (simpleDrawer && simpleDrawer.classList.contains('open')) {
          simpleDrawer.classList.remove('open');
          simpleDrawer.setAttribute('aria-hidden', 'true');
          if (overlay) overlay.classList.remove('is-visible');
          let anyOtherOpen = document.querySelector(
            '#nv-cart-drawer.is-open, #nv-mobile-menu.is-open, #nv-locale-drawer.is-open, #nv-search-drawer.is-open, #nv-collapsible-drawer.open'
          );
          if (!anyOtherOpen) {
            document.body.style.overflow = '';
            document.documentElement.classList.remove('lenis-stop');
            if (window.lenis) window.lenis.start();
          }
          return;
        }

        // Default: mobile menu
        closeMobileMenu();
      });
    }
 
  })();
})