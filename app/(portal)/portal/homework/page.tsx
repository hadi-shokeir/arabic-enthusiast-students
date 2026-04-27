'use client'

import { useState, useEffect } from 'react'
import { createClient }         from '@/lib/supabase/client'

interface Homework {
  id:           string
  title:        string
  instructions: string
  due_date:     string | null
  created_at:   string
}

interface Submission {
  id:          string
  homework_id: string
  content:     string
  ai_feedback: string | null
  score:       number | null
  submitted_at: string
}

/* ─────────────────────────────────────────────────────────────────────────────
   /portal/homework — student homework list + submission + AI feedback
───────────────────────────────────────────────────────────────────────────── */

export default function HomeworkPage() {
  const supabase = createClient()

  const [homework,    setHomework]    = useState<Homework[]>([])
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({})
  const [loading,     setLoading]     = useState(true)
  const [submitting,  setSubmitting]  = useState<string | null>(null)
  const [drafts,      setDrafts]      = useState<Record<string, string>>({})
  const [error,       setError]       = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [hwRes, subRes] = await Promise.all([
        supabase.from('homework').select('*').eq('student_id', user.id).order('created_at', { ascending: false }),
        supabase.from('homework_submissions').select('*').eq('student_id', user.id),
      ])

      setHomework(hwRes.data as Homework[] ?? [])

      const subMap: Record<string, Submission> = {}
      ;(subRes.data as Submission[] ?? []).forEach(s => { subMap[s.homework_id] = s })
      setSubmissions(subMap)
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (hwId: string) => {
    const content = (drafts[hwId] ?? '').trim()
    if (!content) return
    setSubmitting(hwId)
    setError('')

    try {
      const res  = await fetch('/api/homework/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ homeworkId: hwId, content }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Submission failed')

      setSubmissions(prev => ({ ...prev, [hwId]: data.submission as Submission }))
      setDrafts(prev => ({ ...prev, [hwId]: '' }))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to submit')
    } finally {
      setSubmitting(null)
    }
  }

  if (loading) return <div style={{ color: 'var(--text3)', padding: 40 }}>Loading homework…</div>

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--text)', marginBottom: 4 }}>
          Homework / الواجبات
        </h1>
        <p style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>
          Assignments from your tutor. Submit your work to receive AI feedback.
        </p>
      </div>

      {error && (
        <div style={{ background: '#3a1a1a', border: '1px solid #a33', borderRadius: 3, padding: '10px 16px', marginBottom: 20, fontSize: '0.82rem', color: '#f88' }}>
          {error}
        </div>
      )}

      {homework.length === 0 ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: '48px 24px', textAlign: 'center', color: 'var(--text3)', fontSize: '0.88rem' }}>
          No homework assigned yet — check back after your next session.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {homework.map(hw => {
            const sub      = submissions[hw.id]
            const isDue    = hw.due_date && new Date(hw.due_date) < new Date()
            const draftVal = drafts[hw.id] ?? ''

            return (
              <div key={hw.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: '24px 28px' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', color: 'var(--text)', marginBottom: 4 }}>
                      {hw.title}
                    </h2>
                    {hw.due_date && (
                      <div style={{ fontSize: '0.72rem', color: isDue ? '#e07070' : 'var(--text3)' }}>
                        Due: {new Date(hw.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {isDue && !sub && ' — overdue'}
                      </div>
                    )}
                  </div>
                  <div>
                    {sub ? (
                      <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: 99, background: '#1a3a1a', color: '#6c6', border: '1px solid #2a5a2a' }}>
                        Submitted ✓
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: 99, background: 'var(--bg2)', color: 'var(--text3)', border: '1px solid var(--border)' }}>
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Instructions */}
                <div style={{ fontSize: '0.85rem', color: 'var(--text2)', lineHeight: 1.7, marginBottom: 20, whiteSpace: 'pre-wrap' }}>
                  {hw.instructions}
                </div>

                {/* Submission */}
                {sub ? (
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                      Your answer
                    </div>
                    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 2, padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text2)', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 16 }}>
                      {sub.content}
                    </div>

                    {/* AI Feedback */}
                    {sub.ai_feedback && (
                      <div style={{ background: 'var(--bg)', border: '1px solid var(--gold-border)', borderLeft: '3px solid var(--gold)', borderRadius: 2, padding: '16px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--gold)' }}>✦ AI Feedback</span>
                          {sub.score !== null && (
                            <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 99, background: 'var(--bg2)', color: 'var(--text3)', border: '1px solid var(--border)' }}>
                              Score: {sub.score}/100
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text2)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                          {sub.ai_feedback}
                        </div>
                      </div>
                    )}
                    {!sub.ai_feedback && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text3)', fontStyle: 'italic' }}>
                        AI feedback is being generated…
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                      Your answer
                    </div>
                    <textarea
                      value={draftVal}
                      onChange={e => setDrafts(prev => ({ ...prev, [hw.id]: e.target.value }))}
                      rows={5}
                      placeholder="Write your answer here in Arabic or English…"
                      style={{
                        width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
                        borderRadius: 2, padding: '10px 14px', fontSize: '0.85rem', color: 'var(--text)',
                        resize: 'vertical', outline: 'none', fontFamily: 'var(--font-body)',
                        boxSizing: 'border-box',
                      }}
                    />
                    <button
                      onClick={() => submit(hw.id)}
                      disabled={!draftVal.trim() || submitting === hw.id}
                      style={{
                        marginTop: 10, padding: '8px 22px', background: 'var(--gold)', color: '#000',
                        border: 'none', borderRadius: 2, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700,
                        opacity: (!draftVal.trim() || submitting === hw.id) ? 0.5 : 1,
                      }}
                    >
                      {submitting === hw.id ? 'Submitting…' : 'Submit →'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
