// ─── Courses & Lesson Pages ───────────────────────────────────────────────────
const { useState, useEffect, useRef } = React;

// ── Alphabet Explorer (full) ──────────────────────────────────────────────────
function AlphabetExplorer() {
  const alpha = window.AE.DATA.alphabet;
  const [sel, setSel] = useState(0);
  const [form, setForm] = useState('isolated');
  const [quiz, setQuiz] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const letter = alpha[sel];
  const forms = ['isolated','initial','medial','final'];

  function startQuiz() {
    const distractors = alpha.filter((_,i) => i !== sel).sort(() => Math.random()-0.5).slice(0,3);
    const opts = [...distractors, letter].sort(() => Math.random()-0.5);
    setQuiz({ question: letter.ar, options: opts.map(l => l.name), answer: letter.name });
    setQuizResult(null);
  }

  return (
    <div style={{ background: 'rgba(12,12,12,0.8)', border: '1px solid rgba(255,255,255,0.1)', padding: 40 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
        <div>
          {/* Letter grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 20 }}>
            {alpha.map((l, i) => (
              <button key={i} onClick={() => { setSel(i); setForm('isolated'); setQuiz(null); }} style={{
                background: sel === i ? '#ffffff' : 'rgba(18,18,18,0.8)',
                border: `1px solid ${sel === i ? '#ffffff' : 'rgba(255,255,255,0.1)'}`,
                padding: '14px 6px', cursor: 'pointer', transition: 'all 0.15s',
              }}>
                <div style={{ fontFamily: 'Amiri, serif', fontSize: '1.5rem', color: sel === i ? '#080808' : '#f0f0f0', lineHeight: 1 }}>{l.ar}</div>
                <div style={{ fontSize: '0.58rem', color: sel === i ? 'rgba(8,8,8,0.6)' : 'rgba(240,240,240,0.3)', marginTop: 4 }}>{l.trans}</div>
              </button>
            ))}
          </div>
          {/* Form tabs */}
          <div style={{ display: 'flex', gap: 6 }}>
            {forms.map(f => (
              <button key={f} onClick={() => setForm(f)} style={{
                flex: 1, padding: '12px 8px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s',
                background: form === f ? 'rgba(255,255,255,0.08)' : 'rgba(16,16,16,0.8)',
                border: `1px solid ${form === f ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
              }}>
                <div style={{ fontFamily: 'Amiri, serif', fontSize: '1.6rem', color: form === f ? '#ffffff' : '#f0f0f0', direction: 'rtl' }}>{letter.forms[f]}</div>
                <div style={{ fontSize: '0.62rem', color: 'rgba(240,240,240,0.4)', textTransform: 'capitalize', marginTop: 4 }}>{f}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ textAlign: 'center', padding: '28px 16px', background: 'rgba(16,16,16,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div key={sel} style={{ fontFamily: 'Amiri, serif', fontSize: '7rem', color: '#ffffff', lineHeight: 1, animation: 'letterFade 0.3s ease', textShadow: '0 0 40px rgba(255,255,255,0.3)' }}>{letter.ar}</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#f0f0f0', marginTop: 4 }}>{letter.name}</div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(240,240,240,0.4)', marginTop: 4 }}>/{letter.trans}/</div>
          </div>

          <div style={{ background: 'rgba(16,16,16,0.8)', border: '1px solid rgba(255,255,255,0.07)', padding: 16 }}>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Note</div>
            <div style={{ fontSize: '0.83rem', color: 'rgba(240,240,240,0.55)', lineHeight: 1.6 }}>{letter.note}</div>
          </div>

          <div style={{ background: 'rgba(16,16,16,0.8)', border: '1px solid rgba(255,255,255,0.07)', padding: 16 }}>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Example word</div>
            <div style={{ fontFamily: 'Amiri, serif', fontSize: '2rem', color: '#f0f0f0', direction: 'rtl', textAlign: 'right' }}>{letter.example.word}</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(240,240,240,0.4)', marginTop: 4 }}>{letter.example.meaning} · {letter.example.trans}</div>
          </div>

          {/* Mini quiz */}
          {!quiz ? (
            <button onClick={startQuiz} style={{ padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.color = '#ffffff'; }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'rgba(255,255,255,0.6)'; }}
            >Test yourself →</button>
          ) : (
            <div style={{ background: 'rgba(16,16,16,0.8)', border: '1px solid rgba(255,255,255,0.07)', padding: 16 }}>
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Which letter is this?</div>
              <div style={{ fontFamily: 'Amiri, serif', fontSize: '3rem', color: '#f0f0f0', textAlign: 'center', marginBottom: 12 }}>{quiz.question}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {quiz.options.map(opt => {
                  const isCorrect = opt === quiz.answer;
                  const isWrong = quizResult === opt && opt !== quiz.answer;
                  return (
                    <button key={opt} onClick={() => !quizResult && setQuizResult(opt)} style={{
                      padding: '8px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', cursor: quizResult ? 'default' : 'pointer',
                      background: quizResult ? (isCorrect ? 'rgba(74,122,90,0.3)' : isWrong ? 'rgba(180,60,60,0.3)' : 'transparent') : 'transparent',
                      border: `1px solid ${quizResult ? (isCorrect ? '#4a7a5a' : isWrong ? '#b43c3c' : 'rgba(255,255,255,0.1)') : 'rgba(255,255,255,0.1)'}`,
                      color: quizResult ? (isCorrect ? '#6abf80' : isWrong ? '#e08080' : 'rgba(240,240,240,0.4)') : 'rgba(240,240,240,0.7)',
                      transition: 'all 0.2s',
                    }}>{opt}</button>
                  );
                })}
              </div>
              {quizResult && (
                <button onClick={() => { setQuiz(null); setQuizResult(null); }} style={{ marginTop: 10, width: '100%', padding: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(240,240,240,0.5)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem' }}>
                  {quizResult === quiz.answer ? '✓ Correct! Try another →' : '✗ Try again →'}
                </button>
              )}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setSel(s => Math.max(0, s - 1))} disabled={sel === 0} style={{ padding: '8px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(240,240,240,0.4)', cursor: sel === 0 ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', opacity: sel === 0 ? 0.3 : 1 }}>← Prev</button>
            <span style={{ fontSize: '0.7rem', color: 'rgba(240,240,240,0.3)', alignSelf: 'center' }}>{sel + 1} / {alpha.length}</span>
            <button onClick={() => setSel(s => Math.min(alpha.length - 1, s + 1))} disabled={sel === alpha.length - 1} style={{ padding: '8px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(240,240,240,0.4)', cursor: sel === alpha.length - 1 ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', opacity: sel === alpha.length - 1 ? 0.3 : 1 }}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Courses Page ──────────────────────────────────────────────────────────────
function CoursesPage({ setPage, setLesson }) {
  const courses = window.AE.DATA.courses;
  const [filter, setFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const types = ['All', ...new Set(courses.map(c => c.type))];
  const filtered = courses.filter(c =>
    (filter === 'All' || c.level === filter) &&
    (typeFilter === 'All' || c.type === typeFilter)
  );

  return (
    <div style={{ paddingTop: 100 }}>
      {/* Header */}
      <div style={{ padding: '60px 80px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(8,8,8,0.5)' }}>
        <Reveal>
          <Eyebrow>All Courses</Eyebrow>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.4rem, 4vw, 3.6rem)', color: '#f0f0f0', fontWeight: 600, lineHeight: 1.15, marginBottom: 16 }}>
            Your path to Arabic<br /><em style={{ color: '#ffffff' }}>starts here</em>
          </h1>
          <p style={{ color: 'rgba(240,240,240,0.45)', fontSize: '0.95rem', maxWidth: 500, lineHeight: 1.7 }}>Structured courses across Classical, Levantine, and Quranic Arabic — for every level.</p>
        </Reveal>
      </div>

      {/* Filters */}
      <div style={{ padding: '24px 80px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, marginRight: 24 }}>
          {levels.map(l => (
            <button key={l} onClick={() => setFilter(l)} style={{
              padding: '7px 16px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s',
              background: filter === l ? '#ffffff' : 'transparent',
              border: `1px solid ${filter === l ? '#ffffff' : 'rgba(255,255,255,0.15)'}`,
              color: filter === l ? '#080808' : 'rgba(240,240,240,0.5)',
            }}>{l}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {types.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} style={{
              padding: '7px 16px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s',
              background: typeFilter === t ? 'rgba(255,255,255,0.08)' : 'transparent',
              border: `1px solid ${typeFilter === t ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
              color: typeFilter === t ? '#ffffff' : 'rgba(240,240,240,0.4)',
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: '48px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {filtered.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.06}>
              <div onClick={() => { setLesson(c.id); setPage('lesson'); window.scrollTo(0,0); }} style={{
                background: 'rgba(16,16,16,0.8)', border: '1px solid rgba(255,255,255,0.08)',
                padding: '32px 28px', cursor: 'pointer', transition: 'all 0.3s', position: 'relative',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = 'rgba(22,22,22,0.95)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(16,16,16,0.8)'; }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: c.color }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <Badge>{c.level}</Badge>
                  <span style={{ fontFamily: 'Amiri, serif', fontSize: '1.4rem', color: 'rgba(255,255,255,0.3)', textShadow: '0 0 15px rgba(255,255,255,0.2)' }}>{c.arabic.slice(0, 3)}</span>
                </div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', color: '#f0f0f0', marginBottom: 6, lineHeight: 1.3 }}>{c.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(240,240,240,0.35)', marginBottom: 14, letterSpacing: '0.04em' }}>{c.subtitle}</div>
                <div style={{ fontFamily: 'Amiri, serif', fontSize: '1.4rem', color: 'rgba(255,255,255,0.4)', direction: 'rtl', textAlign: 'right', marginBottom: 16, textShadow: '0 0 20px rgba(255,255,255,0.2)' }}>{c.arabic}</div>
                <div style={{ fontSize: '0.82rem', color: 'rgba(240,240,240,0.45)', lineHeight: 1.65, marginBottom: 20 }}>{c.desc}</div>
                <div style={{ paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <span style={{ fontSize: '0.68rem', color: 'rgba(240,240,240,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>View lessons →</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Alphabet Explorer */}
      <div style={{ padding: '0 80px 80px' }}>
        <Reveal>
          <SectionHeading eyebrow="Interactive Tool" heading="Explore the Alphabet" sub="Click any letter to explore its forms, pronunciation notes, and example words." />
          <AlphabetExplorer />
        </Reveal>
      </div>
    </div>
  );
}

// ── Lesson Page ───────────────────────────────────────────────────────────────
function LessonPage({ courseId, setPage }) {
  const courses = window.AE.DATA.courses;
  const course = courses.find(c => c.id === courseId) || courses[0];
  const allLessons = window.AE.DATA.lessons[course.id] || window.AE.DATA.lessons['arabic-foundations'];
  const [activeLesson, setActiveLesson] = useState(0);
  const [completed, setCompleted] = useState(new Set([0]));
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const lesson = allLessons[activeLesson];

  const QUIZ = {
    question: 'Which of these is the initial form of the letter Ba (ب)?',
    options: ['بـ', 'ـبـ', 'ـب', 'ب'],
    answer: 'بـ',
  };

  function completeLesson() {
    setCompleted(prev => new Set([...prev, activeLesson]));
    if (activeLesson < allLessons.length - 1) setActiveLesson(activeLesson + 1);
  }

  return (
    <div style={{ paddingTop: 80, display: 'grid', gridTemplateColumns: '300px 1fr', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ background: 'rgba(8,8,8,0.95)', borderRight: '1px solid rgba(255,255,255,0.08)', padding: '28px 0', position: 'sticky', top: 80, height: 'calc(100vh - 80px)', overflowY: 'auto' }}>
        <div style={{ padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 12 }}>
          <button onClick={() => { setPage('courses'); window.scrollTo(0,0); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,240,240,0.35)', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif', marginBottom: 12, padding: 0 }}>← Back to Courses</button>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: '#f0f0f0', marginBottom: 4 }}>{course.title}</div>
          <div style={{ fontFamily: 'Amiri, serif', fontSize: '1.1rem', color: 'rgba(255,255,255,0.4)', direction: 'rtl', textAlign: 'right' }}>{course.arabic}</div>
          <div style={{ marginTop: 12, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
            <div style={{ height: '100%', width: `${(completed.size / allLessons.length) * 100}%`, background: '#ffffff', borderRadius: 2, transition: 'width 0.4s' }} />
          </div>
          <div style={{ fontSize: '0.65rem', color: 'rgba(240,240,240,0.3)', marginTop: 6 }}>{completed.size}/{allLessons.length} lessons complete</div>
        </div>
        {allLessons.map((l, i) => (
          <button key={l.id} onClick={() => setActiveLesson(i)} style={{
            display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 20px',
            background: activeLesson === i ? 'rgba(255,255,255,0.07)' : 'transparent',
            border: 'none', borderLeft: `3px solid ${activeLesson === i ? '#ffffff' : 'transparent'}`,
            cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              background: completed.has(i) ? '#ffffff' : 'transparent',
              border: `1px solid ${completed.has(i) ? '#ffffff' : 'rgba(255,255,255,0.2)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.6rem', color: completed.has(i) ? '#080808' : 'rgba(240,240,240,0.3)',
            }}>{completed.has(i) ? '✓' : i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.82rem', color: activeLesson === i ? '#f0f0f0' : 'rgba(240,240,240,0.5)', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.3 }}>{l.title}</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(240,240,240,0.25)', marginTop: 2 }}>{l.duration} min · {l.type}</div>
            </div>
            {l.free && <span style={{ fontSize: '0.58rem', padding: '2px 6px', background: 'rgba(74,122,90,0.3)', color: '#6abf80', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Free</span>}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div style={{ padding: '48px 64px', maxWidth: 820 }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(240,240,240,0.3)' }}>Lesson {activeLesson + 1}</span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(240,240,240,0.2)' }}></span>
            <span style={{ fontSize: '0.65rem', color: 'rgba(240,240,240,0.3)' }}>{lesson.duration} min</span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(240,240,240,0.2)' }}></span>
            <Badge>{lesson.type}</Badge>
          </div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.2rem', color: '#f0f0f0', fontWeight: 600, marginBottom: 8 }}>{lesson.title}</h1>
          <div style={{ fontFamily: 'Amiri, serif', fontSize: '1.6rem', color: 'rgba(255,255,255,0.45)', direction: 'rtl', textAlign: 'right', textShadow: '0 0 20px rgba(255,255,255,0.2)' }}>{lesson.arabic}</div>
        </div>

        {/* Video placeholder */}
        <div style={{ width: '100%', paddingBottom: '56.25%', position: 'relative', background: 'rgba(8,8,8,0.9)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 36, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 64, height: 64, border: '1px solid rgba(255,255,255,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ color: '#ffffff', fontSize: '1.2rem', marginLeft: 4 }}>▶</span>
            </div>
            <div style={{ fontFamily: 'Playfair Display, serif', color: 'rgba(240,240,240,0.4)', fontSize: '0.9rem' }}>{lesson.title}</div>
            <div style={{ fontFamily: 'Amiri, serif', fontSize: '1.4rem', color: 'rgba(255,255,255,0.25)', marginTop: 8 }}>{lesson.arabic}</div>
          </div>
        </div>

        {/* Lesson content */}
        <div style={{ borderLeft: '2px solid rgba(255,255,255,0.15)', paddingLeft: 28, marginBottom: 36 }}>
          <p style={{ color: 'rgba(240,240,240,0.55)', lineHeight: 1.85, fontSize: '0.95rem', marginBottom: 16 }}>
            In this lesson, we'll explore <strong style={{ color: '#f0f0f0' }}>{lesson.title}</strong> — building a solid foundation for everything that follows. Arabic is written and read from right to left, and understanding its structure is the key to reading fluency.
          </p>
          <p style={{ color: 'rgba(240,240,240,0.45)', lineHeight: 1.85, fontSize: '0.95rem' }}>
            Pay close attention to the positional forms — each letter changes shape depending on whether it appears at the start, middle, or end of a word, or stands alone.
          </p>
        </div>

        {/* Key points */}
        <div style={{ background: 'rgba(12,12,12,0.8)', border: '1px solid rgba(255,255,255,0.08)', padding: 28, marginBottom: 32 }}>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 16 }}>Key points in this lesson</div>
          {['Arabic reads right to left', 'Letters change form by position', 'Dots distinguish similar letters', 'Short vowels (harakat) are usually omitted in modern text'].map((pt, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', marginTop: 3, flexShrink: 0 }}>◆</span>
              <span style={{ fontSize: '0.88rem', color: 'rgba(240,240,240,0.6)', lineHeight: 1.6 }}>{pt}</span>
            </div>
          ))}
        </div>

        {/* Quiz toggle */}
        {!showQuiz ? (
          <button onClick={() => setShowQuiz(true)} style={{ width: '100%', padding: 18, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', transition: 'all 0.2s', marginBottom: 28 }}
            onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.color = '#ffffff'; }}
            onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.color = 'rgba(255,255,255,0.7)'; }}
          >Take the quick quiz →</button>
        ) : (
          <div style={{ background: 'rgba(12,12,12,0.8)', border: '1px solid rgba(255,255,255,0.08)', padding: 28, marginBottom: 28 }}>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 16 }}>Quick Quiz</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.05rem', color: '#f0f0f0', marginBottom: 20, lineHeight: 1.4 }}>{QUIZ.question}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {QUIZ.options.map(opt => {
                const isCorrect = opt === QUIZ.answer;
                const selected = quizAnswer === opt;
                return (
                  <button key={opt} onClick={() => !quizAnswer && setQuizAnswer(opt)} style={{
                    padding: '14px', fontFamily: 'Amiri, serif', fontSize: '1.6rem', direction: 'rtl', cursor: quizAnswer ? 'default' : 'pointer',
                    background: quizAnswer ? (isCorrect ? 'rgba(74,122,90,0.2)' : selected ? 'rgba(180,60,60,0.2)' : 'transparent') : 'transparent',
                    border: `1px solid ${quizAnswer ? (isCorrect ? '#4a7a5a' : selected ? '#b43c3c' : 'rgba(255,255,255,0.08)') : 'rgba(255,255,255,0.12)'}`,
                    color: quizAnswer ? (isCorrect ? '#6abf80' : selected ? '#e08080' : 'rgba(240,240,240,0.3)') : '#f0f0f0',
                    transition: 'all 0.2s',
                  }}>{opt}</button>
                );
              })}
            </div>
            {quizAnswer && <div style={{ marginTop: 12, fontSize: '0.82rem', color: quizAnswer === QUIZ.answer ? '#6abf80' : '#e08080', lineHeight: 1.5 }}>
              {quizAnswer === QUIZ.answer ? '✓ Correct! The initial form bends to connect to the next letter.' : '✗ Not quite — بـ is the initial form, because it opens to the left to join.'}
            </div>}
          </div>
        )}

        {/* Complete button */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <button onClick={completeLesson} style={{
            flex: 1, padding: '16px 32px', background: completed.has(activeLesson) ? 'rgba(74,122,90,0.2)' : '#ffffff',
            border: `1px solid ${completed.has(activeLesson) ? '#4a7a5a' : '#ffffff'}`,
            color: completed.has(activeLesson) ? '#6abf80' : '#080808',
            fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s',
          }}>
            {completed.has(activeLesson) ? '✓ Completed — Next Lesson →' : 'Mark Complete & Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
}

window.CoursesPage = CoursesPage;
window.LessonPage = LessonPage;
