// ─── Courses & Lesson Pages ───────────────────────────────────────────────────
const { useState, useEffect, useRef } = React;

// ── Alphabet Explorer ────────────────────────────────────────────────────────
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

  const navBtn = (disabled) => ({
    padding: '8px 18px', background: 'var(--surface-2)', border: '1px solid var(--line)',
    color: disabled ? 'var(--faint)' : 'var(--ink-2)', cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'var(--f-body)', fontSize: '0.78rem', borderRadius: 'var(--r-sm)',
    opacity: disabled ? 0.4 : 1, transition: 'all .18s',
  });

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', padding: 32, boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28 }}>
        <div>
          {/* Letter grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 16 }}>
            {alpha.map((l, i) => (
              <button key={i} onClick={() => { setSel(i); setForm('isolated'); setQuiz(null); }} style={{
                background: sel === i ? 'var(--accent)' : 'var(--surface-2)',
                border: `1px solid ${sel === i ? 'var(--accent)' : 'var(--line)'}`,
                padding: '12px 4px', cursor: 'pointer', transition: 'all .15s',
                borderRadius: 'var(--r-sm)',
              }}>
                <div className="ar" style={{ fontFamily: 'var(--f-ar)', fontSize: '1.4rem', color: sel === i ? 'var(--on-accent)' : 'var(--ink)', lineHeight: 1 }}>{l.ar}</div>
                <div style={{ fontSize: '0.55rem', color: sel === i ? 'rgba(255,248,241,0.7)' : 'var(--muted)', marginTop: 3 }}>{l.trans}</div>
              </button>
            ))}
          </div>
          {/* Form tabs */}
          <div style={{ display: 'flex', gap: 6 }}>
            {forms.map(f => (
              <button key={f} onClick={() => setForm(f)} style={{
                flex: 1, padding: '10px 4px', textAlign: 'center', cursor: 'pointer', transition: 'all .15s',
                background: form === f ? 'color-mix(in oklab, var(--accent) 10%, var(--surface))' : 'var(--surface-2)',
                border: `1px solid ${form === f ? 'color-mix(in oklab, var(--accent) 36%, transparent)' : 'var(--line)'}`,
                borderRadius: 'var(--r-sm)',
              }}>
                <div className="ar" style={{ fontFamily: 'var(--f-ar)', fontSize: '1.5rem', color: form === f ? 'var(--accent)' : 'var(--ink)', direction: 'rtl' }}>{letter.forms ? letter.forms[f] || letter[f] || '' : letter[f] || ''}</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'capitalize', marginTop: 3 }}>{f}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ textAlign: 'center', padding: '24px 12px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r)' }}>
            <div key={sel} className="ar" style={{ fontFamily: 'var(--f-ar)', fontSize: '5.5rem', color: 'var(--accent)', lineHeight: 1, animation: 'letterFade .3s var(--ease)' }}>{letter.ar}</div>
            <div style={{ fontFamily: 'var(--f-head)', fontSize: '1.15rem', color: 'var(--ink)', marginTop: 6, fontWeight: 600 }}>{letter.name}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>/{letter.trans}/</div>
          </div>

          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', padding: 14 }}>
            <div style={{ fontFamily: 'var(--f-body)', fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 6, fontWeight: 700 }}>Note</div>
            <div style={{ fontSize: '0.83rem', color: 'var(--ink-2)', lineHeight: 1.6 }}>{letter.note}</div>
          </div>

          {letter.example && (
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', padding: 14 }}>
              <div style={{ fontFamily: 'var(--f-body)', fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 6, fontWeight: 700 }}>Example</div>
              <div className="ar" style={{ fontFamily: 'var(--f-ar)', fontSize: '1.8rem', color: 'var(--ink)', direction: 'rtl', textAlign: 'right' }}>{letter.example.word}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>{letter.example.meaning} · {letter.example.trans}</div>
            </div>
          )}

          {/* Mini quiz */}
          {!quiz ? (
            <button onClick={startQuiz} style={{
              padding: '10px', background: 'var(--surface-2)', border: '1px solid var(--line)',
              color: 'var(--ink-2)', cursor: 'pointer', fontFamily: 'var(--f-body)', fontSize: '0.78rem',
              borderRadius: 'var(--r-sm)', transition: 'all .2s',
            }}
              onMouseEnter={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--line)'; e.target.style.color = 'var(--ink-2)'; }}
            >Test yourself →</button>
          ) : (
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: 14 }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 10, fontWeight: 700 }}>Which letter is this?</div>
              <div className="ar" style={{ fontFamily: 'var(--f-ar)', fontSize: '2.6rem', color: 'var(--ink)', textAlign: 'center', marginBottom: 10 }}>{quiz.question}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                {quiz.options.map(opt => {
                  const isCorrect = opt === quiz.answer;
                  const isWrong = quizResult === opt && opt !== quiz.answer;
                  return (
                    <button key={opt} onClick={() => !quizResult && setQuizResult(opt)} style={{
                      padding: '7px', fontFamily: 'var(--f-body)', fontSize: '0.78rem',
                      cursor: quizResult ? 'default' : 'pointer',
                      background: quizResult ? (isCorrect ? 'color-mix(in oklab, var(--good) 14%, var(--surface))' : isWrong ? 'color-mix(in oklab, var(--bad) 12%, var(--surface))' : 'var(--surface)') : 'var(--surface)',
                      border: `1px solid ${quizResult ? (isCorrect ? 'var(--good)' : isWrong ? 'var(--bad)' : 'var(--line-2)') : 'var(--line)'}`,
                      color: quizResult ? (isCorrect ? 'var(--good)' : isWrong ? 'var(--bad)' : 'var(--faint)') : 'var(--ink-2)',
                      borderRadius: 'var(--r-sm)', transition: 'all .2s',
                    }}>{opt}</button>
                  );
                })}
              </div>
              {quizResult && (
                <button onClick={() => { setQuiz(null); setQuizResult(null); }} style={{
                  marginTop: 8, width: '100%', padding: '7px', background: 'var(--surface-2)',
                  border: '1px solid var(--line)', color: 'var(--ink-2)', cursor: 'pointer',
                  fontFamily: 'var(--f-body)', fontSize: '0.72rem', borderRadius: 'var(--r-sm)',
                }}>
                  {quizResult === quiz.answer ? '✓ Correct! Try another →' : '✗ Try again →'}
                </button>
              )}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <button onClick={() => setSel(s => Math.max(0, s - 1))} disabled={sel === 0} style={navBtn(sel === 0)}>← Prev</button>
            <span style={{ fontSize: '0.7rem', color: 'var(--muted)', alignSelf: 'center' }}>{sel + 1}/{alpha.length}</span>
            <button onClick={() => setSel(s => Math.min(alpha.length - 1, s + 1))} disabled={sel === alpha.length - 1} style={navBtn(sel === alpha.length - 1)}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Courses Page ──────────────────────────────────────────────────────────────
