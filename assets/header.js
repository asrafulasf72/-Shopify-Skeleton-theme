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

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
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
        if (localeDrawer && localeDrawer.classList.contains('is-open')) {
          closeLocaleDrawer();
          return;
        }
        if (mobileMenu && mobileMenu.classList.contains('is-open')) closeMobileMenu();
      }
    });

    /* Accordion submenus */
    mobileMenu.addEventListener('click', function (e) {
      let btn = e.target.closest('[data-submenu-toggle]');
      if (!btn) return;
      let panelId = btn.getAttribute('aria-controls');
      let panel = panelId && document.getElementById(panelId);
      if (!panel) return;

      let isExpanded = btn.getAttribute('aria-expanded') === 'true';

      /* Close siblings */
      let parentList = btn.closest('ul, nav');
      if (parentList) {
        parentList.querySelectorAll(':scope > li > [data-submenu-toggle]').forEach(function (sibling) {
          if (sibling === btn) return;
          let sibId = sibling.getAttribute('aria-controls');
          let sibPanel = sibId && document.getElementById(sibId);
          if (sibPanel) {
            sibling.setAttribute('aria-expanded', 'false');
            sibPanel.classList.remove('is-open');
            sibPanel.setAttribute('aria-hidden', 'true');
            sibPanel.querySelectorAll('[data-submenu-toggle]').forEach(function (gc) {
              gc.setAttribute('aria-expanded', 'false');
              let gcId = gc.getAttribute('aria-controls');
              let gcPanel = gcId && document.getElementById(gcId);
              if (gcPanel) {
                gcPanel.classList.remove('is-open');
                gcPanel.setAttribute('aria-hidden', 'true');
              }
            });
          }
        });
      }

      btn.setAttribute('aria-expanded', String(!isExpanded));
      panel.classList.toggle('is-open', !isExpanded);
      panel.setAttribute('aria-hidden', String(isExpanded));
    });
  })();

  /* --- LOCALE DRAWER EVENTS --- */
  (function initLocaleDrawer() {
    if (!localeTrigger || !localeDrawer) return;

    localeTrigger.addEventListener('click', function () {
      localeDrawer.classList.contains('is-open') ? closeLocaleDrawer() : openLocaleDrawer();
    });

    let closeBtns = document.querySelectorAll('[data-locale-close]');
    closeBtns.forEach(btn => btn.addEventListener('click', closeLocaleDrawer));

    if (dim) dim.addEventListener('click', closeLocaleDrawer);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && localeDrawer.classList.contains('is-open')) {
        closeLocaleDrawer();
      }
    });

    localeDrawer.addEventListener('click', function (e) {
      let gotoBtn = e.target.closest('[data-locale-goto]');
      if (gotoBtn) { showLocaleView(gotoBtn.getAttribute('data-locale-goto')); return; }
      let backBtn = e.target.closest('[data-locale-back]');
      if (backBtn) showLocaleView('main');
    });
  })();

  /* ---- DESKTOP NAV DROPDOWNS --- */
  (function initDesktopNav() {

    function setNavInteractiveState(panel, isHidden) {
      if (!panel) return;
      let interactiveEls = panel.querySelectorAll('a, button');
      interactiveEls.forEach(function (el) {
        el.setAttribute('aria-hidden', isHidden ? 'true' : 'false');
        if (isHidden) {
          el.setAttribute('tabindex', '-1');
        } else {
          el.removeAttribute('tabindex');
        }
      });
    }

    function openPanel(toggle, panel) {
      toggle.setAttribute('aria-expanded', 'true');
      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');
      setNavInteractiveState(panel, false);
    }

    function closePanel(toggle, panel) {
      toggle.setAttribute('aria-expanded', 'false');
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
      setNavInteractiveState(panel, true);
    }

    function closeAll() {
      document.querySelectorAll('[data-nav-toggle]').forEach(function (toggle) {
        let id = toggle.getAttribute('aria-controls');
        let panel = id && document.getElementById(id);
        if (panel && panel.classList.contains('is-open')) closePanel(toggle, panel);
      });
    }

    document.querySelectorAll('[data-nav-toggle]').forEach(function (toggle) {
      let panelId = toggle.getAttribute('aria-controls');
      let panel = panelId && document.getElementById(panelId);
      if (panel) setNavInteractiveState(panel, true);
    });

    document.querySelectorAll('[data-nav-toggle]').forEach(function (toggle) {
      let panelId = toggle.getAttribute('aria-controls');
      let panel = panelId && document.getElementById(panelId);
      let item = toggle.closest('[data-nav-item]');
      if (!panel || !item) return;

      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        let isOpen = panel.classList.contains('is-open');
        closeAll();
        if (!isOpen) openPanel(toggle, panel);
      });

      toggle.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          let isOpen = panel.classList.contains('is-open');
          closeAll();
          if (!isOpen) openPanel(toggle, panel);
        }
        if (e.key === 'Escape') { closePanel(toggle, panel); toggle.focus(); }
      });

      panel.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { closePanel(toggle, panel); toggle.focus(); }
      });

      item.addEventListener('focusout', function (e) {
        if (!item.contains(e.relatedTarget)) closePanel(toggle, panel);
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('[data-nav-item]')) closeAll();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAll();
    });
  })();

  /* --- MEGA MENU --- */
  (function initMegaMenu() {
    let HOVER_DELAY = 120;

    document.querySelectorAll('[data-mega-panel]').forEach(function (panel) {
      setMegaInteractiveState(panel, true);
    });

    function setMegaInteractiveState(panel, isHidden) {
      if (!panel) return;
      let interactiveEls = panel.querySelectorAll('a, button');
      interactiveEls.forEach(function (el) {
        el.setAttribute('aria-hidden', isHidden ? 'true' : 'false');
        if (isHidden) {
          el.setAttribute('tabindex', '-1');
        } else {
          el.removeAttribute('tabindex');
        }
      });
    }

    function closeAllMega() {
      document.querySelectorAll('[data-mega-item]').forEach(function (item) {
        let panel = item.querySelector('[data-mega-panel]');
        let toggle = item.querySelector('[data-mega-toggle]');
        if (!panel) return;
        panel.classList.remove('is-open');
        panel.setAttribute('aria-hidden', 'true');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
        setMegaInteractiveState(panel, true);
      });
    }

    function openMega(item) {
      let panel = item.querySelector('[data-mega-panel]');
      let toggle = item.querySelector('[data-mega-toggle]');
      if (!panel) return;
      closeAllMega();
      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');
      if (toggle) toggle.setAttribute('aria-expanded', 'true');
      setMegaInteractiveState(panel, false);

      let swiperEl = panel.querySelector('.nv-mega-featured-swiper');
      if (swiperEl && swiperEl.swiper) {
        setTimeout(function () {
          swiperEl.swiper.update();
          if (typeof swiperEl._updateNavState === 'function') {
            swiperEl._updateNavState();
          }
        }, 50);
      }
    }

    function closeMega(item) {
      let panel = item.querySelector('[data-mega-panel]');
      let toggle = item.querySelector('[data-mega-toggle]');
      if (!panel) return;
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      setMegaInteractiveState(panel, true);


      panel.querySelectorAll('.nv-mega-menu-cat-link, .nv-mega-menu-brand-link').forEach(function (el) {
        el.style.animation = 'none';
        el.offsetHeight;
        el.style.animation = '';
      });

      panel.querySelectorAll('.nv-mega-menu-col-featured .swiper-slide').forEach(function (el) {
        el.style.animation = 'none';
        el.offsetHeight;
        el.style.animation = '';
      });
    }

    document.querySelectorAll('[data-mega-item]').forEach(function (item) {
      let leaveTimer = null;

      item.addEventListener('mouseenter', function () {
        clearTimeout(leaveTimer);
        openMega(item);
      });

      item.addEventListener('mouseleave', function () {
        leaveTimer = setTimeout(function () { closeMega(item); }, HOVER_DELAY);
      });

      let panel = item.querySelector('[data-mega-panel]');
      if (panel) {
        panel.addEventListener('mouseenter', function () { clearTimeout(leaveTimer); });
        panel.addEventListener('mouseleave', function () {
          leaveTimer = setTimeout(function () { closeMega(item); }, HOVER_DELAY);
        });
      }

      let toggle = item.querySelector('[data-mega-toggle]');
      if (toggle) {
        toggle.addEventListener('click', function (e) {
          e.stopPropagation();
          let isOpen = panel && panel.classList.contains('is-open');
          isOpen ? closeMega(item) : openMega(item);
        });
      }

      item.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          closeMega(item);
          let link = item.querySelector('.nv-nav-link');
          if (link) link.focus();
        }
      });

      item.addEventListener('focusout', function (e) {
        if (!item.contains(e.relatedTarget)) closeMega(item);
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('[data-mega-item]')) closeAllMega();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAllMega();
    });

    /* ── Swiper for mega menu Product lists ── */
    function initMegaSwipers() {
      if (typeof Swiper === 'undefined') return;
      document.querySelectorAll('.nv-mega-featured-swiper').forEach(function (el) {
        if (el._swiperInitialized) return;
        el._swiperInitialized = true;

        let col = el.closest('.nv-mega-menu-col-featured');
        let prevBtn = col ? col.querySelector('.nv-feat-prev') : null;
        let nextBtn = col ? col.querySelector('.nv-feat-next') : null;
        let dots = col ? col.querySelectorAll('.nv-mega-menu-dot') : [];

        let swiper = new Swiper(el, {
          slidesPerView: 1,
          speed: 400,
          loop: false,
          on: {
            slideChange: function () {
              let dotsWrapper = col ? col.querySelector('.nv-mega-menu-dots') : null;
              if (dotsWrapper) {
                let dir = swiper.activeIndex > swiper.previousIndex ? 'next' : 'prev';
                dotsWrapper.setAttribute('data-direction', dir);
              }
              dots.forEach(function (d, i) {
                d.classList.toggle('is-active', i === swiper.activeIndex);
              });
              updateNavState();
            }
          }
        });

        function updateNavState() {
          if (prevBtn) prevBtn.classList.toggle('is-disabled', swiper.isBeginning);
          if (nextBtn) nextBtn.classList.toggle('is-disabled', swiper.isEnd);
        }

        updateNavState();

        el._updateNavState = updateNavState;

        if (prevBtn) prevBtn.addEventListener('click', function () {
          if (!swiper.isBeginning) swiper.slidePrev();
        });
        if (nextBtn) nextBtn.addEventListener('click', function () {
          if (!swiper.isEnd) swiper.slideNext();
        });
      });
    }

    document.querySelectorAll('[data-mega-item]').forEach(function (item) {
      item.addEventListener('mouseenter', initMegaSwipers, { once: true });
    });
  })();

  (function initAccountModal() {
    const toggle = document.querySelector('[data-acct-toggle]');
    const modal = document.getElementById('nv-login-modal');
    if (!toggle || !modal) return;

    const modalClose = document.getElementById('nv-modal-close');
    const modalNextBtn = document.getElementById('nv-modal-next');
    const modalEmailInput = document.getElementById('nv-modal-email');

    const open = () => {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
    };

    const close = () => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.contains('is-open') ? close() : open();
    });

    modalClose?.addEventListener('click', close);

    document.addEventListener('click', (e) => {
      if (
        modal.classList.contains('is-open') &&
        !modal.contains(e.target) &&
        !toggle.contains(e.target)
      ) close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
    });

    if (modalNextBtn && modalEmailInput) {
      const loginUrl = modalNextBtn.dataset.loginUrl || '/account/login';

      const submit = () => {
        const email = modalEmailInput.value.trim();
        if (!email || !modalEmailInput.validity.valid) { modalEmailInput.focus(); return; }
        window.location.href = `${loginUrl}?email=${encodeURIComponent(email)}`;
      };

      modalNextBtn.addEventListener('click', submit);
      modalEmailInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); submit(); }
      });
    }
  })();

    // Magnet effect for header icons
  (function () {
    let STRENGTH = 0.40;

    document.querySelectorAll('.nv-header-slot-right .nv-icon-btn').forEach(function (btn) {
      let inner = btn.querySelector('.nv-mag-inner');
      if (!inner) return;

      let rect;

      btn.addEventListener('mouseenter', function () {
        rect = btn.getBoundingClientRect();
      });

      btn.addEventListener('mousemove', function (e) {
        let dx = e.clientX - (rect.left + rect.width / 2);
        let dy = e.clientY - (rect.top + rect.height / 2);
        inner.style.transform = 'translate(' + (dx * STRENGTH) + 'px, ' + (dy * STRENGTH) + 'px)';
      });

      btn.addEventListener('mouseleave', function () {
        inner.style.transform = 'translate(0px, 0px)';
      });
    });
  })();

    (function () {
    const PIXELS_PER_SECOND = 200;

    function setMarqueeSpeed() {
      document.querySelectorAll('.nv-mega-menu-marquee-track').forEach(function (track) {
        const width = track.scrollWidth;
        track.style.animationDuration = (width / PIXELS_PER_SECOND) + 's';
      });
    }

    setMarqueeSpeed();
    window.addEventListener('resize', setMarqueeSpeed);
  })();
  /* ---  Menu Overflow control --- */
  (function initSubmenuOverflow() {
    function checkAndFlip(submenu) {
      if (!submenu) return;
      submenu.classList.remove('nv-flip-left');
      let rect = submenu.getBoundingClientRect();
      let viewportWidth = document.documentElement.clientWidth;
      if (rect.right > viewportWidth) {
        submenu.classList.add('nv-flip-left');
      }
    }

    let items = document.querySelectorAll(
      '.nv-nav-item-has-children, .nv-nav-dropdown-item-has-children'
    );

    items.forEach(function (item) {
      let submenu = item.querySelector(':scope > .nv-nav-dropdown, :scope > .nv-nav-flyout');
      if (!submenu) return;

      item.addEventListener('mouseenter', function () {
        checkAndFlip(submenu);
      });

      let toggle = item.querySelector(':scope > .nv-nav-parent-wrap [data-nav-toggle]');
      if (toggle) {
        toggle.addEventListener('click', function () {
          setTimeout(function () { checkAndFlip(submenu); }, 0);
        });
      }
    });

    window.addEventListener('resize', function () {
      document.querySelectorAll('.nv-flip-left').forEach(function (el) {
        el.classList.remove('nv-flip-left');
      });
    });
  })();
})