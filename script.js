/* ── CURSOR ── */
const cursor = document.getElementById('cursor');
const cursorGlow = document.getElementById('cursor-glow');
let mx = -100, my = -100, gx = -100, gy = -100;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
});

function animateGlow() {
  gx += (mx - gx) * 0.06;
  gy += (my - gy) * 0.06;
  cursorGlow.style.left = gx + 'px';
  cursorGlow.style.top = gy + 'px';
  requestAnimationFrame(animateGlow);
}
animateGlow();

/* ── NAV SCROLL ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

/* ── MOBILE NAV ── */
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');
navToggle.addEventListener('click', () => {
  navMobile.classList.toggle('open');
  navToggle.setAttribute('aria-label', navMobile.classList.contains('open') ? 'Fermer' : 'Menu');
});
document.querySelectorAll('.nav-mobile-link').forEach(a => {
  a.addEventListener('click', () => navMobile.classList.remove('open'));
});

/* ── REVEAL ON SCROLL ── */
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      e.target.style.animationDelay = (i % 3 * 0.1) + 's';
      e.target.classList.add('in');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
reveals.forEach(el => observer.observe(el));

/* ── COUNTER ANIMATION ── */
function animateCount(el, target, duration) {
  const suffix = el.querySelector('span')?.textContent || '';
  const start = performance.now();
  const update = now => {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const val = Math.round(ease * target);
    el.textContent = val;
    const s = document.createElement('span');
    s.className = 'accent';
    s.textContent = suffix;
    el.appendChild(s);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      const target = parseInt(el.dataset.count);
      animateCount(el, target, 1200);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.counter-val[data-count]').forEach(el => counterObserver.observe(el));

/* ── FORM SUBMIT ── */
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
if (contactForm) contactForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  submitBtn.innerHTML = 'Envoi en cours...';
  submitBtn.disabled = true;
  try {
    const res = await fetch(contactForm.action, {
      method: 'POST',
      body: new FormData(contactForm),
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      submitBtn.innerHTML = 'Message envoyé ✓';
      submitBtn.style.background = '#22c55e';
      contactForm.reset();
      setTimeout(() => {
        submitBtn.innerHTML = 'Envoyer ma demande <span>→</span>';
        submitBtn.style.background = '';
        submitBtn.disabled = false;
      }, 4000);
    } else {
      submitBtn.innerHTML = 'Erreur, réessayez';
      submitBtn.style.background = '#ef4444';
      submitBtn.disabled = false;
      setTimeout(() => {
        submitBtn.innerHTML = 'Envoyer ma demande <span>→</span>';
        submitBtn.style.background = '';
      }, 3000);
    }
  } catch {
    submitBtn.innerHTML = 'Erreur réseau';
    submitBtn.style.background = '#ef4444';
    submitBtn.disabled = false;
  }
});

/* ── CAROUSEL ── */
const cards = document.querySelectorAll('.c-card');
const dots  = document.querySelectorAll('.card-dot');
let current = 0;
let autoTimer;

function goTo(index) {
  cards[current].classList.remove('active');
  cards[current].classList.add('exit');
  dots[current].classList.remove('active');

  setTimeout(() => {
    cards[current].classList.remove('exit');
    current = (index + cards.length) % cards.length;
    cards[current].classList.add('active');
    dots[current].classList.add('active');
  }, 60);
}

function startAuto() {
  autoTimer = setInterval(() => goTo(current + 1), 4000);
}
function stopAuto() { clearInterval(autoTimer); }

if (document.getElementById('cardNext')) document.getElementById('cardNext').addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });
if (document.getElementById('cardPrev')) document.getElementById('cardPrev').addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
dots.forEach((d, i) => d.addEventListener('click', () => { stopAuto(); goTo(i); startAuto(); }));

/* Swipe tactile */
let touchStartX = 0;
const carousel = document.getElementById('cardCarousel');
if (carousel) {
  carousel.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { stopAuto(); goTo(diff > 0 ? current + 1 : current - 1); startAuto(); }
  }, { passive: true });
}

if (cards.length) startAuto();

