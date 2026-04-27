import { redirect }          from 'next/navigation'
import Link                  from 'next/link'
import { createClient }      from '@/lib/supabase/server'
import { courses }           from '@/data/courses'
import { DashboardCharts }   from '@/components/DashboardCharts'
import type { Profile, Streak, UserProgress } from '@/types'

/* ─────────────────────────────────────────────────────────────────────────────
   Student Dashboard — /portal
───────────────────────────────────────────────────────────────────────────── */

export default async function PortalDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: streak }, { data: progressRows }, { data: practiceRows }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('streaks').select('*').eq('user_id', user.id).single(),
    supabase.from('user_progress').select('*').eq('user_id', user.id),
    supabase.from('practice_events').select('exercise_type,correct,created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(200),
  ])

  const p  = profile  as Profile      | null
  const s  = streak   as Streak       | null
  const pr = (progressRows ?? [])     as UserProgress[]

  const firstName     = p?.full_name?.split(' ')[0] ?? 'Student'
  const enrolledIds   = p?.enrolled_courses ?? []
  const enrolledCourses = courses.filter(c => enrolledIds.includes(c.id))

  // XP thresholds per level
  const XP_PER_LEVEL = 500
  const level         = s?.current_level    ?? 1
  const totalXp       = s?.total_xp         ?? 0
  const xpThisLevel   = totalXp % XP_PER_LEVEL
  const xpProgress    = Math.round((xpThisLevel / XP_PER_LEVEL) * 100)
  const currentStreak = s?.current_streak   ?? 0
  const longestStreak = s?.longest_streak   ?? 0

  // Build progress map
  const progressMap: Record<string, UserProgress> = {}
  pr.forEach(row => { progressMap[row.course_id] = row })

  // ── Chart data ─────────────────────────────────────────────────

  // Bar chart: completed vs total lessons per enrolled course
  const courseBars = enrolledCourses.map(c => ({
    name:      c.title.split(' ')[0],          // first word keeps labels short
    completed: progressMap[c.id]?.completed_lessons?.length ?? 0,
    total:     c.lessons.length,
    color:     c.color,
  }))

  // Radar: derive skill scores from practice history
  const practice = (practiceRows ?? []) as { exercise_type: string; correct: boolean | null; created_at: string }[]
  const correctByType = (type: string) => {
    const rows = practice.filter(r => r.exercise_type === type)
    if (!rows.length) return 0
    const correct = rows.filter(r => r.correct === true).length
    return Math.round((correct / rows.length) * 100)
  }
  const quizScores = pr.flatMap(row => Object.values(row.quiz_scores ?? {}) as number[])
  const avgQuiz    = quizScores.length ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) : 0

  const skills = [
    { skill: 'Vocab',     score: correctByType('flashcard'),        fullMark: 100 as const },
    { skill: 'Grammar',   score: correctByType('cloze'),            fullMark: 100 as const },
    { skill: 'Reading',   score: avgQuiz,                           fullMark: 100 as const },
    { skill: 'Writing',   score: correctByType('sentence_builder'), fullMark: 100 as const },
    { skill: 'Listening', score: correctByType('harakat_dash'),     fullMark: 100 as const },
  ]
  const hasAnyData = skills.some(s => s.score > 0) || courseBars.some(c => c.completed > 0)

  // Line chart: XP per day for the last 7 days (estimated from lesson events)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })
  // Each completed lesson ~ 50 XP; each practice event ~ 5 XP
  const lessonEventDates = pr.flatMap(row =>
    (row.completed_lessons ?? []).map(() => row.last_accessed?.slice(0, 10) ?? '')
  ).filter(Boolean)
  const practiceEventDates = practice.map(r => r.created_at.slice(0, 10))

  const activity = days.map(date => {
    const lessonXp   = lessonEventDates.filter(d => d === date).length * 50
    const practiceXp = practiceEventDates.filter(d => d === date).length * 5
    return {
      day: new Date(date).toLocaleDateString('en-GB', { weekday: 'short' }),
      xp:  lessonXp + practiceXp,
    }
  })

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 36 }}>
        <h1
          style={{
            fontFamily:   'var(--font-heading)',
            fontSize:     'clamp(1.6rem, 3vw, 2.2rem)',
            color:        'var(--text)',
            marginBottom: 6,
          }}
        >
          Welcome back, {firstName}
        </h1>
        <p style={{ color: 'var(--text3)', fontSize: '0.88rem' }}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────────── */}
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap:                 16,
          marginBottom:        36,
        }}
      >
        {[
          { label: 'Day Streak',      value: currentStreak, suffix: currentStreak === 1 ? ' day' : ' days', icon: '🔥' },
          { label: 'Longest Streak',  value: longestStreak, suffix: ' days', icon: '🏆' },
          { label: 'Total XP',        value: totalXp.toLocaleString(), suffix: '', icon: '⭐' },
          { label: 'Level',           value: level, suffix: '', icon: '📖' },
        ].map(stat => (
          <div
            key={stat.label}
            style={{
              background:   'var(--card)',
              border:       '1px solid var(--border)',
              borderRadius: 3,
              padding:      '20px 20px',
            }}
          >
            <div style={{ fontSize: '1.2rem', marginBottom: 8 }}>{stat.icon}</div>
            <div
              style={{
                fontFamily:   'var(--font-heading)',
                fontSize:     '1.6rem',
                color:        'var(--text)',
                fontWeight:   600,
                lineHeight:   1,
                marginBottom: 4,
              }}
            >
              {stat.value}{stat.suffix}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── XP progress bar ────────────────────────────────────────────────── */}
      <div
        style={{
          background:   'var(--card)',
          border:       '1px solid var(--border)',
          borderRadius: 3,
          padding:      '20px 24px',
          marginBottom: 36,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>
            Level {level} → Level {level + 1}
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>
            {xpThisLevel} / {XP_PER_LEVEL} XP
          </span>
        </div>
        <div style={{ background: 'var(--bg2)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
          <div
            style={{
              width:        `${xpProgress}%`,
              height:       '100%',
              background:   'var(--gold)',
              borderRadius: 99,
              transition:   'width 0.6s ease',
            }}
          />
        </div>
      </div>

      {/* ── Charts ─────────────────────────────────────────────────────────── */}
      <DashboardCharts
        courseBars={courseBars}
        skills={skills}
        activity={activity}
        hasAnyData={hasAnyData}
      />

      {/* ── Enrolled courses ───────────────────────────────────────────────── */}
      <div style={{ marginBottom: 36 }}>
        <h2
          style={{
            fontFamily:   'var(--font-heading)',
            fontSize:     '1.1rem',
            color:        'var(--text)',
            marginBottom: 16,
          }}
        >
          Your courses
        </h2>

        {enrolledCourses.length === 0 ? (
          <div
            style={{
              background:   'var(--card)',
              border:       '1px solid var(--border)',
              borderRadius: 3,
              padding:      '40px 24px',
              textAlign:    'center',
            }}
          >
            <p style={{ color: 'var(--text3)', fontSize: '0.88rem', marginBottom: 20 }}>
              You are not enrolled in any courses yet.
            </p>
            <Link href="/courses" className="btn-primary" style={{ display: 'inline-flex', padding: '10px 24px' }}>
              Browse courses
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {enrolledCourses.map(course => {
              const prog = progressMap[course.id]
              const completed = prog?.completed_lessons?.length ?? 0
              const total     = course.lessons.length
              const pct       = total > 0 ? Math.round((completed / total) * 100) : 0
              const scores    = prog?.quiz_scores ?? {}
              const avgScore  = Object.keys(scores).length > 0
                ? Math.round(Object.values(scores as Record<string, number>).reduce((a, b) => a + b, 0) / Object.keys(scores).length)
                : null

              // Find next lesson to do
              const completedSet = new Set(prog?.completed_lessons ?? [])
              const nextLesson   = course.lessons.find(l => !completedSet.has(l.id))

              return (
                <div
                  key={course.id}
                  style={{
                    background:  'var(--card)',
                    border:      '1px solid var(--border)',
                    borderLeft:  `3px solid ${course.color}`,
                    borderRadius: 3,
                    padding:     '20px 24px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 16 }}>
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--text)', marginBottom: 2 }}>
                        {course.title}
                      </h3>
                      <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: '0.8rem', color: 'var(--text3)' }}>
                        {course.arabic}
                      </div>
                    </div>
                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                        {pct}%
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>
                        {completed}/{total} lessons
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ background: 'var(--bg2)', borderRadius: 99, height: 4, overflow: 'hidden', marginBottom: 16 }}>
                    <div
                      style={{
                        width:        `${pct}%`,
                        height:       '100%',
                        background:   course.color,
                        borderRadius: 99,
                        transition:   'width 0.6s ease',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 16 }}>
                      {avgScore !== null && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>
                          Avg quiz: <strong style={{ color: 'var(--text2)' }}>{avgScore}%</strong>
                        </span>
                      )}
                    </div>

                    {nextLesson ? (
                      <Link
                        href={`/courses/${course.id}/lessons/${nextLesson.id}`}
                        className="btn-primary"
                        style={{ display: 'inline-flex', padding: '8px 18px', fontSize: '0.8rem' }}
                      >
                        Continue
                      </Link>
                    ) : (
                      <span
                        style={{
                          fontSize:    '0.78rem',
                          color:       'var(--gold)',
                          fontWeight:  600,
                          letterSpacing:'0.05em',
                        }}
                      >
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Quick actions ──────────────────────────────────────────────────── */}
      <div>
        <h2
          style={{
            fontFamily:   'var(--font-heading)',
            fontSize:     '1.1rem',
            color:        'var(--text)',
            marginBottom: 16,
          }}
        >
          Practice
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { href: '/portal/flashcards', label: 'Flashcards', sub: 'Review vocabulary with SRS', icon: '🃏' },
            { href: '/portal/practice',   label: 'Practice hub', sub: 'Cloze, sentence builder & more', icon: '✍️' },
            { href: '/courses',           label: 'All courses',  sub: 'Browse the full curriculum', icon: '📚' },
          ].map(action => (
            <Link
              key={action.href}
              href={action.href}
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{
                  background:   'var(--card)',
                  border:       '1px solid var(--border)',
                  borderRadius: 3,
                  padding:      '20px',
                  transition:   'border-color 0.2s ease',
                  cursor:       'pointer',
                }}
              >
                <div style={{ fontSize: '1.4rem', marginBottom: 10 }}>{action.icon}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 600, marginBottom: 4 }}>{action.label}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{action.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
