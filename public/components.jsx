// ─── Shared Components ──────────────────────────────────────────────────────
const { useState, useEffect, useRef } = React;

// ── Scroll reveal hook ───────────────────────────────────────────────────────
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
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
    const onResize = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const links = [
    { id: 'home', label: 'Home' },
    { id: 'courses', label: 'Courses' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'about', label: 'About' },
  ];
  const go = (id) => { setPage(id); setMenuOpen(false); window.scrollTo(0, 0); };
  const goPortal = () => { window.location.href = '/portal'; };

  const btnStyle = {
    fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem',
    letterSpacing: '0.12em', textTransform: 'uppercase',
    padding: '10px 22px', background: 'transparent',
    border: '1px solid rgba(255,255,255,0.5)', color: '#f0f0f0', cursor: 'pointer',
    transition: 'all 0.2s',
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      padding: scrolled ? '12px 48px' : '20px 48px',
      background: scrolled || menuOpen ? 'rgba(8,8,8,0.97)' : 'transparent',
      backdropFilter: scrolled || menuOpen ? 'blur(16px)' : 'none',
      borderBottom: scrolled || menuOpen ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
      transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
    }}>
      {/* Main bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => go('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo.jpeg" alt="AE" style={{ height: 36, filter: 'brightness(0) invert(1)' }} />
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.85rem', letterSpacing: '0.15em', color: '#ffffff', textTransform: 'uppercase' }}>Arabic Enthusiast</span>
        </button>

        {/* Desktop links */}
        <ul style={{ display: 'flex', gap: 36, listStyle: 'none', margin: 0, padding: 0 }} className="nav-desktop">
          {links.map(l => (
            <li key={l.id}>
              <button onClick={() => go(l.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: page === l.id ? '#ffffff' : 'rgba(240,240,240,0.5)',
                transition: 'color 0.2s', padding: '4px 0',
                borderBottom: page === l.id ? '1px solid #ffffff' : '1px solid transparent',
              }}>{l.label}</button>
            </li>
          ))}
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={goPortal} style={btnStyle} className="nav-desktop"
            onMouseEnter={e => { e.target.style.background = '#ffffff'; e.target.style.color = '#080808'; }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#f0f0f0'; }}
          >Login</button>

          {/* Hamburger — mobile only */}
          <button onClick={() => setMenuOpen(o => !o)} className="nav-mobile" style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer',
            padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 5,
          }}>
            {[0,1,2].map(i => (
              <span key={i} style={{
                display: 'block', width: 22, height: 1.5, background: '#ffffff',
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
          borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 16,
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {links.map(l => (
            <button key={l.id} onClick={() => go(l.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
              fontFamily: 'DM Sans, sans-serif', fontSize: '1rem',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: page === l.id ? '#ffffff' : 'rgba(240,240,240,0.6)',
              padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
              transition: 'color 0.2s',
            }}>{l.label}</button>
          ))}
          <button onClick={goPortal} style={{
            ...btnStyle, marginTop: 16, width: '100%', justifyContent: 'center',
            padding: '14px', fontSize: '0.85rem',
          }}>Login</button>
        </div>
      )}
    </nav>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────────
function Footer({ setPage }) {
  const go = (id) => { setPage(id); window.scrollTo(0, 0); };
  return (
    <footer style={{
      background: '#060606', borderTop: '1px solid rgba(255,255,255,0.08)',
      padding: '60px 80px 32px',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
        <div>
          <div style={{ fontFamily: 'Cinzel, serif', color: '#ffffff', fontSize: '1rem', letterSpacing: '0.15em', marginBottom: 12 }}>ARABIC ENTHUSIAST</div>
          <p style={{ color: 'rgba(240,240,240,0.4)', fontSize: '0.85rem', lineHeight: 1.7, maxWidth: 280 }}>
            Professional Arabic instruction — from first letters to fluent reading. Taught with passion and precision.
          </p>
          <div style={{ fontFamily: 'Amiri, serif', fontSize: '1.8rem', color: 'rgba(255,255,255,0.5)', marginTop: 16, direction: 'rtl', textShadow: '0 0 20px rgba(255,255,255,0.2)' }}>بِسْمِ اللَّهِ</div>
        </div>
        {[
          { title: 'Learn', links: [['home','Home'],['courses','Courses'],['pricing','Pricing']] },
          { title: 'About', links: [['about','Instructor'],['about','Teaching Method'],['about','Contact']] },
          { title: 'Student', links: [['courses','Enrol Now'],['pricing','Pricing'],['about','Contact Hadi']] },
        ].map(col => (
          <div key={col.title}>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 16 }}>{col.title}</div>
            {col.links.map(([id, label]) => (
              <div key={label} style={{ marginBottom: 10 }}>
                <button onClick={() => go(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,240,240,0.4)', fontSize: '0.85rem', fontFamily: 'DM Sans, sans-serif', transition: 'color 0.2s', padding: 0 }}
                  onMouseEnter={e => e.target.style.color = '#f0f0f0'}
                  onMouseLeave={e => e.target.style.color = 'rgba(240,240,240,0.4)'}
                >{label}</button>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.72rem', color: 'rgba(240,240,240,0.25)' }}>© 2026 Arabic Enthusiast. All rights reserved.</span>
        <span style={{ fontSize: '0.72rem', color: 'rgba(240,240,240,0.25)' }}>Teaching the world's most beautiful language.</span>
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
      transform: visible ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      ...style
    }}>
      {children}
    </div>
  );
}

// ── Eyebrow label ────────────────────────────────────────────────────────────
function Eyebrow({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <span style={{ display: 'block', width: 28, height: 1, background: 'rgba(255,255,255,0.4)' }}></span>
      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>{children}</span>
    </div>
  );
}

// ── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ eyebrow, heading, sub, center = false }) {
  return (
    <div style={{ textAlign: center ? 'center' : 'left', marginBottom: 56 }}>
      {eyebrow && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, justifyContent: center ? 'center' : 'flex-start' }}>
          <span style={{ display: 'block', width: 28, height: 1, background: 'rgba(255,255,255,0.4)' }}></span>
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>{eyebrow}</span>
          {center && <span style={{ display: 'block', width: 28, height: 1, background: 'rgba(255,255,255,0.4)' }}></span>}
        </div>
      )}
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: '#f0f0f0', fontWeight: 600, lineHeight: 1.2, marginBottom: sub ? 16 : 0 }}>{heading}</h2>
      {sub && <p style={{ color: 'rgba(240,240,240,0.45)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: center ? 520 : 480, margin: center ? '0 auto' : 0 }}>{sub}</p>}
    </div>
  );
}

// ── Level badge ──────────────────────────────────────────────────────────────
function Badge({ children, color }) {
  const colors = { Beginner: 'rgba(255,255,255,0.7)', Intermediate: 'rgba(255,255,255,0.5)', Advanced: 'rgba(255,255,255,0.35)' };
  const c = colors[children] || color || 'rgba(255,255,255,0.5)';
  return (
    <span style={{
      fontFamily: 'DM Sans, sans-serif', fontSize: '0.62rem',
      letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600,
      padding: '3px 10px', border: `1px solid ${c}`, color: c,
    }}>{children}</span>
  );
}

// Export all to window
Object.assign(window, { Nav, Footer, Reveal, Eyebrow, SectionHeading, Badge, useReveal });
