/* Amica website — interactions
 * ------------------------------------------------------------------
 * CONFIG
 *
 *  CONTACT_EMAIL  The team inbox. Shown on the page and used as the
 *                 "send it by email instead" fallback.
 *  FORM_ENDPOINT  The Firebase function that receives contact-form
 *                 messages (amica-cloud-backend → submitContactMessage).
 *                 It saves each message in Firestore and emails it to the
 *                 team inbox. See README.md → "Receiving messages".
 */
const CONFIG = {
  CONTACT_EMAIL: 'teamkintsugi2026@gmail.com',
  FORM_ENDPOINT: 'https://us-central1-amica-cloud-backend.cloudfunctions.net/submitContactMessage',
};

(function () {
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ── Year ── */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ── Theme: light by default, dark ("discreet mode") on request ── */
  const themeBtn = $('#themeToggle');
  const applyTheme = (t) => {
    if (t === 'dark') root.dataset.theme = 'dark';
    else delete root.dataset.theme;
    try { localStorage.setItem('amica-theme', t); } catch (e) { /* private mode */ }
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = t === 'dark' ? '#0E0A17' : '#7C4DEB';
    // The hero phone follows the theme, like the app's discreet mode.
    $$('img[data-dark]').forEach((img) => { img.src = t === 'dark' ? img.dataset.dark : img.dataset.light; });
  };
  applyTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');

  themeBtn.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.classList.remove('theme-spin'); void root.offsetWidth; root.classList.add('theme-spin');

    if (reduceMotion) { applyTheme(next); return; }

    // A circle of the new theme grows out of the toggle button.
    if (document.startViewTransition) {
      const r = themeBtn.getBoundingClientRect();
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      const vt = document.startViewTransition(() => applyTheme(next));
      vt.ready.then(() => {
        root.animate(
          { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
          { duration: 700, easing: 'cubic-bezier(.22,1,.36,1)', pseudoElement: '::view-transition-new(root)' },
        );
      }).catch(() => {});
    } else {
      root.classList.add('theme-fade');
      applyTheme(next);
      setTimeout(() => root.classList.remove('theme-fade'), 600);
    }
  });

  /* ── Mobile menu ── */
  const nav = $('#nav');
  const menuBtn = $('#menuBtn');
  const closeMenu = () => {
    nav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
  };
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  $$('a', nav).forEach((a) => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('open') && !nav.contains(e.target) && !menuBtn.contains(e.target)) closeMenu();
  });

  /* ── Scroll: header state, hide-on-scroll-down, progress bar ── */
  const header = $('.site-header');
  const progress = $('#progress');
  let lastY = window.scrollY;
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 10);
    // Tuck the bar away while reading downwards; bring it back on any upward scroll.
    if (!nav.classList.contains('open')) header.classList.toggle('hide', y > 500 && y > lastY + 4);
    if (y < lastY - 4 || y < 500) header.classList.remove('hide');
    lastY = y;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
    ticking = false;
  };
  onScroll();
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  header.addEventListener('focusin', () => header.classList.remove('hide'));

  /* ── Reveal on scroll (staggered within each group) + active nav link ── */
  const countUp = (el) => {
    const target = Number(el.dataset.count);
    if (reduceMotion || !target) return;
    const start = performance.now(), dur = 1100;
    const step = (now) => {
      const t = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(step);
    };
    el.textContent = '0';
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    // Items in the same grid/list come in one after another.
    $$('.reveal').forEach((el) => {
      const siblings = $$(':scope > .reveal', el.parentElement);
      const i = siblings.indexOf(el);
      if (i > 0) el.style.setProperty('--d', `${Math.min(i, 6) * 90}ms`);
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -50px 0px' });
    $$('.reveal').forEach((el) => io.observe(el));

    const statsIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        $$('[data-count]', en.target).forEach((n, i) => setTimeout(() => countUp(n), i * 120));
        statsIO.unobserve(en.target);
      });
    }, { threshold: 0.5 });
    $$('.stats').forEach((s) => statsIO.observe(s));

    const links = $$('.nav a[href^="#"]');
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === `#${en.target.id}`));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach((s) => spy.observe(s));
  } else {
    $$('.reveal').forEach((el) => el.classList.add('in'));
  }

  /* ── Hero parallax: phones and cards drift with the pointer ── */
  const heroVisual = $('#heroVisual');
  if (heroVisual && finePointer && !reduceMotion) {
    const hero = $('.hero');
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      heroVisual.style.setProperty('--px', (((e.clientX - r.left) / r.width) - 0.5).toFixed(3));
      heroVisual.style.setProperty('--py', (((e.clientY - r.top) / r.height) - 0.5).toFixed(3));
    });
    hero.addEventListener('pointerleave', () => {
      heroVisual.style.setProperty('--px', 0);
      heroVisual.style.setProperty('--py', 0);
    });
  }

  /* ── Cards: gentle 3D tilt + a light that follows the pointer ── */
  if (finePointer && !reduceMotion) {
    $$('.feature, .member').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', `${x * 100}%`);
        card.style.setProperty('--my', `${y * 100}%`);
        card.style.setProperty('--ry', `${(x - 0.5) * 8}deg`);
        card.style.setProperty('--rx', `${(0.5 - y) * 8}deg`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ── FAQ: animate open and close ── */
  $$('.faq details').forEach((d) => {
    const summary = $('summary', d);
    let anim = null;
    summary.addEventListener('click', (e) => {
      if (reduceMotion || !d.animate) return;
      e.preventDefault();
      if (anim) anim.cancel();
      const startH = d.offsetHeight;
      const closing = d.open;
      if (!closing) d.open = true;
      const endH = closing ? summary.offsetHeight : d.scrollHeight;
      anim = d.animate({ height: [`${startH}px`, `${endH}px`] }, { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' });
      anim.onfinish = () => { anim = null; if (closing) d.open = false; };
    });
  });

  /* ── Screenshot gallery arrows ── */
  const gallery = $('#gallery');
  $$('[data-scroll]').forEach((b) => b.addEventListener('click', () => {
    gallery.scrollBy({ left: Number(b.dataset.scroll) * 290, behavior: reduceMotion ? 'auto' : 'smooth' });
  }));

  /* ── Contact ── */
  const emailLink = $('#contactEmailLink');
  if (emailLink) {
    emailLink.href = `mailto:${CONFIG.CONTACT_EMAIL}`;
    emailLink.textContent = CONFIG.CONTACT_EMAIL;
  }

  const form = $('#contactForm');
  const status = $('#formStatus');
  const subject = $('#subject');
  const submitBtn = $('#submitBtn');
  const success = $('#formSuccess');

  // "Send a message" on a team card pre-fills the subject.
  $$('.member-link').forEach((a) => a.addEventListener('click', () => {
    subject.value = a.dataset.topic || '';
    const other = $('input[name="topic"][value="Other"]', form);
    if (other) other.checked = true;
    setTimeout(() => $('input[name="name"]', form).focus({ preventScroll: true }), 700);
  }));

  const toast = (msg) => {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 4200);
  };

  const setStatus = (msg, kind) => {
    status.innerHTML = '';
    status.append(msg);
    status.className = `form-status ${kind || ''}`;
  };

  const mailtoHref = (p) => {
    const body = `${p.message}\n\n— ${p.name}\n${p.email}\nInterested in: ${p.topic}`;
    return `mailto:${CONFIG.CONTACT_EMAIL}?subject=${encodeURIComponent(`[Amica] ${p.subject}`)}&body=${encodeURIComponent(body)}`;
  };

  const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  const flagInvalid = (el) => {
    el.classList.remove('invalid'); void el.offsetWidth; el.classList.add('invalid');
  };

  form.addEventListener('input', (e) => e.target.classList.remove('invalid'));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (data._honey) return; // honeypot filled: silently drop bots

    const problems = [];
    const { name, email, message } = form.elements;
    if (!data.name.trim()) { flagInvalid(name); problems.push('your name'); }
    if (!validEmail(data.email.trim())) { flagInvalid(email); problems.push('a valid email'); }
    if (data.message.trim().length < 10) { flagInvalid(message); problems.push('a message (at least 10 characters)'); }
    if (!form.elements.consent.checked) problems.push('your consent to be contacted');
    if (problems.length) {
      setStatus(`Please add ${problems.join(', ')}.`, 'err');
      return;
    }

    const topic = data.topic || 'General';
    const payload = {
      name: data.name.trim(),
      email: data.email.trim(),
      topic,
      subject: data.subject.trim() || `${topic} enquiry`,
      message: data.message.trim(),
    };

    if (!CONFIG.FORM_ENDPOINT) {
      window.location.href = mailtoHref(payload);
      setStatus('Your email app should open with the message ready — just press send.', 'ok');
      return;
    }

    submitBtn.classList.add('is-sending');
    submitBtn.querySelector('.btn-label').textContent = 'Sending…';
    setStatus('');

    try {
      const res = await fetch(CONFIG.FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...payload,
          consent: true,
          page: window.location.href,
          _honey: data._honey || '',
        }),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || out.success !== true) {
        const err = new Error(out.message || `HTTP ${res.status}`);
        // 400 = something to fix in the form, 429 = too many messages: show the server's words.
        err.userMessage = (res.status === 400 || res.status === 429) ? out.message : '';
        throw err;
      }

      form.reset();
      success.hidden = false;
      toast('Message sent — thank you!');
      $('#sendAnother').focus({ preventScroll: true });
    } catch (err) {
      const link = document.createElement('a');
      link.href = mailtoHref(payload);
      link.textContent = 'send it by email instead';
      const msg = document.createDocumentFragment();
      if (err.userMessage) {
        msg.append(`${err.userMessage} `, 'You can also ', link, '.');
      } else {
        msg.append("We couldn't send your message right now. Please try again, or ", link, '.');
      }
      setStatus(msg, 'err');
      console.warn('[Amica] contact form:', err.message);
    } finally {
      submitBtn.classList.remove('is-sending');
      submitBtn.querySelector('.btn-label').textContent = 'Send message';
    }
  });

  $('#sendAnother').addEventListener('click', () => {
    success.hidden = true;
    setStatus('');
    $('input[name="name"]', form).focus();
  });
})();
