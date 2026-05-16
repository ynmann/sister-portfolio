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

/* === DEVICE DETECTION ================================ */
const IS_MOBILE  = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
const IS_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* === LENIS + GSAP ==================================== */
gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  duration: IS_REDUCED ? 0 : 1.2,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
lenis.on('scroll', () => ScrollTrigger.update());

/* === THREE.JS: FLOATING ARCHITECTURAL FRAMES ======== */
/*
 * Replaces the particle sphere with floating wireframe rectangles —
 * like framed artwork, mirrors, and panels from interior design.
 * Elegant, on-brand, and far less generic than a sphere.
 */
class HeroScene {
  constructor() {
    this.canvas = document.getElementById('heroCanvas');
    if (!this.canvas || typeof THREE === 'undefined') return;

    this.mouse   = { x: 0, y: 0 };
    this.target  = { x: 0, y: 0 };
    this.time    = 0;
    this._paused = false;

    this._init();
    this._loop();

    window.addEventListener('mousemove', e => {
      this.mouse.x =  (e.clientX / window.innerWidth  - 0.5) * 2;
      this.mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    let _rt;
    window.addEventListener('resize', () => {
      clearTimeout(_rt);
      _rt = setTimeout(() => this._resize(), 150);
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      this._paused = document.hidden;
    });

    const obs = new IntersectionObserver(([e]) => {
      this._paused = !e.isIntersecting || document.hidden;
    }, { rootMargin: '200px' });
    obs.observe(this.canvas);

    setTimeout(() => this.canvas.classList.add('ready'), 600);
  }

  _init() {
    const W = this.canvas.clientWidth  || window.innerWidth;
    const H = this.canvas.clientHeight || window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: false });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, IS_MOBILE ? 1 : 2));
    this.renderer.setSize(W, H, false);

    this.scene  = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
    this.camera.position.z = 3.5;

    this._buildFrames();
    this._buildDust();
  }

  /*
   * Floating wireframe rectangles — picture frames, mirror outlines,
   * architectural panels. The visual language of interior design.
   * Each entry: [width, height, x, y, z, rotX, rotY, rotZ, opacity]
   */
  _buildFrames() {
    this.group  = new THREE.Group();
    this.frames = [];

    const defs = [
      /* main large landscape — like a panoramic artwork   */ [3.0, 1.9,  1.1,  0.0,  0.0,  0.00,  0.22,  0.00, 0.22],
      /* tall portrait — mirror or doorway                 */ [1.3, 2.3, -0.9,  0.1, -0.5,  0.05, -0.16,  0.03, 0.15],
      /* medium landscape — artwork in background          */ [2.4, 1.5,  0.8, -0.8, -1.3,  0.12,  0.07, -0.05, 0.10],
      /* small accent square — decorative panel            */ [0.8, 1.1,  2.1,  0.7, -0.2, -0.04,  0.42,  0.06, 0.13],
      /* thin horizontal bar — shelf or skirting board     */ [4.0, 0.5,  0.0,  1.5, -0.9, -0.07,  0.00,  0.00, 0.07],
      /* distant tall frame — layered depth                */ [1.7, 2.6, -0.2, -0.1, -2.0,  0.06, -0.09,  0.00, 0.06],
    ];

    defs.forEach(([w, h, x, y, z, rx, ry, rz, opacity]) => {
      const geo  = new THREE.EdgesGeometry(new THREE.PlaneGeometry(w, h));
      const mat  = new THREE.LineBasicMaterial({ color: 0xB8883A, transparent: true, opacity });
      const mesh = new THREE.LineSegments(geo, mat);
      mesh.position.set(x, y, z);
      mesh.rotation.set(rx, ry, rz);
      mesh.userData = { rx, ry, rz };
      this.frames.push(mesh);
      this.group.add(mesh);
    });

    // Subtle outer glow on the main frame (slightly larger, very low opacity)
    const glowGeo = new THREE.EdgesGeometry(new THREE.PlaneGeometry(3.25, 2.1));
    const glowMat = new THREE.LineBasicMaterial({ color: 0xD4A85A, transparent: true, opacity: 0.06 });
    const glow    = new THREE.LineSegments(glowGeo, glowMat);
    glow.position.copy(this.frames[0].position);
    glow.rotation.copy(this.frames[0].rotation);
    this.group.add(glow);

    this.scene.add(this.group);
  }

  /* Fine golden dust — like suspended particles in a sunlit room */
  _buildDust() {
    const N   = IS_MOBILE ? 100 : 260;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 8;
      pos[i*3+1] = (Math.random() - 0.5) * 6;
      pos[i*3+2] = (Math.random() - 0.5) * 4;
    }
    const geo  = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.dust  = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.007, color: 0xD4A85A, transparent: true, opacity: 0.30,
    }));
    this.scene.add(this.dust);
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
    if (this._paused) return;

    const dt = IS_REDUCED ? 0 : 0.003;
    this.time += dt;

    this.target.x += (this.mouse.x * 0.16 - this.target.x) * 0.022;
    this.target.y += (this.mouse.y * 0.16 - this.target.y) * 0.022;

    // Whole group slowly rotates + follows mouse
    this.group.rotation.y = this.time * 0.045 + this.target.x * 0.75;
    this.group.rotation.x = this.target.y * 0.22;

    // Individual frames breathe independently
    this.frames.forEach((f, i) => {
      const { rx, ry, rz } = f.userData;
      f.rotation.y = ry + Math.sin(this.time * 0.32 + i * 0.95) * 0.038;
      f.rotation.x = rx + Math.sin(this.time * 0.22 + i * 1.40) * 0.024;
    });

    if (this.dust) {
      this.dust.rotation.y = this.time * 0.011;
      this.dust.rotation.x = Math.sin(this.time * 0.09) * 0.038;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

/* === THREE.JS: CONTACT AMBIENT FIELD ================ */
class ContactScene {
  constructor() {
    this.canvas = document.getElementById('contactCanvas');
    if (!this.canvas || typeof THREE === 'undefined') return;
    this.time    = 0;
    this._paused = false;

    this._init();
    this._loop();

    let _rt;
    window.addEventListener('resize', () => {
      clearTimeout(_rt);
      _rt = setTimeout(() => this._resize(), 150);
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      this._paused = document.hidden;
    });

    const obs = new IntersectionObserver(([e]) => {
      this._paused = !e.isIntersecting || document.hidden;
    }, { rootMargin: '100px' });
    obs.observe(this.canvas);
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

    const N   = 700;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 12;
      pos[i*3+1] = (Math.random() - 0.5) * 8;
      pos[i*3+2] = (Math.random() - 0.5) * 4;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.points = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.009, color: 0xB8883A, transparent: true, opacity: 0.25,
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
    if (this._paused) return;
    this.time += 0.003;
    if (this.points) {
      this.points.rotation.y = this.time * 0.07;
      this.points.rotation.x = Math.sin(this.time * 0.13) * 0.07;
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
        setTimeout(onPageReady, 1400);
      }, 350);
    }
  }, 22);
})();

