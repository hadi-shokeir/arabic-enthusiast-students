'use client'

import { useState, useEffect } from 'react'
import { createClient }         from '@/lib/supabase/client'
import { useRouter }            from 'next/navigation'

/* ─────────────────────────────────────────────────────────────────────────────
   /tutor/students/[studentId] — per-student management page.
───────────────────────────────────────────────────────────────────────────── */

const COURSES = [
  { id: 'arabic-foundations', label: 'Arabic Foundations', color: '#C9922A' },
  { id: 'levantine-dialect',  label: 'Levantine Dialect',  color: '#6B9E8F' },
  { id: 'quranic-arabic',     label: 'Quranic Arabic',     color: '#4A7A6A' },
]

const SKILL_LABELS: Record<number, string> = { 1: 'Beginner', 2: 'Elementary', 3: 'Intermediate', 4: 'Advanced', 5: 'Native-like' }

interface Profile {
  full_name:              string
  whatsapp:               string | null
  phone:                  string | null
  goals:                  string | null
  notes_from_tutor:       string | null
  enrolled_courses:       string[]
  arabic_type:            string | null
  student_level:          string | null
  payment_plan:           string | null
  lesson_rate:            number | null
  lessons_total:          number | null
  lessons_taken:          number | null
  remaining_classes:      number | null
  total_paid:             number | null
  start_date:             string | null
  timezone:               string | null
  gender:                 string | null
  study_types:            string[]
  enrolment_status:       string
  teacher_summary:        string | null
  teacher_strengths:      string | null
  teacher_improve:        string | null
  skill_reading:          number | null
  skill_writing:          number | null
  skill_listening:        number | null
  skill_speaking:         number | null
  skill_dialect_listening:number | null
  skill_dialect_speaking: number | null
  skill_tajweed:          number | null
  skill_makharij:         number | null
  skill_hifz:             number | null
  skill_tarteel:          number | null
  weekly_tasks:           { id: string; text: string; assignedAt: string; doneAt: string | null }[]
}

interface PageProps { params: { studentId: string } }

function SkillDots({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          title={SKILL_LABELS[n]}
          style={{
            width: 16, height: 16, borderRadius: '50%',
            background: n <= value ? 'var(--gold)' : 'var(--bg2)',
            border: '1px solid var(--border)',
            cursor: 'pointer', padding: 0,
          }}
        />
      ))}
      <span style={{ fontSize: '0.7rem', color: 'var(--text3)', marginLeft: 6 }}>{SKILL_LABELS[value] ?? '—'}</span>
    </div>
  )
}

