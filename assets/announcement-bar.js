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
        startAutoplay();
      }

      if (autoplayEnabled) startAutoplay();
    }
  }
});