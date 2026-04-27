import { redirect }          from 'next/navigation'
import Link                  from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient }      from '@/lib/supabase/server'
import type { Profile, Streak } from '@/types'

const TUTOR_EMAILS = ['hadishokeir@gmail.com', 'hadishkeir123@gmail.com']
const COURSES = [
  { id: 'arabic-foundations', label: 'Foundations',  color: '#C9922A' },
  { id: 'levantine-dialect',  label: 'Levantine',    color: '#6B9E8F' },
  { id: 'quranic-arabic',     label: 'Quranic',      color: '#4A7A6A' },
]

export default async function StudentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !TUTOR_EMAILS.includes(user.email ?? '')) redirect('/portal')

  const admin = createAdminClient()
  const [{ data: profiles }, { data: streaks }, { data: { users: authUsers } }] = await Promise.all([
    admin.from('profiles').select('*').order('full_name'),
    admin.from('streaks').select('*'),
    admin.auth.admin.listUsers(),
  ])

  const streakMap: Record<string, Streak> = {}
  ;(streaks ?? []).forEach((s: Streak) => { streakMap[s.user_id] = s })

  const emailMap: Record<string, string> = {}
  ;(authUsers ?? []).forEach(u => { emailMap[u.id] = u.email ?? '' })

  const students = (profiles ?? [])
    .map((p: Profile) => ({ ...p, email: emailMap[p.id] ?? '', streak: streakMap[p.id] }))
    .filter(p => !TUTOR_EMAILS.includes(p.email))

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--text)', marginBottom: 4 }}>
          All Students / الطلاب
        </h1>
        <p style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>{students.length} student{students.length !== 1 ? 's' : ''} registered</p>
      </div>

      {students.length === 0 ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: '48px 24px', textAlign: 'center', color: 'var(--text3)', fontSize: '0.88rem' }}>
          No students yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {students.map(student => (
            <div key={student.id} style={{
              background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3,
              padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', background: 'var(--gold)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, color: '#000', flexShrink: 0,
              }}>
                {student.full_name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem', marginBottom: 2 }}>
                  {student.full_name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{student.email}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1, minWidth: 120 }}>
                {(student.enrolled_courses ?? []).length === 0
                  ? <span style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>No courses</span>
                  : (student.enrolled_courses ?? []).map((cid: string) => {
                      const c = COURSES.find(x => x.id === cid)
                      return c ? (
                        <span key={cid} style={{
                          fontSize: '0.68rem', padding: '2px 7px', borderRadius: 99,
                          background: `${c.color}22`, color: c.color, border: `1px solid ${c.color}55`,
                        }}>{c.label}</span>
                      ) : null
                    })
                }
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
                  {(student.streak?.total_xp ?? 0)} XP
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text3)' }}>
                  Streak: {student.streak?.current_streak ?? 0}d
                </div>
              </div>
              <Link href={`/tutor/students/${student.id}`} style={{
                fontSize: '0.78rem', padding: '7px 14px', flexShrink: 0,
                border: '1px solid var(--gold-border)', borderRadius: 2,
                color: 'var(--gold)', textDecoration: 'none',
              }}>
                Manage →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
