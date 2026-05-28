/* ============================================================
   BeFit2Benefit — Component Loader
   ============================================================ */

(async function () {

  /* ── Inject HTML component into placeholder ── */
  async function inject(id, file) {
    const el = document.getElementById(id);
    if (!el) return;
    try {
      const res = await fetch(file);
      if (!res.ok) throw new Error(res.status);
      const html = await res.text();
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      el.replaceWith(...tmp.childNodes);
    } catch (e) {
      console.warn('[components] Failed to load:', file, e);
    }
  }

  /* ── Load header first (need it for nav + hamburger) ── */
  await inject('site-header', 'components/header.html');

  /* ── Active nav link based on current page ── */
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links > li > a[data-page]').forEach(a => {
    const page = a.dataset.page;
    const isIndex = (page === 'index') && (path === '/' || path.endsWith('/') || path.endsWith('index.html'));
    const isPage  = !isIndex && path.endsWith(page + '.html');
    if (isIndex || isPage) a.classList.add('active');
  });

  /* ── Hamburger toggle ── */
  const hamburger = document.querySelector('.hamburger');
  const navLinks  = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    /* Mobile dropdown toggle (click on parent link) */
    navLinks.querySelectorAll('.dropdown > a').forEach(a => {
      a.addEventListener('click', e => {
        if (window.innerWidth <= 680) {
          e.preventDefault();
          a.closest('.dropdown').classList.toggle('open');
        }
      });
    });

    /* Close nav on any regular link click */
    navLinks.querySelectorAll('a:not(.dropdown > a)').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    /* Close on resize back to desktop */
    window.addEventListener('resize', () => {
      if (window.innerWidth > 680) {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ── Load footer, CTA and cookie banner in parallel ── */
  await Promise.all([
    inject('site-footer', 'components/footer.html'),
    inject('site-cta',    'components/cta.html'),
    inject('site-cookie', 'components/cookie-banner.html'),
  ]);

  /* ── Cookie banner logic ── */
  const banner  = document.getElementById('cookie-banner');
  const consent = localStorage.getItem('cookie-consent');

  if (banner && !consent) {
    banner.style.display = 'flex';

    document.getElementById('cookie-accept')?.addEventListener('click', () => {
      localStorage.setItem('cookie-consent', 'accepted');
      banner.style.display = 'none';
      document.dispatchEvent(new CustomEvent('cookie-accepted'));
    });

    document.getElementById('cookie-decline')?.addEventListener('click', () => {
      localStorage.setItem('cookie-consent', 'declined');
      banner.style.display = 'none';
    });
  }

})();
