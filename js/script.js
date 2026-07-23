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
  // Fallback only. Every signup form on the site now posts to Mailchimp, so
  // this should not fire; it exists in case a form is ever added without a
  // Mailchimp action.
  alert('Sorry, this form is not connected yet. Please call 778.919.9364.');
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
  // Nothing is submitted anywhere yet, so this must not tell the visitor
  // their registration was received. Carlos has said registration will go
  // through the community centres; until those URLs exist, point people at
  // the phone number rather than making a promise the site cannot keep.
  alert('To register, please call the academy on 778.919.9364 and we will confirm your spot.');
  form.reset();
  closeModal();
}


/* ==================================================================
   Homepage intro overlay
   ------------------------------------------------------------------
   Fades out the logo splash shortly after load. The overlay is only
   visible when <html> carries .js-intro (set inline in the <head> of
   index.html), so a visitor without JS never sees it at all. The
   listeners below are a safety net: whatever happens, the overlay is
   dismissed rather than left covering the page.
   ================================================================== */

const introOverlay = document.getElementById('intro-overlay');
if (introOverlay) {
  const dismissIntro = () => {
    document.documentElement.classList.add('intro-done');
    // Remove it from the document once the fade has finished.
    setTimeout(() => {
      if (introOverlay.parentNode) introOverlay.parentNode.removeChild(introOverlay);
    }, 700);
  };

  setTimeout(dismissIntro, 1400);
  introOverlay.addEventListener('click', dismissIntro);
  window.addEventListener('keydown', dismissIntro, { once: true });
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
    return;
  }

  // Mailchimp form: the native POST runs into a hidden iframe so the page
  // never navigates away, then the visitor is sent to the thank-you page.
  form.addEventListener('submit', () => {
    const frame = document.querySelector('iframe[name="mc-hidden-iframe"]');
    if (!frame) return;

    // Show progress on the button while the POST is in flight.
    const button = form.querySelector('button[type="submit"]');
    if (button) {
      button.dataset.originalLabel = button.textContent;
      button.disabled = true;
      button.textContent = 'Sending...';
    }

    // The iframe is cross-origin (Mailchimp), so the browser will not let this
    // page observe its load event. Instead we give the POST a moment to reach
    // Mailchimp and then move the visitor on. The request continues in the
    // iframe regardless of what this page does next.
    // Pass the form's source through so thank-you.html can show wording that
    // matches what the visitor actually signed up for.
    const source = form.getAttribute('data-source') || '';
    const target = source
      ? 'thank-you.html?source=' + encodeURIComponent(source)
      : 'thank-you.html';

    setTimeout(() => {
      window.location.href = target;
    }, 1500);
  });
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
   Thank-you page wording
   ------------------------------------------------------------------
   One page serves every signup form. The ?source= parameter set by the
   redirect decides the wording. Anything unrecognised falls back to the
   newsletter copy already in the markup, so the page is never blank.
   ================================================================== */

const thanksPage = document.querySelector('[data-thanks]');
if (thanksPage) {
  const COPY = {
    'Newsletter': {
      label: 'Newsletter',
      heading: 'Thank you for subscribing',
      body: 'You are on the list. Look out for news about upcoming programs, camps and academy updates.'
    },
    'Win A Free Week': {
      label: 'Summer Camp',
      heading: 'You are entered',
      body: 'Thanks for entering the draw for a free week at our Tennis + Art summer camp. We will be in touch by email if you win.'
    },
    'Scholarship': {
      label: 'Scholarship Program',
      heading: 'Thanks for your interest',
      body: 'We have your email address. Someone from the academy will contact you with details about the scholarship program.'
    }
  };

  let source = '';
  try {
    source = new URLSearchParams(window.location.search).get('source') || '';
  } catch (e) {}

  const copy = COPY[source];
  if (copy) {
    const labelEl = thanksPage.querySelector('[data-thanks-label]');
    const headEl = thanksPage.querySelector('[data-thanks-heading]');
    const bodyEl = thanksPage.querySelector('[data-thanks-body]');
    if (labelEl) labelEl.textContent = copy.label;
    if (headEl) headEl.textContent = copy.heading;
    if (bodyEl) bodyEl.textContent = copy.body;
  }

  // Summer camp entrants are more likely to want the camp page than programs.
  if (source === 'Win A Free Week') {
    const secondary = thanksPage.querySelector('[data-thanks-secondary]');
    if (secondary) {
      secondary.setAttribute('href', 'summer-camp.html');
      secondary.textContent = 'Summer Camp';
    }
  }
}


/* ==================================================================
   Footer location groups
   ------------------------------------------------------------------
   Vancouver expands to list the community centres the academy runs
   programs at. Closed by default; the sublist is only hidden by CSS,
   so without JS it simply stays visible rather than becoming
   unreachable.
   ================================================================== */

document.querySelectorAll('[data-loc-group]').forEach((group) => {
  const toggle = group.querySelector('[data-loc-toggle]');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const open = group.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
});


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
