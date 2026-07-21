// ─── Shared Components ──────────────────────────────────────────────────────
const { useState, useEffect, useRef } = React;
const getSiteContent = () => window.AE?.site ? window.AE.site() : (window.AE?.DATA?.siteContent || {});
const showSiteSection = name => (getSiteContent().sections || {})[name] !== false;

// ── Scroll reveal hook ───────────────────────────────────────────────────────
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

// ── Nav ──────────────────────────────────────────────────────────────────────
function Nav({ page, setPage }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 860) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const site = getSiteContent();
  const links = [
    { id: 'home', label: 'Home' },
    { id: 'courses', label: 'Courses' },
    { id: 'pricing', label: 'Pricing', section: 'pricing' },
    { id: 'about', label: 'About', section: 'about' },
  ].filter(link => !link.section || showSiteSection(link.section));
  const go = (id) => { setPage(id); setMenuOpen(false); window.scrollTo(0, 0); };
  const goPortal = () => { window.location.href = '/portal'; };

  const isScrolledOrOpen = scrolled || menuOpen;

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      padding: scrolled ? '10px 32px' : '18px 32px',
      background: isScrolledOrOpen
        ? 'color-mix(in oklab, var(--paper) 88%, transparent)'
        : 'transparent',
      backdropFilter: isScrolledOrOpen ? 'blur(16px)' : 'none',
      borderBottom: isScrolledOrOpen ? '1px solid var(--line)' : '1px solid transparent',
      transition: 'all 0.35s var(--ease)',
    }}>
      {/* Main bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Wordmark */}
        <button onClick={() => go('home')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <img src="/logo.jpeg" alt="Hadi Shokeir" style={{
            width: 36, height: 36, borderRadius: 8,
            objectFit: 'cover', objectPosition: 'center top',
            flexShrink: 0, border: '1px solid var(--line)',
          }} />
          <div>
            <div style={{
              fontFamily: 'var(--f-head)', fontSize: '0.95rem', fontWeight: 600,
              color: 'var(--ink)', letterSpacing: '0.01em',
            }}>{site.brand || 'Arabic Enthusiast'}</div>
            <div style={{
              fontFamily: 'var(--f-body)', fontSize: '0.58rem', fontWeight: 700,
              color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase',
              marginTop: 1,
            }}>Arabic · English · Language Mentor</div>
          </div>
        </button>

        {/* Desktop links */}
        <ul style={{ display: 'flex', gap: 32, listStyle: 'none', margin: 0, padding: 0 }} className="nav-desktop">
          {links.map(l => (
            <li key={l.id}>
              <button onClick={() => go(l.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--f-body)', fontSize: '0.82rem', fontWeight: page === l.id ? 600 : 400,
                color: page === l.id ? 'var(--ink)' : 'var(--muted)',
                transition: 'color 0.2s', padding: '4px 0',
                borderBottom: page === l.id ? '1.5px solid var(--accent)' : '1.5px solid transparent',
              }}>{l.label}</button>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={goPortal} className="nav-desktop" style={{
            fontFamily: 'var(--f-body)', fontSize: '0.82rem', fontWeight: 500,
            padding: '9px 18px', background: 'transparent',
            border: '1px solid var(--line)', color: 'var(--ink-2)',
            cursor: 'pointer', transition: 'all 0.2s var(--ease)',
            borderRadius: 'var(--r)',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--ink-2)'; }}
          >Log in</button>

          <button onClick={() => go('courses')} className="nav-desktop" style={{
            fontFamily: 'var(--f-body)', fontSize: '0.82rem', fontWeight: 600,
            padding: '9px 20px', background: 'var(--accent)',
            border: '1px solid var(--accent)', color: 'var(--on-accent)',
            cursor: 'pointer', transition: 'all 0.2s var(--ease)',
            borderRadius: 'var(--r)',
            boxShadow: '0 4px 14px -8px color-mix(in oklab, var(--accent) 60%, transparent)',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >Start learning →</button>

          {/* Hamburger — mobile only */}
          <button onClick={() => setMenuOpen(o => !o)} className="nav-mobile" style={{
            background: 'none', border: '1px solid var(--line)',
            borderRadius: 'var(--r-sm)', cursor: 'pointer',
            padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 5,
            minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center',
          }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: 'block', width: 20, height: 1.5,
                background: 'var(--ink)', borderRadius: 1,
                transition: 'all 0.25s',
                transform: menuOpen
                  ? i === 0 ? 'translateY(6.5px) rotate(45deg)'
                  : i === 2 ? 'translateY(-6.5px) rotate(-45deg)'
                  : 'scaleX(0)'
                  : 'none',
                opacity: menuOpen && i === 1 ? 0 : 1,
              }} />
            ))}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          paddingTop: 20, paddingBottom: 24,
          borderTop: '1px solid var(--line)', marginTop: 16,
          display: 'flex', flexDirection: 'column', gap: 4,
          animation: 'fadeIn 0.2s var(--ease)',
        }}>
          {links.map(l => (
            <button key={l.id} onClick={() => go(l.id)} style={{
              background: page === l.id ? 'color-mix(in oklab, var(--accent) 10%, var(--surface))' : 'none',
              border: 'none', cursor: 'pointer', textAlign: 'left',
              fontFamily: 'var(--f-body)', fontSize: '1rem', fontWeight: page === l.id ? 600 : 400,
              color: page === l.id ? 'var(--accent)' : 'var(--ink-2)',
              padding: '12px 8px', borderRadius: 'var(--r-sm)',
              transition: 'color 0.2s',
            }}>{l.label}</button>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            <button onClick={goPortal} style={{
              fontFamily: 'var(--f-body)', fontSize: '0.85rem', fontWeight: 500,
              padding: '12px', background: 'transparent',
              border: '1px solid var(--line)', color: 'var(--ink-2)',
              cursor: 'pointer', borderRadius: 'var(--r)',
            }}>Log in</button>
            <button onClick={() => go('courses')} style={{
              fontFamily: 'var(--f-body)', fontSize: '0.85rem', fontWeight: 600,
              padding: '12px', background: 'var(--accent)',
              border: '1px solid var(--accent)', color: 'var(--on-accent)',
              cursor: 'pointer', borderRadius: 'var(--r)',
            }}>Start learning →</button>
          </div>
        </div>
      )}
    </nav>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────────
function Footer({ setPage }) {
  const go = (id) => { setPage(id); window.scrollTo(0, 0); };
  const site = getSiteContent();
  const home = site.homepage || {};
  const visible = site.sections || {};
  return (
    <footer style={{
      background: 'var(--surface-2)',
      borderTop: '1px solid var(--line)',
      padding: 'clamp(40px, 6vw, 72px) clamp(20px, 5vw, 80px) 32px',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48, maxWidth: 1240, margin: '0 auto 48px' }}>
        {/* Brand column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <img src="/logo.jpeg" alt="Hadi Shokeir" style={{
              width: 36, height: 36, borderRadius: 8,
              objectFit: 'cover', objectPosition: 'center top',
              flexShrink: 0, border: '1px solid var(--line)',
            }} />
            <div style={{ fontFamily: 'var(--f-head)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink)' }}>
              {site.brand || 'Arabic Enthusiast'}
            </div>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: 1.7, maxWidth: 280 }}>
            Arabic and English language mentoring — private lessons, structured curriculum, real results.
          </p>
          <div dir="rtl" style={{
            fontFamily: 'var(--f-ar)', fontSize: '1.6rem', color: 'var(--faint)',
            marginTop: 16, lineHeight: 1.8,
          }}>بِسْمِ اللَّهِ</div>
        </div>
        {/* Link columns */}
        {[
          { title: 'Learn', links: [['home','Home'],['courses','Courses'], ...(visible.pricing === false ? [] : [['pricing','Pricing']])] },
          { title: 'About', links: visible.about === false ? [] : [['about','Instructor'],['about','Teaching Method'],['about','Contact']] },
          { title: 'Enrol', links: [['courses','Enrol Now'], ...(visible.pricing === false ? [] : [['pricing','Pricing']]), ...(visible.about === false ? [] : [['about','Contact Hadi']])] },
        ].filter(col => col.links.length).map(col => (
          <div key={col.title}>
            <div style={{ fontFamily: 'var(--f-body)', fontSize: '0.66rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink)', fontWeight: 700, marginBottom: 16 }}>{col.title}</div>
            {col.links.map(([id, label]) => (
              <div key={label} style={{ marginBottom: 10 }}>
                <button onClick={() => go(id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--muted)', fontSize: '0.85rem', fontFamily: 'var(--f-body)',
                  transition: 'color 0.2s', padding: 0,
                }}
                  onMouseEnter={e => e.target.style.color = 'var(--ink)'}
                  onMouseLeave={e => e.target.style.color = 'var(--muted)'}
                >{label}</button>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{
        maxWidth: 1240, margin: '0 auto',
        borderTop: '1px solid var(--line-2)', paddingTop: 24,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--faint)' }}>© 2026 {site.brand || 'Arabic Enthusiast'}. All rights reserved.</span>
        <span style={{ fontSize: '0.72rem', color: 'var(--faint)' }}>Arabic · English · Teaching with passion & precision.</span>
      </div>
    </footer>
  );
}

// ── Reveal wrapper ───────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, style = {} }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: `opacity 0.7s var(--ease) ${delay}s, transform 0.7s var(--ease) ${delay}s`,
      ...style
    }}>
      {children}
    </div>
  );
}

// ── Eyebrow label ────────────────────────────────────────────────────────────
function Eyebrow({ children, center = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, justifyContent: center ? 'center' : 'flex-start' }}>
      <span style={{ display: 'block', width: 22, height: 1.5, background: 'var(--accent)', flexShrink: 0 }}></span>
      <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700 }}>{children}</span>
      {center && <span style={{ display: 'block', width: 22, height: 1.5, background: 'var(--accent)', flexShrink: 0 }}></span>}
    </div>
  );
}

// ── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ eyebrow, heading, sub, center = false }) {
  return (
    <div style={{ textAlign: center ? 'center' : 'left', marginBottom: 48 }}>
      {eyebrow && <Eyebrow center={center}>{eyebrow}</Eyebrow>}
      <h2 style={{ fontFamily: 'var(--f-head)', fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', color: 'var(--ink)', fontWeight: 600, lineHeight: 1.15, marginBottom: sub ? 14 : 0, letterSpacing: '-0.01em' }}>{heading}</h2>
      {sub && <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.7, maxWidth: center ? 520 : 480, margin: center ? '0 auto' : 0 }}>{sub}</p>}
    </div>
  );
}

// ── Badge / Pill ─────────────────────────────────────────────────────────────
function Badge({ children, tone = 'accent', color }) {
  const tones = {
    accent:  { bg: 'color-mix(in oklab, var(--accent) 13%, var(--surface))', fg: 'var(--accent)',   bd: 'color-mix(in oklab, var(--accent) 26%, transparent)' },
    good:    { bg: 'color-mix(in oklab, var(--good)   14%, var(--surface))', fg: 'var(--good)',     bd: 'color-mix(in oklab, var(--good)   30%, transparent)' },
    warn:    { bg: 'color-mix(in oklab, var(--warn)   15%, var(--surface))', fg: 'var(--warn)',     bd: 'color-mix(in oklab, var(--warn)   32%, transparent)' },
    bad:     { bg: 'color-mix(in oklab, var(--bad)    13%, var(--surface))', fg: 'var(--bad)',      bd: 'color-mix(in oklab, var(--bad)    30%, transparent)' },
    neutral: { bg: 'var(--surface-3)',                                        fg: 'var(--ink-2)',    bd: 'var(--line)' },
    // legacy level badges keep working via fallback
    Beginner:     { bg: 'color-mix(in oklab, var(--good)   14%, var(--surface))', fg: 'var(--good)', bd: 'color-mix(in oklab, var(--good) 30%, transparent)' },
    Intermediate: { bg: 'color-mix(in oklab, var(--warn)   15%, var(--surface))', fg: 'var(--warn)', bd: 'color-mix(in oklab, var(--warn) 32%, transparent)' },
    Advanced:     { bg: 'color-mix(in oklab, var(--bad)    13%, var(--surface))', fg: 'var(--bad)',  bd: 'color-mix(in oklab, var(--bad)  30%, transparent)' },
  };
  const t = tones[children] || tones[tone] || tones.accent;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontFamily: 'var(--f-body)', fontSize: '0.62rem', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.07em',
      padding: '3px 10px', borderRadius: '99px',
      border: `1px solid ${t.bd}`,
      background: t.bg, color: t.fg,
    }}>{children}</span>
  );
}

// Export all to window
Object.assign(window, { Nav, Footer, Reveal, Eyebrow, SectionHeading, Badge, useReveal, getSiteContent, showSiteSection });