/* === PAGE READY ====================================== */
let _readyFired = false;
function onPageReady() {
  if (_readyFired) return;
  _readyFired = true;
  document.body.style.overflow = '';

  playHeroAnims();
  initHeroSlideshow();
  initHeroScrollOut();
  initScrollReveal();
  initParallax();
  initStatsCountUp();

  // Skip Three.js on touch/small-screen to save battery
  if (!IS_MOBILE) {
    new HeroScene();
    new ContactScene();
  }
}

/* === HERO ENTRANCE =================================== */
function playHeroAnims() {
  if (IS_REDUCED) {
    gsap.set(['.hero__tag', '.hero__title-line span',
              '.hero__tagline', '.hero__meta', '.hero__scroll',
              '.hero__feat'], { clearProps: 'all' });
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl
    .fromTo('.hero__tag',            { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.85 })
    .fromTo('.hero__title-line span',{ yPercent: 115 },     { yPercent: 0, duration: 1.3, stagger: 0.15 }, '-=0.35')
    .fromTo('.hero__feat',           { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.1 }, '-=0.6')
    .fromTo('.hero__tagline',        { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.85 }, '-=0.55')
    .fromTo('.hero__meta',           { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.75 }, '-=0.45')
    .fromTo('.hero__scroll',         { opacity: 0 },        { opacity: 1, duration: 0.6 }, '-=0.25');
}

/* === HERO SLIDESHOW ================================== */
function initHeroSlideshow() {
  const slides = document.querySelectorAll('.hero__feat-slide');
  const dots   = document.querySelectorAll('.hero__feat-dot');
  const lblEl  = document.querySelector('.hero__feat-lbl');
  if (!slides.length) return;

  let current = 0;
  let autoTimer;
  let running = false;

  _kenBurns(slides[0].querySelector('img'));

  function _kenBurns(img) {
    if (!img || IS_REDUCED) return;
    gsap.fromTo(img,
      { scale: 1.09, transformOrigin: '60% 50%' },
      { scale: 1.02, duration: 5.5, ease: 'none' }
    );
  }

  function goTo(next) {
    if (next === current || running) return;
    running = true;
    const prev = current;
    current = next;

    gsap.to(slides[prev], {
      clipPath: 'inset(0 0 0 100%)', duration: 1.0, ease: 'power3.inOut',
      onComplete: () => {
        gsap.set(slides[prev], { opacity: 0, clipPath: 'inset(0 0 0 100%)' });
        slides[prev].classList.remove('is-active');
        running = false;
      },
    });

    slides[current].classList.add('is-active');
    gsap.set(slides[current], { opacity: 1, clipPath: 'inset(0 100% 0 0)' });
    gsap.to(slides[current], {
      clipPath: 'inset(0 0% 0 0)', duration: 1.0, ease: 'power3.inOut',
      onStart: () => _kenBurns(slides[current].querySelector('img')),
    });

    if (lblEl) {
      gsap.to(lblEl, {
        opacity: 0, duration: 0.25,
        onComplete: () => {
          lblEl.textContent = slides[current].dataset.label || '';
          gsap.to(lblEl, { opacity: 1, duration: 0.35 });
        },
      });
    }
    dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo((current + 1) % slides.length), 4500);
  }

  dots.forEach((dot, i) => {
    dot.style.pointerEvents = 'auto';
    dot.addEventListener('click', () => { goTo(i); startAuto(); });
  });

  const feat = document.querySelector('.hero__feat');
  feat?.addEventListener('mouseenter', () => clearInterval(autoTimer));
  feat?.addEventListener('mouseleave', startAuto);

  startAuto();
}

