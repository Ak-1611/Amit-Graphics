/* ==========================================================================
   MAIN — site-wide interactions
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {

  /* ---- Preloader ------------------------------------------------------ */
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => preloader.classList.add('is-hidden'), 400);
    });
    // Safety net: never let the loader block the site if 'load' is slow/stuck
    setTimeout(() => preloader.classList.add('is-hidden'), 3500);
  }

  /* ---- Mobile nav toggle ------------------------------------------------ */
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.innerHTML = isOpen
        ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>'
        : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    mainNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
        document.body.style.overflow = '';
      });
    });
  }

  /* ---- Footer year ------------------------------------------------------ */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ---- Lottie ambient status indicator (contact page) ------------------ */
  const lottieTarget = document.getElementById('lottie-status');
  if (lottieTarget && typeof lottie !== 'undefined') {
    try {
      lottie.loadAnimation({
        container: lottieTarget,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'assets/lottie/pulse.json'
      });
    } catch (e) {
      lottieTarget.style.display = 'none';
    }
  } else if (lottieTarget) {
    lottieTarget.style.display = 'none';
  }

  /* ---- Portfolio filter -------------------------------------------------- */
  const filterBar = document.querySelector('.filter-bar');
  if (filterBar) {
    const buttons = filterBar.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.portfolio-item');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const filter = btn.dataset.filter;
        items.forEach((item) => {
          const match = filter === 'all' || item.dataset.category === filter;
          item.classList.toggle('is-hidden', !match);
        });
      });
    });
  }

  /* ---- Portfolio lightbox ------------------------------------------------ */
  const lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    const lightboxImg = lightbox.querySelector('img');
    const lightboxTitle = lightbox.querySelector('.lightbox-title');
    const lightboxTag = lightbox.querySelector('.lightbox-tag');
    const closeBtn = lightbox.querySelector('.lightbox-close');

    document.querySelectorAll('.portfolio-item').forEach((item) => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const title = item.dataset.title || '';
        const tag = item.dataset.category || '';
        if (img && lightboxImg) lightboxImg.src = img.src;
        if (lightboxImg) lightboxImg.alt = title;
        if (lightboxTitle) lightboxTitle.textContent = title;
        if (lightboxTag) lightboxTag.textContent = tag;
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  /* ---- Contact card mouse tilt (desktop only, respects reduced motion) --- */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover)').matches;
  if (!prefersReducedMotion && canHover) {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ---- Contact form (no backend attached — validates + confirms client-side) */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const statusEl = contactForm.querySelector('.form-status');
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = contactForm.querySelector('#name');
      const email = contactForm.querySelector('#email');
      const message = contactForm.querySelector('#message');

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
        showStatus('Please fill in every field before sending.', 'error');
        return;
      }
      if (!emailPattern.test(email.value.trim())) {
        showStatus('Please enter a valid email address.', 'error');
        return;
      }

      // Build a mailto fallback so the message always has somewhere to go
      const subject = encodeURIComponent(`New enquiry from ${name.value.trim()}`);
      const body = encodeURIComponent(
        `Name: ${name.value.trim()}\nEmail: ${email.value.trim()}\n\n${message.value.trim()}`
      );
      const mailtoLink = `mailto:theamitgraphics@gmail.com?subject=${subject}&body=${body}`;

      showStatus('Opening your email app to send this message…', 'success');
      window.location.href = mailtoLink;
      contactForm.reset();
    });

    function showStatus(msg, type) {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.className = 'form-status ' + type;
    }
  }
});
