/* ============================================================
   Happy Dog Barkery & Boutique — main.js
   ============================================================ */

(function () {
  'use strict';

  /* ── Hamburger ── */
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', open);
      const spans = hamburger.querySelectorAll('span');
      spans[0].style.transform = open ? 'rotate(45deg) translate(5px,5px)'  : '';
      spans[1].style.opacity   = open ? '0' : '1';
      spans[2].style.transform = open ? 'rotate(-45deg) translate(5px,-5px)' : '';
    });
    mobileNav.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      })
    );
  }

  /* ── Active nav link ── */
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(a => {
    if (a.getAttribute('href') === page || (page === '' && a.getAttribute('href') === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ── Fade-up on scroll ── */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  /* ── Generic modal helpers ── */
  function openOverlay(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeOverlay(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('open');
    document.body.style.overflow = '';
  }
  function closeAllModals() {
    document.querySelectorAll('.modal-overlay.open').forEach(el => {
      el.classList.remove('open');
    });
    document.body.style.overflow = '';
  }

  /* ── Cake order form (inline on shop page) ── */
  const cakeForm    = document.getElementById('cake-form');
  const pickupInput = document.getElementById('ck-pickup');
  const pickupError = document.getElementById('ck-pickup-error');

  if (cakeForm && pickupInput) {
    function updatePickupMin() {
      const minTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
      const pad = n => String(n).padStart(2, '0');
      pickupInput.min = `${minTime.getFullYear()}-${pad(minTime.getMonth()+1)}-${pad(minTime.getDate())}T${pad(minTime.getHours())}:${pad(minTime.getMinutes())}`;
    }
    updatePickupMin();
    pickupInput.addEventListener('change', () => { if (pickupError) pickupError.style.display = 'none'; });

    cakeForm.addEventListener('submit', e => {
      e.preventDefault();
      updatePickupMin();
      const selected   = new Date(pickupInput.value);
      const minAllowed = new Date(Date.now() + 2 * 60 * 60 * 1000);
      if (!pickupInput.value || selected < minAllowed) {
        if (pickupError) pickupError.style.display = 'block';
        pickupInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        pickupInput.focus();
        return;
      }
      if (pickupError) pickupError.style.display = 'none';

      const petName   = (document.getElementById('ck-pet')  || {}).value || 'your pup';
      const submitBtn = document.getElementById('cake-submit-btn');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(cakeForm)).toString()
      })
        .then(() => {
          const banner  = document.getElementById('cake-success-banner');
          const heading = document.getElementById('cake-success-heading');
          if (heading) heading.textContent = `Cake order received for ${petName}!`;
          if (banner)  { banner.style.display = 'block'; banner.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
          cakeForm.reset();
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Place Cake Order'; }
        })
        .catch(() => {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Place Cake Order'; }
          alert('Something went wrong — please call us at (405) 714-2971 to place your order.');
        });
    });
  }

  /* ── Close buttons (all modals) ── */
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  /* ── Escape key ── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllModals();
  });

  /* ── Success banners (Netlify redirects) ── */
  const qs = window.location.search;
  if (qs.includes('ordered=true')) {
    const banner = document.getElementById('order-success-banner');
    if (banner) { banner.style.display = 'block'; banner.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }
  if (qs.includes('cake=true')) {
    const banner = document.getElementById('order-success-banner');
    if (banner) {
      banner.querySelector('strong').textContent = 'Cake order received!';
      banner.innerHTML = '<strong>Cake order received!</strong><br>We\'ll confirm via text. Payment via Venmo (@HappyDogBarkery) is due at pickup.';
      banner.style.display = 'block';
      banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  if (qs.includes('success=true')) {
    const banner = document.getElementById('contact-success-banner');
    if (banner) { banner.style.display = 'block'; banner.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }

})();
