// ─── About & Contact Page ─────────────────────────────────────────────────────
const { useState } = React;

// 🔴 Set your WhatsApp number here — full international format, no + or spaces
// e.g. if your number is +961 71 123 456, write '96171123456'
const HADI_WA = '96176957495';

function AboutPage({ setPage }) {
  const site = window.getSiteContent ? window.getSiteContent() : (window.AE?.DATA?.siteContent || {});
  const { instructor } = window.AE.DATA;
  const profile = { ...(instructor || {}), ...(site.instructor || {}) };
  const [form, setForm] = useState({ name: '', email: '', whatsapp: '', interests: [], lessonsPerWeek: '', message: '' });
  const [sent, setSent] = useState(false);

  function toggleInterest(val) {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(val) ? f.interests.filter(x => x !== val) : [...f.interests, val],
    }));
  }

  function buildWaText() {
    const lines = [`Hi Hadi! My name is ${form.name || '(name not provided)'}.`];
    if (form.interests.length) lines.push(`\nI'm interested in: ${form.interests.join(', ')}`);
    if (form.lessonsPerWeek) lines.push(`Looking for: ${form.lessonsPerWeek}`);
    if (form.message) lines.push(`\n${form.message}`);
    if (form.email) lines.push(`\nEmail: ${form.email}`);
    if (form.whatsapp) lines.push(`WhatsApp: ${form.whatsapp}`);
    return encodeURIComponent(lines.join('\n'));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  const interests = ['Classical Arabic', 'Levantine Dialect', 'Quranic Arabic', 'English', 'Private Lessons', 'Group Lessons'];

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
              <div className="ar" style={{ fontFamily: 'var(--f-ar)', fontSize: '1.4rem', color: 'var(--accent)', marginBottom: 20, textAlign: 'right', lineHeight: 1.7 }}>
                {profile.arabicTitle || 'لغويٌّ · مُعلِّم · مُترجم'}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
                {(profile.specialties || ['Classical Arabic', 'Levantine Dialect', 'Quranic Arabic', 'English']).map(s => (
                  <Badge key={s} tone="neutral">{s}</Badge>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--line-2)', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <p style={{ color: 'var(--ink-2)', fontSize: '1rem', lineHeight: 1.85, margin: 0 }}>
                  {profile.bio1 || 'Hadi Shokeir is a linguist, translator, and language mentor with deep roots in both Arabic and English. Born into the Arabic language and immersed in English from an early age, he has spent years teaching both — to students across different countries, backgrounds, and levels, from complete beginners to advanced readers working on precision.'}
                </p>
                <p style={{ color: 'var(--muted)', fontSize: '0.93rem', lineHeight: 1.85, margin: 0 }}>
                  {profile.bio2 || 'Before building Arabic Enthusiast, Hadi worked professionally in digital advertising — managing Meta Ads campaigns across Facebook and Instagram, with a focus on performance, clear goals, and measurable results. He brings that same structured thinking to his teaching: every lesson has a purpose, every session moves you forward, and progress is always visible.'}
                </p>
                <div style={{ display: 'flex', gap: 32, marginTop: 8, flexWrap: 'wrap' }}>
                  {(profile.stats || [{value:'7+',label:'Years teaching'},{value:'4',label:'Specialisations'},{value:'1:1',label:'Private lessons'}]).map(({value, label}) => (
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
              { title: 'The system, not shortcuts', arabic: 'النظام لا الاختصارات', desc: 'Survival phrases get you to the airport. Structure gets you the language. Every lesson builds a mental framework so new words and grammar slot in naturally — and stay.' },
              { title: 'Both directions', arabic: 'الاتجاهان معاً', desc: 'Hadi teaches Arabic to English speakers and English to Arabic speakers. Understanding how each language interferes with the other — its rhythms, its gaps — is a real advantage in the classroom.' },
              { title: 'Your goals, your pace', arabic: 'أهدافك أولاً', desc: 'Whether you\'re reading Quran, building dialect fluency, writing professional English, or starting from zero — the curriculum shapes itself around where you are and where you want to go.' },
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
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: 28, maxWidth: 400 }}>
                {profile.contactPrompt || "Whether you're starting from scratch, looking to level up, or not sure where to begin — send a message and Hadi will get back to you personally within 24 hours."}
              </p>
              {HADI_WA && (
                <a href={`https://wa.me/${HADI_WA}`} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  fontFamily: 'var(--f-body)', fontSize: '0.88rem', fontWeight: 600,
                  padding: '12px 22px', marginBottom: 20,
                  background: '#25D366', color: '#fff',
                  border: 'none', cursor: 'pointer', borderRadius: 'var(--r)',
                  textDecoration: 'none', transition: 'all .2s var(--ease)',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.525 5.845L.057 23.882l6.199-1.624A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.003-1.37l-.359-.213-3.681.965.981-3.595-.234-.369A9.818 9.818 0 0112 2.182c5.424 0 9.818 4.394 9.818 9.818 0 5.424-4.394 9.818-9.818 9.818z"/></svg>
                  Message on WhatsApp
                </a>
              )}
              <div>
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
                      <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 6, fontWeight: 600 }}>WhatsApp / Phone <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                      <input type="tel" value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="+1 234 567 8900" style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--line)'}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 8, fontWeight: 600 }}>I'm interested in <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(choose all that apply)</span></label>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {interests.map(int => {
                          const active = form.interests.includes(int);
                          return (
                            <button key={int} type="button" onClick={() => toggleInterest(int)} style={{
                              padding: '6px 12px', fontFamily: 'var(--f-body)', fontSize: '0.78rem', cursor: 'pointer',
                              background: active ? 'color-mix(in oklab, var(--accent) 12%, var(--surface))' : 'var(--surface)',
                              border: `1px solid ${active ? 'color-mix(in oklab, var(--accent) 40%, transparent)' : 'var(--line)'}`,
                              color: active ? 'var(--accent)' : 'var(--muted)',
                              borderRadius: 'var(--r-sm)', transition: 'all .15s', fontWeight: active ? 600 : 400,
                            }}>{active ? '✓ ' : ''}{int}</button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 6, fontWeight: 600 }}>How often?</label>
                      <select value={form.lessonsPerWeek} onChange={e => setForm(f => ({ ...f, lessonsPerWeek: e.target.value }))} style={{ ...inputStyle, appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath fill=\'%238a7f6c\' d=\'M6 8L0 0h12z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 36, cursor: 'pointer' }}>
                        <option value="">Not sure yet</option>
                        <option value="1 lesson/week (~$100/month)">1 lesson/week (~$100/month)</option>
                        <option value="2 lessons/week (~$200/month)">2 lessons/week (~$200/month)</option>
                        <option value="3+ lessons/week (~$300+/month)">3+ lessons/week (~$300+/month)</option>
                        <option value="Group lesson (waitlist)">Group lesson (waitlist)</option>
                        <option value="Intensive / flexible">Intensive / flexible</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 6, fontWeight: 600 }}>Message <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                      <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
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
                    {HADI_WA && form.interests.length > 0 && (
                      <a href={`https://wa.me/${HADI_WA}?text=${buildWaText()}`} target="_blank" rel="noopener noreferrer" style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        width: '100%', padding: '13px',
                        background: '#25D366', color: '#fff',
                        border: 'none', borderRadius: 'var(--r)',
                        fontFamily: 'var(--f-body)', fontSize: '0.85rem', fontWeight: 600,
                        cursor: 'pointer', textDecoration: 'none', transition: 'all .2s var(--ease)',
                        animation: 'fadeIn 0.3s var(--ease)',
                      }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.525 5.845L.057 23.882l6.199-1.624A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.003-1.37l-.359-.213-3.681.965.981-3.595-.234-.369A9.818 9.818 0 0112 2.182c5.424 0 9.818 4.394 9.818 9.818 0 5.424-4.394 9.818-9.818 9.818z"/></svg>
                        Send via WhatsApp
                      </a>
                    )}
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