/* === HERO SCROLL-OUT PARALLAX ======================== */
function initHeroScrollOut() {
  if (IS_REDUCED) return;

  // Title area drifts up
  gsap.to('.hero__center', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.4 },
    y: -90, ease: 'none',
  });

  // Eyebrow + foot fade as hero exits
  gsap.to('.hero__eyebrow, .hero__foot', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: '55% top', scrub: 1.2 },
    opacity: 0, ease: 'none',
  });

}

/* === SCROLL REVEAL ==================================== */
function initScrollReveal() {
  // Portfolio cards: stagger as a group
  const cards = document.querySelectorAll('.proj-card.js-reveal');
  cards.forEach(el => el.classList.remove('js-reveal'));
  if (cards.length) {
    gsap.fromTo(cards,
      { opacity: 0, y: IS_REDUCED ? 0 : 55 },
      {
        opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
        stagger: IS_REDUCED ? 0 : 0.07,
        scrollTrigger: { trigger: '.proj-grid', start: 'top 88%', toggleActions: 'play none none none' },
      }
    );
  }

  // Process steps: stagger
  const steps = document.querySelectorAll('.pstep.js-reveal');
  steps.forEach(el => el.classList.remove('js-reveal'));
  if (steps.length) {
    gsap.fromTo(steps,
      { opacity: 0, y: IS_REDUCED ? 0 : 28 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: IS_REDUCED ? 0 : 0.1,
        scrollTrigger: { trigger: '.proc__steps', start: 'top 82%', toggleActions: 'play none none none' },
      }
    );
  }

  // Services cards: stagger
  const svcs = document.querySelectorAll('.svc.js-reveal');
  svcs.forEach(el => el.classList.remove('js-reveal'));
  if (svcs.length) {
    gsap.fromTo(svcs,
      { opacity: 0, y: IS_REDUCED ? 0 : 32 },
      {
        opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', stagger: IS_REDUCED ? 0 : 0.12,
        scrollTrigger: { trigger: '.svcs__grid', start: 'top 82%', toggleActions: 'play none none none' },
      }
    );
  }

  // Everything else individually
  document.querySelectorAll('.js-reveal').forEach(el => {
    const isTag = el.classList.contains('about__tag') ||
                  el.classList.contains('svcs__tag')  ||
                  el.classList.contains('proc__tag')  ||
                  el.classList.contains('contact__tag');

    if (isTag) {
      gsap.fromTo(el,
        { opacity: 0, x: IS_REDUCED ? 0 : -22 },
        {
          opacity: 1, x: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
        }
      );
    } else {
      gsap.fromTo(el,
        { opacity: 0, y: IS_REDUCED ? 0 : 40 },
        {
          opacity: 1, y: 0, duration: 1, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
        }
      );
    }
  });
}

