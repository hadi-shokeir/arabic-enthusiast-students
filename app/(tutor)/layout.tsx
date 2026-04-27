import { redirect } from 'next/navigation'
import Link         from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { ReactNode } from 'react'

const TUTOR_EMAILS = ['hadishokeir@gmail.com', 'hadishkeir123@gmail.com']

const NAV = [
  { href: '/tutor',          label: 'Dashboard',  ar: 'لوحة التحكم' },
  { href: '/tutor/students', label: 'Students',   ar: 'الطلاب'      },
]

export default async function TutorLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (!user.email || !TUTOR_EMAILS.includes(user.email)) redirect('/portal')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>

      {/* Top bar */}
      <header style={{
        height: 56, borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <Link href="/tutor" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-brand)', fontSize: '0.95rem', color: 'var(--text)', letterSpacing: '0.06em' }}>
            Arabic Enthusiast
          </span>
          <span style={{ fontSize: '0.72rem', background: 'var(--gold)', color: '#000', borderRadius: 2, padding: '2px 8px', fontFamily: 'var(--font-body)', fontWeight: 700, letterSpacing: '0.06em' }}>
            TUTOR
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/portal" style={{ fontSize: '0.78rem', color: 'var(--text3)', textDecoration: 'none' }}>
            Student view
          </Link>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" style={{
              background: 'none', border: '1px solid var(--border)', borderRadius: 2,
              padding: '6px 12px', fontSize: '0.78rem', color: 'var(--text3)', cursor: 'pointer',
            }}>
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>

        {/* Sidebar */}
        <aside style={{
          width: 200, borderRight: '1px solid var(--border)', padding: '24px 0',
          display: 'flex', flexDirection: 'column', gap: 4,
          position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto',
        }}>
          {NAV.map(link => (
            <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 20px', fontSize: '0.85rem', color: 'var(--text2)',
                borderLeft: '2px solid transparent', cursor: 'pointer',
              }}>
                <span>{link.label}</span>
                <span lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: '0.78rem', color: 'var(--text3)' }}>
                  {link.ar}
                </span>
              </div>
            </Link>
          ))}
        </aside>

        {/* Main */}
        <main style={{ flex: 1, padding: 'clamp(24px, 4vw, 48px)', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
