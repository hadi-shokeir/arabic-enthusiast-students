'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts'

interface CourseBar {
  name:      string
  completed: number
  total:     number
  color:     string
}

interface SkillPoint {
  skill:    string
  score:    number
  fullMark: number
}

interface ActivityPoint {
  day:      string
  xp:       number
}

interface Props {
  courseBars:   CourseBar[]
  skills:       SkillPoint[]
  activity:     ActivityPoint[]
  hasAnyData:   boolean
}

/* ── Shared empty state ─────────────────────────────────────────── */
function Empty({ msg }: { msg: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: 140, fontSize: '0.78rem', color: 'var(--text3)', fontStyle: 'italic',
    }}>
      {msg}
    </div>
  )
}

/* ── Custom tooltip ─────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 4, padding: '8px 12px', fontSize: '0.78rem', color: 'var(--text)',
    }}>
      <div style={{ marginBottom: 4, color: 'var(--text3)', fontWeight: 500 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  )
}

export function DashboardCharts({ courseBars, skills, activity, hasAnyData }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 36 }}>

      {/* ── Lessons Completed ─────────────────────────────────────── */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: '20px 24px' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
          Lessons Completed
        </div>
        {courseBars.length === 0 ? (
          <Empty msg="Enroll in a course to see progress" />
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={courseBars} barCategoryGap="30%">
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
              <YAxis hide allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="completed" name="Done" radius={[3, 3, 0, 0]}
                fill="var(--gold)" maxBarSize={40} />
              <Bar dataKey="total" name="Total" radius={[3, 3, 0, 0]}
                fill="var(--bg2)" maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Skills Radar ─────────────────────────────────────────── */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: '20px 24px' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
          Skills Overview
        </div>
        {!hasAnyData ? (
          <Empty msg="Complete lessons to see your skill profile" />
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skills}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: 'var(--text3)' }} />
              <Radar name="Score" dataKey="score" stroke="#C9922A" fill="#C9922A" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Activity (XP per day) ────────────────────────────────── */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 3, padding: '20px 24px' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
          XP This Week
        </div>
        {activity.every(a => a.xp === 0) ? (
          <Empty msg="Practice daily to build your streak" />
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={activity}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="xp" name="XP" stroke="#C9922A" strokeWidth={2}
                dot={{ r: 3, fill: '#C9922A' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  )
}
