/* =====================================================
   app.js — Madina Bekassyl Interior Design
   Three.js r128 · Lenis 1.0 · GSAP 3 + ScrollTrigger
   ===================================================== */

'use strict';

/* === PROJECTS DATA =================================== */
const PROJECTS = {
  'belle-view':   { name: 'Belle View',    meta: '2025 · Жилой · Современный стиль',      count: 11 },
  'kazybek':      { name: 'Kazybek Bi',    meta: '2024 · Жилой · 82 м²',                  count: 10 },
  'arena-park':   { name: 'Arena Park',    meta: '2024 · Жилой · Минимализм',              count: 13 },
  'arena-park-2': { name: 'Arena Park II', meta: '2024 · Жилой · Современный стиль',      count:  9 },
  'arman':        { name: 'Arman',         meta: '2024 · Жилой · Современный с классикой', count: 12 },
  'office':       { name: 'Office',        meta: 'Коммерческий · Современный',             count: 11 },
};

function projectImages(id, count) {
  return Array.from({ length: count }, (_, i) =>
    `static/images/projects/${id}/${String(i + 1).padStart(2, '0')}.jpg`
  );
}

/* === LENIS + GSAP ==================================== */
gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  duration: 1.2,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
lenis.on('scroll', () => ScrollTrigger.update());

/* === THREE.JS: HERO PARTICLE SPHERE ================= */
class HeroScene {
  constructor() {
    this.canvas = document.getElementById('heroCanvas');
    if (!this.canvas || typeof THREE === 'undefined') return;

    this.mouse  = { x: 0, y: 0 };
    this.target = { x: 0, y: 0 };
    this.time   = 0;

    this._init();
    this._loop();

    window.addEventListener('mousemove', e => {
      this.mouse.x =  (e.clientX / window.innerWidth  - 0.5) * 2;
      this.mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    window.addEventListener('resize', () => this._resize(), { passive: true });

    setTimeout(() => this.canvas.classList.add('ready'), 600);
  }

  _init() {
    const W = this.canvas.clientWidth  || window.innerWidth;
    const H = this.canvas.clientHeight || window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: false });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(W, H, false);

    this.scene  = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    this.camera.position.z = 3.2;

    this._buildSphere();
    this._buildAmbient();
  }

  _buildSphere() {
    const N   = 2500;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle — uniform sphere coverage

    for (let i = 0; i < N; i++) {
      const y  = 1 - (i / (N - 1)) * 2;
      const rr = Math.sqrt(1 - y * y);
      const th = phi * i;
      const R  = 1.35;

      pos[i*3]   = Math.cos(th) * rr * R;
      pos[i*3+1] = y * R;
      pos[i*3+2] = Math.sin(th) * rr * R;

      const t    = Math.random();
      col[i*3]   = (0.55 + 0.45 * t) * (184 / 255);
      col[i*3+1] = (0.55 + 0.45 * t) * (136 / 255);
      col[i*3+2] = (0.35 + 0.65 * t) * ( 58 / 255);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));

    this.sphere = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.018, vertexColors: true, transparent: true, opacity: 0.88, sizeAttenuation: true,
    }));
    this.scene.add(this.sphere);
  }

  _buildAmbient() {
    const N   = 600;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);

    for (let i = 0; i < N; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 9;
      pos[i*3+1] = (Math.random() - 0.5) * 9;
      pos[i*3+2] = (Math.random() - 0.5) * 5;

      col[i*3]   = 0.6  + Math.random() * 0.2;
      col[i*3+1] = 0.45 + Math.random() * 0.15;
      col[i*3+2] = 0.12 + Math.random() * 0.12;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));

    this.ambient = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.006, vertexColors: true, transparent: true, opacity: 0.38, sizeAttenuation: true,
    }));
    this.scene.add(this.ambient);
  }

  _resize() {
    const W = this.canvas.clientWidth  || window.innerWidth;
    const H = this.canvas.clientHeight || window.innerHeight;
    this.camera.aspect = W / H;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(W, H, false);
  }

  _loop() {
    requestAnimationFrame(() => this._loop());
    this.time += 0.005;

    this.target.x += (this.mouse.x * 0.25 - this.target.x) * 0.025;
    this.target.y += (this.mouse.y * 0.25 - this.target.y) * 0.025;

    if (this.sphere) {
      this.sphere.rotation.y = this.time * 0.12 + this.target.x;
      this.sphere.rotation.x = this.target.y * 0.45;
      const pulse = 1 + Math.sin(this.time * 0.7) * 0.012;
      this.sphere.scale.setScalar(pulse);
    }

    if (this.ambient) {
      this.ambient.rotation.y = this.time * 0.025;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

/* === THREE.JS: CONTACT AMBIENT FIELD ================ */
class ContactScene {
  constructor() {
    this.canvas = document.getElementById('contactCanvas');
    if (!this.canvas || typeof THREE === 'undefined') return;
    this.time = 0;
    this._init();
    this._loop();
    window.addEventListener('resize', () => this._resize(), { passive: true });
  }

  _init() {
    const W = this.canvas.clientWidth  || window.innerWidth;
    const H = this.canvas.clientHeight || 600;

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: false });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.renderer.setSize(W, H, false);

    this.scene  = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    this.camera.position.z = 3;

    const N   = 900;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 12;
      pos[i*3+1] = (Math.random() - 0.5) * 8;
      pos[i*3+2] = (Math.random() - 0.5) * 4;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    this.points = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.01, color: 0xB8883A, transparent: true, opacity: 0.28, sizeAttenuation: true,
    }));
    this.scene.add(this.points);
  }

  _resize() {
    const W = this.canvas.clientWidth  || window.innerWidth;
    const H = this.canvas.clientHeight || 600;
    this.camera.aspect = W / H;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(W, H, false);
  }

  _loop() {
    requestAnimationFrame(() => this._loop());
    this.time += 0.003;
    if (this.points) {
      this.points.rotation.y = this.time * 0.08;
      this.points.rotation.x = Math.sin(this.time * 0.15) * 0.08;
    }
    this.renderer.render(this.scene, this.camera);
  }
}

