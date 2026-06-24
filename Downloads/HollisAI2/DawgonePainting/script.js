/* ============================================================
   DAWGONE CUSTOM PAINTING — script.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Mobile nav toggle ----
  const toggle = document.querySelector('.nav__toggle');
  const mobileNav = document.querySelector('.nav__mobile');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);
    });
  }

  // ---- Contact form success message ----
  // Shows the success div if URL contains ?submitted=true
  const params = new URLSearchParams(window.location.search);
  if (params.get('submitted') === 'true') {
    const successEl = document.getElementById('form-success');
    if (successEl) {
      successEl.style.display = 'block';
      successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

});
