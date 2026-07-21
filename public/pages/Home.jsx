// ─── Home Page ───────────────────────────────────────────────────────────────
const { useState, useEffect, useRef } = React;

function HeroSection({ setPage }) {
  const [tick, setTick] = useState(0);
  const site = window.getSiteContent ? window.getSiteContent() : (window.AE?.DATA?.siteContent || {});
  const home = site.homepage || {};
  const letters = ['ع', 'ر', 'ب', 'ي'];
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 2400);
    return () => clearInterval(t);
  }, []);

  const btnPrimary = {
    fontFamily: 'var(--f-body)', fontSize: '0.85rem', fontWeight: 600,
    padding: '14px 36px', background: 'var(--accent)', color: 'var(--on-accent)',
    border: '1px solid var(--accent)', cursor: 'pointer', transition: 'all .2s var(--ease)',
    borderRadius: 'var(--r)', letterSpacing: '.01em',
    boxShadow: '0 4px 14px -8px color-mix(in oklab, var(--accent) 60%, transparent)',
  };
  const btnOutline = {
    fontFamily: 'var(--f-body)', fontSize: '0.85rem', fontWeight: 500,
    padding: '14px 28px', background: 'transparent', color: 'var(--ink-2)',
    border: '1px solid var(--line)', cursor: 'pointer', transition: 'all .2s var(--ease)',
    borderRadius: 'var(--r)',
  };
  const btnGhost = {
    fontFamily: 'var(--f-body)', fontSize: '0.82rem', fontWeight: 500,
    padding: '12px 20px', background: 'transparent', color: 'var(--muted)',
    border: '1px solid var(--line-2)', cursor: 'pointer', transition: 'all .2s var(--ease)',
    borderRadius: 'var(--r)',
  };

  return (
    <section style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      position: 'relative', overflow: 'hidden',
      padding: 'clamp(100px,12vh,140px) clamp(20px,5vw,80px) 80px',
    }}>
      {/* Soft radial wash behind visual */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 50% 60% at 78% 38%, color-mix(in oklab, var(--accent) 9%, transparent), transparent 70%)',
      }} />

      <div className="hero-grid" style={{
        display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 'clamp(32px,6vw,80px)',
        alignItems: 'center', width: '100%', maxWidth: 1240, margin: '0 auto',
        position: 'relative', zIndex: 1,
      }}>
        {/* Copy column */}
        <div>
          <Eyebrow>{home.eyebrow || 'Private 1:1 Language Mentoring'}</Eyebrow>
          <h1 style={{
            fontFamily: 'var(--f-head)',
            fontSize: 'clamp(2.6rem, 5.4vw, 4.4rem)',
            fontWeight: 600, lineHeight: 1.08, color: 'var(--ink)',
            letterSpacing: '-0.01em', marginBottom: 24, textWrap: 'balance',
          }}>
            {home.titleLine1 || 'A linguist who teaches'}{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{home.titleAccent || 'Arabic & English'}</em>
            {' '}{home.titleLine3 || 'the right way'}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', lineHeight: 1.75, maxWidth: 480, marginBottom: 36 }}>
            {home.description || 'Hadi Shokeir is a linguist, translator, and language mentor who teaches Classical Arabic, Levantine dialect, Quranic recitation, and English — through focused private lessons built around your goals.'}
          </p>

          <div className="hero-actions" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => window.location.href = '/portal?signup=1'} style={btnPrimary}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >{home.primaryCta || 'Start learning'} →</button>

            <button onClick={() => { setPage('about'); window.scrollTo(0,0); }} style={btnOutline}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--ink-2)'; }}
            >Meet Hadi</button>

            <button onClick={() => { setPage('courses'); window.scrollTo(0,0); }} style={btnGhost}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
            >Browse courses</button>
          </div>

          {/* Stat strip */}
          <div style={{ marginTop: 40, paddingTop: 28, borderTop: '1px solid var(--line-2)', display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            {[['4.9★','Rating'],['200+','Students'],['7+ yrs','Teaching']].map(([val, label]) => (
              <div key={label}>
                <div style={{ fontFamily: 'var(--f-head)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--ink)', lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '.08em', textTransform: 'uppercase', marginTop: 3 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero visual — Hadi's photo centered in decorative rings */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{
            width: 'min(400px, 82vw)', height: 'min(400px, 82vw)',
            border: '1px solid var(--line)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
          }}>
            {/* Inner ring */}
            <div style={{ position: 'absolute', inset: 28, border: '1px solid var(--line-2)', borderRadius: '50%' }} />
            {/* Rotating dashed ring */}
            <div style={{
              position: 'absolute', inset: -1, borderRadius: '50%',
              border: '1px dashed color-mix(in oklab, var(--accent) 36%, transparent)',
              animation: 'spin 40s linear infinite',
            }} />
            {/* Hadi's photo */}
            <div style={{
              width: 'min(248px, 60vw)', height: 'min(248px, 60vw)',
              borderRadius: '50%', overflow: 'hidden',
              border: '4px solid var(--surface)',
              boxShadow: '0 8px 40px -12px rgba(47,74,122,0.38)',
              position: 'relative', zIndex: 1,
            }}>
              <img src="/logo.jpeg" alt="Hadi Shokeir" style={{
                width: '100%', height: '100%', objectFit: 'cover',
                objectPosition: 'center top', display: 'block',
              }} />
            </div>
            {/* Name card at bottom of ring */}
            <div style={{
              position: 'absolute', bottom: '11%', zIndex: 2,
              background: 'color-mix(in oklab, var(--surface) 92%, transparent)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--line)',
              padding: '7px 16px', borderRadius: 'var(--r-sm)',
              boxShadow: 'var(--shadow-sm)', textAlign: 'center', whiteSpace: 'nowrap',
            }}>
              <div style={{ fontFamily: 'var(--f-head)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)' }}>Hadi Shokeir</div>
              <div style={{ fontSize: '0.58rem', color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 2 }}>Linguist · Arabic & English Mentor</div>
            </div>
          </div>

          {/* Floating word chips */}
          {[
            { word: 'كِتَاب', meaning: 'Book', pos: { top: '8%', left: '-8%' } },
            { word: 'نُور',  meaning: 'Light', pos: { top: '12%', right: '-6%' } },
          ].map(({ word, meaning, pos }, i) => (
            <div key={word} style={{
              position: 'absolute', ...pos,
              background: 'var(--surface)', border: '1px solid var(--line)',
              padding: '8px 14px', borderRadius: 'var(--r-sm)',
              boxShadow: 'var(--shadow-sm)',
              animation: `floaty ${4.2 + i * 0.6}s ease-in-out infinite`,
              backdropFilter: 'blur(4px)',
            }}>
              <div className="ar" style={{ fontSize: '1.3rem', color: 'var(--ink)', lineHeight: 1.4 }}>{word}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--muted)', letterSpacing: '.06em', marginTop: 1 }}>{meaning}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const site = window.getSiteContent ? window.getSiteContent() : (window.AE?.DATA?.siteContent || {});
  const home = site.homepage || {};
  const features = Array.isArray(home.features) && home.features.length ? home.features : [
    { icon: '🌐', label: 'Two Languages', title: 'Arabic & English — one teacher', desc: 'Whether you want Quran, dialect, or professional English, Hadi teaches both. One consistent voice, two complete systems.' },
    { icon: '٢٨', label: 'Script', title: 'Master the Arabic script', desc: 'All 28 letters with four positional forms — isolated, initial, medial, and final. Interactive explorer built into every lesson.' },
    { icon: '⟳', label: 'Retention', title: 'Vocabulary that actually sticks', desc: 'Spaced repetition flashcards so you retain what you learn long-term — not just for the lesson, but for life.' },
    { icon: '📈', label: 'Progress', title: 'Track every step', desc: 'Visual dashboard with lesson logs, skill ratings, streak tracking, and clear next steps from your teacher after every session.' },
  ];
  return (
    <section style={{ padding: 'clamp(48px,8vw,96px) clamp(20px,5vw,80px)', background: 'var(--surface-2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <Reveal>
          <SectionHeading
            eyebrow={home.featuresEyebrow || 'Why Arabic Enthusiast'}
            heading={home.featuresHeading || 'Everything you need to learn Arabic properly.'}
            sub={home.featuresSub || 'Structured curriculum, interactive tools, and genuine teaching — with no shortcuts.'}
          />
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 2 }}>
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.08}>
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--line)',
                padding: '28px 24px', transition: 'all .25s var(--ease)',
                borderRadius: i === 0 ? 'var(--r-lg) 0 0 var(--r-lg)' : i === features.length - 1 ? '0 var(--r-lg) var(--r-lg) 0' : '0',
                cursor: 'default', height: '100%',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'color-mix(in oklab, var(--accent) 40%, var(--line))'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{
                  width: 46, height: 46, borderRadius: 10, marginBottom: 20,
                  background: 'color-mix(in oklab, var(--accent) 12%, var(--surface))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--f-ar)', fontSize: '1.4rem', color: 'var(--accent)',
                }}>{f.icon}</div>
                <div style={{ fontSize: '0.62rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 700, marginBottom: 8, fontFamily: 'var(--f-body)' }}>{f.label}</div>
                <div style={{ fontFamily: 'var(--f-head)', fontSize: '1.1rem', color: 'var(--ink)', marginBottom: 10, lineHeight: 1.3, fontWeight: 600 }}>{f.title}</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.7 }}>{f.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CoursesTeaser({ setPage }) {
  const site = window.getSiteContent ? window.getSiteContent() : (window.AE?.DATA?.siteContent || {});
  const home = site.homepage || {};
  const courses = window.AE.DATA.courses.filter(c => c.featured && c.visible !== false);
  return (
    <section style={{ padding: 'clamp(48px,8vw,96px) clamp(20px,5vw,80px)', background: 'var(--surface-2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <Reveal style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
          <SectionHeading eyebrow={home.coursesEyebrow || 'Curriculum'} heading={home.coursesHeading || 'Three paths into Arabic'} />
          <button onClick={() => { setPage('courses'); window.scrollTo(0,0); }} style={{
            fontFamily: 'var(--f-body)', fontSize: '0.82rem', fontWeight: 500,
            background: 'none', border: '1px solid var(--line)', color: 'var(--ink-2)',
            padding: '9px 18px', cursor: 'pointer', transition: 'all .2s var(--ease)',
            borderRadius: 'var(--r)', whiteSpace: 'nowrap',
          }}
            onMouseEnter={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--line)'; e.target.style.color = 'var(--ink-2)'; }}
          >All courses →</button>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {courses.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.1}>
              <div onClick={() => { setPage('courses'); window.scrollTo(0,0); }} style={{
                background: 'var(--surface)', border: '1px solid var(--line)',
                padding: '28px 24px', cursor: 'pointer',
                transition: 'all .25s var(--ease)',
                borderRadius: 'var(--r-lg)', position: 'relative', overflow: 'hidden',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'color-mix(in oklab, var(--accent) 40%, var(--line))'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <Badge tone="accent">{c.type || 'Classical'}</Badge>
                  <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.62rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>{c.level}</span>
                </div>
                <div style={{ fontFamily: 'var(--f-head)', fontSize: '1.2rem', color: 'var(--ink)', marginBottom: 6, lineHeight: 1.3, fontWeight: 600 }}>{c.title}</div>
                <div className="ar" style={{ fontFamily: 'var(--f-ar)', fontSize: '1.4rem', color: 'var(--accent)', textAlign: 'right', marginBottom: 12, lineHeight: 1.6 }}>{c.arabic}</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.65, marginBottom: 20 }}>{c.desc}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', borderTop: '1px solid var(--line-2)', paddingTop: 14 }}>
                  {[`${c.lessons || '–'} lessons`, `${c.weeks || '–'} weeks`].map(stat => (
                    <span key={stat} style={{ fontFamily: 'var(--f-head)', fontSize: '0.82rem', color: 'var(--ink-2)' }}>{stat}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ApproachSection({ setPage }) {
  const site = window.getSiteContent ? window.getSiteContent() : (window.AE?.DATA?.siteContent || {});
  const home = site.homepage || {};
  const principles = [
    { num: '01', title: 'Language before rules', body: 'Arabic and English both have elegant internal logic. You learn by using the language, not by memorising rules in isolation. Grammar arrives when it explains something you\'ve already felt.' },
    { num: '02', title: 'Both languages, one system', body: 'Hadi teaches Arabic to English speakers and English to Arabic speakers. Knowing what each language feels like from the inside — its rhythms, its gaps — is what makes the teaching sharp.' },
    { num: '03', title: 'Progress you can see', body: 'Every lesson is logged. You always know what you\'ve covered, what\'s coming next, and how far you\'ve come. No guessing, no plateaus you can\'t explain.' },
  ];
  return (
    <section style={{ padding: 'clamp(48px,8vw,96px) clamp(20px,5vw,80px)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <Reveal>
          <div className="approach-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px,6vw,80px)', alignItems: 'start' }}>
            {/* Left */}
            <div>
              <Eyebrow>The teaching approach</Eyebrow>
              <h2 style={{ fontFamily: 'var(--f-head)', fontSize: 'clamp(1.6rem,3vw,2.1rem)', fontWeight: 600, lineHeight: 1.15, color: 'var(--ink)', marginBottom: 20, letterSpacing: '-0.01em' }}>
                Teaching that <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>builds</em><br />real ability
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.7, marginBottom: 28 }}>
                {home.approachSub || 'Arabic is not a utility language to "get through" — it is a living tradition. English is not just grammar drills — it is a tool for real life. Every lesson honours the language being taught.'}
              </p>
              <button onClick={() => { setPage('about'); window.scrollTo(0,0); }} style={{
                fontFamily: 'var(--f-body)', fontSize: '0.85rem', fontWeight: 600,
                padding: '12px 24px', background: 'var(--ink)', color: 'var(--paper)',
                border: '1px solid var(--ink)', cursor: 'pointer', transition: 'all .2s var(--ease)',
                borderRadius: 'var(--r)',
              }}>Meet Hadi →</button>
            </div>
            {/* Right — principles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {principles.map((p, i) => (
                <div key={p.num} style={{ borderTop: '1px solid var(--line-2)', padding: '20px 0' }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ fontFamily: 'var(--f-head)', fontSize: '1.8rem', fontWeight: 600, color: 'var(--accent)', lineHeight: 1, flexShrink: 0, minWidth: 36 }}>{p.num}</div>
                    <div>
                      <div style={{ fontFamily: 'var(--f-head)', fontSize: '1.05rem', fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>{p.title}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.65 }}>{p.body}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function QuoteSection() {
  const site = window.getSiteContent ? window.getSiteContent() : (window.AE?.DATA?.siteContent || {});
  const home = site.homepage || {};
  return (
    <section style={{ background: 'var(--ink)', color: 'var(--paper)', textAlign: 'center', padding: 'clamp(40px,6vw,72px) clamp(20px,5vw,80px)' }}>
      <Reveal>
        <div className="ar" style={{
          fontFamily: 'var(--f-ar)', fontSize: 'clamp(2.2rem,5vw,3.4rem)',
          color: 'var(--paper)', lineHeight: 1.7, marginBottom: 16, direction: 'rtl',
        }}>
          {home.quoteArabic || 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا'}
        </div>
        <div style={{ fontFamily: 'var(--f-head)', fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--ink-2)', maxWidth: 480, margin: '0 auto 10px' }}>
          "{home.quoteText || 'And He taught Adam the names of all things'}"
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '.14em', textTransform: 'uppercase', fontFamily: 'var(--f-body)' }}>
          {home.quoteSource || 'Quran 2:31'}
        </div>
      </Reveal>
    </section>
  );
}

function CtaSection({ setPage }) {
  const site = window.getSiteContent ? window.getSiteContent() : (window.AE?.DATA?.siteContent || {});
  const home = site.homepage || {};
  return (
    <section style={{ padding: 'clamp(48px,8vw,96px) clamp(20px,5vw,80px)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div style={{
          background: 'var(--accent)', color: 'var(--on-accent)',
          borderRadius: 'var(--r-lg)', padding: 'clamp(40px,6vw,72px)',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          {/* Faint watermark */}
          <div className="ar" style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            fontFamily: 'var(--f-ar)', fontSize: 'clamp(8rem,18vw,14rem)',
            color: 'rgba(255,255,255,0.07)', pointerEvents: 'none',
            lineHeight: 1, userSelect: 'none', whiteSpace: 'nowrap',
          }}>{home.ctaArabic || 'بِسْمِ اللَّهِ'}</div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: 'var(--f-head)', fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 600, lineHeight: 1.15, marginBottom: 16, color: 'var(--on-accent)' }}>
              {home.ctaTitleLine1 || 'Begin your'}{' '}
              <em style={{ fontStyle: 'italic' }}>{home.ctaTitleAccent || 'Arabic journey'}</em>{' '}
              {home.ctaTitleLine3 || 'today'}
            </h2>
            <p style={{ color: 'rgba(255,248,241,0.75)', fontSize: '1rem', lineHeight: 1.7, marginBottom: 28, maxWidth: 520, margin: '0 auto 28px' }}>
              {home.ctaDescription || "Take the first step towards understanding one of the world's most profound languages."}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => window.location.href = '/portal?signup=1'} style={{
                fontFamily: 'var(--f-body)', fontSize: '0.85rem', fontWeight: 600,
                padding: '13px 36px', background: 'var(--on-accent)', color: 'var(--accent)',
                border: '1px solid var(--on-accent)', cursor: 'pointer', borderRadius: 'var(--r)',
                transition: 'all .2s var(--ease)',
              }}>{home.ctaPrimary || 'Start learning →'}</button>
              <button onClick={() => { setPage('pricing'); window.scrollTo(0,0); }} style={{
                fontFamily: 'var(--f-body)', fontSize: '0.85rem', fontWeight: 500,
                padding: '13px 28px', background: 'transparent',
                border: '1px solid rgba(255,248,241,0.38)', color: 'var(--on-accent)',
                cursor: 'pointer', borderRadius: 'var(--r)', transition: 'all .2s var(--ease)',
              }}>{home.ctaSecondary || 'See pricing'}</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutTeaser({ setPage }) {
  return (
    <section style={{ padding: 'clamp(48px,8vw,96px) clamp(20px,5vw,80px)', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 'clamp(40px,7vw,96px)', alignItems: 'center' }} className="about-grid">
          {/* Photo */}
          <Reveal delay={0.05}>
            <div style={{ position: 'relative' }}>
              <div style={{
                borderRadius: 'var(--r-lg)', overflow: 'hidden',
                border: '1px solid var(--line)', boxShadow: 'var(--shadow)',
                aspectRatio: '4/5', maxWidth: 420,
              }}>
                <img src="/logo.jpeg" alt="Hadi Shokeir" style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  objectPosition: 'center top', display: 'block',
                }} />
              </div>
              {/* Floating credential badge */}
              <div style={{
                position: 'absolute', bottom: 20, right: -16,
                background: 'var(--ink)', color: 'var(--paper)',
                padding: '12px 18px', borderRadius: 'var(--r-sm)',
                boxShadow: 'var(--shadow)', whiteSpace: 'nowrap',
              }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 3 }}>Your teacher</div>
                <div style={{ fontFamily: 'var(--f-head)', fontSize: '0.95rem', fontWeight: 600 }}>Hadi Shokeir</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--faint)', marginTop: 2 }}>Linguist · Translator · Mentor</div>
              </div>
            </div>
          </Reveal>

          {/* Copy */}
          <Reveal>
            <Eyebrow>Who teaches you</Eyebrow>
            <h2 style={{ fontFamily: 'var(--f-head)', fontSize: 'clamp(1.8rem,3.4vw,2.6rem)', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.12, marginBottom: 20, letterSpacing: '-0.01em' }}>
              A linguist who has lived{' '}
              <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>both languages</em>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
              <p style={{ color: 'var(--ink-2)', fontSize: '1rem', lineHeight: 1.8, margin: 0 }}>
                Hadi Shokeir is a linguist, translator, and language mentor with deep roots in both Arabic and English. Born into the Arabic language and immersed in English from an early age, he has spent years teaching both — to students across different countries, backgrounds, and goals.
              </p>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.8, margin: 0 }}>
                Before building Arabic Enthusiast, Hadi worked professionally in digital advertising — managing Meta Ads campaigns across Facebook and Instagram, with a focus on performance, clarity, and measurable results. He brings that same structured thinking to teaching: every lesson is goal-oriented, every session moves you forward.
              </p>
            </div>
            {/* Specialty chips */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
              {['Classical Arabic', 'Levantine Dialect', 'Quranic Arabic', 'English'].map(s => (
                <span key={s} style={{
                  padding: '5px 12px', fontFamily: 'var(--f-body)', fontSize: '0.75rem',
                  border: '1px solid var(--line)', borderRadius: 999,
                  color: 'var(--ink-2)', background: 'var(--surface-2)',
                }}>{s}</span>
              ))}
            </div>
            <button onClick={() => { setPage('about'); window.scrollTo(0,0); }} style={{
              fontFamily: 'var(--f-body)', fontSize: '0.85rem', fontWeight: 600,
              padding: '13px 28px', background: 'var(--accent)', color: 'var(--on-accent)',
              border: '1px solid var(--accent)', cursor: 'pointer', borderRadius: 'var(--r)',
              transition: 'all .2s var(--ease)',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >Full story & contact →</button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function GroupWaitlistSection() {
  const [form, setForm] = React.useState({ name: '', email: '', phone: '', interest: 'Arabic Group' });
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } catch {}
    setSent(true);
    setLoading(false);
  }

  const inputStyle = {
    width: '100%', background: 'var(--surface-2)', border: '1px solid var(--line)',
    color: 'var(--ink)', padding: '11px 14px', fontFamily: 'var(--f-body)', fontSize: '15px',
    outline: 'none', transition: 'border-color .2s', borderRadius: 'var(--r-sm)',
  };

  return (
    <section style={{ padding: 'clamp(48px,8vw,96px) clamp(20px,5vw,80px)', background: 'var(--surface-2)', borderTop: '1px solid var(--line)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px,6vw,80px)', alignItems: 'start' }} className="about-grid">
          {/* Left — context */}
          <Reveal>
            <Eyebrow>Coming Soon</Eyebrow>
            <h2 style={{ fontFamily: 'var(--f-head)', fontSize: 'clamp(1.8rem,3.2vw,2.4rem)', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.01em' }}>
              Group lessons —{' '}
              <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>join the waitlist</em>
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.75, marginBottom: 28, maxWidth: 420 }}>
              Small-group lessons are coming for Arabic and English learners. Structured, live sessions with Hadi — at a lower price point than private 1:1. Drop your details and you'll be the first to know when spots open.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: '👥', label: 'Small groups', desc: 'Maximum 6 students per session — everyone gets attention.' },
                { icon: '🗓️', label: 'Structured curriculum', desc: 'Same rigour as private lessons, shared journey.' },
                { icon: '💬', label: 'Live with Hadi', desc: 'Not pre-recorded. Real-time lessons, real feedback.' },
              ].map(({ icon, label, desc }) => (
                <div key={label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 20, width: 28, flexShrink: 0, marginTop: 2 }}>{icon}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--ink)', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: '0.83rem', color: 'var(--muted)', lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Right — form */}
          <Reveal delay={0.1}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', padding: '32px 28px' }}>
              {sent ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                  <div style={{ fontFamily: 'var(--f-head)', fontSize: '1.3rem', fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>You're on the list!</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.6 }}>Hadi will reach out personally when group sessions are ready to launch.</div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ fontFamily: 'var(--f-head)', fontSize: '1.05rem', fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>Reserve your spot</div>
                  {[['text','Full Name','name'],['email','Email Address','email'],['tel','Phone / WhatsApp','phone']].map(([type, label, key]) => (
                    <div key={key}>
                      <label style={{ display: 'block', fontSize: '0.66rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 5, fontWeight: 600 }}>{label}</label>
                      <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required={key !== 'phone'} placeholder={key === 'phone' ? 'Optional — for WhatsApp updates' : ''} style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--line)'}
                      />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.66rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 8, fontWeight: 600 }}>I want group lessons in</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['Arabic Group', 'English Group', 'Both'].map(opt => (
                        <button key={opt} type="button" onClick={() => setForm(f => ({ ...f, interest: opt }))} style={{
                          flex: 1, padding: '9px 8px', fontFamily: 'var(--f-body)', fontSize: '0.78rem', cursor: 'pointer',
                          background: form.interest === opt ? 'color-mix(in oklab, var(--accent) 12%, var(--surface))' : 'var(--surface-2)',
                          border: `1px solid ${form.interest === opt ? 'color-mix(in oklab, var(--accent) 40%, transparent)' : 'var(--line)'}`,
                          color: form.interest === opt ? 'var(--accent)' : 'var(--muted)',
                          borderRadius: 'var(--r-sm)', transition: 'all .15s', fontWeight: form.interest === opt ? 600 : 400,
                        }}>{opt}</button>
                      ))}
                    </div>
                  </div>
                  <button type="submit" disabled={loading} style={{
                    width: '100%', padding: '13px',
                    background: 'var(--accent)', color: 'var(--on-accent)',
                    border: 'none', fontFamily: 'var(--f-body)', fontSize: '0.88rem',
                    fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                    borderRadius: 'var(--r)', transition: 'all .2s var(--ease)',
                    opacity: loading ? 0.7 : 1, marginTop: 4,
                  }}>{loading ? 'Saving…' : 'Join the waitlist →'}</button>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textAlign: 'center', lineHeight: 1.5 }}>No spam. Hadi will message you personally when it's ready.</div>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function HomePage({ setPage }) {
  const show = window.showSiteSection || (() => true);
  return (
    <div>
      {show('homeHero') && <HeroSection setPage={setPage} />}
      {show('features') && <FeaturesSection />}
      {show('courses') && <CoursesTeaser setPage={setPage} />}
      {show('approach') !== false && <ApproachSection setPage={setPage} />}
      <AboutTeaser setPage={setPage} />
      {show('quote') && <QuoteSection />}
      <GroupWaitlistSection />
      {show('cta') && <CtaSection setPage={setPage} />}
    </div>
  );
}

window.HomePage = HomePage;
