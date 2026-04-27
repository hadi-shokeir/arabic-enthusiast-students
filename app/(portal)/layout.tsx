import { redirect }          from 'next/navigation'
import Link                  from 'next/link'
import { createClient }      from '@/lib/supabase/server'
import { AiChatWidget }      from '@/components/AiChatWidget'
import { ThemeToggle }       from '@/components/ThemeToggle'
import type { ReactNode }    from 'react'
import type { Profile, Streak } from '@/types'

/* ─────────────────────────────────────────────────────────────────────────────
   Portal layout — wraps all /portal/* pages.
   Reads session server-side; redirects to /login if not authenticated.
───────────────────────────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { href: '/portal',             label: 'Dashboard',  ar: 'لوحة التحكم' },
  { href: '/portal/courses',     label: 'My Courses', ar: 'دروسي'       },
  { href: '/portal/homework',    label: 'Homework',   ar: 'الواجبات'    },
  { href: '/portal/practice',    label: 'Practice',   ar: 'تدريب'       },
  { href: '/portal/flashcards',  label: 'Flashcards', ar: 'بطاقات'      },
  { href: '/portal/settings',    label: 'Settings',   ar: 'الإعدادات'   },
]

// Hadi's accounts — redirect to tutor portal instead of student portal
const TUTOR_EMAILS = ['hadishokeir@gmail.com', 'hadishkeir123@gmail.com']

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Tutor gets their own portal
  if (user.email && TUTOR_EMAILS.includes(user.email)) redirect('/tutor')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: streak } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const firstName = (profile as Profile | null)?.full_name?.split(' ')[0] ?? 'Student'
  const currentStreak = (streak as Streak | null)?.current_streak ?? 0
  const totalXp       = (streak as Streak | null)?.total_xp       ?? 0

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <header
        style={{
          height:       56,
          borderBottom: '1px solid var(--border)',
          display:      'flex',
          alignItems:   'center',
          justifyContent:'space-between',
          padding:      '0 24px',
          background:   'var(--bg)',
          position:     'sticky',
          top:          0,
          zIndex:       50,
        }}
      >
        <Link
          href="/"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <span style={{ fontFamily: 'var(--font-brand)', fontSize: '0.95rem', color: 'var(--text)', letterSpacing: '0.06em' }}>
            Arabic Enthusiast
          </span>
          <span
            lang="ar"
            style={{ fontFamily: 'var(--font-arabic)', fontSize: '0.75rem', color: 'var(--gold)' }}
          >
            متذوق العربية
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Streak badge */}
          {currentStreak > 0 && (
            <div
              style={{
                display:     'flex',
                alignItems:  'center',
                gap:         5,
                fontSize:    '0.82rem',
                color:       'var(--text2)',
                background:  'var(--bg2)',
                border:      '1px solid var(--border)',
                borderRadius: 20,
                padding:     '4px 12px',
              }}
            >
              <span>🔥</span>
              <span style={{ fontWeight: 600, color: 'var(--gold)' }}>{currentStreak}</span>
              <span style={{ color: 'var(--text3)' }}>day streak</span>
            </div>
          )}

          {/* Theme toggle */}
          <ThemeToggle />

          {/* XP */}
          <div style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>
            {totalXp.toLocaleString()} XP
          </div>

          {/* User initial */}
          <div
            style={{
              width:          32,
              height:         32,
              borderRadius:   '50%',
              background:     'var(--gold)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              fontSize:       '0.85rem',
              fontWeight:     700,
              color:          '#000',
            }}
          >
            {firstName.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>

        {/* ── Sidebar ────────────────────────────────────────────────────────── */}
        <aside
          style={{
            width:        220,
            borderRight:  '1px solid var(--border)',
            padding:      '24px 0',
            display:      'flex',
            flexDirection:'column',
            gap:          4,
            position:     'sticky',
            top:          56,
            height:       'calc(100vh - 56px)',
            overflowY:    'auto',
          }}
        >
          {/* Greeting */}
          <div style={{ padding: '0 20px 20px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
              Signed in as
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text)', fontWeight: 500 }}>
              {firstName}
            </div>
          </div>

          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{
                  display:     'flex',
                  alignItems:  'center',
                  justifyContent:'space-between',
                  padding:     '10px 20px',
                  fontSize:    '0.85rem',
                  color:       'var(--text2)',
                  transition:  'all 0.15s ease',
                  borderLeft:  '2px solid transparent',
                  cursor:      'pointer',
                }}
              >
                <span>{link.label}</span>
                <span lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: '0.78rem', color: 'var(--text3)' }}>
                  {link.ar}
                </span>
              </div>
            </Link>
          ))}

          {/* Sign out at the bottom */}
          <div style={{ marginTop: 'auto', padding: '20px 20px 0', borderTop: '1px solid var(--border)' }}>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                style={{
                  width:        '100%',
                  background:   'none',
                  border:       '1px solid var(--border)',
                  borderRadius: 2,
                  padding:      '8px 12px',
                  fontSize:     '0.78rem',
                  color:        'var(--text3)',
                  cursor:       'pointer',
                  textAlign:    'left',
                }}
              >
                Sign out
              </button>
            </form>
          </div>
        </aside>

        {/* ── Main content ───────────────────────────────────────────────────── */}
        <main style={{ flex: 1, padding: 'clamp(24px, 4vw, 48px)', overflowY: 'auto' }}>
          {children}
        </main>

      </div>

      {/* Floating AI chat widget */}
      <AiChatWidget />
    </div>
  )
}
