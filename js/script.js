const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => siteNav.classList.toggle('open'));
}

// Newsletter / scholarship signup (placeholder until Mailchimp connected)
document.querySelectorAll('.signup-form').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    alert('Thanks! Newsletter signup will be connected to our email service soon.');
    form.reset();
  });
});

// ---- Registration modal (Book Now / Register) ----
const regModal = document.getElementById('reg-modal');
if (regModal) {
  const titleEl = regModal.querySelector('.reg-program');
  const closeEls = regModal.querySelectorAll('[data-reg-close]');
  document.querySelectorAll('[data-book]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (titleEl) titleEl.textContent = btn.getAttribute('data-book') || 'a program';
      regModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });
  const close = () => { regModal.classList.remove('open'); document.body.style.overflow = ''; };
  closeEls.forEach((el) => el.addEventListener('click', close));
  regModal.addEventListener('click', (e) => { if (e.target === regModal) close(); });
  const regForm = regModal.querySelector('.reg-form');
  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thanks! Your registration request has been received. We will confirm your spot by email.');
      regForm.reset();
      close();
    });
  }
}

// Smooth scroll for Contact (and any in-page anchor)
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href');
    if (id.length > 1) {
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});
