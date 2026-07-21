// ─── Pricing Page ─────────────────────────────────────────────────────────────

function PricingGroupSection() {
  const GW = window.GroupWaitlistSection;
  if (!GW) return null;
  return <GW />;
}

function PricingPage({ setPage }) {
  const site = window.getSiteContent ? window.getSiteContent() : (window.AE?.DATA?.siteContent || {});
  const pricing = site.pricing || {};
  const plans = window.AE?.DATA?.plans || [
    { id: 'single', name: 'Single Lesson', price: '$25', unit: 'per lesson', popular: false, features: ['1 private 60-min lesson','Tailored to your level & goals','Personal feedback every session','Book anytime — Arabic or English'] },
    { id: 'bundle', name: '12-Lesson Bundle', price: '$250', unit: 'save $50', popular: true, features: ['12 private lessons','Priority scheduling','Full student portal access','Progress tracking & lesson logs','WhatsApp support between sessions'] },
  ];

  return (
    <div style={{ paddingTop: 100, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: 'clamp(48px,8vw,96px) clamp(20px,5vw,80px)' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <Eyebrow center={true}>{pricing.eyebrow || 'Pricing'}</Eyebrow>
            <h1 style={{ fontFamily: 'var(--f-head)', fontSize: 'clamp(2.2rem,4vw,3rem)', color: 'var(--ink)', fontWeight: 600, lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.01em' }}>
              {pricing.titleLine1 || 'Simple, fair'}{' '}
              <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{pricing.titleAccent || 'pricing'}</em>
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
              {pricing.description || 'Every plan includes a free introductory lesson so you can experience the teaching before committing.'}
            </p>
          </div>
        </Reveal>

        {/* Plan cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, maxWidth: 780, margin: '0 auto 32px' }}>
          {plans.map((plan, i) => (
            <Reveal key={plan.id} delay={i * 0.08}>
              <div style={{
                background: plan.popular ? 'var(--ink)' : 'var(--surface)',
                color: plan.popular ? 'var(--paper)' : 'var(--ink)',
                border: plan.popular ? '1px solid var(--ink)' : '1px solid var(--line)',
                borderRadius: 'var(--r-lg)', padding: '32px 28px',
                display: 'flex', flexDirection: 'column',
                boxShadow: plan.popular ? 'var(--shadow)' : 'var(--shadow-sm)',
                position: 'relative', height: '100%',
              }}>
                {plan.popular && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)' }}>
                    <span style={{
                      fontFamily: 'var(--f-body)', fontSize: '0.62rem', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '.07em',
                      padding: '4px 14px', borderRadius: '99px',
                      background: 'var(--accent)', color: 'var(--on-accent)',
                      border: '1px solid var(--accent)',
                    }}>Best value</span>
                  </div>
                )}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontFamily: 'var(--f-head)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 8 }}>{plan.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--f-head)', fontSize: '2.6rem', fontWeight: 700, lineHeight: 1 }}>{plan.price}</span>
                    <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.82rem', color: 'var(--muted)', opacity: .85 }}>{plan.unit}</span>
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--accent)', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                      <span style={{ fontSize: '0.88rem', opacity: plan.popular ? 0.88 : 1, lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => window.location.href = '/portal?signup=1'} style={{
                  width: '100%', padding: '13px',
                  fontFamily: 'var(--f-body)', fontSize: '0.88rem', fontWeight: 600,
                  background: plan.popular ? 'var(--accent)' : 'color-mix(in oklab, var(--accent) 11%, var(--surface))',
                  color: plan.popular ? 'var(--on-accent)' : 'var(--accent)',
                  border: plan.popular ? '1px solid var(--accent)' : '1px solid color-mix(in oklab, var(--accent) 26%, transparent)',
                  cursor: 'pointer', borderRadius: 'var(--r)', transition: 'all .2s var(--ease)',
                }}>Get started →</button>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.12}>
          <div style={{ maxWidth: 780, margin: '0 auto 32px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', padding: '22px 28px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 28 }}>✨</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--f-head)', fontSize: '1rem', fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>Free introductory lesson</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6 }}>Not sure where to start? Book a free 30-min intro session — no obligation, no payment. Just meet Hadi and see if it's the right fit.</div>
            </div>
            <button onClick={() => window.location.href = '/portal?signup=1'} style={{
              fontFamily: 'var(--f-body)', fontSize: '0.82rem', fontWeight: 600,
              padding: '10px 20px', background: 'var(--accent)', color: 'var(--on-accent)',
              border: 'none', cursor: 'pointer', borderRadius: 'var(--r)',
              whiteSpace: 'nowrap', transition: 'all .2s var(--ease)',
            }}>Book free intro →</button>
          </div>
        </Reveal>

        <Reveal>
          <div style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--muted)' }}>
            Questions about which plan fits?{' '}
            <button onClick={() => { setPage('about'); window.scrollTo(0,0); }} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--accent)', fontFamily: 'var(--f-body)', fontSize: '0.88rem', fontWeight: 600,
              textDecoration: 'underline', textDecorationColor: 'color-mix(in oklab, var(--accent) 40%, transparent)',
            }}>Talk to Hadi →</button>
          </div>
        </Reveal>
      </div>
    </div>
    <PricingGroupSection />
  );
}

window.PricingPage = PricingPage;
