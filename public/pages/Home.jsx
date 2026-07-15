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
          <Eyebrow>{home.eyebrow || 'Private 1:1 Arabic Tuition'}</Eyebrow>
          <h1 style={{
            fontFamily: 'var(--f-head)',
            fontSize: 'clamp(2.6rem, 5.4vw, 4.4rem)',
            fontWeight: 600, lineHeight: 1.08, color: 'var(--ink)',
            letterSpacing: '-0.01em', marginBottom: 24, textWrap: 'balance',
          }}>
            {home.titleLine1 || 'Learn Arabic with'}{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{home.titleAccent || 'passion'}</em>
            {' & '}{home.titleLine3 || 'precision'}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', lineHeight: 1.75, maxWidth: 480, marginBottom: 36 }}>
            {home.description || 'From your first letter to reading the Quran and conversing in dialect — structured courses that honour the depth and beauty of the Arabic language.'}
          </p>

          <div className="hero-actions" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => window.location.href = '/portal?signup=1'} style={btnPrimary}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >{home.primaryCta || 'Start learning'} →</button>

            <button onClick={() => { setPage('courses'); window.scrollTo(0,0); }} style={btnOutline}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--ink-2)'; }}
            >{home.secondaryCta || 'Browse courses'}</button>

            <button onClick={() => window.location.href = '/demo'} style={btnGhost}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
            >Try free demo</button>
          </div>

          {/* Stat strip */}
          <div style={{ marginTop: 40, paddingTop: 28, borderTop: '1px solid var(--line-2)', display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            {[['4.9★','Rating'],['200+','Students'],['6+ yrs','Teaching']].map(([val, label]) => (
              <div key={label}>
                <div style={{ fontFamily: 'var(--f-head)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--ink)', lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '.08em', textTransform: 'uppercase', marginTop: 3 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero visual — animated Arabic letter in rings */}
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
            {/* The letter */}
            <div key={tick} style={{
              fontFamily: 'var(--f-ar)', fontSize: 'clamp(6rem, 18vw, 10rem)',
              color: 'var(--accent)', lineHeight: 1, userSelect: 'none',
              animation: 'letterFade 2.2s var(--ease)',
            }}>{letters[tick % letters.length]}</div>
          </div>

          {/* Floating word chips */}
          {[
            { word: 'كِتَاب', meaning: 'Book', style: { top: '10%', left: '-6%', animationDelay: '0s' } },
            { word: 'نُور',  meaning: 'Light', style: { top: '14%', right: '-4%', animationDelay: '1.5s' } },
            { word: 'قَلْب', meaning: 'Heart', style: { bottom: '12%', left: '-4%', animationDelay: '0.8s' } },
          ].map(({ word, meaning, style: pos }) => (
            <div key={word} style={{
              position: 'absolute', ...pos,
              background: 'var(--surface)', border: '1px solid var(--line)',
              padding: '8px 14px', borderRadius: 'var(--r-sm)',
              boxShadow: 'var(--shadow-sm)',
              animation: `floaty ${4 + Math.random()}s ease-in-out infinite`,
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
    { icon: '٢٨', label: 'Script', title: 'Master the script', desc: 'All 28 Arabic letters with four positional forms — isolated, initial, medial, and final. Interactive explorer included.' },
    { icon: '◎', label: 'Sounds', title: 'Authentic sounds', desc: 'Audio for every letter, word, and phrase. The sounds that don\'t exist in English — ʿAyn, Ḥa, and Qāf — made clear.' },
    { icon: '⟳', label: 'Vocabulary', title: 'Vocabulary that sticks', desc: 'Flashcard system using spaced repetition so you retain vocabulary long-term, not just for one lesson.' },
    { icon: '📈', label: 'Progress', title: 'Track every step', desc: 'Visual dashboard with lesson completion, quiz scores, streaks, and skill levels across reading, writing, and speaking.' },
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
    { num: '01', title: 'Language before grammar', body: 'You learn by using Arabic, not by memorising rules in a vacuum. Structures are introduced in context.' },
    { num: '02', title: 'Dialect and Modern Standard together', body: 'Classical roots, Levantine spoken fluency, and Quranic recitation are not competing paths — they reinforce each other.' },
    { num: '03', title: 'Progress you can see', body: 'Every lesson is tracked. You always know what you\'ve covered, what\'s next, and how far you\'ve come.' },
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
                Teaching that <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>respects</em><br />the language
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.7, marginBottom: 28 }}>
                {home.approachSub || 'Arabic is not a utility language to "get through" — it is a living tradition. Every lesson honours its depth.'}
              </p>
              <button onClick={() => { setPage('about'); window.scrollTo(0,0); }} style={{
                fontFamily: 'var(--f-body)', fontSize: '0.85rem', fontWeight: 600,
                padding: '12px 24px', background: 'var(--ink)', color: 'var(--paper)',
                border: '1px solid var(--ink)', cursor: 'pointer', transition: 'all .2s var(--ease)',
                borderRadius: 'var(--r)',
              }}>Meet your teacher →</button>
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

function SubscriptionSection() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  async function handleSubscribe() {
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await r.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
      }
    } catch {
      setError('Could not connect. Please try again.');
      setLoading(false);
    }
  }

  return (
    <section style={{ padding: 'clamp(48px,8vw,96px) clamp(20px,5vw,80px)', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <Eyebrow center={true}>Monthly Access</Eyebrow>
            <h2 style={{
              fontFamily: 'var(--f-head)', fontSize: 'clamp(1.8rem,4vw,2.6rem)',
              fontWeight: 600, lineHeight: 1.15, marginBottom: 12, color: 'var(--ink)',
            }}>
              The fastest path to{' '}
              <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Arabic fluency</em>
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.7, maxWidth: 460, margin: '0 auto' }}>
              Unlimited lessons, daily practice, and direct access to your teacher — one flat monthly price.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div style={{
            maxWidth: 440, margin: '0 auto',
            background: 'var(--ink)', color: 'var(--paper)',
            borderRadius: 'var(--r-lg)', padding: '36px 32px',
            textAlign: 'center', boxShadow: 'var(--shadow)',
          }}>
            <div style={{ fontFamily: 'var(--f-head)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 4 }}>
              Monthly Immersion
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
              <span style={{ fontFamily: 'var(--f-head)', fontSize: '3rem', fontWeight: 700, lineHeight: 1 }}>$420</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>/month</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28, textAlign: 'left' }}>
              {['Unlimited lessons (up to 4/week)', 'Daily vocab & tasks', 'Full portal access', 'Weekly progress call', 'Priority support'].map(function (f) {
                return (
                  <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: '0.88rem', opacity: 0.85, lineHeight: 1.4 }}>{f}</span>
                  </div>
                );
              })}
            </div>
            {error && <p style={{ color: 'var(--bad)', fontSize: '0.8rem', marginBottom: 10 }}>{error}</p>}
            <button
              onClick={handleSubscribe}
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                fontFamily: 'var(--f-body)', fontSize: '0.9rem', fontWeight: 600,
                background: 'var(--accent)', color: 'var(--on-accent)',
                border: '1px solid var(--accent)',
                cursor: loading ? 'not-allowed' : 'pointer',
                borderRadius: 'var(--r)', transition: 'all .2s var(--ease)',
                opacity: loading ? 0.7 : 1,
              }}
            >{loading ? 'Redirecting…' : 'Subscribe now →'}</button>
          </div>
        </Reveal>
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
      {show('subscription') !== false && <SubscriptionSection />}
      {show('quote') && <QuoteSection />}
      {show('cta') && <CtaSection setPage={setPage} />}
    </div>
  );
}

window.HomePage = HomePage;
