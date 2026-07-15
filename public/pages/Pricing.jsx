// ─── Pricing Page ─────────────────────────────────────────────────────────────

function PricingPage({ setPage }) {
  const site = window.getSiteContent ? window.getSiteContent() : (window.AE?.DATA?.siteContent || {});
  const pricing = site.pricing || {};
  const [stripeLoading, setStripeLoading] = React.useState(false);
  const [stripeError, setStripeError] = React.useState('');
  const plans = window.AE?.DATA?.plans || [
    { id: 'single', name: 'Single Lesson', price: '$35', unit: 'per lesson', popular: false, features: ['1 private 60-min lesson','Personal feedback','Recording available','Book anytime'] },
    { id: 'bundle', name: '10-Lesson Bundle', price: '$300', unit: 'saves $50', popular: true, features: ['10 private lessons','Priority scheduling','Progress reports','WhatsApp support','Lesson recordings'] },
    { id: 'monthly', name: 'Monthly Immersion', price: '$420', unit: 'per month', popular: false, features: ['Unlimited lessons (up to 4/week)','Daily vocab & tasks','Full portal access','Weekly progress call','Priority support'] },
  ];

  async function handleSubscribe() {
    setStripeLoading(true);
    setStripeError('');
    try {
      const r = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await r.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setStripeError(data.error || 'Something went wrong. Please try again.');
        setStripeLoading(false);
      }
    } catch {
      setStripeError('Could not connect. Please try again.');
      setStripeLoading(false);
    }
  }

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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
          {plans.map((plan, i) => (
            <Reveal key={plan.id} delay={i * 0.08}>
              <div style={{
                background: plan.popular ? 'var(--ink)' : 'var(--surface)',
                color: plan.popular ? 'var(--paper)' : 'var(--ink)',
                border: plan.popular ? '1px solid var(--ink)' : '1px solid var(--line)',
                borderRadius: 'var(--r-lg)', padding: '28px 24px',
                display: 'flex', flexDirection: 'column',
                boxShadow: plan.popular ? 'var(--shadow)' : 'var(--shadow-sm)',
                position: 'relative',
              }}>
                {plan.popular && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)' }}>
                    <span style={{
                      fontFamily: 'var(--f-body)', fontSize: '0.62rem', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '.07em',
                      padding: '4px 14px', borderRadius: '99px',
                      background: 'var(--accent)', color: 'var(--on-accent)',
                      border: '1px solid var(--accent)',
                    }}>Most popular</span>
                  </div>
                )}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontFamily: 'var(--f-head)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 6 }}>{plan.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontFamily: 'var(--f-head)', fontSize: '2.2rem', fontWeight: 700, lineHeight: 1 }}>{plan.price}</span>
                    <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.82rem', color: plan.popular ? 'var(--muted)' : 'var(--muted)', opacity: .8 }}>{plan.unit}</span>
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--accent)', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                      <span style={{ fontSize: '0.88rem', color: plan.popular ? 'var(--ink-2)' : 'var(--ink-2)', opacity: plan.popular ? 0.85 : 1, lineHeight: 1.4 }}>{f}</span>
                    </div>
                  ))}
                </div>
                {plan.id === 'monthly' ? (
                  <div>
                    {stripeError && <p style={{ color: 'var(--bad)', fontSize: '0.78rem', marginBottom: 8 }}>{stripeError}</p>}
                    <button
                      onClick={handleSubscribe}
                      disabled={stripeLoading}
                      style={{
                        width: '100%', padding: '12px',
                        fontFamily: 'var(--f-body)', fontSize: '0.85rem', fontWeight: 600,
                        background: 'color-mix(in oklab, var(--accent) 11%, var(--surface))',
                        color: 'var(--accent)',
                        border: '1px solid color-mix(in oklab, var(--accent) 26%, transparent)',
                        cursor: stripeLoading ? 'not-allowed' : 'pointer',
                        borderRadius: 'var(--r)', transition: 'all .2s var(--ease)',
                        opacity: stripeLoading ? 0.7 : 1,
                      }}
                    >{stripeLoading ? 'Redirecting…' : 'Subscribe now →'}</button>
                  </div>
                ) : (
                  <button onClick={() => window.location.href = '/portal?signup=1'} style={{
                    width: '100%', padding: '12px',
                    fontFamily: 'var(--f-body)', fontSize: '0.85rem', fontWeight: 600,
                    background: plan.popular ? 'var(--accent)' : 'color-mix(in oklab, var(--accent) 11%, var(--surface))',
                    color: plan.popular ? 'var(--on-accent)' : 'var(--accent)',
                    border: plan.popular ? '1px solid var(--accent)' : '1px solid color-mix(in oklab, var(--accent) 26%, transparent)',
                    cursor: 'pointer', borderRadius: 'var(--r)', transition: 'all .2s var(--ease)',
                  }}>Get started →</button>
                )}
              </div>
            </Reveal>
          ))}
        </div>

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
  );
}

window.PricingPage = PricingPage;