function CoursesPage({ setPage, setLesson }) {
  const site = window.getSiteContent ? window.getSiteContent() : (window.AE?.DATA?.siteContent || {});
  const home = site.homepage || {};
  const courses = window.AE.DATA.courses.filter(c => c.visible !== false);
  const [filter, setFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const types = ['All', ...new Set(courses.map(c => c.type))];
  const filtered = courses.filter(c =>
    (filter === 'All' || c.level === filter) &&
    (typeFilter === 'All' || c.type === typeFilter)
  );

  const filterBtn = (active) => ({
    padding: '7px 16px', fontFamily: 'var(--f-body)', fontSize: '0.78rem', cursor: 'pointer',
    transition: 'all .2s', borderRadius: 'var(--r-sm)',
    background: active ? 'color-mix(in oklab, var(--accent) 12%, var(--surface))' : 'transparent',
    border: `1px solid ${active ? 'color-mix(in oklab, var(--accent) 36%, transparent)' : 'var(--line)'}`,
    color: active ? 'var(--accent)' : 'var(--muted)',
    fontWeight: active ? 600 : 400,
  });

  return (
    <div style={{ paddingTop: 80 }}>
      {/* Header */}
      <div style={{ padding: 'clamp(48px,8vw,80px) clamp(20px,5vw,80px)', background: 'var(--surface-2)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <Reveal>
            <Eyebrow>Curriculum</Eyebrow>
            <h1 style={{ fontFamily: 'var(--f-head)', fontSize: 'clamp(2.4rem,4vw,3.4rem)', color: 'var(--ink)', fontWeight: 600, lineHeight: 1.1, marginBottom: 14, letterSpacing: '-0.01em' }}>
              {home.coursesHeading || 'Three paths into Arabic'}
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', maxWidth: 500, lineHeight: 1.7 }}>Structured courses across Classical, Levantine, and Quranic Arabic — for every level.</p>
          </Reveal>
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: '16px clamp(20px,5vw,80px)', borderBottom: '1px solid var(--line-2)', background: 'var(--surface)', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ maxWidth: 1240, width: '100%', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {levels.map(l => <button key={l} onClick={() => setFilter(l)} style={filterBtn(filter === l)}>{l}</button>)}
          <div style={{ width: 1, height: 20, background: 'var(--line)', alignSelf: 'center', margin: '0 6px' }} />
          {types.map(t => <button key={t} onClick={() => setTypeFilter(t)} style={filterBtn(typeFilter === t)}>{t}</button>)}
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: 'clamp(32px,6vw,64px) clamp(20px,5vw,80px)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {filtered.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.06}>
              <div onClick={() => { setLesson(c.id); setPage('lesson'); window.scrollTo(0,0); }} style={{
                background: 'var(--surface)', border: '1px solid var(--line)',
                padding: '28px 24px', cursor: 'pointer', transition: 'all .25s var(--ease)',
                borderRadius: 'var(--r-lg)', position: 'relative',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'color-mix(in oklab, var(--accent) 40%, var(--line))'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: c.color || 'var(--accent)', borderRadius: 'var(--r-lg) var(--r-lg) 0 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <Badge tone="neutral">{c.level}</Badge>
                  <div className="ar" style={{ fontFamily: 'var(--f-ar)', fontSize: '1.2rem', color: 'var(--accent)' }}>{(c.arabic || '').slice(0, 3)}</div>
                </div>
                <div style={{ fontFamily: 'var(--f-head)', fontSize: '1.2rem', color: 'var(--ink)', marginBottom: 4, lineHeight: 1.3, fontWeight: 600 }}>{c.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 12 }}>{c.subtitle}</div>
                <div className="ar" style={{ fontFamily: 'var(--f-ar)', fontSize: '1.3rem', color: 'var(--accent)', textAlign: 'right', marginBottom: 14, lineHeight: 1.6 }}>{c.arabic}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.65, marginBottom: 16 }}>{c.desc}</div>
                <div style={{ paddingTop: 14, borderTop: '1px solid var(--line-2)', fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600 }}>View lessons →</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Alphabet Explorer */}
      <div style={{ padding: 'clamp(32px,6vw,64px) clamp(20px,5vw,80px)', borderTop: '1px solid var(--line)', background: 'var(--surface-2)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <Reveal>
            <SectionHeading eyebrow="Interactive Tool" heading="Explore the Alphabet" sub="Click any letter to explore its forms, pronunciation notes, and example words." />
            <AlphabetExplorer />
          </Reveal>
        </div>
      </div>
    </div>
  );
}

// ── Lesson Page ───────────────────────────────────────────────────────────────
function LessonPage({ courseId, setPage }) {
  const visibleCourses = window.AE.DATA.courses.filter(c => c.visible !== false);
  const courses = visibleCourses.length ? visibleCourses : window.AE.DATA.courses;
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
    <div style={{ paddingTop: 80, display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{
        background: 'var(--surface)', borderRight: '1px solid var(--line)',
        padding: '20px 0', position: 'sticky', top: 80,
        height: 'calc(100vh - 80px)', overflowY: 'auto',
      }}>
        <div style={{ padding: '0 16px 16px', borderBottom: '1px solid var(--line-2)', marginBottom: 8 }}>
          <button onClick={() => { setPage('courses'); window.scrollTo(0,0); }} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)',
            fontSize: '0.78rem', fontFamily: 'var(--f-body)', marginBottom: 10, padding: 0,
          }}>← Back to Courses</button>
          <div style={{ fontFamily: 'var(--f-head)', fontSize: '1rem', color: 'var(--ink)', marginBottom: 4, fontWeight: 600 }}>{course.title}</div>
          <div className="ar" style={{ fontFamily: 'var(--f-ar)', fontSize: '1rem', color: 'var(--accent)', textAlign: 'right', lineHeight: 1.6 }}>{course.arabic}</div>
          <div style={{ marginTop: 10, height: 4, background: 'var(--surface-3)', borderRadius: 99 }}>
            <div style={{ height: '100%', width: `${(completed.size / allLessons.length) * 100}%`, background: 'var(--accent)', borderRadius: 99, transition: 'width .4s var(--ease)' }} />
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: 5 }}>{completed.size}/{allLessons.length} lessons complete</div>
        </div>
        {allLessons.map((l, i) => (
          <button key={l.id} onClick={() => setActiveLesson(i)} style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 16px',
            background: activeLesson === i ? 'color-mix(in oklab, var(--accent) 10%, var(--surface))' : 'transparent',
            border: 'none', borderLeft: `3px solid ${activeLesson === i ? 'var(--accent)' : 'transparent'}`,
            cursor: 'pointer', textAlign: 'left', transition: 'all .15s',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              background: completed.has(i) ? 'var(--good)' : 'transparent',
              border: `1px solid ${completed.has(i) ? 'var(--good)' : 'var(--line)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.6rem', color: completed.has(i) ? '#fff' : 'var(--muted)',
            }}>{completed.has(i) ? '✓' : i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.82rem', color: activeLesson === i ? 'var(--accent)' : 'var(--ink-2)', fontFamily: 'var(--f-body)', lineHeight: 1.3 }}>{l.title}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: 1 }}>{l.duration} min · {l.type}</div>
            </div>
            {l.free && <Badge tone="good">Free</Badge>}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div style={{ padding: 'clamp(28px,5vw,56px) clamp(20px,5vw,64px)', maxWidth: 820 }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: '0.65rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>Lesson {activeLesson + 1}</span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--faint)', display: 'inline-block' }}></span>
            <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{lesson.duration} min</span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--faint)', display: 'inline-block' }}></span>
            <Badge tone="neutral">{lesson.type}</Badge>
          </div>
          <h1 style={{ fontFamily: 'var(--f-head)', fontSize: '2rem', color: 'var(--ink)', fontWeight: 600, marginBottom: 8 }}>{lesson.title}</h1>
          <div className="ar" style={{ fontFamily: 'var(--f-ar)', fontSize: '1.5rem', color: 'var(--accent)', textAlign: 'right', lineHeight: 1.6 }}>{lesson.arabic}</div>
        </div>

        {/* Video placeholder */}
        <div style={{
          width: '100%', paddingBottom: '56.25%', position: 'relative',
          background: 'var(--surface-2)', border: '1px solid var(--line)',
          marginBottom: 32, overflow: 'hidden', borderRadius: 'var(--r)',
        }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: 60, height: 60, border: '1px solid var(--line)', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
              cursor: 'pointer', transition: 'all .2s', background: 'var(--surface)',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'color-mix(in oklab, var(--accent) 12%, var(--surface))'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--line)'; }}
            >
              <span style={{ color: 'var(--accent)', fontSize: '1.1rem', marginLeft: 3 }}>▶</span>
            </div>
            <div style={{ fontFamily: 'var(--f-head)', color: 'var(--ink-2)', fontSize: '0.9rem' }}>{lesson.title}</div>
            <div className="ar" style={{ fontFamily: 'var(--f-ar)', fontSize: '1.2rem', color: 'var(--accent)', marginTop: 6 }}>{lesson.arabic}</div>
          </div>
        </div>

        {/* Lesson content */}
        <div style={{ borderLeft: '3px solid var(--accent)', paddingLeft: 24, marginBottom: 28 }}>
          <p style={{ color: 'var(--ink-2)', lineHeight: 1.85, fontSize: '0.95rem', marginBottom: 14 }}>
            In this lesson, we'll explore <strong style={{ color: 'var(--ink)' }}>{lesson.title}</strong> — building a solid foundation for everything that follows.
          </p>
          <p style={{ color: 'var(--muted)', lineHeight: 1.85, fontSize: '0.95rem' }}>
            Pay close attention to the positional forms — each letter changes shape depending on whether it appears at the start, middle, or end of a word.
          </p>
        </div>

        {/* Key points */}
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r)', padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.14em', marginBottom: 14, fontWeight: 700 }}>Key points</div>
          {['Arabic reads right to left', 'Letters change form by position', 'Dots distinguish similar letters', 'Short vowels (ḥarakāt) are usually omitted in modern text'].map((pt, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{ color: 'var(--accent)', fontSize: '0.7rem', marginTop: 4, flexShrink: 0 }}>◆</span>
              <span style={{ fontSize: '0.88rem', color: 'var(--ink-2)', lineHeight: 1.6 }}>{pt}</span>
            </div>
          ))}
        </div>

        {/* Quiz */}
        {!showQuiz ? (
          <button onClick={() => setShowQuiz(true)} style={{
            width: '100%', padding: 16, background: 'color-mix(in oklab, var(--accent) 8%, var(--surface))',
            border: '1px solid color-mix(in oklab, var(--accent) 28%, transparent)',
            color: 'var(--accent)', cursor: 'pointer', fontFamily: 'var(--f-body)',
            fontSize: '0.85rem', fontWeight: 600, borderRadius: 'var(--r)',
            transition: 'all .2s', marginBottom: 24,
          }}>Take the quick quiz →</button>
        ) : (
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r)', padding: 24, marginBottom: 24 }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.14em', marginBottom: 14, fontWeight: 700 }}>Quick quiz</div>
            <div style={{ fontFamily: 'var(--f-head)', fontSize: '1.05rem', color: 'var(--ink)', marginBottom: 18, lineHeight: 1.4 }}>{QUIZ.question}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {QUIZ.options.map(opt => {
                const isCorrect = opt === QUIZ.answer;
                const selected = quizAnswer === opt;
                return (
                  <button key={opt} onClick={() => !quizAnswer && setQuizAnswer(opt)} style={{
                    padding: '12px', fontFamily: 'var(--f-ar)', fontSize: '1.4rem', direction: 'rtl',
                    cursor: quizAnswer ? 'default' : 'pointer',
                    background: quizAnswer ? (isCorrect ? 'color-mix(in oklab, var(--good) 14%, var(--surface))' : selected ? 'color-mix(in oklab, var(--bad) 12%, var(--surface))' : 'var(--surface)') : 'var(--surface)',
                    border: `1px solid ${quizAnswer ? (isCorrect ? 'var(--good)' : selected ? 'var(--bad)' : 'var(--line-2)') : 'var(--line)'}`,
                    color: quizAnswer ? (isCorrect ? 'var(--good)' : selected ? 'var(--bad)' : 'var(--faint)') : 'var(--ink)',
                    borderRadius: 'var(--r-sm)', transition: 'all .2s',
                  }}>{opt}</button>
                );
              })}
            </div>
            {quizAnswer && <div style={{ marginTop: 10, fontSize: '0.85rem', color: quizAnswer === QUIZ.answer ? 'var(--good)' : 'var(--bad)', lineHeight: 1.5 }}>
              {quizAnswer === QUIZ.answer ? '✓ Correct! The initial form bends to connect to the next letter.' : '✗ Not quite — بـ is the initial form, because it opens to the left to join.'}
            </div>}
          </div>
        )}

        {/* Complete button */}
        <button onClick={completeLesson} style={{
          width: '100%', padding: '14px 24px',
          background: completed.has(activeLesson) ? 'color-mix(in oklab, var(--good) 12%, var(--surface))' : 'var(--accent)',
          border: `1px solid ${completed.has(activeLesson) ? 'var(--good)' : 'var(--accent)'}`,
          color: completed.has(activeLesson) ? 'var(--good)' : 'var(--on-accent)',
          fontFamily: 'var(--f-body)', fontSize: '0.85rem', fontWeight: 600,
          cursor: 'pointer', borderRadius: 'var(--r)', transition: 'all .2s',
        }}>
          {completed.has(activeLesson) ? '✓ Completed — Next Lesson →' : 'Mark Complete & Continue →'}
        </button>
      </div>
    </div>
  );
}

window.CoursesPage = CoursesPage;
window.LessonPage = LessonPage;
