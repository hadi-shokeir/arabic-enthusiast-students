import { redirect }          from 'next/navigation'
import Link                  from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient }      from '@/lib/supabase/server'

const TUTOR_EMAILS = ['hadishokeir@gmail.com', 'hadishkeir123@gmail.com']

interface StudentRow {
  id:                string
  full_name:         string
  email:             string
  whatsapp:          string | null
  arabic_type:       string | null
  student_level:     string | null
  enrolment_status:  string
  lessons_total:     number | null
  lessons_taken:     number | null
  remaining_classes: number | null
  total_paid:        number | null
  enrolled_courses:  string[]
}

export default async function StudentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !TUTOR_EMAILS.includes(user.email ?? '')) redirect('/portal')

  const admin = createAdminClient()
  const [{ data: profiles }, { data: { users: authUsers } }] = await Promise.all([
    admin.from('profiles').select('id,full_name,whatsapp,arabic_type,student_level,enrolment_status,lessons_total,lessons_taken,remaining_classes,total_paid,enrolled_courses').order('full_name'),
    admin.auth.admin.listUsers(),
  ])

  const emailMap: Record<string, string> = {}
  ;(authUsers ?? []).forEach(u => { emailMap[u.id] = u.email ?? '' })

  const students: StudentRow[] = (profiles ?? [])
    .map((p: StudentRow) => ({ ...p, email: emailMap[p.id] ?? '' }))
    .filter((p: StudentRow) => !TUTOR_EMAILS.includes(p.email))

  const statusColor = (s: string) => s === 'active' ? '#6c6' : s === 'pending' ? '#ca8' : '#888'
  const statusBg    = (s: string) => s === 'active' ? '#1a3a1a' : s === 'pending' ? '#3a2a0a' : '#222'

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--text)', marginBottom: 4 }}>
          Students / الطلاب
        </h1>
        <p style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>{students.length} student{students.length !== 1 ? 's' : ''}</p>
      </div>

      {students.length === 0 ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: '48px 24px', textAlign: 'center', color: 'var(--text3)', fontSize: '0.88rem' }}>
          No students yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {students.map(student => {
            const remaining = student.remaining_classes ?? 0
            const total     = student.lessons_total ?? 0
            const taken     = student.lessons_taken ?? 0
            const paid      = student.total_paid ?? 0

            return (
              <div key={student.id} style={{
                background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3,
                padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
              }}>
                {/* Avatar */}
                <div style={{
                  width: 42, height: 42, borderRadius: '50%', background: 'var(--gold)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, color: '#000', flexShrink: 0, fontSize: '1.1rem',
                }}>
                  {student.full_name.charAt(0).toUpperCase()}
                </div>

                {/* Name + email + type */}
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem', marginBottom: 2 }}>
                    {student.full_name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginBottom: 2 }}>
                    {student.email}
                  </div>
                  {student.arabic_type && (
                    <div style={{ fontSize: '0.68rem', color: 'var(--text3)' }}>
                      {student.arabic_type} · {student.student_level ?? 'Beginner'}
                    </div>
                  )}
                </div>

                {/* Lesson stats */}
                <div style={{ display: 'flex', gap: 20, flexShrink: 0 }}>
                  {[
                    { label: 'Total',     value: total },
                    { label: 'Taken',     value: taken },
                    { label: 'Remaining', value: remaining, highlight: remaining > 0 },
                    { label: 'Paid',      value: paid > 0 ? `$${paid}` : '—' },
                  ].map(stat => (
                    <div key={stat.label} style={{ textAlign: 'center' }}>
                      <div style={{
                        fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 600,
                        color: stat.highlight ? 'var(--gold)' : 'var(--text)',
                      }}>
                        {stat.value}
                      </div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Status badge */}
                <span style={{
                  fontSize: '0.68rem', padding: '3px 9px', borderRadius: 99,
                  background: statusBg(student.enrolment_status),
                  color: statusColor(student.enrolment_status),
                  border: `1px solid ${statusColor(student.enrolment_status)}55`,
                  flexShrink: 0,
                  textTransform: 'capitalize',
                }}>
                  {student.enrolment_status || 'pending'}
                </span>

                <Link href={`/tutor/students/${student.id}`} style={{
                  fontSize: '0.78rem', padding: '7px 14px', flexShrink: 0,
                  border: '1px solid var(--gold-border)', borderRadius: 2,
                  color: 'var(--gold)', textDecoration: 'none',
                }}>
                  Manage →
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
