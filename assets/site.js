(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const esc = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  /* Cabecera: fondo sólido al hacer scroll */
  const header = $('.site-header');
  const onScroll = () => header && header.classList.toggle('is-scrolled', scrollY > 12);
  onScroll(); addEventListener('scroll', onScroll, { passive: true });

  /* Menú móvil */
  const toggle = $('.nav-toggle'), nav = $('.main-nav');
  if (toggle && nav) {
    const setMenu = open => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      nav.classList.toggle('open', open);
      header.classList.toggle('menu-open', open);
    };
    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
    nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  }

  /* Video de fondo: respetar "reducir movimiento" */
  const video = $('.scene-video');
  if (video && reduce.matches) video.pause();

  /* Brasas flotantes */
  const canvas = $('.scene-embers');
  if (canvas && !reduce.matches) {
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, parts = [];
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const make = initial => ({
      x: Math.random() * w, y: initial ? Math.random() * h : h + 12,
      r: Math.random() * 1.7 + .5, vy: -(Math.random() * .55 + .18),
      vx: (Math.random() - .5) * .2, ph: Math.random() * 6.28,
      a: Math.random() * .6 + .3, hot: Math.random() < .22
    });
    const resize = () => {
      w = innerWidth; h = innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = w < 700 ? 28 : 64;
      parts = Array.from({ length: n }, () => make(true));
    };
    resize(); addEventListener('resize', resize);
    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (const p of parts) {
        p.ph += .02; p.x += p.vx + Math.sin(p.ph) * .3; p.y += p.vy;
        if (p.y < -10) Object.assign(p, make(false));
        const fade = Math.min(1, p.y / (h * .35)) * p.a;
        const col = p.hot ? '255,150,70' : '255,45,74';
        ctx.fillStyle = `rgba(${col},${fade * .16})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, 6.283); ctx.fill();
        ctx.fillStyle = `rgba(${col},${fade})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
      requestAnimationFrame(frame);
    };
    frame();
  }

  /* Índice lateral de "El servidor": marca la sección visible */
  const tocLinks = $$('.toc a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const map = new Map(tocLinks.map(a => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          tocLinks.forEach(a => a.classList.remove('is-active'));
          map.get(en.target.id)?.classList.add('is-active');
        }
      });
    }, { rootMargin: '-20% 0px -65% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* Galería pública (assets/albums/albums.json) */
  (async function gallery() {
    const root = $('#public-gallery');
    if (!root) return;
    let albums = [], loadError = false;
    try {
      const r = await fetch('assets/albums/albums.json', { cache: 'no-store' });
      if (!r.ok) throw new Error('No se pudo leer el índice de álbumes');
      const data = await r.json();
      albums = (Array.isArray(data.albums) ? data.albums : []).map(a => ({
        ...a,
        photos: (a.photos || []).map(p => typeof p === 'string' ? { src: p, thumb: p, title: '' } : { thumb: p.src, title: '', ...p })
      }));
    } catch (err) { loadError = true; console.warn('Galería pública no disponible:', err); }

    const filters = $$('[data-filter]');
    const box = $('#gallery-lightbox'), img = $('#lightbox-image'), cap = $('#lightbox-caption');
    let current = null, index = 0, lastFocus = null;

    const fmtDate = d => {
      const t = d ? new Date(d + 'T00:00:00') : null;
      return t && !isNaN(t) ? t.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }) + ' · ' : '';
    };

    const render = (filter = 'all') => {
      const visible = albums.filter(a => filter === 'all' || a.category === filter);
      if (loadError) {
        root.innerHTML = '<div class="gallery-empty panel"><div class="glyph" aria-hidden="true"><span>✦</span></div><h2>No se pudo cargar la galería</h2><p>Si abriste el archivo directamente desde tu PC, el navegador bloquea la lectura de las fotos. Se ven bien al publicar el sitio en GitHub Pages, o abriéndolo con un servidor local.</p><p class="note">Probar en tu PC: en la carpeta del sitio ejecutá <code>python -m http.server 8000</code> y entrá a http://localhost:8000</p></div>';
        return;
      }
      if (!visible.length) {
        root.innerHTML = '<div class="gallery-empty panel"><div class="glyph" aria-hidden="true"><span>✦</span></div><h2>La próxima historia la escribimos juntos</h2><p>Todavía no hay fotos publicadas en esta categoría.</p></div>';
        return;
      }
      root.innerHTML = '<div class="gallery-grid">' + visible.map((a, ai) => {
        const photos = a.photos || [];
        const cover = a.cover || photos[0]?.thumb || '';
        return `<article class="album-card"><button type="button" class="album-cover-btn" data-album="${ai}" data-photo="0" aria-label="Abrir álbum ${esc(a.title || '')}"><img class="album-cover" src="${esc(cover)}" alt="" loading="lazy"></button><div class="album-meta"><h3>${esc(a.title || 'Álbum sin título')}</h3><p>${esc(fmtDate(a.date))}${photos.length} ${photos.length === 1 ? 'foto' : 'fotos'}</p><div class="album-photos">${photos.map((ph, pi) => `<button type="button" data-album="${ai}" data-photo="${pi}" aria-label="Abrir foto ${pi + 1}${ph.title ? ': ' + esc(ph.title) : ''}"><img src="${esc(ph.thumb)}" alt="" loading="lazy"></button>`).join('')}</div></div></article>`;
      }).join('') + '</div>';
      $$('[data-album]', root).forEach(b => b.addEventListener('click', () => open(visible[+b.dataset.album], +b.dataset.photo, b)));
    };

    const show = () => {
      const photos = current?.photos || [];
      if (!photos.length) return;
      index = (index + photos.length) % photos.length;
      const ph = photos[index];
      img.src = ph.src;
      img.alt = ph.title || current.title || 'Captura de L2 Intratables';
      cap.textContent = `${ph.title ? ph.title + ' — ' : ''}${current.title || 'Álbum'} (${index + 1} / ${photos.length})`;
    };
    const open = (album, i, trigger) => {
      current = album; index = i; lastFocus = trigger; show();
      box.hidden = false; document.body.style.overflow = 'hidden';
      $('.lightbox-close', box).focus();
    };
    const close = () => {
      box.hidden = true; document.body.style.overflow = '';
      lastFocus?.focus();
    };
    if (box) {
      $('.lightbox-close', box).addEventListener('click', close);
      $('.lightbox-prev', box).addEventListener('click', () => { index--; show(); });
      $('.lightbox-next', box).addEventListener('click', () => { index++; show(); });
      box.addEventListener('click', e => { if (e.target === box) close(); });
      addEventListener('keydown', e => {
        if (box.hidden) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') { index--; show(); }
        if (e.key === 'ArrowRight') { index++; show(); }
      });
    }
    filters.forEach(btn => btn.addEventListener('click', () => {
      filters.forEach(b => { const on = b === btn; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', String(on)); });
      render(btn.dataset.filter);
    }));
    render();
  })();

})();
