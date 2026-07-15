// ─── Success Page ─────────────────────────────────────────────────────────────

function SuccessPage({ setPage }) {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('session_id');
  const [managing, setManaging] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(function () {
    if (sessionId) {
      try { localStorage.setItem('ae_stripe_session', sessionId); } catch {}
    }
  }, [sessionId]);

  const storedSession = sessionId || (function () {
    try { return localStorage.getItem('ae_stripe_session'); } catch { return null; }
  })();

  async function handleManage() {
    setManaging(true);
    setError('');
    try {
      const r = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: storedSession }),
      });
      const data = await r.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Could not open billing portal.');
        setManaging(false);
      }
    } catch {
      setError('Connection error. Please try again.');
      setManaging(false);
    }
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', paddingTop: 120 }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'color-mix(in oklab, var(--good) 15%, var(--surface))',
          border: '2px solid color-mix(in oklab, var(--good) 30%, transparent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', fontSize: '2rem', color: 'var(--good)',
        }}>✓</div>

        <h1 style={{
          fontFamily: 'var(--f-head)', fontSize: 'clamp(1.8rem,4vw,2.4rem)',
          fontWeight: 600, color: 'var(--ink)', marginBottom: 12, lineHeight: 1.2,
        }}>
          You're subscribed!
        </h1>

        <p style={{
          color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.7,
          maxWidth: 400, margin: '0 auto 32px',
        }}>
          Welcome to Monthly Immersion. Your access to the portal and all lesson features is now active. Hadi will be in touch shortly.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          <button
            onClick={function () { window.location.href = '/portal'; }}
            style={{
              fontFamily: 'var(--f-body)', fontSize: '0.88rem', fontWeight: 600,
              padding: '12px 28px', background: 'var(--accent)', color: 'var(--on-accent)',
              border: '1px solid var(--accent)', cursor: 'pointer', borderRadius: 'var(--r)',
              transition: 'all .2s var(--ease)',
            }}
          >Go to portal →</button>

          {storedSession && (
            <button
              onClick={handleManage}
              disabled={managing}
              style={{
                fontFamily: 'var(--f-body)', fontSize: '0.88rem', fontWeight: 500,
                padding: '12px 24px', background: 'transparent',
                border: '1px solid var(--line)', color: 'var(--ink-2)',
                cursor: managing ? 'not-allowed' : 'pointer', borderRadius: 'var(--r)',
                transition: 'all .2s var(--ease)', opacity: managing ? 0.6 : 1,
              }}
            >{managing ? 'Opening…' : 'Manage subscription'}</button>
          )}
        </div>

        {error && (
          <p style={{ color: 'var(--bad)', fontSize: '0.82rem', marginBottom: 12 }}>{error}</p>
        )}

        <button
          onClick={function () { setPage('home'); }}
          style={{
            marginTop: 8, background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--muted)', fontFamily: 'var(--f-body)', fontSize: '0.82rem',
            textDecoration: 'underline',
            textDecorationColor: 'color-mix(in oklab, var(--muted) 40%, transparent)',
          }}
        >← Back to home</button>
      </div>
    </div>
  );
}

window.SuccessPage = SuccessPage;
