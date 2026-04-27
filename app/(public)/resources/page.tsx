import type { Metadata } from 'next'
import Link from 'next/link'
import SectionHeading    from '@/components/ui/SectionHeading'
import Reveal            from '@/components/ui/Reveal'
import Badge             from '@/components/ui/Badge'
import { LeadMagnetModal } from '@/components/LeadMagnetModal'
import { resources }    from '@/data/resources'

export const metadata: Metadata = {
  title: 'Free Resources — Arabic Enthusiast',
  description: 'Free Arabic learning resources: Quranic vocabulary, Lebanese phrase sheets, alphabet workbooks, and more.',
}

/* ─────────────────────────────────────────────────────────────────────────────
   Resources — /resources
   Lead magnets + future downloadable PDFs.
   Email capture handled by the /api/lead-magnet API route (Phase 6).
───────────────────────────────────────────────────────────────────────────── */

const CATEGORY_COLOURS: Record<string, 'gold' | 'green' | 'teal' | 'muted'> = {
  Quranic:      'green',
  Lebanese:     'teal',
  Beginner:     'gold',
  Intermediate: 'muted',
  Advanced:     'muted',
}

export default function ResourcesPage() {
  const leadMagnets    = resources.filter(r => r.is_lead_magnet)
  const comingSoon     = resources.filter(r => !r.is_lead_magnet)

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
          eyebrow={{ en: 'Resources', ar: 'الموارد' }}
          heading="Free Arabic learning resources"
          sub="Download these free resources to support your Arabic studies — no course required."
          center
        />
      </section>

      {/* ── Lead magnets ─────────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(48px, 6vw, 80px) clamp(20px, 6vw, 80px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div
            style={{
              fontSize:      '0.65rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color:         'var(--text3)',
              marginBottom:  28,
            }}
          >
            Free Downloads
          </div>

          <div
            style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap:                 20,
            }}
          >
            {leadMagnets.map((resource, i) => (
              <Reveal key={resource.id} delay={i * 80}>
                <div
                  className="card"
                  style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}
                >
                  {/* Category + size */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Badge variant={CATEGORY_COLOURS[resource.category] ?? 'muted'}>
                      {resource.category}
                    </Badge>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text3)' }}>
                      {resource.file_size}
                    </span>
                  </div>

                  {/* Titles */}
                  <div>
                    <h3
                      style={{
                        fontFamily:   'var(--font-heading)',
                        fontSize:     '1.1rem',
                        color:        'var(--text)',
                        marginBottom: 6,
                        lineHeight:   1.3,
                      }}
                    >
                      {resource.title}
                    </h3>
                    <div
                      lang="ar"
                      dir="rtl"
                      style={{
                        fontFamily: 'var(--font-arabic)',
                        fontSize:   '0.9rem',
                        color:      'var(--text3)',
                      }}
                    >
                      {resource.arabic}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.84rem', color: 'var(--text2)', lineHeight: 1.7, flex: 1 }}>
                    {resource.description}
                  </p>

                  {/* Download CTA — email capture modal */}
                  <LeadMagnetModal
                    resourceId={resource.id}
                    resourceTitle={resource.title}
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Coming soon ──────────────────────────────────────────────────────── */}
      {comingSoon.length > 0 && (
        <section
          style={{
            padding:    'clamp(40px, 5vw, 64px) clamp(20px, 6vw, 80px)',
            borderTop:  '1px solid var(--border)',
            background: 'var(--bg2)',
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div
              style={{
                fontSize:      '0.65rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color:         'var(--text3)',
                marginBottom:  28,
              }}
            >
              Coming Soon
            </div>

            <div
              style={{
                display:             'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap:                 20,
              }}
            >
              {comingSoon.map((resource, i) => (
                <Reveal key={resource.id} delay={i * 80}>
                  <div
                    className="card"
                    style={{ padding: '28px', opacity: 0.6, cursor: 'default' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <Badge variant={CATEGORY_COLOURS[resource.category] ?? 'muted'}>
                        {resource.category}
                      </Badge>
                      <Badge variant="muted">Coming soon</Badge>
                    </div>
                    <h3
                      style={{
                        fontFamily:   'var(--font-heading)',
                        fontSize:     '1rem',
                        color:        'var(--text)',
                        marginBottom: 6,
                      }}
                    >
                      {resource.title}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text3)', lineHeight: 1.65 }}>
                      {resource.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section
        style={{
          padding:   'clamp(48px, 6vw, 72px) clamp(20px, 6vw, 80px)',
          textAlign: 'center',
          borderTop: '1px solid var(--border)',
        }}
      >
        <Reveal>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.3rem, 2.5vw, 1.9rem)', color: 'var(--text)', marginBottom: 16 }}>
            Want personalised guidance?
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 32, maxWidth: 420, margin: '0 auto 32px' }}>
            Free resources are a great start — private lessons take you much further.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/consultation" className="btn-primary">Book a Free Consultation</Link>
            <Link href="/courses" className="btn-ghost">Explore Courses</Link>
          </div>
        </Reveal>
      </section>
    </>
  )
}
