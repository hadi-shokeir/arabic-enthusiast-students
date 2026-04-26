// ─── Home Page ───────────────────────────────────────────────────────────────
const { useState, useEffect, useRef } = React;

function HeroSection({ setPage }) {
  const [tick, setTick] = useState(0);
  const letters = ['ع', 'ر', 'ب', 'ي'];
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <section style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      position: 'relative', overflow: 'hidden',
      padding: '120px 80px 80px',
    }}>
      {/* Ambient background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 55% 70% at 65% 50%, rgba(255,255,255,0.04) 0%, transparent 65%),
          radial-gradient(ellipse 40% 50% at 10% 80%, rgba(90,80,120,0.04) 0%, transparent 60%)
        `,
      }} />
      {/* Decorative grid lines */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', width: '100%', maxWidth: 1400, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Text */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <span style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.5)', display: 'block' }}></span>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>Arabic Enthusiast</span>
          </div>
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(3rem, 5vw, 5rem)',
            fontWeight: 600, lineHeight: 1.1, color: '#f0f0f0',
            marginBottom: 28,
          }}>
            Learn Arabic<br />
            <em style={{ color: '#ffffff', fontStyle: 'italic' }}>with Passion</em><br />
            & Precision
          </h1>
          <p style={{ color: 'rgba(240,240,240,0.55)', fontSize: '1.05rem', lineHeight: 1.75, maxWidth: 440, marginBottom: 44 }}>
            From your first letter to reading the Quran and conversing in dialect — structured courses that honour the depth and beauty of the Arabic language.
          </p>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <button onClick={() => { setPage('courses'); window.scrollTo(0,0); }} style={{
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem',
              letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600,
              padding: '16px 40px', background: '#ffffff', color: '#080808',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.target.style.background = '#e0e0e0'; e.target.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.target.style.background = '#ffffff'; e.target.style.transform = 'translateY(0)'; }}
            >Explore Courses</button>
            <button onClick={() => { setPage('about'); window.scrollTo(0,0); }} style={{
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '16px 28px', background: 'transparent',
              border: '1px solid rgba(240,240,240,0.2)', color: 'rgba(240,240,240,0.6)',
              cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 10,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'; e.currentTarget.style.color = '#ffffff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(240,240,240,0.2)'; e.currentTarget.style.color = 'rgba(240,240,240,0.6)'; }}
            >
              <span style={{ width: 30, height: 30, border: '1px solid currentColor', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>▶</span>
              Meet your teacher
            </button>
          </div>
          {/* Subject pills */}
          <div style={{ marginTop: 48, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Classical Arabic', 'Conversational Arabic', 'Quranic Arabic'].map(s => (
              <span key={s} style={{
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', letterSpacing: '0.1em',
                textTransform: 'uppercase', padding: '5px 14px',
                border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)',
              }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Hero visual — animated Arabic letter */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{
            width: 420, height: 420,
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', inset: 20, border: '1px solid rgba(255,255,255,0.06)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />
            {/* Rotating ring */}
            <div style={{ position: 'absolute', inset: -1, borderRadius: '50%',
              border: '1px dashed rgba(255,255,255,0.2)',
              animation: 'spin 30s linear infinite',
            }} />
            {/* Letter display */}
            <div key={tick} style={{
              fontFamily: 'Amiri, serif',
              fontSize: '10rem', color: '#ffffff',
              lineHeight: 1, userSelect: 'none',
              animation: 'letterFade 2.2s ease',
              textShadow: '0 0 60px rgba(255,255,255,0.5), 0 0 120px rgba(255,255,255,0.2)',
            }}>{letters[tick % letters.length]}</div>
            {/* Orbit dots */}
            {[0,72,144,216,288].map((deg,i) => {
              const r = 210; const rad = (deg - 90) * Math.PI / 180;
              return (
                <div key={i} style={{
                  position: 'absolute',
                  left: `calc(50% + ${r * Math.cos(rad)}px - 4px)`,
                  top: `calc(50% + ${r * Math.sin(rad)}px - 4px)`,
                  width: 8, height: 8, borderRadius: '50%',
                  background: i === 0 ? '#ffffff' : 'rgba(255,255,255,0.25)',
                }} />
              );
            })}
          </div>
          {/* Floating word cards */}
          {[
            { word: 'كِتَاب', meaning: 'Book', top: '8%', left: '-10%' },
            { word: 'نُور', meaning: 'Light', top: '15%', right: '-5%' },
            { word: 'قَلْب', meaning: 'Heart', bottom: '15%', left: '-8%' },
          ].map(({ word, meaning, ...pos }) => (
            <div key={word} style={{
              position: 'absolute', ...pos,
              background: 'rgba(18,18,18,0.9)', border: '1px solid rgba(255,255,255,0.15)',
              padding: '10px 16px', backdropFilter: 'blur(8px)',
              animation: 'float 4s ease-in-out infinite',
            }}>
              <div style={{ fontFamily: 'Amiri, serif', fontSize: '1.4rem', color: '#ffffff', direction: 'rtl', lineHeight: 1 }}>{word}</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(240,240,240,0.45)', letterSpacing: '0.08em', marginTop: 2 }}>{meaning}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll cue */}
      <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(240,240,240,0.3)' }}>Scroll</span>
        <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)', animation: 'scrollLine 1.5s ease-in-out infinite' }} />
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { icon: '٢٨', label: '28 Letters', title: 'Master the Script', desc: 'Learn all 28 Arabic letters with their four positional forms — isolated, initial, medial and final. Interactive explorer included.' },
    { icon: '◎', label: 'Pronunciation', title: 'Authentic Sounds', desc: 'Audio for every letter, word, and phrase. Learn the sounds that don\'t exist in English — ʿAin, Ḥa, and Qaf.' },
    { icon: '⟳', label: 'Spaced Repetition', title: 'Vocabulary That Sticks', desc: 'Our flashcard system uses proven spacing algorithms so you retain what you learn long-term — not just for the exam.' },
    { icon: '📈', label: 'Progress', title: 'Track Every Step', desc: 'Visual dashboard showing your lesson completion, quiz scores, streak, and skill levels across reading, writing, and speaking.' },
  ];
  return (
    <section style={{ padding: '100px 80px', position: 'relative' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <Reveal>
          <SectionHeading eyebrow="Why Arabic Enthusiast" heading="Everything you need to learn Arabic properly." sub="Structured curriculum, interactive tools, and genuine teaching — no shortcuts." />
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.08}>
              <div style={{
                background: 'rgba(18,18,18,0.6)', border: '1px solid rgba(255,255,255,0.08)',
                padding: '36px 28px', transition: 'all 0.3s', cursor: 'default',
                position: 'relative', overflow: 'hidden',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(24,24,24,0.9)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(18,18,18,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                <div style={{ fontFamily: 'Amiri, serif', fontSize: '2.2rem', color: 'rgba(255,255,255,0.15)', marginBottom: 20, lineHeight: 1 }}>{f.icon}</div>
                <div style={{ fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 10 }}>{f.label}</div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.15rem', color: '#f0f0f0', marginBottom: 12, lineHeight: 1.3 }}>{f.title}</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(240,240,240,0.45)', lineHeight: 1.7 }}>{f.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function AlphabetTeaser({ setPage }) {
  const [hovered, setHovered] = useState(null);
  const letters = window.AE.DATA.alphabet.slice(0, 14);
  return (
    <section style={{ padding: '100px 80px', background: 'rgba(12,12,12,0.8)' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <Reveal style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <SectionHeading eyebrow="Interactive" heading={<>Explore the<br /><em style={{ color: '#ffffff' }}>Arabic Alphabet</em></>} sub="Each of the 28 letters changes form depending on its position in a word. Click any letter to discover its story." />
            <button onClick={() => { setPage('courses'); window.scrollTo(0,0); }} style={{
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              padding: '14px 32px', background: 'transparent',
              border: '1px solid rgba(255,255,255,0.4)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.target.style.background = '#ffffff'; e.target.style.color = '#080808'; }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'rgba(255,255,255,0.7)'; }}
            >Start the Alphabet Course →</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {letters.map((l, i) => (
              <div key={l.ar}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: hovered === i ? 'rgba(255,255,255,0.1)' : 'rgba(18,18,18,0.8)',
                  border: `1px solid ${hovered === i ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  padding: '14px 6px', textAlign: 'center', cursor: 'pointer',
                  transition: 'all 0.2s', transform: hovered === i ? 'translateY(-3px)' : 'none',
                }}>
                <div style={{ fontFamily: 'Amiri, serif', fontSize: '1.5rem', color: hovered === i ? '#ffffff' : '#f0f0f0', lineHeight: 1 }}>{l.ar}</div>
                <div style={{ fontSize: '0.58rem', color: 'rgba(240,240,240,0.35)', marginTop: 4, letterSpacing: '0.06em' }}>{l.trans}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function CoursesTeaser({ setPage }) {
  const courses = window.AE.DATA.courses.filter(c => c.featured);
  return (
    <section style={{ padding: '100px 80px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <Reveal style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56 }}>
          <SectionHeading eyebrow="Curriculum" heading="Choose your path" sub={null} />
          <button onClick={() => { setPage('courses'); window.scrollTo(0,0); }} style={{
            fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase',
            background: 'none', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(240,240,240,0.45)', padding: '10px 20px', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
          }}
            onMouseEnter={e => { e.target.style.borderColor = 'rgba(255,255,255,0.5)'; e.target.style.color = '#ffffff'; }}
            onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.18)'; e.target.style.color = 'rgba(240,240,240,0.45)'; }}
          >All courses →</button>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {courses.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.1}>
              <div onClick={() => { setPage('courses'); window.scrollTo(0,0); }} style={{
                background: 'rgba(16,16,16,0.8)', border: '1px solid rgba(255,255,255,0.08)',
                padding: '36px 32px', cursor: 'pointer', transition: 'all 0.3s', position: 'relative', overflow: 'hidden',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.transform = 'translateY(-5px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: c.color, opacity: 0.7 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <Badge>{c.level}</Badge>
                  <span style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,240,240,0.3)' }}>{c.type}</span>
                </div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: '#f0f0f0', marginBottom: 8, lineHeight: 1.3 }}>{c.title}</div>
                <div style={{ fontFamily: 'Amiri, serif', fontSize: '1.5rem', color: 'rgba(255,255,255,0.45)', direction: 'rtl', textAlign: 'right', marginBottom: 14, textShadow: '0 0 20px rgba(255,255,255,0.2)' }}>{c.arabic}</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(240,240,240,0.45)', lineHeight: 1.65, marginBottom: 24 }}>{c.desc}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(c.topics || []).slice(0, 2).map(t => (
                    <span key={t} style={{ fontSize: '0.65rem', color: 'rgba(240,240,240,0.35)', border: '1px solid rgba(255,255,255,0.1)', padding: '3px 10px', letterSpacing: '0.04em' }}>{t}</span>
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

function QuoteSection() {
  return (
    <section style={{ padding: '80px', background: 'rgba(10,10,10,0.7)', borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
      <Reveal>
        <div style={{ fontFamily: 'Amiri, serif', fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: '#ffffff', direction: 'rtl', marginBottom: 16, lineHeight: 1.6, textShadow: '0 0 40px rgba(255,255,255,0.3), 0 0 80px rgba(255,255,255,0.1)' }}>
          وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا
        </div>
        <div style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: '1.1rem', color: 'rgba(240,240,240,0.55)', maxWidth: 480, margin: '0 auto 8px' }}>
          "And He taught Adam the names of all things"
        </div>
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Quran 2:31</div>
      </Reveal>
    </section>
  );
}

function CtaSection({ setPage }) {
  return (
    <section style={{ padding: '120px 80px', textAlign: 'center' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <Reveal>
          <div style={{ fontFamily: 'Amiri, serif', fontSize: '3.5rem', color: 'rgba(255,255,255,0.1)', marginBottom: 8, textShadow: '0 0 40px rgba(255,255,255,0.15)' }}>بِسْمِ اللَّهِ</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#f0f0f0', fontWeight: 600, lineHeight: 1.2, marginBottom: 20 }}>
            Begin your<br /><em style={{ color: '#ffffff' }}>Arabic journey</em> today
          </h2>
          <p style={{ color: 'rgba(240,240,240,0.45)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: 36 }}>
            Take the first step towards understanding one of the world's most profound languages.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <button onClick={() => { setPage('pricing'); window.scrollTo(0,0); }} style={{
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600,
              padding: '16px 44px', background: '#ffffff', color: '#080808', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.target.style.background = '#e0e0e0'; e.target.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.target.style.background = '#ffffff'; e.target.style.transform = 'none'; }}
            >See Pricing</button>
            <button onClick={() => { setPage('courses'); window.scrollTo(0,0); }} style={{
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '16px 32px', background: 'transparent', border: '1px solid rgba(240,240,240,0.2)', color: 'rgba(240,240,240,0.6)', cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.color = '#ffffff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(240,240,240,0.2)'; e.currentTarget.style.color = 'rgba(240,240,240,0.6)'; }}
            >Browse Courses</button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function HomePage({ setPage }) {
  return (
    <div>
      <HeroSection setPage={setPage} />
      <FeaturesSection />
      <AlphabetTeaser setPage={setPage} />
      <CoursesTeaser setPage={setPage} />
      <QuoteSection />
      <CtaSection setPage={setPage} />
    </div>
  );
}

window.HomePage = HomePage;
