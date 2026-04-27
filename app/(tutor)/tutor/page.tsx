import { redirect }          from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient }      from '@/lib/supabase/server'
import Link                  from 'next/link'
import type { Profile, Streak } from '@/types'

const TUTOR_EMAILS = ['hadishokeir@gmail.com', 'hadishkeir123@gmail.com']

/* ─────────────────────────────────────────────────────────────────────────────
   Tutor Dashboard — /tutor
   Shows all students, their progress, and enrolment controls.
───────────────────────────────────────────────────────────────────────────── */

const COURSES = [
  { id: 'arabic-foundations', label: 'Foundations',       color: '#C9922A' },
  { id: 'levantine-dialect',  label: 'Levantine Dialect', color: '#6B9E8F' },
  { id: 'quranic-arabic',     label: 'Quranic Arabic',    color: '#4A7A6A' },
]

export default async function TutorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !TUTOR_EMAILS.includes(user.email ?? '')) redirect('/portal')

  const admin = createAdminClient()

  // Fetch all profiles + streaks
  const [{ data: profiles }, { data: streaks }] = await Promise.all([
    admin.from('profiles').select('*').order('full_name'),
    admin.from('streaks').select('*'),
  ])

  const streakMap: Record<string, Streak> = {}
  ;(streaks ?? []).forEach((s: Streak) => { streakMap[s.user_id] = s })

  // Fetch auth users for emails (via admin API approach: join by id)
  const { data: authListRaw } = await admin.auth.admin.listUsers()
  const emailMap: Record<string, string> = {}
  ;(authListRaw?.users ?? []).forEach(u => { emailMap[u.id] = u.email ?? '' })

  const students = (profiles ?? [])
    .map((p: Profile) => ({
      ...p,
      email:  emailMap[p.id] ?? '',
      streak: streakMap[p.id],
    }))
    .filter(p => !TUTOR_EMAILS.includes(p.email)) // exclude tutor's own accounts

  const totalStudents  = students.length
  const activeStudents = students.filter(s => (s.streak?.total_xp ?? 0) > 0).length
  const avgXp          = totalStudents > 0
    ? Math.round(students.reduce((sum, s) => sum + (s.streak?.total_xp ?? 0), 0) / totalStudents)
    : 0

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem,3vw,2rem)', color: 'var(--text)', marginBottom: 6 }}>
          Tutor Dashboard
        </h1>
        <p lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: '1rem', color: 'var(--gold)' }}>
          لوحة المدرّس
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 16, marginBottom: 40 }}>
        {[
          { label: 'Total Students',   value: totalStudents,  icon: '👥' },
          { label: 'Active (has XP)',   value: activeStudents, icon: '⚡' },
          { label: 'Avg XP per student', value: avgXp,        icon: '⭐' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 3, padding: '20px',
          }}>
            <div style={{ fontSize: '1.2rem', marginBottom: 8 }}>{stat.icon}</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--text)', fontWeight: 600, lineHeight: 1, marginBottom: 4 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Student list */}
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--text)', marginBottom: 16 }}>
        Students / الطلاب
      </h2>

      {students.length === 0 ? (
        <div style={{
          background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3,
          padding: '40px 24px', textAlign: 'center',
          color: 'var(--text3)', fontSize: '0.88rem',
        }}>
          No students yet. Students appear here after they sign up.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {students.map(student => (
            <div key={student.id} style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 3, padding: '20px 24px',
              display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
            }}>
              {/* Avatar */}
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: 'var(--gold)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '1rem', color: '#000', flexShrink: 0,
              }}>
                {student.full_name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.92rem', marginBottom: 2 }}>
                  {student.full_name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{student.email}</div>
                {student.goals && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: 4, fontStyle: 'italic' }}>
                    Goal: {student.goals}
                  </div>
                )}
              </div>

              {/* Enrolled courses pills */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1, minWidth: 140 }}>
                {(student.enrolled_courses ?? []).length === 0 ? (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>No courses enrolled</span>
                ) : (
                  (student.enrolled_courses ?? []).map((cid: string) => {
                    const course = COURSES.find(c => c.id === cid)
                    return course ? (
                      <span key={cid} style={{
                        fontSize: '0.7rem', padding: '2px 8px', borderRadius: 99,
                        background: `${course.color}22`, color: course.color,
                        border: `1px solid ${course.color}55`, fontWeight: 600,
                      }}>
                        {course.label}
                      </span>
                    ) : null
                  })
                )}
              </div>

              {/* XP */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
                  {(student.streak?.total_xp ?? 0).toLocaleString()} XP
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>
                  Streak: {student.streak?.current_streak ?? 0}d
                </div>
              </div>

              {/* View button */}
              <Link
                href={`/tutor/students/${student.id}`}
                style={{
                  fontSize: '0.78rem', padding: '8px 16px',
                  border: '1px solid var(--gold-border)', borderRadius: 2,
                  color: 'var(--gold)', textDecoration: 'none', flexShrink: 0,
                }}
              >
                Manage →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
