/* Claire Charpentier : interactions et animations
   Dépendances (chargées par CDN dans index.html) : GSAP, ScrollTrigger, Lenis.
   Si une librairie ne charge pas, le site reste lisible et utilisable. */
(() => {
  const q = (s, c = document) => c.querySelector(s);
  const qa = (s, c = document) => [...c.querySelectorAll(s)];
  const html = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const animate = hasGsap && !reduce;
  let lenis = null;

  /* ---------- Base (toujours actif) ---------- */
  const an = q('#annee'); if (an) an.textContent = new Date().getFullYear();

  const header = q('.header'), burger = q('.burger'), nav = q('.nav');
  let lastY = 0, menuOpen = false;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    header.classList.toggle('is-hidden', !menuOpen && y > 600 && y > lastY);
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const setMenu = (open) => {
    menuOpen = open;
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    if (lenis) open ? lenis.stop() : lenis.start();
    else document.body.style.overflow = open ? 'hidden' : '';
  };
  if (burger) {
    burger.addEventListener('click', () => setMenu(!menuOpen));
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) setMenu(false); });
  }

  // Ancres internes
  qa('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const target = id.length > 1 ? q(id) : null;
    if (!target) return;
    e.preventDefault();
    if (menuOpen) setMenu(false);
    if (lenis) lenis.scrollTo(target, { duration: 1.4 });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    history.replaceState(null, '', id);
  }));

  // Onglets des conseils
  const tabs = qa('[role="tab"]');
  const selectTab = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const p = q('#' + t.getAttribute('aria-controls'));
      p.hidden = !on;
      if (on && animate) {
        gsap.from(qa('li', p), { x: 36, autoAlpha: 0, duration: .6, stagger: .05, ease: 'power3.out' });
        gsap.fromTo(q('figure', p), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .9, ease: 'power3.inOut', clearProps: 'clipPath' });
        ScrollTrigger.refresh();
      }
    });
    if (focus) tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') selectTab(tabs[(i + 1) % tabs.length], true);
      if (e.key === 'ArrowLeft') selectTab(tabs[(i - 1 + tabs.length) % tabs.length], true);
    });
  });

  // Sur écran tactile : le noir et blanc passe en couleur quand l'image est à l'écran
  if (!fine && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('is-color', e.isIntersecting)), { threshold: .6 });
    qa('.bw').forEach((el) => io.observe(el));
  }

  const loader = q('.loader');
  if (!animate) { if (loader) loader.style.display = 'none'; return; }

  /* ---------- Animations ---------- */
  gsap.registerPlugin(ScrollTrigger);
  html.classList.add('anim');

  if (window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Découpe un texte en mots animables (les pastilles image comptent pour un mot)
  const split = (el) => {
    const walk = (node, out) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach((t) => {
            if (!t) return;
            if (/^\s+$/.test(t)) { out.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const i = document.createElement('span'); i.className = 'wi'; i.textContent = t;
            w.appendChild(i); out.appendChild(w);
          });
        } else if (n.nodeType === 1 && n.classList.contains('pill')) {
          const w = document.createElement('span'); w.className = 'w w--pill';
          n.classList.add('wi'); w.appendChild(n); out.appendChild(w);
        } else if (n.nodeType === 1) {
          const c = n.cloneNode(false); walk(n, c); out.appendChild(c);
        }
      });
    };
    const frag = document.createDocumentFragment();
    walk(el, frag); el.textContent = ''; el.appendChild(frag);
    return qa('.wi', el);
  };

  /* 1. Sections épinglées (créées en premier, dans l'ordre de la page) */

  // Image qui grandit jusqu'au plein écran
  const stage = q('.expand__stage');
  if (stage) {
    const media = q('.expand__media', stage), img = q('img', media);
    const wl = q('.expand__word--l', stage), wr = q('.expand__word--r', stage), over = q('.expand__over', stage);
    const portrait = () => innerWidth <= 800;
    const r0 = () => Math.min(innerWidth, innerHeight) * .17;
    const r1 = () => Math.hypot(innerWidth, innerHeight) / 2 + 4;
    const tl = gsap.timeline({ scrollTrigger: { trigger: stage, start: 'top top', end: '+=170%', pin: true, scrub: .6, anticipatePin: 1, invalidateOnRefresh: true } });
    tl.fromTo(media, { clipPath: () => `circle(${r0()}px at 50% 50%)` }, { clipPath: () => `circle(${r1()}px at 50% 50%)`, duration: 1, ease: 'power2.inOut' }, 0)
      .to(wl, { x: () => (portrait() ? 0 : -innerWidth * .32), y: () => (portrait() ? -innerHeight * .3 : 0), autoAlpha: 0, duration: .55, ease: 'power2.in' }, 0)
      .to(wr, { x: () => (portrait() ? 0 : innerWidth * .32), y: () => (portrait() ? innerHeight * .3 : 0), autoAlpha: 0, duration: .55, ease: 'power2.in' }, 0)
      .fromTo(over, { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: .4, ease: 'power2.out' }, .68)
      .to({}, { duration: .3 });
    if (img) tl.fromTo(img, { scale: 1.4 }, { scale: 1, duration: 1, ease: 'power2.inOut' }, 0);
  }

  // La séance : le scroll s'arrête, les quatre temps défilent
  const sStage = q('.seance__stage');
  if (sStage) {
    const steps = qa('.seance__steps li'), figs = qa('.seance__visual figure');
    const ring = q('#seanceRing'), num = q('#seanceNum');
    const n = steps.length; let cur = -1;
    const setStep = (i) => {
      if (i === cur) return; cur = i;
      steps.forEach((s, k) => { s.classList.toggle('is-active', k === i); s.classList.toggle('is-past', k < i); });
      figs.forEach((f, k) => f.classList.toggle('is-active', k === i));
      num.textContent = '0' + (i + 1);
    };
    ScrollTrigger.create({
      trigger: sStage, start: 'top top', end: () => '+=' + innerHeight * 3.2, pin: true, anticipatePin: 1,
      onUpdate: (self) => {
        ring.style.strokeDashoffset = 301.6 * (1 - (1 / n + (1 - 1 / n) * self.progress));
        setStep(Math.min(n - 1, Math.floor(self.progress * n)));
      },
    });
    ring.style.strokeDashoffset = 301.6 * (1 - 1 / n);
  }

  /* 2. Entrée du site */
  const heroWords = split(q('#heroTitle'));
  if (loader) loader.style.animation = 'none';
  const intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
  intro.from('.loader__fan', { scale: .5, autoAlpha: 0, duration: .6 })
    .from('.loader__name, .loader__sub', { y: 22, autoAlpha: 0, stagger: .1, duration: .6 }, '-=.3')
    .to(loader, { yPercent: -100, duration: .9, ease: 'power4.inOut' }, '+=.3')
    .set(loader, { display: 'none' })
    .from(heroWords, { yPercent: 118, duration: 1.05, stagger: .045 }, '-=.5')
    .from('.hero__eyebrow', { autoAlpha: 0, y: 16, duration: .7 }, '<')
    .fromTo('.hero__arch', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power3.inOut', clearProps: 'clipPath' }, '<')
    .from('.hero__arch img', { scale: 1.35, duration: 1.6, ease: 'power3.out' }, '<')
    .from('.sunburst', { autoAlpha: 0, duration: 1.4 }, '<.2')
    .from('.hero__round', { scale: 0, duration: .9, ease: 'back.out(1.6)' }, '-=.9')
    .from('.rot-badge', { scale: 0, rotate: -120, duration: 1, ease: 'back.out(1.5)' }, '-=.8')
    .from('[data-hero]', { y: 30, autoAlpha: 0, stagger: .1, duration: .8 }, '-=1.2')
    .from('.header', { autoAlpha: 0, duration: .8 }, '-=1')
    .from('.scroll-hint', { autoAlpha: 0, duration: .6 }, '-=.4');

  // Le visuel du hero glisse au scroll
  gsap.to('.hero__visual', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__round', { y: -70, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* 3. Textes */
  qa('[data-split]').forEach((el) => {
    gsap.from(split(el), { yPercent: 118, duration: 1, ease: 'power4.out', stagger: .04, scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  qa('[data-scrub]').forEach((el) => {
    gsap.fromTo(split(el), { opacity: .14 }, { opacity: 1, ease: 'none', stagger: .08, scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 48%', scrub: true } });
  });

  /* 4. Apparitions */
  gsap.set('[data-reveal]', { autoAlpha: 0, y: 44 });
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%', once: true,
    onEnter: (b) => gsap.to(b, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .12, overwrite: true }),
  });
  gsap.from('.tile', { y: 70, autoAlpha: 0, scale: .9, duration: 1, ease: 'power3.out', stagger: .08, scrollTrigger: { trigger: '.bento__grid', start: 'top 82%' } });

  // Frise d'images et de symboles qui défile avec le scroll
  const track = q('.frise__track');
  if (track) gsap.to(track, { x: () => -(track.scrollWidth - innerWidth * .96), ease: 'none', scrollTrigger: { trigger: '.frise', start: 'top bottom', end: 'bottom top', scrub: .6, invalidateOnRefresh: true } });

  // Parallaxe des images
  qa('[data-parallax] img').forEach((img) => {
    gsap.fromTo(img, { yPercent: -7, scale: 1.16 }, { yPercent: 7, scale: 1.16, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // Compteurs
  qa('[data-count]').forEach((el) => {
    const end = +el.dataset.count, o = { v: end > 1000 ? end - 30 : 0 };
    el.textContent = o.v;
    gsap.to(o, { v: end, duration: 1.6, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v); }, scrollTrigger: { trigger: el, start: 'top 90%' } });
  });

  // Frise chronologique
  const dates = q('.frise-dates');
  if (dates) {
    gsap.fromTo(dates, { '--p': 0 }, { '--p': 1, ease: 'none', scrollTrigger: { trigger: dates, start: 'top 85%', end: 'top 35%', scrub: true } });
    gsap.from(qa('li', dates), { autoAlpha: 0, y: 26, duration: .7, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: dates, start: 'top 85%' } });
  }
  gsap.from('.claire__fan', { rotate: -25, scale: .7, autoAlpha: 0, transformOrigin: '50% 100%', duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: '.claire__visual', start: 'top 80%' } });
  gsap.from('.contact__fan', { rotate: 30, autoAlpha: 0, transformOrigin: '50% 100%', ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top 90%', end: 'top 20%', scrub: true } });
  gsap.from('.footer__big', { yPercent: 55, autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top 95%', end: 'bottom bottom', scrub: true } });

  /* 5. Souris : curseur et boutons aimantés */
  if (fine) {
    const c = q('.cursor'), s = c.firstElementChild;
    const xTo = gsap.quickTo(c, 'x', { duration: .35, ease: 'power3' }), yTo = gsap.quickTo(c, 'y', { duration: .35, ease: 'power3' });
    addEventListener('mousemove', (e) => { xTo(e.clientX); yTo(e.clientY); });
    qa('[data-cursor]').forEach((el) => {
      el.addEventListener('mouseenter', () => { c.classList.add('is-label'); s.textContent = el.dataset.cursor; });
      el.addEventListener('mouseleave', () => { c.classList.remove('is-label'); s.textContent = ''; });
    });
    qa('a, button, summary').forEach((el) => {
      el.addEventListener('mouseenter', () => c.classList.add('is-link'));
      el.addEventListener('mouseleave', () => c.classList.remove('is-link'));
    });
    qa('.magnet').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * .3, y: (e.clientY - r.top - r.height / 2) * .3, duration: .4, ease: 'power3.out' });
      });
      el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: .9, ease: 'elastic.out(1,.4)' }));
    });
  }

  // Recalcule les positions quand polices et images sont prêtes
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh());
})();
