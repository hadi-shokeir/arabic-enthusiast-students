// ─── About & Contact Page ─────────────────────────────────────────────────────
const { useState } = React;

function AboutPage({ setPage }) {
  const { instructor } = window.AE.DATA;
  const [form, setForm] = useState({ name: '', email: '', interest: 'Classical', message: '' });
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  const interests = ['Classical', 'Levantine', 'Quranic', 'Quranic + Dialect', 'Private Lessons'];

  return (
    <div style={{ paddingTop: 100 }}>
      {/* Instructor Hero */}
      <section style={{ padding: '60px 80px 80px', position: 'relative', overflow: 'hidden', background: 'rgba(8,8,8,0.5)' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 50% 80% at 70% 50%, rgba(255,255,255,0.03) 0%, transparent 60%)',
        }} />
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Reveal>
            <Eyebrow>Your Instructor</Eyebrow>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.6rem, 4vw, 4rem)', color: '#f0f0f0', fontWeight: 600, lineHeight: 1.1, marginBottom: 24 }}>
              {instructor.name}
            </h1>
            <div style={{ fontFamily: 'Amiri, serif', fontSize: '1.6rem', color: 'rgba(255,255,255,0.7)', marginBottom: 28, direction: 'rtl', textAlign: 'right', textShadow: '0 0 30px rgba(255,255,255,0.3)' }}>مدرّس اللغة العربية</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['Classical Arabic', 'Conversational Arabic', 'Quranic Arabic'].map(s => (
                <span key={s} style={{ padding: '6px 14px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s}</span>
              ))}
            </div>
          </Reveal>

          {/* Instructor photo */}
          <Reveal delay={0.15}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: 340, height: 400 }}>
                <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.15)' }} />
                <div style={{ position: 'absolute', inset: 12, border: '1px solid rgba(255,255,255,0.07)' }} />
                {/* Photo */}
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                  <img src="/logo.jpeg" alt="Hadi — Arabic Instructor" style={{
                    width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top',
                    display: 'block',
                    filter: 'brightness(0.92) contrast(1.05)',
                  }} />
                  {/* Subtle gradient overlay at bottom */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%',
                    background: 'linear-gradient(transparent, rgba(8,8,8,0.7))',
                    pointerEvents: 'none',
                  }} />
                  <div style={{
                    position: 'absolute', bottom: 20, left: 0, right: 0,
                    textAlign: 'center',
                  }}>
                    <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '0.2em', color: '#ffffff', textTransform: 'uppercase', marginBottom: 4 }}>Hadi Shokeir</div>
                    <div style={{ fontSize: '0.62rem', color: 'rgba(240,240,240,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Arabic Instructor</div>
                  </div>
                </div>
                {/* Corner accents */}
                {['top:0;left:0', 'top:0;right:0', 'bottom:0;left:0', 'bottom:0;right:0'].map((pos, i) => (
                  <div key={i} style={{ position: 'absolute', width: 20, height: 20, border: '2px solid rgba(255,255,255,0.6)', ...Object.fromEntries(pos.split(';').map(p => p.split(':'))), borderTop: i < 2 ? '2px solid rgba(255,255,255,0.6)' : 'none', borderBottom: i >= 2 ? '2px solid rgba(255,255,255,0.6)' : 'none', borderLeft: i % 2 === 0 ? '2px solid rgba(255,255,255,0.6)' : 'none', borderRight: i % 2 !== 0 ? '2px solid rgba(255,255,255,0.6)' : 'none' }} />
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Teaching Philosophy */}
      <section style={{ padding: '80px', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <Reveal>
            <SectionHeading eyebrow="Approach" heading="Teaching Philosophy" center={true} />
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { title: 'Structure First', arabic: 'البنية أولاً', desc: 'Arabic has an elegant, logical grammar. Learning the system — not just memorising phrases — is what gives you lasting ability.' },
              { title: 'Authentic Sounds', arabic: 'الأصوات الأصيلة', desc: 'From the first lesson, you\'ll learn to produce real Arabic sounds. No shortcuts that create bad habits to unlearn later.' },
              { title: 'Your Pace', arabic: 'بالسرعة التي تناسبك', desc: 'Every student\'s journey is different. Lessons adapt to your goals — whether Quran, dialect, conversation, or classical literature.' },
            ].map((p, i) => (
              <Reveal key={p.title} delay={i * 0.1}>
                <div style={{ background: 'rgba(14,14,14,0.8)', border: '1px solid rgba(255,255,255,0.07)', padding: '36px 32px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Amiri, serif', fontSize: '1.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: 12, textShadow: '0 0 25px rgba(255,255,255,0.25)' }}>{p.arabic}</div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: '#f0f0f0', marginBottom: 14 }}>{p.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(240,240,240,0.45)', lineHeight: 1.7 }}>{p.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" style={{ padding: '80px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80 }}>
          <Reveal>
            <Eyebrow>Get in Touch</Eyebrow>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 3vw, 2.8rem)', color: '#f0f0f0', fontWeight: 600, lineHeight: 1.2, marginBottom: 20 }}>
              Ready to begin?<br /><em style={{ color: '#ffffff' }}>Let's talk</em>
            </h2>
            <p style={{ color: 'rgba(240,240,240,0.45)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: 40, maxWidth: 400 }}>
              Whether you have questions about courses, want a free intro lesson, or are ready to enrol — send a message and Hadi will get back to you within 24 hours.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[['📧', 'Email', 'hadishokeir@gmail.com'], ['🕌', 'Response time', 'Within 24 hours'], ['🌍', 'Location', 'Online — worldwide']].map(([icon, label, val]) => (
                <div key={label} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
                    <div style={{ fontSize: '0.9rem', color: 'rgba(240,240,240,0.6)', marginTop: 2 }}>{val}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            {sent ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: 48, background: 'rgba(74,122,90,0.08)', border: '1px solid rgba(74,122,90,0.25)' }}>
                <div style={{ fontFamily: 'Amiri, serif', fontSize: '3rem', color: '#6abf80', marginBottom: 16 }}>شكراً</div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#f0f0f0', marginBottom: 10 }}>Message received!</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(240,240,240,0.45)', lineHeight: 1.6 }}>Hadi will be in touch within 24 hours.</div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ background: 'rgba(14,14,14,0.8)', border: '1px solid rgba(255,255,255,0.08)', padding: '40px 36px' }}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>Your Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required style={{ width: '100%', background: 'rgba(8,8,8,0.8)', border: '1px solid rgba(255,255,255,0.12)', color: '#f0f0f0', padding: '12px 16px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>Email Address</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required style={{ width: '100%', background: 'rgba(8,8,8,0.8)', border: '1px solid rgba(255,255,255,0.12)', color: '#f0f0f0', padding: '12px 16px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>I'm interested in</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {interests.map(int => (
                      <button key={int} type="button" onClick={() => setForm(f => ({ ...f, interest: int }))} style={{
                        padding: '6px 14px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', cursor: 'pointer', transition: 'all 0.15s',
                        background: form.interest === int ? 'rgba(255,255,255,0.1)' : 'transparent',
                        border: `1px solid ${form.interest === int ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.12)'}`,
                        color: form.interest === int ? '#ffffff' : 'rgba(240,240,240,0.45)',
                      }}>{int}</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>Message</label>
                  <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required rows={4} style={{ width: '100%', background: 'rgba(8,8,8,0.8)', border: '1px solid rgba(255,255,255,0.12)', color: '#f0f0f0', padding: '12px 16px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', outline: 'none', resize: 'vertical', transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                </div>
                <button type="submit" style={{ width: '100%', padding: '16px', background: '#ffffff', border: 'none', color: '#080808', fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.target.style.background = '#e0e0e0'; }}
                  onMouseLeave={e => { e.target.style.background = '#ffffff'; }}
                >Send Message →</button>
              </form>
            )}
          </Reveal>
        </div>
      </section>
    </div>
  );
}

window.AboutPage = AboutPage;
