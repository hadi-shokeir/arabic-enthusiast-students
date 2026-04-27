'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'

/* ─────────────────────────────────────────────────────────────────────────────
   Settings — /portal/settings
   Update profile name, WhatsApp, goals.
───────────────────────────────────────────────────────────────────────────── */

const inputStyle: React.CSSProperties = {
  width:        '100%',
  background:   'var(--input-bg)',
  border:       '1px solid var(--border)',
  borderRadius: 2,
  padding:      '11px 14px',
  fontFamily:   'var(--font-body)',
  fontSize:     '0.88rem',
  color:        'var(--text)',
  outline:      'none',
  transition:   'border-color 0.2s ease',
}

const labelStyle: React.CSSProperties = {
  display:       'block',
  fontSize:      '0.7rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color:         'var(--text3)',
  marginBottom:  6,
}

export default function SettingsPage() {
  const supabase = createClient()

  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [email,    setEmail]    = useState('')
  const [form,     setForm]     = useState({
    full_name: '',
    whatsapp:  '',
    goals:     '',
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email ?? '')

      const { data } = await supabase
        .from('profiles')
        .select('full_name, whatsapp, goals')
        .eq('id', user.id)
        .single()

      const row = data as { full_name: string; whatsapp: string | null; goals: string | null } | null
      if (row) {
        setForm({
          full_name: row.full_name ?? '',
          whatsapp:  row.whatsapp  ?? '',
          goals:     row.goals     ?? '',
        })
      }
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not signed in.'); setSaving(false); return }

    const { error: updateError } = await (supabase
      .from('profiles') as ReturnType<typeof supabase.from>)
      .upsert({
        id:        user.id,
        full_name: form.full_name.trim(),
        whatsapp:  form.whatsapp.trim()  || null,
        goals:     form.goals.trim()     || null,
      })

    setSaving(false)
    if (updateError) {
      setError(updateError.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  if (loading) {
    return (
      <div style={{ color: 'var(--text3)', fontSize: '0.88rem' }}>Loading…</div>
    )
  }

  return (
    <div style={{ maxWidth: 540, margin: '0 auto' }}>
      <h1
        style={{
          fontFamily:   'var(--font-heading)',
          fontSize:     '1.6rem',
          color:        'var(--text)',
          marginBottom: 8,
        }}
      >
        Settings
      </h1>
      <p style={{ color: 'var(--text3)', fontSize: '0.85rem', marginBottom: 36 }}>
        Update your profile details.
      </p>

      {error && (
        <div
          style={{
            background:   'var(--danger-dim)',
            border:       '1px solid var(--danger)',
            borderRadius: 2,
            padding:      '10px 14px',
            marginBottom: 24,
            fontSize:     '0.82rem',
            color:        'var(--danger)',
          }}
        >
          {error}
        </div>
      )}

      {saved && (
        <div
          style={{
            background:   '#16a34a15',
            border:       '1px solid #16a34a40',
            borderRadius: 2,
            padding:      '10px 14px',
            marginBottom: 24,
            fontSize:     '0.82rem',
            color:        '#16a34a',
          }}
        >
          Saved successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={labelStyle}>Email (read-only)</label>
          <input
            type="email"
            disabled
            value={email}
            style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
          />
        </div>

        <div>
          <label htmlFor="full_name" style={labelStyle}>Full name</label>
          <input
            id="full_name"
            type="text"
            required
            value={form.full_name}
            onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
            placeholder="Your name"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = 'var(--gold-border)')}
            onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        <div>
          <label htmlFor="whatsapp" style={labelStyle}>WhatsApp number (optional)</label>
          <input
            id="whatsapp"
            type="tel"
            value={form.whatsapp}
            onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))}
            placeholder="+44 7700 000000"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = 'var(--gold-border)')}
            onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        <div>
          <label htmlFor="goals" style={labelStyle}>Learning goals (optional)</label>
          <textarea
            id="goals"
            rows={4}
            value={form.goals}
            onChange={e => setForm(p => ({ ...p, goals: e.target.value }))}
            placeholder="e.g. Read the Quran, speak with family, prepare for hawza..."
            style={{ ...inputStyle, resize: 'vertical', minHeight: 90 }}
            onFocus={e => (e.target.style.borderColor = 'var(--gold-border)')}
            onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary"
          style={{ alignSelf: 'flex-start', padding: '11px 28px', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      {/* Change password section */}
      <div
        style={{
          marginTop:    40,
          paddingTop:   32,
          borderTop:    '1px solid var(--border)',
        }}
      >
        <h2
          style={{
            fontFamily:   'var(--font-heading)',
            fontSize:     '1rem',
            color:        'var(--text)',
            marginBottom: 8,
          }}
        >
          Change password
        </h2>
        <p style={{ color: 'var(--text3)', fontSize: '0.82rem', marginBottom: 16 }}>
          Use the forgot password flow to set a new password.
        </p>
        <a
          href="/forgot-password"
          style={{
            fontSize:      '0.82rem',
            color:         'var(--gold)',
            textDecoration:'none',
            border:        '1px solid var(--gold-border)',
            padding:       '8px 16px',
            borderRadius:  2,
            display:       'inline-block',
          }}
        >
          Send reset email
        </a>
      </div>
    </div>
  )
}
