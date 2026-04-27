'use client'

import { useState } from 'react'

interface Props {
  resourceId:    string
  resourceTitle: string
}

/* ─────────────────────────────────────────────────────────────────────────────
   LeadMagnetModal — email capture before downloading a free resource.
   Calls POST /api/lead-magnet, then either redirects to download_url or
   shows a "check your email" message.
───────────────────────────────────────────────────────────────────────────── */

export function LeadMagnetModal({ resourceId, resourceTitle }: Props) {
  const [open,    setOpen]    = useState(false)
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [error,   setError]   = useState('')

  const submit = async () => {
    if (!email.trim() || loading) return
    setLoading(true)
    setError('')

    try {
      const res  = await fetch('/api/lead-magnet', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim(), resource_id: resourceId }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error ?? 'Error')

      if (data.download_url) {
        window.open(data.download_url, '_blank')
        setOpen(false)
      } else {
        setDone(true)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => { setOpen(true); setDone(false); setError(''); setEmail('') }}
        className="btn-primary"
        style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}
      >
        Download Free PDF
      </button>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.7)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '36px 32px', maxWidth: 440, width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            {done ? (
              <>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>✦</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--text)', marginBottom: 10 }}>
                  Almost there!
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text2)', lineHeight: 1.7, marginBottom: 24 }}>
                  Your free copy of <strong>{resourceTitle}</strong> is being prepared. We will send it to{' '}
                  <strong style={{ color: 'var(--gold)' }}>{email}</strong> shortly.
                </p>
                <button
                  onClick={() => setOpen(false)}
                  style={{ padding: '9px 22px', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: 2, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700 }}
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--text)', marginBottom: 6 }}>
                  Get your free copy
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text3)', marginBottom: 20, lineHeight: 1.6 }}>
                  Enter your email and we'll send <strong style={{ color: 'var(--text2)' }}>{resourceTitle}</strong> straight to you.
                </p>

                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  placeholder="your@email.com"
                  autoFocus
                  style={{
                    width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: 2, padding: '10px 14px', fontSize: '0.88rem',
                    color: 'var(--text)', outline: 'none', marginBottom: 10, boxSizing: 'border-box',
                  }}
                />

                {error && (
                  <div style={{ fontSize: '0.78rem', color: '#f88', marginBottom: 10 }}>{error}</div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={submit}
                    disabled={!email.trim() || loading}
                    style={{
                      flex: 1, padding: '10px', background: 'var(--gold)', color: '#000',
                      border: 'none', borderRadius: 2, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700,
                      opacity: (!email.trim() || loading) ? 0.5 : 1,
                    }}
                  >
                    {loading ? 'Sending…' : 'Send me the PDF →'}
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    style={{ padding: '10px 16px', background: 'none', border: '1px solid var(--border)', borderRadius: 2, cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text3)' }}
                  >
                    Cancel
                  </button>
                </div>

                <p style={{ fontSize: '0.7rem', color: 'var(--text3)', marginTop: 12, lineHeight: 1.5 }}>
                  No spam. You can unsubscribe at any time.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
