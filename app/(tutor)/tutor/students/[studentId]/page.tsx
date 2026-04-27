'use client'

import { useState, useEffect } from 'react'
import { createClient }         from '@/lib/supabase/client'
import { useRouter }            from 'next/navigation'

/* ─────────────────────────────────────────────────────────────────────────────
   /tutor/students/[studentId] — per-student management page.
   Tutor can: view profile, change enrolled courses, add notes, run AI analysis.
───────────────────────────────────────────────────────────────────────────── */

const COURSES = [
  { id: 'arabic-foundations', label: 'Arabic Foundations',   color: '#C9922A' },
  { id: 'levantine-dialect',  label: 'Levantine Dialect',    color: '#6B9E8F' },
  { id: 'quranic-arabic',     label: 'Quranic Arabic',       color: '#4A7A6A' },
]

interface PageProps {
  params: { studentId: string }
}

export default function StudentManagePage({ params }: PageProps) {
  const { studentId } = params
  const supabase      = createClient()
  const router        = useRouter()

  const [profile,    setProfile]    = useState<{ full_name: string; whatsapp: string | null; goals: string | null; enrolled_courses: string[] } | null>(null)
  const [streak,     setStreak]     = useState<{ total_xp: number; current_streak: number; current_level: number } | null>(null)
  const [email,      setEmail]      = useState('')
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [saved,      setSaved]      = useState(false)
  const [note,       setNote]       = useState('')
  const [notesSaved, setNotesSaved] = useState(false)
  const [enrolled,   setEnrolled]   = useState<string[]>([])
  const [analysis,   setAnalysis]   = useState('')
  const [analyzing,  setAnalyzing]  = useState(false)

  // Homework
  const [hwTitle,    setHwTitle]    = useState('')
  const [hwInstr,    setHwInstr]    = useState('')
  const [hwDue,      setHwDue]      = useState('')
  const [hwSaving,   setHwSaving]   = useState(false)
  const [hwSaved,    setHwSaved]    = useState(false)
  const [hwList,     setHwList]     = useState<{ id: string; title: string; due_date: string | null; created_at: string }[]>([])

  useEffect(() => {
    async function load() {
      // Verify tutor
      const { data: { user } } = await supabase.auth.getUser()
      const TUTOR_EMAILS = ['hadishokeir@gmail.com', 'hadishkeir123@gmail.com']
      if (!user || !TUTOR_EMAILS.includes(user.email ?? '')) {
        router.push('/portal')
        return
      }

      const [profileRes, streakRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', studentId).single(),
        supabase.from('streaks').select('*').eq('user_id', studentId).single(),
      ])

      if (profileRes.data) {
        const p = profileRes.data as { full_name: string; whatsapp: string | null; goals: string | null; enrolled_courses: string[] }
        setProfile(p)
        setEnrolled(p.enrolled_courses ?? [])
      }
      if (streakRes.data) {
        setStreak(streakRes.data as { total_xp: number; current_streak: number; current_level: number })
      }

      // Get email via admin route
      try {
        const res = await fetch(`/api/tutor/student-email?id=${studentId}`)
        const d   = await res.json()
        setEmail(d.email ?? '')
      } catch { /* noop */ }

      // Load homework assignments for this student
      const { data: hw } = await supabase.from('homework')
        .select('id, title, due_date, created_at')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
      setHwList(hw ?? [])

      setLoading(false)
    }
    load()
  }, [studentId]) // eslint-disable-line react-hooks/exhaustive-deps

  const assignHomework = async () => {
    if (!hwTitle.trim() || !hwInstr.trim()) return
    setHwSaving(true)
    const res = await fetch('/api/tutor/assign-homework', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ studentId, title: hwTitle.trim(), instructions: hwInstr.trim(), due_date: hwDue || null }),
    })
    const data = await res.json()
    if (res.ok && data.homework) {
      setHwList(prev => [data.homework, ...prev])
      setHwTitle('')
      setHwInstr('')
      setHwDue('')
      setHwSaved(true)
      setTimeout(() => setHwSaved(false), 2500)
    }
    setHwSaving(false)
  }

  const toggleCourse = (id: string) => {
    setEnrolled(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const saveEnrolment = async () => {
    setSaving(true)
    await supabase.from('profiles').update({ enrolled_courses: enrolled }).eq('id', studentId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const saveNote = async () => {
    if (!note.trim()) return
    await supabase.from('tutor_notes').insert({ student_id: studentId, content: note.trim() })
    // Also write to profiles for quick student read
    await supabase.from('profiles').update({ notes_from_tutor: note.trim() }).eq('id', studentId)
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 2500)
  }

  const runAnalysis = async () => {
    setAnalyzing(true)
    setAnalysis('')
    try {
      const res  = await fetch('/api/ai/analyze', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ studentId }),
      })
      const data = await res.json()
      setAnalysis(data.analysis ?? data.error ?? 'No analysis returned.')
    } catch {
      setAnalysis('Failed to run analysis.')
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) return <div style={{ color: 'var(--text3)', padding: 40 }}>Loading student…</div>
  if (!profile) return <div style={{ color: 'var(--text3)', padding: 40 }}>Student not found.</div>

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>

      {/* Back */}
      <a href="/tutor/students" style={{ fontSize: '0.8rem', color: 'var(--text3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
        ← All students
      </a>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', background: 'var(--gold)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '1.3rem', color: '#000',
        }}>
          {profile.full_name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--text)', marginBottom: 2 }}>
            {profile.full_name}
          </h1>
          <div style={{ fontSize: '0.82rem', color: 'var(--text3)' }}>{email}</div>
          {profile.whatsapp && (
            <a href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
              style={{ fontSize: '0.78rem', color: 'var(--gold)', textDecoration: 'none' }}>
              WhatsApp: {profile.whatsapp}
            </a>
          )}
        </div>
        {/* Stats */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 24, textAlign: 'right' }}>
          {[
            { label: 'Total XP',  value: (streak?.total_xp ?? 0).toLocaleString() },
            { label: 'Level',     value: streak?.current_level ?? 1 },
            { label: 'Streak',    value: `${streak?.current_streak ?? 0}d` },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--gold)', fontWeight: 600 }}>{s.value}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Goals */}
      {profile.goals && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: '16px 20px', marginBottom: 24 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Student Goals</div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text2)', margin: 0 }}>{profile.goals}</p>
        </div>
      )}

      {/* Course enrolment */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: '20px 24px', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--text)', marginBottom: 16 }}>
          Enrolled Courses
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {COURSES.map(course => (
            <label key={course.id} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={enrolled.includes(course.id)}
                onChange={() => toggleCourse(course.id)}
                style={{ width: 16, height: 16, accentColor: course.color }}
              />
              <span style={{ fontSize: '0.88rem', color: 'var(--text2)', fontWeight: enrolled.includes(course.id) ? 600 : 400 }}>
                {course.label}
              </span>
            </label>
          ))}
        </div>
        <button
          onClick={saveEnrolment}
          disabled={saving}
          style={{
            marginTop: 16, padding: '8px 20px', background: 'var(--gold)', color: '#000',
            border: 'none', borderRadius: 2, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700,
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save enrolment'}
        </button>
      </div>

      {/* Tutor note */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: '20px 24px', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--text)', marginBottom: 4 }}>
          Add Note for Student
        </h2>
        <p style={{ fontSize: '0.78rem', color: 'var(--text3)', marginBottom: 12 }}>
          This note is visible to the student on their dashboard.
        </p>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={4}
          placeholder="Personalised feedback, next steps, encouragement…"
          style={{
            width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 2, padding: '10px 14px', fontSize: '0.85rem', color: 'var(--text)',
            resize: 'vertical', outline: 'none', fontFamily: 'var(--font-body)',
          }}
        />
        <button
          onClick={saveNote}
          disabled={!note.trim()}
          style={{
            marginTop: 10, padding: '8px 20px', background: 'var(--gold)', color: '#000',
            border: 'none', borderRadius: 2, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700,
            opacity: !note.trim() ? 0.5 : 1,
          }}
        >
          {notesSaved ? 'Saved ✓' : 'Save note'}
        </button>
      </div>

      {/* Homework */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: '20px 24px', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--text)', marginBottom: 4 }}>
          Assign Homework
        </h2>
        <p style={{ fontSize: '0.78rem', color: 'var(--text3)', marginBottom: 12 }}>
          Student will see this in their portal and receive AI feedback on submission.
        </p>
        <input
          type="text"
          value={hwTitle}
          onChange={e => setHwTitle(e.target.value)}
          placeholder="Title — e.g. Write 5 sentences using past tense"
          style={{
            width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 2, padding: '9px 14px', fontSize: '0.85rem', color: 'var(--text)',
            outline: 'none', marginBottom: 10, boxSizing: 'border-box',
          }}
        />
        <textarea
          value={hwInstr}
          onChange={e => setHwInstr(e.target.value)}
          rows={3}
          placeholder="Full instructions — what exactly should the student do?"
          style={{
            width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 2, padding: '10px 14px', fontSize: '0.85rem', color: 'var(--text)',
            resize: 'vertical', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box', marginBottom: 10,
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            type="date"
            value={hwDue}
            onChange={e => setHwDue(e.target.value)}
            style={{
              background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 2,
              padding: '8px 12px', fontSize: '0.82rem', color: 'var(--text3)', outline: 'none',
            }}
          />
          <button
            onClick={assignHomework}
            disabled={!hwTitle.trim() || !hwInstr.trim() || hwSaving}
            style={{
              padding: '8px 20px', background: 'var(--gold)', color: '#000',
              border: 'none', borderRadius: 2, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700,
              opacity: (!hwTitle.trim() || !hwInstr.trim() || hwSaving) ? 0.5 : 1,
            }}
          >
            {hwSaving ? 'Assigning…' : hwSaved ? 'Assigned ✓' : 'Assign homework'}
          </button>
        </div>

        {/* Past assignments */}
        {hwList.length > 0 && (
          <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
              Assigned ({hwList.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {hwList.map(hw => (
                <div key={hw.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg2)', borderRadius: 2, fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text2)' }}>{hw.title}</span>
                  <span style={{ color: 'var(--text3)', fontSize: '0.72rem' }}>
                    {hw.due_date ? `Due ${new Date(hw.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : 'No due date'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Analysis */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderLeft: '3px solid var(--gold)', borderRadius: 3, padding: '20px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--text)', marginBottom: 4 }}>
          AI Student Analysis ✦
        </h2>
        <p style={{ fontSize: '0.78rem', color: 'var(--text3)', marginBottom: 16 }}>
          Powered by Claude Sonnet — generates a personalised student briefing.
        </p>
        <button
          onClick={runAnalysis}
          disabled={analyzing}
          style={{
            padding: '9px 22px', background: 'var(--gold)', color: '#000',
            border: 'none', borderRadius: 2, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700,
            opacity: analyzing ? 0.7 : 1, marginBottom: analysis ? 16 : 0,
          }}
        >
          {analyzing ? 'Analysing…' : 'Run analysis'}
        </button>
        {analysis && (
          <div style={{
            background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 2,
            padding: '16px 18px', fontSize: '0.85rem', color: 'var(--text2)',
            lineHeight: 1.7, whiteSpace: 'pre-wrap',
          }}>
            {analysis}
          </div>
        )}
      </div>
    </div>
  )
}
