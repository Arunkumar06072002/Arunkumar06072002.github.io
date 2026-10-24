/* =====================================================================
   AI Innovation AppX — small interactions (no libraries)
   1. Mobile menu   2. Scroll reveal   3. Contact form
   ===================================================================== */

/* ---------- 1. Mobile menu ---------- */
const toggle = document.querySelector('.nav__toggle');
const menu = document.getElementById('nav-menu');

function setMenu(open) {
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menu.classList.toggle('is-open', open);
}

toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
// Close after choosing a link, or on Escape
menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

/* ---------- 2. Fade/slide-in on scroll ---------- */
const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  // Small stagger for items that sit side by side in a grid
  revealEls.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
    el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 4) * 80}ms`;
    io.observe(el);
  });
} else {
  revealEls.forEach((el) => el.classList.add('in'));
}

/* ---------- 3. Contact form ----------
   Sends the form with fetch so the visitor stays on the page.
   The endpoint is the form's `action` attribute in index.html.
   For EmailJS or your own API, replace the fetch() call below.        */
const form = document.querySelector('.form');
const statusEl = form.querySelector('.form__status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.className = 'form__status';

  // Basic validation with friendly messages
  let firstInvalid = null;
  form.querySelectorAll('[required]').forEach((field) => {
    const valid = field.checkValidity();
    field.setAttribute('aria-invalid', String(!valid));
    if (!valid && !firstInvalid) firstInvalid = field;
  });
  if (firstInvalid) {
    statusEl.textContent = 'Please fill in your name, a valid email, project type and message.';
    statusEl.classList.add('err');
    firstInvalid.focus();
    return;
  }

  if (form.action.includes('[your-form-id]') || form.action.includes('%5Byour-form-id%5D')) {
    statusEl.textContent = 'Form endpoint not set yet — add your Formspree form ID in index.html.';
    statusEl.classList.add('err');
    return;
  }

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = 'Sending…';

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(res.statusText);
    form.reset();
    statusEl.textContent = "Thanks! Your message has been sent — we'll reply soon.";
    statusEl.classList.add('ok');
  } catch {
    statusEl.textContent = 'Something went wrong. Please try again or message us on WhatsApp.';
    statusEl.classList.add('err');
  } finally {
    button.disabled = false;
    button.textContent = 'Send Message';
  }
});
