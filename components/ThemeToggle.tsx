'use client'

import { useState, useEffect } from 'react'

/* ─────────────────────────────────────────────────────────────────────────────
   ThemeToggle — reads and writes the data-theme attribute + localStorage.
   Works in tandem with the blocking inline script in layout.tsx that prevents
   flash-of-wrong-theme on load.
───────────────────────────────────────────────────────────────────────────── */

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('ae-theme')
    const initial = (stored === 'light' || stored === 'dark') ? stored : 'dark'
    setTheme(initial)
  }, [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    try { localStorage.setItem('ae-theme', next) } catch { /* noop */ }
  }

  return (
    <button
      onClick={toggle}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      style={{
        background:   'none',
        border:       '1px solid var(--border)',
        borderRadius: 20,
        padding:      '4px 10px',
        cursor:       'pointer',
        fontSize:     '0.82rem',
        color:        'var(--text3)',
        display:      'flex',
        alignItems:   'center',
        gap:          6,
        transition:   'border-color 0.2s, color 0.2s',
      }}
    >
      <span style={{ fontSize: '0.95rem' }}>{theme === 'dark' ? '☀' : '☽'}</span>
      <span style={{ fontSize: '0.72rem' }}>{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  )
}
