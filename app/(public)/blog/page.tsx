import type { Metadata } from 'next'
import Link from 'next/link'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal         from '@/components/ui/Reveal'
import { getAllPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Blog — Arabic Enthusiast',
  description: 'Articles on Arabic language, Quranic vocabulary, Levantine culture, and language-learning methodology.',
}

/* ─────────────────────────────────────────────────────────────────────────────
   Blog — /blog
   Placeholder page until MDX posts are authored.
   When posts exist they will be in content/blog/*.mdx and imported via
   @next/mdx + a getAllPosts() utility.
───────────────────────────────────────────────────────────────────────────── */

export default function BlogPage() {
  const posts = getAllPosts()
  return (
    <>
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <section
        style={{
          padding:      'clamp(60px, 8vw, 100px) clamp(20px, 6vw, 80px) 48px',
          borderBottom: '1px solid var(--border)',
          textAlign:    'center',
        }}
      >
        <SectionHeading
          eyebrow={{ en: 'Blog', ar: 'المدوّنة' }}
          heading="Arabic language articles"
          sub="Grammar explainers, cultural notes, Quranic vocabulary breakdowns, and language-learning advice."
          center
        />
      </section>

      {/* ── Posts ────────────────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(48px, 6vw, 80px) clamp(20px, 6vw, 80px)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {posts.map((post, i) => (
              <Reveal key={post.slug} delay={i * 60}>
                <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div
                    style={{
                      display:    'flex',
                      gap:        24,
                      padding:    '28px 0',
                      borderBottom: '1px solid var(--border)',
                      alignItems: 'flex-start',
                      cursor:     'pointer',
                    }}
                  >
                    {/* Category pill */}
                    <div style={{ flexShrink: 0, paddingTop: 3 }}>
                      <span
                        style={{
                          fontSize:      '0.62rem',
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color:         'var(--gold)',
                          border:        '1px solid var(--gold-border)',
                          padding:       '3px 9px',
                          borderRadius:  2,
                          whiteSpace:    'nowrap',
                        }}
                      >
                        {post.category}
                      </span>
                    </div>

                    <div style={{ flex: 1 }}>
                      <h2
                        style={{
                          fontFamily:   'var(--font-heading)',
                          fontSize:     '1.1rem',
                          color:        'var(--text)',
                          marginBottom: 4,
                          lineHeight:   1.3,
                        }}
                      >
                        {post.title}
                      </h2>
                      <div
                        lang="ar"
                        dir="rtl"
                        style={{
                          fontFamily:   'var(--font-arabic)',
                          fontSize:     '0.85rem',
                          color:        'var(--text3)',
                          marginBottom: 10,
                        }}
                      >
                        {post.arabic}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text2)', lineHeight: 1.7 }}>
                        {post.excerpt}
                      </p>
                    </div>

                    <div style={{ flexShrink: 0, fontSize: '0.72rem', color: 'var(--text3)', paddingTop: 3 }}>
                      {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter sign-up placeholder ───────────────────────────────────── */}
      <section
        style={{
          padding:    'clamp(48px, 6vw, 72px) clamp(20px, 6vw, 80px)',
          textAlign:  'center',
          background: 'var(--bg2)',
          borderTop:  '1px solid var(--border)',
        }}
      >
        <Reveal>
          <h2
            style={{
              fontFamily:   'var(--font-heading)',
              fontSize:     'clamp(1.3rem, 2.5vw, 1.9rem)',
              color:        'var(--text)',
              marginBottom: 12,
            }}
          >
            Get new articles by email
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 28, maxWidth: 400, margin: '0 auto 28px' }}>
            Grammar explainers and vocabulary breakdowns — no more than twice a month.
          </p>
          <Link href="/consultation" className="btn-primary">
            Subscribe
          </Link>
        </Reveal>
      </section>
    </>
  )
}
