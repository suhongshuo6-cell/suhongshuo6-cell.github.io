const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

/* ---------- Split headlines into words ---------- */
$$('[data-split]').forEach(el => {
  let i = 0;
  const wrap = node => {
    const w = document.createElement('span');
    w.className = 'w';
    const inner = document.createElement('span');
    inner.append(node);
    w.append(inner);
    w.style.setProperty('--i', i++);
    return w;
  };
  [...el.childNodes].forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        frag.append(/^\s+$/.test(part) ? document.createTextNode(' ') : wrap(document.createTextNode(part)));
      });
      node.replaceWith(frag);
    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BR') {
      const placeholder = document.createComment('');
      node.replaceWith(placeholder);
      placeholder.replaceWith(wrap(node));
    }
  });
});

/* ---------- Statement: characters light up while scrolling ---------- */
const statement = $('[data-fill]');
let chars = [];
if (statement) {
  statement.setAttribute('aria-label', statement.textContent);
  const text = statement.textContent;
  statement.textContent = '';
  chars = [...text].map(c => {
    const s = document.createElement('span');
    s.className = 'ch';
    s.setAttribute('aria-hidden', 'true');
    s.textContent = c;
    statement.append(s);
    return s;
  });
  if (reduceMotion) chars.forEach(c => c.classList.add('on'));
}

/* ---------- Reveal on enter ---------- */
const revealer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    // The wordmark is fully clipped before reveal, so its footer is observed instead
    (entry.target.classList.contains('footer') ? $('.wordmark', entry.target) : entry.target).classList.add('is-in');
    revealer.unobserve(entry.target);
  });
}, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
$$('[data-reveal], [data-split], .sec-label, .footer').forEach(el => revealer.observe(el));

/* ---------- Hero: load sequence (the 3D scene lives in hero3d.js) ---------- */
const hero = $('.hero');

const startHero = () => requestAnimationFrame(() => {
  hero.classList.add('is-in');
});
(document.fonts?.ready ?? Promise.resolve()).then(startHero);
setTimeout(startHero, 1200);

/* ---------- Nav: compact state, dark sections, active indicator ---------- */
const nav = $('[data-nav]');
const pill = $('.pill');
const indicator = $('.pill-indicator');
const pillLinks = $$('a', pill);
const sections = $$('main section[id]');
let activeId = null;

function moveIndicator(link) {
  if (!link) { indicator.style.opacity = 0; return; }
  indicator.style.opacity = 1;
  indicator.style.width = link.offsetWidth + 'px';
  indicator.style.transform = `translateX(${link.offsetLeft}px)`;
}

function updateNav() {
  const y = scrollY;
  nav.classList.toggle('is-compact', y > 40);
  const navMid = nav.offsetHeight / 2;
  // Later sections overlap earlier ones (arc tops), so the last one reaching the nav wins
  let under = null;
  sections.forEach(s => { if (s.getBoundingClientRect().top <= navMid) under = s; });
  nav.classList.toggle('on-dark', !!under?.hasAttribute('data-dark'));
  const probe = innerHeight * .4;
  let current = null;
  sections.forEach(s => { if (s.getBoundingClientRect().top <= probe) current = s.id; });
  if (current !== activeId) {
    activeId = current;
    let link = null;
    pillLinks.forEach(a => {
      const on = a.hash === '#' + current;
      a.classList.toggle('is-active', on);
      if (on) { a.setAttribute('aria-current', 'location'); link = a; }
      else a.removeAttribute('aria-current');
    });
    moveIndicator(link);
  }
}
addEventListener('resize', () => moveIndicator(pillLinks.find(a => a.classList.contains('is-active'))));

/* ---------- Method: rolling step number ---------- */
const steps = $$('.step');
const methodGrid = $('.method-grid');
const roll = $('.roll');
const bar = $('.method-bar');
const indexItems = $$('.method-index li');

function updateMethod() {
  if (!methodGrid) return;
  const mid = innerHeight * .5;
  let current = 0;
  steps.forEach((step, i) => { if (step.getBoundingClientRect().top < mid) current = i; });
  steps.forEach((step, i) => step.classList.toggle('is-on', i === current));
  indexItems.forEach((li, i) => li.classList.toggle('is-on', i === current));
  roll.style.setProperty('--step', current);
  const r = $('.steps').getBoundingClientRect();
  const p = Math.min(1, Math.max(0, (mid - r.top) / r.height));
  bar.style.setProperty('--p', p.toFixed(3));
}

/* ---------- Statement fill ---------- */
function updateStatement() {
  if (!chars.length || reduceMotion) return;
  const r = statement.getBoundingClientRect();
  const start = innerHeight * .85;
  const span = r.height + innerHeight * .35;
  const p = Math.min(1, Math.max(0, (start - r.top) / span));
  const n = Math.round(p * chars.length);
  chars.forEach((c, i) => c.classList.toggle('on', i < n));
}

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    updateNav();
    updateMethod();
    updateStatement();
    ticking = false;
  });
}
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', onScroll);
onScroll();

/* ---------- Mobile menu ---------- */
const menuBtn = $('.menu-btn');
const menu = $('#mobile-menu');
function setMenu(open) {
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? '关闭导航' : '打开导航');
  menu.hidden = !open;
  menu.classList.toggle('is-open', open);
  nav.classList.toggle('menu-open', open);
  document.documentElement.style.overflow = open ? 'hidden' : '';
}
menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
$$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); }
});

/* ---------- ID card tilt ---------- */
const card = $('[data-tilt]');
if (card && finePointer && !reduceMotion) {
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    card.classList.add('is-tilting');
    card.style.transform = `rotate(-3deg) rotateY(${x * 14}deg) rotateX(${y * -14}deg)`;
  });
  card.addEventListener('pointerleave', () => {
    card.classList.remove('is-tilting');
    card.style.transform = '';
  });
}

/* ---------- Bento: ink spreads from the entry point ---------- */
$$('.b-card').forEach(el => el.addEventListener('pointerenter', e => {
  const r = el.getBoundingClientRect();
  el.style.setProperty('--mx', e.clientX - r.left + 'px');
  el.style.setProperty('--my', e.clientY - r.top + 'px');
}));

/* ---------- Notes accordion ---------- */
$$('.note-head').forEach(btn => btn.addEventListener('click', () => {
  const open = btn.getAttribute('aria-expanded') !== 'true';
  btn.setAttribute('aria-expanded', String(open));
  btn.closest('.note').classList.toggle('is-open', open);
}));

/* ---------- Cursor tag ---------- */
const tag = $('.cursor-tag');
if (finePointer) {
  $$('[data-cursor]').forEach(el => {
    el.addEventListener('pointerenter', () => { tag.textContent = el.dataset.cursor; tag.classList.add('is-on'); });
    el.addEventListener('pointerleave', () => tag.classList.remove('is-on'));
    el.addEventListener('pointermove', e => { tag.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`; });
  });
}

$('#year').textContent = new Date().getFullYear();
