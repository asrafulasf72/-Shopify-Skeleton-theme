document.addEventListener('DOMContentLoaded', function () {
  const slides = document.querySelectorAll('.nv-announcement-bar-slide');
  const nextBtn = document.querySelector('.nv-announcement-bar-arrow--next');
  const prevBtn = document.querySelector('.nv-announcement-bar-arrow--prev');

  if (slides.length) {
    slides[0].classList.add('is-active');

    if (slides.length <= 1) {
      if (nextBtn) nextBtn.style.display = 'none';
      if (prevBtn) prevBtn.style.display = 'none';
    } else {
      let current = 0;
      let autoplay;

      function goToSlide(nextIndex) {
        if (nextIndex === current) return;
        const currentSlide = slides[current];
        const nextSlide = slides[nextIndex];
        currentSlide.classList.remove('is-active');
        currentSlide.classList.add('is-exit');
        nextSlide.classList.add('is-active');
        setTimeout(() => { currentSlide.classList.remove('is-exit'); }, 600);
        current = nextIndex;
      }

      function nextSlide() {
        let next = current + 1;
        if (next >= slides.length) next = 0;
        goToSlide(next);
      }

      function prevSlide() {
        let prev = current - 1;
        if (prev < 0) prev = slides.length - 1;
        goToSlide(prev);
      }

      if (nextBtn) nextBtn.addEventListener('click', function () { nextSlide(); restartAutoplay(); });
      if (prevBtn) prevBtn.addEventListener('click', function () { prevSlide(); restartAutoplay(); });

      const bar = document.querySelector('.nv-announcement-bar');
      const autoplayEnabled = bar && bar.dataset.autoplay === 'true';
      const autoplaySpeed = bar ? parseInt(bar.dataset.autoplaySpeed) * 1000 : 5000;

      function startAutoplay() {
        autoplay = setInterval(nextSlide, autoplaySpeed);
      }

      function restartAutoplay() {
        clearInterval(autoplay);
        if (autoplayEnabled) {
          startAutoplay();
        }
      }

      if (autoplayEnabled) startAutoplay();
    }
  }

  /*  Locale panel  */
  const localeBtn = document.querySelector('.nv-announcement-bar-locale');
  const localePanel = document.getElementById('nv-locale-panel');
  const localeMain = document.getElementById('nv-locale-main');
  const langBtn = document.getElementById('nv-lang-btn');
  const langPanel = document.getElementById('nv-lang-panel');
  const currencyBtn = document.getElementById('nv-currency-btn');
  const currencyPanel = document.getElementById('nv-currency-panel');

  function isSubPanelOpen() {
    return !langPanel.hidden || !currencyPanel.hidden;
  }

  function showMain() {
    localeMain.hidden = false;
    langPanel.hidden = true;
    currencyPanel.hidden = true;
    if (langBtn) langBtn.classList.remove('is-active');
    if (currencyBtn) currencyBtn.classList.remove('is-active');
  }

  function closeAll() {
    localePanel.hidden = true;
    showMain();
    if (localeBtn) localeBtn.setAttribute('aria-expanded', 'false');
  }

  if (localeBtn && localePanel) {
    localeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      const isOpen = localeBtn.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeAll();
      } else {
        localePanel.hidden = false;
        showMain();
        localeBtn.setAttribute('aria-expanded', 'true');
      }
    });
  }

  if (langBtn) {
    langBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      const isOpen = !langPanel.hidden;
      if (isOpen) {
        showMain();
      } else {
        localeMain.hidden = true;
        langPanel.hidden = false;
        currencyPanel.hidden = true;
        langBtn.classList.add('is-active');
        currencyBtn.classList.remove('is-active');
      }
    });
  }

  if (currencyBtn) {
    currencyBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      const isOpen = !currencyPanel.hidden;
      if (isOpen) {
        showMain();
      } else {
        localeMain.hidden = true;
        currencyPanel.hidden = false;
        langPanel.hidden = true;
        currencyBtn.classList.add('is-active');
        langBtn.classList.remove('is-active');
      }
    });
  }

  document.addEventListener('click', function (e) {
    const bar = document.querySelector('.nv-announcement-bar');
    if (bar && !bar.contains(e.target)) {
      closeAll();
    }
  });
});