/* === PRELOADER ======================================= */
(function initPreloader() {
  const counter = document.querySelector('.preloader__count');
  const barFill = document.querySelector('.preloader__bar-fill');
  const loader  = document.querySelector('.preloader');
  if (!loader) { onPageReady(); return; }

  document.body.style.overflow = 'hidden';

  let n = 0;
  const tick = setInterval(() => {
    n = Math.min(n + Math.ceil(Math.random() * 4 + 1), 100);
    if (counter) counter.textContent = n;
    if (barFill)  barFill.style.right = (100 - n) + '%';
    if (n >= 100) {
      clearInterval(tick);
      setTimeout(() => {
        loader.classList.add('out');
        loader.addEventListener('transitionend', onPageReady, { once: true });
        setTimeout(onPageReady, 1400); // fallback
      }, 350);
    }
  }, 22);
})();

/* === PAGE READY: kick off all animations + scenes === */
let _readyFired = false;
function onPageReady() {
  if (_readyFired) return;
  _readyFired = true;
  document.body.style.overflow = '';
  playHeroAnims();
  initScrollReveal();
  initParallax();
  new HeroScene();
  new ContactScene();
}

/* === HERO ENTRANCE ANIMATIONS ======================== */
function playHeroAnims() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.hero__tag',        { autoAlpha: 0, y: 18, duration: 0.9 })
    .from('.hero__title-line', { autoAlpha: 0, y: 52, duration: 1.2, stagger: 0.14 }, '-=0.6')
    .from('.hero__sig',        { autoAlpha: 0, duration: 0.9, ease: 'power2.out' },   '-=0.5')
    .from('.hero__tagline',    { autoAlpha: 0, y: 14, duration: 0.8 },                '-=0.4')
    .from('.hero__meta',       { autoAlpha: 0, y: 10, duration: 0.7 },                '-=0.35')
    .from('.hero__scroll',     { autoAlpha: 0, duration: 0.6 },                        '-=0.2');
}

/* === SCROLL REVEAL (GSAP ScrollTrigger) ============== */
function initScrollReveal() {
  document.querySelectorAll('.js-reveal').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 1, ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      }
    );
  });
}

/* === PARALLAX ======================================== */
function initParallax() {
  document.querySelectorAll('[data-parallax]').forEach(img => {
    gsap.to(img, {
      y: -70,
      ease: 'none',
      scrollTrigger: {
        trigger: img.closest('section') || img.parentElement,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      },
    });
  });
}

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
  const wrap = document.querySelector('.marquee__track')?.parentElement;
  if (!wrap) return;
  const tracks = wrap.querySelectorAll('.marquee__track');
  if (tracks.length < 2) {
    wrap.appendChild(tracks[0].cloneNode(true));
  }
})();

/* === PROJECT LIST + HOVER IMAGE ===================== */
(function initProjectList() {
  const hoverImg = document.getElementById('projHoverImg');
  const hoverEl  = hoverImg?.querySelector('img');
  let ticking = false, mouseX = 0, mouseY = 0;

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
      if (hoverEl) hoverEl.src = `static/images/projects/${id}/01.jpg`;
      hoverImg?.classList.add('visible');
    });
    item.addEventListener('mouseleave', () => hoverImg?.classList.remove('visible'));
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

  const grid  = document.getElementById('galGrid');
  const modal = document.getElementById('gal');

  grid.innerHTML = curProject.images.map((src, i) =>
    `<div class="gal__item" data-idx="${i}">
       <img src="${src}" alt="${p.name} — фото ${i + 1}" loading="lazy">
     </div>`
  ).join('');

  modal.classList.add('open');
  modal.querySelector('.gal__body').scrollTop = 0;
  document.body.style.overflow = 'hidden';

  const body = modal.querySelector('.gal__body');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); }
    });
  }, { threshold: 0.05, root: body });

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
  if (img.src.endsWith(src)) img.classList.remove('fade');

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

/* === KEYBOARD + CLICK HANDLERS ====================== */
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

/* === SWIPE IN LIGHTBOX ============================== */
let swipeX = 0;
document.getElementById('lb')?.addEventListener('touchstart', e => {
  swipeX = e.touches[0].clientX;
}, { passive: true });
document.getElementById('lb')?.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - swipeX;
  if (Math.abs(dx) > 48) dx < 0 ? lbNext() : lbPrev();
});