/* ── PARALLAX CAROUSEL ── */
const heroRight = document.querySelector('.hero-right');
if (heroRight) {
  document.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth - 0.5) * 10;
    const y = (e.clientY / window.innerHeight - 0.5) * 6;
    const el = document.querySelector('.card-carousel');
    if (el) el.style.transform = `perspective(900px) rotateY(${-x}deg) rotateX(${y}deg)`;
  });
}

/* ── PRELOADER : la ligne se complète puis disparaît, une fois par page ── */
const preloaderEl = document.getElementById('preloader');
window.addEventListener('load', () => {
  setTimeout(() => {
    if (preloaderEl) preloaderEl.classList.add('done');
  }, 800);
});
// sécurité : ne jamais rester bloqué plus de 2.5s
setTimeout(() => { if (preloaderEl) preloaderEl.classList.add('done'); }, 2500);
// retour navigateur (bfcache) : masquer immédiatement
window.addEventListener('pageshow', e => {
  if (e.persisted && preloaderEl) preloaderEl.classList.add('done');
});

/* ── SCROLL PROGRESS ── */
const scrollProgress = document.getElementById('scroll-progress');
if (scrollProgress) {
  addEventListener('scroll', () => {
    const h = document.documentElement;
    scrollProgress.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
  }, { passive: true });
}

/* ── TILT 3D SERVICES ── */
if (matchMedia('(hover:hover)').matches) {
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.transform = `perspective(800px) rotateY(${(x - 0.5) * 7}deg) rotateX(${(0.5 - y) * 7}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* ── AVANT / APRÈS SLIDER ── */
const baWrap = document.getElementById('baWrap');
if (baWrap) {
  const baClip = document.getElementById('baClip');
  const baHandle = document.getElementById('baHandle');
  const baContentBefore = baWrap.querySelector('.ba-before .ba-content');
  const baContentAfter = baWrap.querySelector('.ba-after .ba-content');
  function setCut(clientX) {
    const r = baWrap.getBoundingClientRect();
    let pct = ((clientX - r.left) / r.width) * 100;
    pct = Math.max(12, Math.min(88, pct));
    baClip.style.clipPath = `inset(0 0 0 ${pct}%)`;
    baHandle.style.left = pct + '%';
    // fondu : le contenu disparaît quand sa moitié devient trop étroite
    if (baContentBefore) {
      const o = Math.min(1, Math.max(0, (pct - 24) / 22));
      baContentBefore.style.opacity = o;
      baContentBefore.style.transform = `scale(${0.92 + o * 0.08})`;
    }
    if (baContentAfter) {
      const o = Math.min(1, Math.max(0, (76 - pct) / 22));
      baContentAfter.style.opacity = o;
      baContentAfter.style.transform = `scale(${0.92 + o * 0.08})`;
    }
  }
  let baDragging = false;
  baWrap.addEventListener('pointerdown', e => { baDragging = true; setCut(e.clientX); });
  addEventListener('pointermove', e => { if (baDragging) setCut(e.clientX); }, { passive: true });
  addEventListener('pointerup', () => baDragging = false);
}

/* ── CALCULATEUR DEVIS ── */
const calcOpts = document.querySelectorAll('.calc-opt');
if (calcOpts.length) {
  const totalEl = document.getElementById('calcTotal');
  const noteEl = document.getElementById('calcNote');
  function recalcDevis() {
    let total = 0;
    const parts = [];
    calcOpts.forEach(o => {
      if (!o.classList.contains('on')) return;
      total += parseInt(o.dataset.price);
      parts.push(o.dataset.label || o.querySelector('.name').textContent);
    });
    const from = parseInt(totalEl.textContent.replace(/\D/g, '')) || 0;
    const dur = 450, t0 = performance.now();
    function tick(t) {
      const k = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      totalEl.textContent = 'CHF ' + Math.round(from + (total - from) * eased);
      if (k < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    noteEl.textContent = parts.length ? parts.join(' + ') : 'Sélectionnez au moins une option';
  }
  calcOpts.forEach(o => {
    o.addEventListener('click', () => {
      if (o.dataset.base && !o.classList.contains('on')) {
        calcOpts.forEach(x => { if (x.dataset.base && x !== o) x.classList.remove('on'); });
      }
      o.classList.toggle('on');
      recalcDevis();
    });
  });
}
