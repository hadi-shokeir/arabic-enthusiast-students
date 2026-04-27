import Link from 'next/link'
import type { ReactNode } from 'react'

interface BlogMeta {
  title:    string
  arabic:   string
  date:     string
  category: string
}

/* ─────────────────────────────────────────────────────────────────────────────
   BlogLayout — wraps MDX blog posts with a consistent reading layout.
───────────────────────────────────────────────────────────────────────────── */

export default function BlogLayout({ meta, children }: { meta: BlogMeta; children: ReactNode }) {
  const dateStr = new Date(meta.date).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <article style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(48px, 6vw, 80px) clamp(20px, 5vw, 40px)' }}>

      {/* Back */}
      <Link href="/blog" style={{ fontSize: '0.8rem', color: 'var(--text3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 36 }}>
        ← All articles
      </Link>

      {/* Header */}
      <header style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{
            fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--gold)', border: '1px solid var(--gold-border)', padding: '3px 9px', borderRadius: 2,
          }}>
            {meta.category}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{dateStr}</span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
          color: 'var(--text)', lineHeight: 1.25, marginBottom: 12,
        }}>
          {meta.title}
        </h1>

        <div lang="ar" dir="rtl" style={{
          fontFamily: 'var(--font-arabic)', fontSize: '1.2rem', color: 'var(--text3)',
        }}>
          {meta.arabic}
        </div>
      </header>

      {/* MDX content */}
      <div className="prose">
        {children}
      </div>

      {/* Footer */}
      <footer style={{ marginTop: 64, paddingTop: 32, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text3)', lineHeight: 1.7 }}>
            Written by <strong style={{ color: 'var(--text2)' }}>Hadi Shokeir</strong> — linguist, translator, and Arabic teacher.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/courses" style={{ fontSize: '0.82rem', padding: '8px 18px', background: 'var(--gold)', color: '#000', borderRadius: 2, textDecoration: 'none', fontWeight: 700 }}>
              Explore Courses
            </Link>
            <Link href="/blog" style={{ fontSize: '0.82rem', padding: '8px 18px', border: '1px solid var(--border)', color: 'var(--text2)', borderRadius: 2, textDecoration: 'none' }}>
              More Articles
            </Link>
          </div>
        </div>
      </footer>
    </article>
  )
}
