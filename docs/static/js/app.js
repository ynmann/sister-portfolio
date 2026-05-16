/* =====================================================
   app.js — Madina Bekassyl Interior Design
   ===================================================== */

/* === PRELOADER ======================================= */
(function initPreloader() {
  const counter  = document.querySelector('.preloader__count');
  const barFill  = document.querySelector('.preloader__bar-fill');
  const loader   = document.querySelector('.preloader');
  if (!loader) return;

  let n = 0;
  const tick = setInterval(() => {
    n = Math.min(n + Math.ceil(Math.random() * 4 + 1), 100);
    counter.textContent = n;
    barFill.style.right  = (100 - n) + '%';
    if (n >= 100) {
      clearInterval(tick);
      setTimeout(() => {
        loader.classList.add('out');
        document.body.style.overflow = '';
      }, 350);
    }
  }, 22);

  document.body.style.overflow = 'hidden';
})();

/* === CUSTOM CURSOR =================================== */
(function initCursor() {
  const dot  = document.getElementById('curDot');
  const ring = document.getElementById('curRing');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
    document.body.classList.add('has-cursor');
  }, { passive: true });

  (function trackRing() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(trackRing);
  })();

  document.querySelectorAll('a, button, .proj-item, .svc, .gal__item').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cur-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cur-hover'));
  });
})();

