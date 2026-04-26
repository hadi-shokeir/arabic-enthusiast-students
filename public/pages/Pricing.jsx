// ─── Pricing Page ─────────────────────────────────────────────────────────────

function PricingPage({ setPage }) {
  return (
    <div style={{ paddingTop: 100, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 50% 60% at 50% 40%, rgba(255,255,255,0.03) 0%, transparent 70%)',
      }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.02,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />

      <div style={{ maxWidth: 600, padding: '0 40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Reveal>
          <div style={{ fontFamily: 'Amiri, serif', fontSize: '3rem', color: 'rgba(255,255,255,0.35)', marginBottom: 12, textShadow: '0 0 30px rgba(255,255,255,0.15)' }}>قريباً</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, justifyContent: 'center' }}>
            <span style={{ display: 'block', width: 28, height: 1, background: 'rgba(255,255,255,0.4)' }}></span>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>Pricing</span>
            <span style={{ display: 'block', width: 28, height: 1, background: 'rgba(255,255,255,0.4)' }}></span>
          </div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', color: '#f0f0f0', fontWeight: 600, lineHeight: 1.2, marginBottom: 20 }}>
            Pricing coming<br /><em style={{ color: '#ffffff' }}>soon</em>
          </h1>
          <p style={{ color: 'rgba(240,240,240,0.45)', fontSize: '0.95rem', lineHeight: 1.75, marginBottom: 44 }}>
            Details are being finalised. In the meantime, reach out directly — Hadi will be happy to discuss options based on your goals and availability.
          </p>
          <button onClick={() => { setPage('about'); window.scrollTo(0,0); }} style={{
            fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem',
            letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600,
            padding: '16px 44px', background: '#ffffff', color: '#080808',
            border: 'none', cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.target.style.background = '#e0e0e0'; e.target.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.target.style.background = '#ffffff'; e.target.style.transform = 'none'; }}
          >Get in Touch →</button>
        </Reveal>
      </div>
    </div>
  );
}

window.PricingPage = PricingPage;
