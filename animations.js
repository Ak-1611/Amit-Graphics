/* ==========================================================================
   ANIMATIONS — Lenis smooth scroll + GSAP ScrollTrigger reveals
   Everything here is wrapped defensively: if a library fails to load,
   the page still works and content is still visible (see .reveal CSS,
   which is only hidden once the 'js' class + GSAP confirm control).
   ========================================================================== */
document.documentElement.classList.add('js');

/* ---- Lenis smooth scroll -------------------------------------------- */
let lenis;
if (typeof Lenis !== 'undefined') {
  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  if (typeof gsap !== 'undefined' && gsap.ticker) {
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }
}

/* ---- GSAP scroll reveals ---------------------------------------------- */
if (typeof gsap !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (lenis) {
    lenis.on('scroll', ScrollTrigger.update);
  }

  document.querySelectorAll('.reveal').forEach((el, i) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: reduceMotion ? 0.01 : 0.9,
      ease: 'power3.out',
      delay: reduceMotion ? 0 : (i % 4) * 0.08,
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true
      }
    });
  });

  // Header shrink/blur state
  const header = document.querySelector('.site-header');
  if (header) {
    ScrollTrigger.create({
      start: 'top -60',
      end: 99999,
      onUpdate: (self) => {
        header.classList.toggle('is-scrolled', self.scroll() > 60);
      }
    });
  }

  // Hero copy parallax-in on load
  const heroCopy = document.querySelector('.hero-copy');
  if (heroCopy) {
    gsap.from(heroCopy.children, {
      y: 40,
      opacity: 0,
      duration: 1,
      stagger: 0.12,
      ease: 'power3.out',
      delay: 0.3
    });
  }

  // Stat counters
  document.querySelectorAll('[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const counter = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.to(counter, {
          val: end,
          duration: reduceMotion ? 0.01 : 1.6,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = Math.floor(counter.val) + suffix;
          }
        });
      }
    });
  });

  // Contact cards: 3D tilt-in on scroll, then a continuous ambient float
  gsap.utils.toArray('.contact-card').forEach((card, i) => {
    gsap.from(card, {
      y: 60,
      opacity: 0,
      rotateX: -8,
      duration: reduceMotion ? 0.01 : 0.9,
      delay: reduceMotion ? 0 : i * 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        once: true,
        onComplete: () => {
          if (reduceMotion) return;
          gsap.to(card, {
            y: '-=14',
            duration: 2.6 + i * 0.3,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1
          });
        }
      }
    });
  });

  // Portfolio grid stagger
  gsap.utils.toArray('.portfolio-item').forEach((item, i) => {
    gsap.from(item, {
      opacity: 0,
      y: 30,
      duration: reduceMotion ? 0.01 : 0.6,
      delay: reduceMotion ? 0 : (i % 6) * 0.07,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: item,
        start: 'top 92%',
        once: true
      }
    });
  });
} else {
  // GSAP unavailable — make sure reveal content is still visible
  document.querySelectorAll('.reveal').forEach((el) => {
    el.style.opacity = 1;
    el.style.transform = 'none';
  });
}