export default function StudentManagePage({ params }: PageProps) {
  const { studentId } = params
  const supabase      = createClient()
  const router        = useRouter()

  const [profile,    setProfile]    = useState<Profile | null>(null)
  const [email,      setEmail]      = useState('')
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [saved,      setSaved]      = useState(false)
  const [note,       setNote]       = useState('')
  const [notesSaved, setNotesSaved] = useState(false)
  const [enrolled,   setEnrolled]   = useState<string[]>([])
  const [analysis,   setAnalysis]   = useState('')
  const [analyzing,  setAnalyzing]  = useState(false)
  const [editName,   setEditName]   = useState('')
  const [nameSaving, setNameSaving] = useState(false)
  const [nameSaved,  setNameSaved]  = useState(false)
  const [skillsSaved,setSkillsSaved]= useState(false)

  // Homework
  const [hwTitle,  setHwTitle]  = useState('')
  const [hwInstr,  setHwInstr]  = useState('')
  const [hwDue,    setHwDue]    = useState('')
  const [hwSaving, setHwSaving] = useState(false)
  const [hwSaved,  setHwSaved]  = useState(false)
  const [hwList,   setHwList]   = useState<{ id: string; title: string; due_date: string | null; created_at: string }[]>([])

  // Weekly task
  const [newTask,     setNewTask]     = useState('')
  const [taskSaving,  setTaskSaving]  = useState(false)

  // Lesson management
  const [lessonDelta, setLessonDelta] = useState(0)
  const [lessonSaving,setLessonSaving]= useState(false)
  const [lessonSaved, setLessonSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      const TUTOR_EMAILS = ['hadishokeir@gmail.com', 'hadishkeir123@gmail.com']
      if (!user || !TUTOR_EMAILS.includes(user.email ?? '')) { router.push('/portal'); return }

      const [profileRes, hwRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', studentId).single(),
        supabase.from('homework').select('id, title, due_date, created_at')
          .eq('student_id', studentId).order('created_at', { ascending: false }),
      ])

      if (profileRes.data) {
        const p = profileRes.data as Profile
        setProfile(p)
        setEnrolled(p.enrolled_courses ?? [])
        setEditName(p.full_name ?? '')
      }
      setHwList(hwRes.data ?? [])

      try {
        const r = await fetch(`/api/tutor/student-email?id=${studentId}`)
        const d = await r.json()
        setEmail(d.email ?? '')
      } catch { /* noop */ }

      setLoading(false)
    }
    load()
  }, [studentId]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateSkill = (field: keyof Profile, value: number) => {
    setProfile(prev => prev ? { ...prev, [field]: value } : prev)
  }

  const saveSkills = async () => {
    if (!profile) return
    setSaving(true)
    await supabase.from('profiles').update({
      skill_reading:           profile.skill_reading,
      skill_writing:           profile.skill_writing,
      skill_listening:         profile.skill_listening,
      skill_speaking:          profile.skill_speaking,
      skill_dialect_listening: profile.skill_dialect_listening,
      skill_dialect_speaking:  profile.skill_dialect_speaking,
      skill_tajweed:           profile.skill_tajweed,
      skill_makharij:          profile.skill_makharij,
      skill_hifz:              profile.skill_hifz,
      skill_tarteel:           profile.skill_tarteel,
    }).eq('id', studentId)
    setSaving(false)
    setSkillsSaved(true)
    setTimeout(() => setSkillsSaved(false), 2500)
  }

  const saveName = async () => {
    if (!editName.trim()) return
    setNameSaving(true)
    await supabase.from('profiles').update({ full_name: editName.trim() }).eq('id', studentId)
    setProfile(prev => prev ? { ...prev, full_name: editName.trim() } : prev)
    setNameSaving(false)
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 2500)
  }

  const toggleCourse = (id: string) => {
    setEnrolled(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
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
    await supabase.from('profiles').update({ notes_from_tutor: note.trim() }).eq('id', studentId)
    setProfile(prev => prev ? { ...prev, notes_from_tutor: note.trim() } : prev)
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 2500)
  }

  const addTask = async () => {
    if (!newTask.trim() || !profile) return
    setTaskSaving(true)
    const task = { id: Math.random().toString(36).slice(2), text: newTask.trim(), assignedAt: new Date().toISOString(), doneAt: null }
    const tasks = [...(profile.weekly_tasks ?? []), task]
    await supabase.from('profiles').update({ weekly_tasks: tasks }).eq('id', studentId)
    setProfile(prev => prev ? { ...prev, weekly_tasks: tasks } : prev)
    setNewTask('')
    setTaskSaving(false)
  }

  const markTaskDone = async (taskId: string) => {
    if (!profile) return
    const tasks = (profile.weekly_tasks ?? []).map(t =>
      t.id === taskId ? { ...t, doneAt: t.doneAt ? null : new Date().toISOString() } : t
    )
    await supabase.from('profiles').update({ weekly_tasks: tasks }).eq('id', studentId)
    setProfile(prev => prev ? { ...prev, weekly_tasks: tasks } : prev)
  }

  const addLessons = async () => {
    if (!lessonDelta || !profile) return
    setLessonSaving(true)
    const newTotal     = (profile.lessons_total ?? 0) + lessonDelta
    const newRemaining = Math.max(0, (profile.remaining_classes ?? 0) + lessonDelta)
    await supabase.from('profiles').update({ lessons_total: newTotal, remaining_classes: newRemaining }).eq('id', studentId)
    setProfile(prev => prev ? { ...prev, lessons_total: newTotal, remaining_classes: newRemaining } : prev)
    setLessonDelta(0)
    setLessonSaving(false)
    setLessonSaved(true)
    setTimeout(() => setLessonSaved(false), 2500)
  }

  const markLessonComplete = async () => {
    if (!profile) return
    const taken     = (profile.lessons_taken ?? 0) + 1
    const remaining = Math.max(0, (profile.remaining_classes ?? 0) - 1)
    await supabase.from('profiles').update({ lessons_taken: taken, remaining_classes: remaining }).eq('id', studentId)
    setProfile(prev => prev ? { ...prev, lessons_taken: taken, remaining_classes: remaining } : prev)
  }

  const assignHomework = async () => {
    if (!hwTitle.trim() || !hwInstr.trim()) return
    setHwSaving(true)
    const res  = await fetch('/api/tutor/assign-homework', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, title: hwTitle.trim(), instructions: hwInstr.trim(), due_date: hwDue || null }),
    })
    const data = await res.json()
    if (res.ok && data.homework) {
      setHwList(prev => [data.homework, ...prev])
      setHwTitle(''); setHwInstr(''); setHwDue('')
      setHwSaved(true)
      setTimeout(() => setHwSaved(false), 2500)
    }
    setHwSaving(false)
  }

  const runAnalysis = async () => {
    setAnalyzing(true); setAnalysis('')
    try {
      const res  = await fetch('/api/ai/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      })
      const data = await res.json()
      setAnalysis(data.analysis ?? data.error ?? 'No analysis returned.')
    } catch { setAnalysis('Failed to run analysis.') }
    finally  { setAnalyzing(false) }
  }

  if (loading)   return <div style={{ color: 'var(--text3)', padding: 40 }}>Loading student…</div>
  if (!profile)  return <div style={{ color: 'var(--text3)', padding: 40 }}>Student not found.</div>

  const hasQuran   = (profile.study_types ?? []).includes('quran')
  const hasDialect = (profile.study_types ?? []).includes('dialect')

  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>

      {/* Back */}
      <a href="/tutor/students" style={{ fontSize: '0.8rem', color: 'var(--text3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
        ← All students
      </a>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '1.3rem', color: '#000',
        }}>
          {(editName || profile.full_name).charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onBlur={saveName}
              onKeyDown={e => e.key === 'Enter' && saveName()}
              style={{
                fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--text)',
                background: 'transparent', border: 'none', borderBottom: '1px dashed var(--border)',
                outline: 'none', padding: '2px 4px', maxWidth: 280,
              }}
            />
            {nameSaving && <span style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>saving…</span>}
            {nameSaved  && <span style={{ fontSize: '0.7rem', color: '#6c6' }}>✓</span>}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginBottom: 2 }}>{email}</div>
          {profile.whatsapp && (
            <a href={`https://wa.me/${profile.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
              style={{ fontSize: '0.75rem', color: '#25d366', textDecoration: 'none' }}>
              WhatsApp: {profile.whatsapp}
            </a>
          )}
          {profile.arabic_type && (
            <div style={{ marginTop: 4, fontSize: '0.72rem', color: 'var(--text3)' }}>
              {profile.arabic_type} · {profile.student_level ?? 'Beginner'} · started {profile.start_date ?? '—'}
            </div>
          )}
        </div>

        {/* Lesson counts */}
        <div style={{ display: 'flex', gap: 20, flexShrink: 0 }}>
          {[
            { label: 'Total',     value: profile.lessons_total     ?? 0 },
            { label: 'Taken',     value: profile.lessons_taken     ?? 0 },
            { label: 'Left',      value: profile.remaining_classes ?? 0, gold: (profile.remaining_classes ?? 0) > 0 },
            { label: 'Paid',      value: `$${profile.total_paid ?? 0}` },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 600, color: s.gold ? 'var(--gold)' : 'var(--text)', lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lesson management */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: '18px 24px', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', color: 'var(--text)', marginBottom: 14 }}>Lessons</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={markLessonComplete}
            disabled={(profile.remaining_classes ?? 0) <= 0}
            style={{
              padding: '7px 16px', background: 'var(--gold)', color: '#000',
              border: 'none', borderRadius: 2, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700,
              opacity: (profile.remaining_classes ?? 0) <= 0 ? 0.4 : 1,
            }}
          >
            Mark lesson complete −1
          </button>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>Add lessons:</span>
            <input
              type="number"
              value={lessonDelta || ''}
              onChange={e => setLessonDelta(parseInt(e.target.value) || 0)}
              placeholder="0"
              style={{
                width: 60, background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 2, padding: '7px 10px', fontSize: '0.82rem', color: 'var(--text)', outline: 'none',
              }}
            />
            <button
              onClick={addLessons}
              disabled={!lessonDelta || lessonSaving}
              style={{
                padding: '7px 14px', background: 'var(--bg2)', color: 'var(--text)',
                border: '1px solid var(--border)', borderRadius: 2, cursor: 'pointer', fontSize: '0.82rem',
                opacity: (!lessonDelta || lessonSaving) ? 0.5 : 1,
              }}
            >
              {lessonSaved ? 'Saved ✓' : 'Add'}
            </button>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: '18px 24px', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', color: 'var(--text)', marginBottom: 14 }}>
          Skill Ratings <span style={{ fontSize: '0.72rem', color: 'var(--text3)', fontFamily: 'var(--font-body)', fontWeight: 400 }}>— click dots to update</span>
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', marginBottom: 14 }}>
          {[
            { key: 'skill_reading',  label: 'Reading'  },
            { key: 'skill_writing',  label: 'Writing'  },
            { key: 'skill_listening',label: 'Listening' },
            { key: 'skill_speaking', label: 'Speaking'  },
          ].map(({ key, label }) => (
            <div key={key}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: 4 }}>{label}</div>
              <SkillDots
                value={(profile as Record<string, number | null>)[key] ?? 3}
                onChange={v => updateSkill(key as keyof Profile, v)}
              />
            </div>
          ))}
        </div>

        {hasDialect && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginBottom: 12 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text3)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>Dialect</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
              {[
                { key: 'skill_dialect_listening', label: 'Dialect Listening' },
                { key: 'skill_dialect_speaking',  label: 'Dialect Speaking'  },
              ].map(({ key, label }) => (
                <div key={key}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: 4 }}>{label}</div>
                  <SkillDots
                    value={(profile as Record<string, number | null>)[key] ?? 3}
                    onChange={v => updateSkill(key as keyof Profile, v)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {hasQuran && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginBottom: 12 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text3)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>Quranic</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
              {[
                { key: 'skill_tajweed',  label: 'Tajweed'  },
                { key: 'skill_makharij', label: 'Makharij' },
                { key: 'skill_hifz',     label: 'Hifz'     },
                { key: 'skill_tarteel',  label: 'Tarteel'  },
              ].map(({ key, label }) => (
                <div key={key}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: 4 }}>{label}</div>
                  <SkillDots
                    value={(profile as Record<string, number | null>)[key] ?? 3}
                    onChange={v => updateSkill(key as keyof Profile, v)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={saveSkills}
          disabled={saving}
          style={{
            padding: '7px 18px', background: 'var(--gold)', color: '#000',
            border: 'none', borderRadius: 2, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700,
          }}
        >
          {skillsSaved ? 'Saved ✓' : 'Save skills'}
        </button>
      </div>

      {/* Weekly tasks */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: '18px 24px', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', color: 'var(--text)', marginBottom: 14 }}>Weekly Tasks</h2>

        {(profile.weekly_tasks ?? []).length === 0 ? (
          <p style={{ fontSize: '0.82rem', color: 'var(--text3)', marginBottom: 14 }}>No tasks assigned yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
            {(profile.weekly_tasks ?? []).map(task => (
              <div key={task.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '8px 12px', background: 'var(--bg2)', borderRadius: 2,
                opacity: task.doneAt ? 0.5 : 1,
              }}>
                <button
                  onClick={() => markTaskDone(task.id)}
                  style={{
                    width: 18, height: 18, borderRadius: 3, flexShrink: 0, marginTop: 1,
                    border: '1px solid var(--border)', background: task.doneAt ? 'var(--gold)' : 'var(--bg)',
                    cursor: 'pointer', color: task.doneAt ? '#000' : 'transparent', fontSize: '0.7rem',
                  }}
                >{task.doneAt ? '✓' : ''}</button>
                <span style={{ fontSize: '0.82rem', color: 'var(--text2)', lineHeight: 1.5, textDecoration: task.doneAt ? 'line-through' : 'none' }}>
                  {task.text}
                </span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
            placeholder="New task for student…"
            style={{
              flex: 1, background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 2, padding: '8px 12px', fontSize: '0.82rem', color: 'var(--text)', outline: 'none',
            }}
          />
          <button
            onClick={addTask}
            disabled={!newTask.trim() || taskSaving}
            style={{
              padding: '8px 14px', background: 'var(--gold)', color: '#000',
              border: 'none', borderRadius: 2, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700,
              opacity: (!newTask.trim() || taskSaving) ? 0.5 : 1,
            }}
          >Add</button>
        </div>
      </div>

      {/* Course enrolment */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: '18px 24px', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', color: 'var(--text)', marginBottom: 14 }}>Enrolled Courses</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {COURSES.map(course => (
            <label key={course.id} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input type="checkbox" checked={enrolled.includes(course.id)} onChange={() => toggleCourse(course.id)}
                style={{ width: 16, height: 16, accentColor: course.color }} />
              <span style={{ fontSize: '0.88rem', color: 'var(--text2)', fontWeight: enrolled.includes(course.id) ? 600 : 400 }}>
                {course.label}
              </span>
            </label>
          ))}
        </div>
        <button onClick={saveEnrolment} disabled={saving}
          style={{ marginTop: 14, padding: '8px 20px', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: 2, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700 }}>
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
        </button>
      </div>

      {/* Tutor note */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: '18px 24px', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', color: 'var(--text)', marginBottom: 4 }}>Note for Student</h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: 10 }}>Visible to the student on their dashboard.</p>
        {profile.notes_from_tutor && (
          <div style={{ background: 'var(--bg2)', borderRadius: 2, padding: '10px 14px', fontSize: '0.82rem', color: 'var(--text2)', marginBottom: 10, whiteSpace: 'pre-wrap' }}>
            {profile.notes_from_tutor}
          </div>
        )}
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
          placeholder="Feedback, next steps, encouragement…"
          style={{
            width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 2, padding: '10px 14px', fontSize: '0.85rem', color: 'var(--text)',
            resize: 'vertical', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box',
          }} />
        <button onClick={saveNote} disabled={!note.trim()}
          style={{ marginTop: 10, padding: '8px 20px', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: 2, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, opacity: !note.trim() ? 0.5 : 1 }}>
          {notesSaved ? 'Saved ✓' : 'Save note'}
        </button>
      </div>

      {/* Assign Homework */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: '18px 24px', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', color: 'var(--text)', marginBottom: 4 }}>Assign Homework</h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: 12 }}>Student sees this in their portal and receives AI feedback on submission.</p>
        <input type="text" value={hwTitle} onChange={e => setHwTitle(e.target.value)}
          placeholder="Title — e.g. Write 5 sentences using past tense"
          style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 2, padding: '9px 14px', fontSize: '0.85rem', color: 'var(--text)', outline: 'none', marginBottom: 10, boxSizing: 'border-box' }} />
        <textarea value={hwInstr} onChange={e => setHwInstr(e.target.value)} rows={3}
          placeholder="Full instructions…"
          style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 2, padding: '10px 14px', fontSize: '0.85rem', color: 'var(--text)', resize: 'vertical', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box', marginBottom: 10 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input type="date" value={hwDue} onChange={e => setHwDue(e.target.value)}
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 2, padding: '8px 12px', fontSize: '0.82rem', color: 'var(--text3)', outline: 'none' }} />
          <button onClick={assignHomework} disabled={!hwTitle.trim() || !hwInstr.trim() || hwSaving}
            style={{ padding: '8px 20px', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: 2, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, opacity: (!hwTitle.trim() || !hwInstr.trim() || hwSaving) ? 0.5 : 1 }}>
            {hwSaving ? 'Assigning…' : hwSaved ? 'Assigned ✓' : 'Assign'}
          </button>
        </div>
        {hwList.length > 0 && (
          <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Assigned ({hwList.length})</div>
            {hwList.map(hw => (
              <div key={hw.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--bg2)', borderRadius: 2, fontSize: '0.8rem', marginBottom: 4 }}>
                <span style={{ color: 'var(--text2)' }}>{hw.title}</span>
                <span style={{ color: 'var(--text3)', fontSize: '0.7rem' }}>
                  {hw.due_date ? `Due ${new Date(hw.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : 'No due date'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Analysis */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderLeft: '3px solid var(--gold)', borderRadius: 3, padding: '18px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', color: 'var(--text)', marginBottom: 4 }}>AI Analysis ✦</h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: 14 }}>Powered by Claude Sonnet — generates a personalised student briefing.</p>
        <button onClick={runAnalysis} disabled={analyzing}
          style={{ padding: '9px 22px', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: 2, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, opacity: analyzing ? 0.7 : 1, marginBottom: analysis ? 14 : 0 }}>
          {analyzing ? 'Analysing…' : 'Run analysis'}
        </button>
        {analysis && (
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 2, padding: '14px 16px', fontSize: '0.85rem', color: 'var(--text2)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {analysis}
          </div>
        )}
      </div>
    </div>
  )
}
