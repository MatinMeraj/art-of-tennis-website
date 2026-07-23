/* ------------------------------------------------------------------
   The Art of Tennis Academy — site scripts

   Loaded at the end of <body> on every page, so the DOM is already
   parsed. Every block guards for element existence, which lets this
   single file be included on all pages even though most pages only
   contain some of these features.
   ------------------------------------------------------------------ */


/* ==================================================================
   Form submit handlers
   ------------------------------------------------------------------
   These two functions are the integration points for Mailchimp and
   the registration workflow. They are intentionally isolated so the
   placeholder behaviour can be swapped for a real submission without
   touching the wiring code below.
   ================================================================== */

/**
 * Handles submission of a newsletter / scholarship / "win a free week"
 * signup form (any element with the .signup-form class).
 *
 * TODO (Mailchimp): replace the placeholder alert with a real submission.
 *   - Option A: give the <form> a Mailchimp `action` + `method="post"`
 *     and simply return early here (letting the browser submit natively).
 *   - Option B: keep preventDefault() and POST to Mailchimp via fetch/JSONP
 *     so the user stays on the page, then show inline success/error.
 *   The email input is available as form.querySelector('input[type="email"]').
 *
 * @param {SubmitEvent} event - The submit event.
 * @param {HTMLFormElement} form - The form being submitted.
 */
function handleNewsletter(event, form) {
  event.preventDefault();
  alert('Thanks! Newsletter signup will be connected to our email service soon.');
  form.reset();
}

/**
 * Handles submission of the registration form inside the modal.
 *
 * TODO (registration workflow): replace the placeholder alert with a real
 * submission. Note the selected program name is currently only rendered
 * into the modal UI (.reg-program) and is NOT yet captured as a form field —
 * add a hidden input if the program needs to reach Mailchimp / a backend.
 *   Fields available: form.first, form.last, form.email
 *
 * @param {SubmitEvent} event - The submit event.
 * @param {HTMLFormElement} form - The registration form.
 * @param {Function} closeModal - Closes the modal; call after a successful submit.
 */
function handleRegistration(event, form, closeModal) {
  event.preventDefault();
  alert('Thanks! Your registration request has been received. We will confirm your spot by email.');
  form.reset();
  closeModal();
}


/* ==================================================================
   Mobile navigation toggle
   ================================================================== */

const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => siteNav.classList.toggle('open'));
}


/* ==================================================================
   Newsletter / scholarship signup forms
   ------------------------------------------------------------------
   Appears on the homepage (Newsletter), every program detail page
   (Scholarship) and the summer camp page (Win A Free Week).
   ================================================================== */

document.querySelectorAll('.signup-form').forEach((form) => {
  const isMailchimpForm =
    form.action &&
    form.action.includes('list-manage.com/subscribe/post');

  if (!isMailchimpForm) {
    form.addEventListener('submit', (event) => handleNewsletter(event, form));
  }
});


/* ==================================================================
   Registration modal (Book Now / Register)
   ------------------------------------------------------------------
   Present on team.html and all program detail pages. Any page with a
   [data-book] trigger must also contain the #reg-modal markup.
   ================================================================== */

const regModal = document.getElementById('reg-modal');
if (regModal) {
  const titleEl = regModal.querySelector('.reg-program');
  const closeEls = regModal.querySelectorAll('[data-reg-close]');

  // Open: label the modal with the program that was clicked, then lock scroll.
  document.querySelectorAll('[data-book]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (titleEl) titleEl.textContent = btn.getAttribute('data-book') || 'a program';
      regModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  // Close: via the × button, or by clicking the backdrop.
  const close = () => { regModal.classList.remove('open'); document.body.style.overflow = ''; };
  closeEls.forEach((el) => el.addEventListener('click', close));
  regModal.addEventListener('click', (e) => { if (e.target === regModal) close(); });

  const regForm = regModal.querySelector('.reg-form');
  if (regForm) {
    regForm.addEventListener('submit', (e) => handleRegistration(e, regForm, close));
  }
}


/* ==================================================================
   Smooth scroll for in-page anchors
   ------------------------------------------------------------------
   Powers the "Contact" nav item (-> footer#contact) and the
   "View Our Schedule" link (-> #schedule) on program pages.
   ================================================================== */

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


/* ==================================================================
   Current year (footer copyright)
   ================================================================== */

document.querySelectorAll('[data-current-year]').forEach((el) => {
  el.textContent = String(new Date().getFullYear());
});


/* ==================================================================
   Testimonials slider
   ------------------------------------------------------------------
   Vanilla, no dependencies. Initialises only where the markup exists,
   so pages without a slider are unaffected. Autoplay ~6s, pauses on
   hover and keyboard focus, arrow-key support, honours reduced motion.
   Without JS the first slide stays visible via CSS .is-active.
   ================================================================== */

document.querySelectorAll('[data-testimonial-slider]').forEach((slider) => {
  const slides = Array.from(slider.querySelectorAll('[data-slide]'));
  if (slides.length === 0) return;

  const dotsWrap = slider.querySelector('.testimonial-dots');
  const prevBtn = slider.querySelector('[data-slider-prev]');
  const nextBtn = slider.querySelector('[data-slider-next]');

  const AUTOPLAY_MS = 6000;
  const reduceMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  let index = slides.findIndex((s) => s.classList.contains('is-active'));
  if (index < 0) index = 0;
  let timer = null;

  const dots = [];
  if (dotsWrap) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'testimonial-dot';
      dot.setAttribute('aria-label', 'Show testimonial ' + (i + 1) + ' of ' + slides.length);
      dot.addEventListener('click', () => { show(i); restart(); });
      dotsWrap.appendChild(dot);
      dots.push(dot);
    });
  }

  function show(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === index;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
    });
  }

  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function start() {
    if (reduceMotion || slides.length < 2) return;
    stop();
    timer = setInterval(() => show(index + 1), AUTOPLAY_MS);
  }
  function restart() { stop(); start(); }

  if (prevBtn) prevBtn.addEventListener('click', () => { show(index - 1); restart(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { show(index + 1); restart(); });

  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  slider.addEventListener('focusin', stop);
  slider.addEventListener('focusout', (e) => {
    if (!slider.contains(e.relatedTarget)) start();
  });
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); show(index - 1); restart(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); restart(); }
  });

  show(index);
  start();
});