/* === PORTRAIT PARALLAX ================================ */
function initParallax() {
  if (IS_REDUCED || IS_MOBILE) return;
  document.querySelectorAll('[data-parallax]').forEach(img => {
    gsap.to(img, {
      y: -70, ease: 'none',
      scrollTrigger: {
        trigger: img.closest('section') || img.parentElement,
        start: 'top bottom', end: 'bottom top', scrub: 1.5,
      },
    });
  });
}

/* === STATS COUNT-UP ================================== */
function initStatsCountUp() {
  document.querySelectorAll('.stats__n').forEach(el => {
    const text = el.textContent.trim();
    const m    = text.match(/(\d[\d\s]*)/);
    if (!m) return;

    const raw    = m[1].replace(/\s/g, '');
    const end    = parseInt(raw, 10);
    if (isNaN(end)) return;

    const before = text.slice(0, text.indexOf(m[1]));
    const after  = text.slice(text.indexOf(m[1]) + m[1].length);
    const fmt    = n => {
      const s = String(Math.round(n));
      return s.length > 3 ? s.slice(0, -3) + ' ' + s.slice(-3) : s;
    };

    el.textContent = before + '0' + after;

    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => {
        if (IS_REDUCED) { el.textContent = before + fmt(end) + after; return; }
        const obj = { n: 0 };
        gsap.to(obj, {
          n: end, duration: 1.6, ease: 'power2.out',
          onUpdate() { el.textContent = before + fmt(obj.n) + after; },
        });
      },
    });
  });
}

/* === CUSTOM CURSOR =================================== */
(function initCursor() {
  const dot  = document.getElementById('curDot');
  const ring = document.getElementById('curRing');
  // Only on non-touch devices
  if (!dot || !ring || IS_MOBILE) return;

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

  document.querySelectorAll('a, button, .proj-card, .svc, .gal__item').forEach(el => {
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

/* === PROJECT CARDS =================================== */
(function initProjectCards() {
  document.querySelectorAll('.proj-card').forEach(card => {
    const id = card.dataset.project;
    if (!PROJECTS[id]) return;
    card.addEventListener('click', () => openGallery(id));
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
  const io   = new IntersectionObserver(entries => {
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
