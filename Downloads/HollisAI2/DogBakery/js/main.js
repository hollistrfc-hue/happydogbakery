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
  function closeAllModals() {
    document.querySelectorAll('.modal-overlay.open').forEach(el => {
      el.classList.remove('open');
    });
    document.body.style.overflow = '';
  }

  /* ── Cake size key → select value map ── */
  const cakeSizeMap = {
    '3in':   '3" Round \u2014 $15',
    '5in':   '5" Round \u2014 $27',
    'sbone': 'Small Bone \u2014 $25',
    'lbone': 'Large Bone \u2014 $35'
  };

  const squareLinks = {
    '3" Round \u2014 $15':   'https://square.link/u/T5KVBE4c',
    '5" Round \u2014 $27':   'https://square.link/u/NO988bn6',
    'Small Bone \u2014 $25': 'https://square.link/u/skpMuIfg',
    'Large Bone \u2014 $35': 'https://square.link/u/ulN3JrlM'
  };

  /* ── Open cake modal with pre-selected size ── */
  function openCakeModal(sizeValue) {
    const sizeEl     = document.getElementById('ck-size');
    const subtitle   = document.getElementById('cake-modal-subtitle');
    const formWrap   = document.getElementById('cake-form-wrap');
    const successDiv = document.getElementById('cake-modal-success');

    if (sizeEl)      sizeEl.value              = sizeValue || '';
    if (subtitle)    subtitle.textContent      = sizeValue || 'Custom Dog Cake';
    if (formWrap)    formWrap.style.display    = '';
    if (successDiv)  successDiv.style.display  = 'none';

    openOverlay('cake-modal-overlay');
  }

  /* ── "Order This Cake" button listeners ── */
  document.querySelectorAll('[data-cake-key]').forEach(btn => {
    btn.addEventListener('click', () => {
      openCakeModal(cakeSizeMap[btn.dataset.cakeKey] || '');
    });
  });

  /* ── Cake order form ── */
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

      const petName   = (document.getElementById('ck-pet') || {}).value || 'your pup';
      const sizeEl    = document.getElementById('ck-size');
      const cakeSize  = sizeEl ? sizeEl.value : '';
      const squareUrl = squareLinks[cakeSize];
      const submitBtn = document.getElementById('cake-submit-btn');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending\u2026'; }

      if (squareUrl) window.open(squareUrl, '_blank');

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(cakeForm)).toString()
      })
        .then(() => {
          const heading    = document.getElementById('cake-success-heading');
          const msg        = document.getElementById('cake-success-msg');
          const formWrap   = document.getElementById('cake-form-wrap');
          const successDiv = document.getElementById('cake-modal-success');
          if (heading)    heading.textContent         = '\uD83C\uDF82 Order placed for ' + petName + '!';
          if (msg)        msg.textContent             = "Complete your payment in the new tab. We\u2019ll confirm via text or email.";
          if (formWrap)   formWrap.style.display      = 'none';
          if (successDiv) successDiv.style.display    = 'block';
          cakeForm.reset();
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Place Cake Order & Pay'; }
        })
        .catch(() => {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Place Cake Order & Pay'; }
          alert('Something went wrong \u2014 please call us at (405) 714-2971 to place your order.');
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
      banner.innerHTML = '<strong>Cake order received!</strong><br>We\'ll confirm via text or email. Payment processed securely via Square.';
      banner.style.display = 'block';
      banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  if (qs.includes('success=true')) {
    const banner = document.getElementById('contact-success-banner');
    if (banner) { banner.style.display = 'block'; banner.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }

})();
