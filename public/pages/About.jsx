// ─── About & Contact Page ─────────────────────────────────────────────────────
const { useState } = React;

function AboutPage({ setPage }) {
  const site = window.getSiteContent ? window.getSiteContent() : (window.AE?.DATA?.siteContent || {});
  const { instructor } = window.AE.DATA;
  const profile = { ...(instructor || {}), ...(site.instructor || {}) };
  const [form, setForm] = useState({ name: '', email: '', interest: 'Classical', message: '' });
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  const interests = ['Classical', 'Levantine', 'Quranic', 'Quranic + Dialect', 'English', 'Private Lessons'];

  const inputStyle = {
    width: '100%', background: 'var(--surface)', border: '1px solid var(--line)',
    color: 'var(--ink)', padding: '12px 16px', fontFamily: 'var(--f-body)', fontSize: '16px',
    outline: 'none', transition: 'border-color .2s', borderRadius: 'var(--r-sm)',
  };

  return (
    <div style={{ paddingTop: 100 }}>
      {/* Instructor hero */}
      <section style={{ padding: 'clamp(48px,8vw,96px) clamp(20px,5vw,80px)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div className="about-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px,6vw,80px)', alignItems: 'center' }}>
            {/* Copy */}
            <Reveal>
              <Eyebrow>Your teacher</Eyebrow>
              <h1 style={{ fontFamily: 'var(--f-head)', fontSize: 'clamp(2.4rem,4vw,3.6rem)', color: 'var(--ink)', fontWeight: 600, lineHeight: 1.1, marginBottom: 10, letterSpacing: '-0.01em' }}>
                {profile.name || 'Hadi Shokeir'}
              </h1>
              <div className="ar" style={{ fontFamily: 'var(--f-ar)', fontSize: '1.5rem', color: 'var(--accent)', marginBottom: 20, textAlign: 'right', lineHeight: 1.6 }}>
                {profile.arabicTitle || 'مدرّس اللغة العربية'}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
                {(profile.specialties || ['Classical Arabic', 'Levantine', 'Quranic Arabic', 'English']).map(s => (
                  <Badge key={s} tone="neutral">{s}</Badge>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--line-2)', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p style={{ color: 'var(--ink-2)', fontSize: '1rem', lineHeight: 1.8, margin: 0 }}>
                  {profile.bio1 || 'Hadi Shokeir is a linguist, translator, and Arabic language instructor with teaching experience across Classical Arabic, Levantine dialect, and Quranic studies.'}
                </p>
                <p style={{ color: 'var(--muted)', fontSize: '0.92rem', lineHeight: 1.8, margin: 0 }}>
                  {profile.bio2 || "His lessons combine linguistic structure, patient correction, and a personal relationship with the language so students learn with clarity and confidence."}
                </p>
                <div style={{ display: 'flex', gap: 32, marginTop: 8 }}>
                  {(profile.stats || [{value:'7+',label:'Years teaching'},{value:'3',label:'Specialisations'},{value:'1:1',label:'Private lessons'}]).map(({value, label}) => (
                    <div key={label}>
                      <div style={{ fontFamily: 'var(--f-head)', fontSize: '1.5rem', color: 'var(--ink)', fontWeight: 600, lineHeight: 1 }}>{value}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 4 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 28 }}>
                <button onClick={() => window.location.href = '/portal?signup=1'} style={{
                  fontFamily: 'var(--f-body)', fontSize: '0.85rem', fontWeight: 600,
                  padding: '13px 28px', background: 'var(--accent)', color: 'var(--on-accent)',
                  border: '1px solid var(--accent)', cursor: 'pointer', borderRadius: 'var(--r)',
                  transition: 'all .2s var(--ease)',
                }}>Book a free intro lesson →</button>
              </div>
            </Reveal>

            {/* Photo */}
            <Reveal delay={0.15}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  position: 'relative', width: 'min(340px, 80vw)', borderRadius: 'var(--r-lg)', overflow: 'hidden',
                  border: '1px solid var(--line)', boxShadow: 'var(--shadow)',
                }}>
                  <img src="/logo.jpeg" alt="Hadi — Arabic Instructor" style={{
                    width: '100%', height: 'auto', objectFit: 'cover', display: 'block',
                  }} />
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'color-mix(in oklab, var(--ink) 80%, transparent)',
                    backdropFilter: 'blur(4px)', padding: '14px 16px',
                  }}>
                    <div style={{ fontFamily: 'var(--f-head)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--paper)' }}>{profile.name || 'Hadi Shokeir'}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 2 }}>{profile.title || 'Arabic Instructor'}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Teaching philosophy */}
      <section style={{ padding: 'clamp(48px,8vw,80px) clamp(20px,5vw,80px)', background: 'var(--surface-2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <Reveal><SectionHeading eyebrow="Approach" heading="Teaching philosophy" center={true} /></Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {(profile.philosophy || [
              { title: 'Structure first', arabic: 'البنية أولاً', desc: 'Arabic has an elegant, logical grammar. Learning the system — not just memorising phrases — is what gives lasting ability.' },
              { title: 'Authentic sounds', arabic: 'الأصوات الأصيلة', desc: 'From the first lesson you\'ll produce real Arabic sounds. No shortcuts that create bad habits to unlearn later.' },
              { title: 'Your pace', arabic: 'بالسرعة التي تناسبك', desc: 'Every student\'s journey is different. Lessons adapt to your goals — Quran, dialect, conversation, or classical literature.' },
            ]).map((p, i) => (
              <Reveal key={p.title} delay={i * 0.1}>
                <div style={{
                  background: 'var(--surface)', border: '1px solid var(--line)',
                  padding: '28px 24px', textAlign: 'center',
                  borderRadius: 'var(--r-lg)', transition: 'all .25s var(--ease)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div className="ar" style={{ fontFamily: 'var(--f-ar)', fontSize: '1.6rem', color: 'var(--accent)', marginBottom: 12, lineHeight: 1.6 }}>{p.arabic}</div>
                  <div style={{ fontFamily: 'var(--f-head)', fontSize: '1.1rem', color: 'var(--ink)', marginBottom: 10, fontWeight: 600 }}>{p.title}</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.7 }}>{p.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" style={{ padding: 'clamp(48px,8vw,96px) clamp(20px,5vw,80px)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px,6vw,80px)' }} className="about-grid">
            <Reveal>
              <Eyebrow>Get in touch</Eyebrow>
              <h2 style={{ fontFamily: 'var(--f-head)', fontSize: 'clamp(2rem,3vw,2.8rem)', color: 'var(--ink)', fontWeight: 600, lineHeight: 1.15, marginBottom: 16 }}>
                {profile.contactHeadingLine1 || "Let's"}{' '}
                <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{profile.contactHeadingAccent || 'talk'}</em>
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: 32, maxWidth: 400 }}>
                {profile.contactPrompt || 'Whether you have questions about courses, want a free intro lesson, or are ready to enrol — send a message and Hadi will reply within 24 hours.'}
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button onClick={() => window.location.href = '/portal?signup=1'} style={{
                  fontFamily: 'var(--f-body)', fontSize: '0.85rem', fontWeight: 600,
                  padding: '12px 24px', background: 'var(--accent)', color: 'var(--on-accent)',
                  border: '1px solid var(--accent)', cursor: 'pointer', borderRadius: 'var(--r)',
                }}>Send a message</button>
                <button onClick={() => { setPage('pricing'); window.scrollTo(0,0); }} style={{
                  fontFamily: 'var(--f-body)', fontSize: '0.85rem', fontWeight: 500,
                  padding: '12px 20px', background: 'transparent', color: 'var(--ink-2)',
                  border: '1px solid var(--line)', cursor: 'pointer', borderRadius: 'var(--r)',
                }}>See pricing</button>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', padding: '28px 24px' }}>
                {sent ? (
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <div className="ar" style={{ fontFamily: 'var(--f-ar)', fontSize: '2.5rem', color: 'var(--good)', marginBottom: 12 }}>شكراً</div>
                    <div style={{ fontFamily: 'var(--f-head)', fontSize: '1.3rem', color: 'var(--ink)', marginBottom: 8 }}>Message received!</div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.6 }}>Hadi will be in touch within 24 hours.</div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[['text','Your Name','name'],['email','Email Address','email']].map(([type, label, key]) => (
                      <div key={key}>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 6, fontWeight: 600 }}>{label}</label>
                        <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required style={inputStyle}
                          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                          onBlur={e => e.target.style.borderColor = 'var(--line)'}
                        />
                      </div>
                    ))}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 8, fontWeight: 600 }}>I'm interested in</label>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {interests.map(int => (
                          <button key={int} type="button" onClick={() => setForm(f => ({ ...f, interest: int }))} style={{
                            padding: '6px 12px', fontFamily: 'var(--f-body)', fontSize: '0.78rem', cursor: 'pointer',
                            background: form.interest === int ? 'color-mix(in oklab, var(--accent) 12%, var(--surface))' : 'var(--surface)',
                            border: `1px solid ${form.interest === int ? 'color-mix(in oklab, var(--accent) 40%, transparent)' : 'var(--line)'}`,
                            color: form.interest === int ? 'var(--accent)' : 'var(--muted)',
                            borderRadius: 'var(--r-sm)', transition: 'all .15s',
                          }}>{int}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 6, fontWeight: 600 }}>Message</label>
                      <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required rows={4} style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--line)'}
                      />
                    </div>
                    <button type="submit" style={{
                      width: '100%', padding: '13px',
                      background: 'var(--accent)', color: 'var(--on-accent)',
                      border: 'none', fontFamily: 'var(--f-body)', fontSize: '0.85rem',
                      fontWeight: 600, cursor: 'pointer', borderRadius: 'var(--r)',
                      transition: 'all .2s var(--ease)',
                    }}>Send Message →</button>
                  </form>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}

window.AboutPage = AboutPage;
