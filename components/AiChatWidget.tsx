'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

/* ─────────────────────────────────────────────────────────────────────────────
   Floating AI tutor chat widget — shown on all authenticated portal pages.
   Uses /api/ai/chat (Haiku) for fast, concise Arabic learning answers.
───────────────────────────────────────────────────────────────────────────── */

export function AiChatWidget() {
  const [open,     setOpen]     = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  const send = async () => {
    const q = input.trim()
    if (!q || loading) return

    const next: Message[] = [...messages, { role: 'user', content: q }]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const res  = await fetch('/api/ai/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ question: q }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong — try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Ask your Arabic tutor AI"
        style={{
          position:       'fixed',
          bottom:         24,
          right:          24,
          zIndex:         100,
          width:          52,
          height:         52,
          borderRadius:   '50%',
          background:     'var(--gold)',
          color:          '#000',
          border:         'none',
          cursor:         'pointer',
          fontSize:       '1.3rem',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          boxShadow:      '0 4px 20px rgba(201,146,42,0.4)',
          transition:     'transform 0.2s ease',
        }}
      >
        {open ? '✕' : '✦'}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position:     'fixed',
          bottom:       88,
          right:        24,
          zIndex:       100,
          width:        320,
          maxHeight:    500,
          background:   'var(--bg2)',
          border:       '1px solid var(--border)',
          borderRadius: 8,
          display:      'flex',
          flexDirection:'column',
          overflow:     'hidden',
          boxShadow:    '0 8px 40px rgba(0,0,0,0.3)',
        }}>

          {/* Header */}
          <div style={{
            background:   'var(--gold)',
            padding:      '12px 16px',
            display:      'flex',
            alignItems:   'center',
            gap:          10,
          }}>
            <span style={{ fontSize: '1.1rem' }}>✦</span>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.88rem', color: '#000' }}>
                Arabic Tutor AI
              </div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(0,0,0,0.6)' }}>
                Ask anything about Arabic
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 340 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text3)' }}>
                <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: '1.4rem', color: 'var(--gold)', marginBottom: 8 }}>مرحباً</div>
                <div style={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
                  Ask me anything about Arabic — vocab, grammar, pronunciation, or dialect differences.
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth:     '85%',
                  padding:      '8px 12px',
                  borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  fontSize:     '0.82rem',
                  lineHeight:   1.5,
                  whiteSpace:   'pre-wrap',
                  background:   m.role === 'user' ? 'var(--gold)' : 'var(--bg3)',
                  color:        m.role === 'user' ? '#000' : 'var(--text)',
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ background: 'var(--bg3)', padding: '10px 14px', borderRadius: '12px 12px 12px 2px', display: 'flex', gap: 4 }}>
                  {[0, 150, 300].map(delay => (
                    <span key={delay} style={{
                      width: 6, height: 6, borderRadius: '50%', background: 'var(--text3)',
                      display: 'inline-block',
                      animation: `bounce 1s ${delay}ms infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding:   '10px 12px',
            borderTop: '1px solid var(--border)',
            display:   'flex',
            gap:       8,
          }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about Arabic..."
              disabled={loading}
              style={{
                flex:        1,
                background:  'var(--bg)',
                border:      '1px solid var(--border)',
                borderRadius: 6,
                padding:     '8px 12px',
                fontSize:    '0.82rem',
                color:       'var(--text)',
                outline:     'none',
              }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              style={{
                background:   'var(--gold)',
                color:        '#000',
                border:       'none',
                borderRadius: 6,
                padding:      '8px 12px',
                fontSize:     '0.88rem',
                fontWeight:   700,
                cursor:       'pointer',
                opacity:      loading || !input.trim() ? 0.4 : 1,
                transition:   'opacity 0.2s',
              }}
            >
              →
            </button>
          </div>

          <style>{`
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-4px); }
            }
          `}</style>
        </div>
      )}
    </>
  )
}
