import { NextResponse }        from 'next/server'
import Anthropic               from '@anthropic-ai/sdk'
import { createClient }        from '@/lib/supabase/server'
import { createAdminClient }   from '@/lib/supabase/admin'
import type { Profile, Streak } from '@/types'

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/ai/analyze
   Tutor-only: generates a Sonnet-powered student briefing.
───────────────────────────────────────────────────────────────────────────── */

const TUTOR_EMAILS = ['hadishokeir@gmail.com', 'hadishkeir123@gmail.com']
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !TUTOR_EMAILS.includes(user.email ?? '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { studentId } = await req.json()
    if (!studentId) return NextResponse.json({ error: 'studentId required' }, { status: 400 })

    const admin = createAdminClient()
    const [{ data: profile }, { data: streak }, { data: progress }] = await Promise.all([
      admin.from('profiles').select('*').eq('id', studentId).single(),
      admin.from('streaks').select('*').eq('user_id', studentId).single(),
      admin.from('user_progress').select('*').eq('user_id', studentId),
    ])

    const p  = profile  as Profile | null
    const s  = streak   as Streak  | null

    const prompt = `You are an expert Arabic language teaching assistant. Analyze this student and give the teacher a concise, actionable briefing.

STUDENT DATA:
- Name: ${p?.full_name ?? 'Unknown'}
- Goals: ${p?.goals ?? 'not specified'}
- Enrolled courses: ${(p?.enrolled_courses ?? []).join(', ') || 'none'}
- Total XP: ${s?.total_xp ?? 0}
- Current level: ${s?.current_level ?? 1}
- Current streak: ${s?.current_streak ?? 0} days
- Longest streak: ${s?.longest_streak ?? 0} days
- Courses with progress: ${Array.isArray(progress) ? progress.length : 0}

Respond with ONLY these 4 sections, each 2-3 bullet points max. Be specific, practical, and direct. No filler.

**Strengths**
**Areas to Focus On**
**Suggested Next Steps**
**Risk Flags** (skip if none)`

    const message = await client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 600,
      messages:   [{ role: 'user', content: prompt }],
    })

    const analysis = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ analysis })
  } catch (err) {
    console.error('AI analyze error:', err)
    return NextResponse.json({ error: 'Failed to generate analysis' }, { status: 500 })
  }
}