/* === NAV ============================================= */
(function initNav() {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const mob    = document.getElementById('mob');
  if (!nav) return;

  const updateNav = () => nav.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  if (burger && mob) {
    burger.addEventListener('click', () => {
      const open = mob.classList.toggle('open');
      burger.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mob.querySelectorAll('a').forEach(lk => lk.addEventListener('click', () => {
      mob.classList.remove('open');
      burger.classList.remove('open');
      document.body.style.overflow = '';
    }));
  }
})();

/* === MARQUEE ========================================= */
(function initMarquee() {
  const track = document.querySelector('.marquee__track');
  if (!track) return;
  const clone = track.cloneNode(true);
  track.parentElement.appendChild(clone);
})();

/* === SCROLL REVEAL =================================== */
(function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('on');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* === PROJECT LIST + HOVER IMAGE ====================== */
const PROJECTS = {
  'belle-view':   { name: 'Belle View',    meta: '2024 · Жилой · Современный стиль', count: 11 },
  'kazybek':      { name: 'Kazybek Bi',    meta: '2024 · Жилой · Современный стиль', count: 10 },
  'arena-park':   { name: 'Arena Park',    meta: '2024 · Жилой · Минимализм',        count: 13 },
  'arena-park-2': { name: 'Arena Park II', meta: '2024 · Жилой · Современный стиль', count:  9 },
  'arman':        { name: 'Arman',         meta: '2024 · Жилой · Современный стиль', count: 12 },
  'office':       { name: 'Office',        meta: 'Коммерческий · Современный',       count: 11 },
};

function projectImages(id, count) {
  return Array.from({ length: count }, (_, i) =>
    `static/images/projects/${id}/${String(i + 1).padStart(2, '0')}.jpg`
  );
}

(function initProjectList() {
  const hoverImg = document.getElementById('projHoverImg');
  const hoverEl  = hoverImg && hoverImg.querySelector('img');
  let ticking    = false;
  let mouseX = 0, mouseY = 0;

  if (hoverImg) {
    window.addEventListener('mousemove', e => {
      mouseX = e.clientX; mouseY = e.clientY;
      if (!ticking) {
        requestAnimationFrame(() => {
          hoverImg.style.left = mouseX + 30 + 'px';
          hoverImg.style.top  = mouseY - 120 + 'px';
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  document.querySelectorAll('.proj-item').forEach(item => {
    const id = item.dataset.project;
    const p  = PROJECTS[id];
    if (!p) return;

    item.addEventListener('mouseenter', () => {
      if (hoverEl) {
        hoverEl.src = `static/images/projects/${id}/01.jpg`;
        hoverImg.classList.add('visible');
      }
    });
    item.addEventListener('mouseleave', () => {
      if (hoverImg) hoverImg.classList.remove('visible');
    });
    item.addEventListener('click', () => openGallery(id));
  });
})();

/* === GALLERY ========================================= */
let curProject = null;

function openGallery(id) {
  const p = PROJECTS[id];
  if (!p) return;
  curProject = { id, ...p, images: projectImages(id, p.count) };

  document.getElementById('galName').textContent = p.name;
  document.getElementById('galMeta').textContent = `${p.meta} · ${p.count} фото`;

  const grid = document.getElementById('galGrid');
  grid.innerHTML = curProject.images.map((src, i) =>
    `<div class="gal__item" data-idx="${i}">
       <img src="${src}" alt="${p.name} — фото ${i + 1}" loading="lazy">
     </div>`
  ).join('');

  const modal = document.getElementById('gal');
  modal.classList.add('open');
  modal.querySelector('.gal__body').scrollTop = 0;
  document.body.style.overflow = 'hidden';

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); }
    });
  }, { threshold: 0.05, root: modal.querySelector('.gal__body') });

  grid.querySelectorAll('.gal__item').forEach((el, i) => {
    el.style.transitionDelay = Math.min(i, 9) * 50 + 'ms';
    io.observe(el);
    el.addEventListener('click', () => openLightbox(+el.dataset.idx));
  });
}

function closeGallery() {
  document.getElementById('gal').classList.remove('open');
  document.body.style.overflow = '';
  curProject = null;
}

/* === LIGHTBOX ======================================== */
let lbIdx = 0;

function openLightbox(idx) {
  lbIdx = idx;
  renderLightbox();
  document.getElementById('lb').classList.add('open');
}

function renderLightbox() {
  const { images, name } = curProject;
  const img = document.getElementById('lbImg');

  img.classList.add('fade');
  const src    = images[lbIdx];
  const loader = new Image();
  loader.onload = () => {
    img.src = src;
    img.alt = `${name} — фото ${lbIdx + 1}`;
    img.classList.remove('fade');
  };
  loader.src = src;
  if (img.src === src) img.classList.remove('fade');

  document.getElementById('lbCounter').textContent = `${lbIdx + 1} / ${images.length}`;

  const thumbs = document.getElementById('lbThumbs');
  thumbs.innerHTML = images.map((s, i) =>
    `<div class="lb__thumb${i === lbIdx ? ' active' : ''}" data-i="${i}">
       <img src="${s}" alt="">
     </div>`
  ).join('');

  thumbs.querySelectorAll('.lb__thumb').forEach(t =>
    t.addEventListener('click', () => { lbIdx = +t.dataset.i; renderLightbox(); })
  );

  const active = thumbs.querySelector('.active');
  if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

function lbNext() { lbIdx = (lbIdx + 1) % curProject.images.length; renderLightbox(); }
function lbPrev() { lbIdx = (lbIdx - 1 + curProject.images.length) % curProject.images.length; renderLightbox(); }
function closeLb() { document.getElementById('lb').classList.remove('open'); }

/* === EVENT LISTENERS ================================= */
document.getElementById('galClose')?.addEventListener('click', closeGallery);
document.getElementById('lbClose')?.addEventListener('click', closeLb);
document.getElementById('lbNext')?.addEventListener('click', lbNext);
document.getElementById('lbPrev')?.addEventListener('click', lbPrev);

document.addEventListener('keydown', e => {
  const lbOpen  = document.getElementById('lb')?.classList.contains('open');
  const galOpen = document.getElementById('gal')?.classList.contains('open');
  if (lbOpen) {
    if (e.key === 'ArrowRight') lbNext();
    else if (e.key === 'ArrowLeft') lbPrev();
    else if (e.key === 'Escape') closeLb();
  } else if (galOpen && e.key === 'Escape') {
    closeGallery();
  }
});

/* Swipe in lightbox */
let swipeX = 0;
document.getElementById('lb')?.addEventListener('touchstart', e => {
  swipeX = e.touches[0].clientX;
}, { passive: true });
document.getElementById('lb')?.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - swipeX;
  if (Math.abs(dx) > 48) dx < 0 ? lbNext() : lbPrev();
});
