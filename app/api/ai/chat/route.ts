import { NextResponse }   from 'next/server'
import Anthropic          from '@anthropic-ai/sdk'
import { createClient }   from '@/lib/supabase/server'
import type { Profile }   from '@/types'

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/ai/chat
   Student AI tutor chat — answers Arabic learning questions using Haiku.
───────────────────────────────────────────────────────────────────────────── */

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { question } = await req.json()
    if (!question?.trim()) return NextResponse.json({ error: 'Question is required' }, { status: 400 })

    // Fetch student profile for personalised context
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, goals')
      .eq('id', user.id)
      .single()

    const p = profile as Pick<Profile, 'full_name' | 'goals'> | null

    const systemPrompt = `You are a helpful Arabic language tutor assistant for ${p?.full_name ?? 'a student'}.
${p?.goals ? `Their learning goals: ${p.goals}` : ''}

Rules:
1. Answer in concise bullet points — max 5 bullets
2. Each bullet is one clear, useful point — no filler
3. If showing Arabic, always include transliteration and English meaning
4. If the question is unrelated to Arabic language learning, politely redirect
5. End with one short encouragement if relevant
6. Total response under 150 words`

    const message = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 350,
      system:     systemPrompt,
      messages:   [{ role: 'user', content: question }],
    })

    const answer = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ answer })
  } catch (err) {
    console.error('AI chat error:', err)
    return NextResponse.json({ error: 'Failed to get answer' }, { status: 500 })
  }
}
