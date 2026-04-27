import { NextResponse }      from 'next/server'
import Anthropic             from '@anthropic-ai/sdk'
import { createClient }      from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/homework/submit
   Body: { homeworkId: string, content: string }

   1. Verifies the student is authenticated
   2. Checks homework belongs to this student
   3. Inserts submission row
   4. Calls Claude Haiku to generate feedback + score
   5. Patches submission with feedback and returns it
───────────────────────────────────────────────────────────────────────────── */

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

    const { homeworkId, content } = await req.json() as { homeworkId?: string; content?: string }
    if (!homeworkId || !content?.trim()) {
      return NextResponse.json({ error: 'homeworkId and content are required' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Verify homework belongs to this student
    const { data: hw } = await admin
      .from('homework')
      .select('id, title, instructions')
      .eq('id', homeworkId)
      .eq('student_id', user.id)
      .single()

    if (!hw) return NextResponse.json({ error: 'Homework not found' }, { status: 404 })

    // Check for existing submission (no re-submission)
    const { data: existing } = await admin
      .from('homework_submissions')
      .select('id')
      .eq('homework_id', homeworkId)
      .eq('student_id', user.id)
      .single()

    if (existing) return NextResponse.json({ error: 'Already submitted' }, { status: 409 })

    // Insert submission (no feedback yet)
    const { data: submission, error: insertErr } = await admin
      .from('homework_submissions')
      .insert({ homework_id: homeworkId, student_id: user.id, content: content.trim() })
      .select()
      .single()

    if (insertErr || !submission) {
      return NextResponse.json({ error: 'Could not save submission' }, { status: 500 })
    }

    // Generate AI feedback (Claude Haiku — fast and cheap)
    let ai_feedback: string | null = null
    let score: number | null = null

    try {
      const msg = await anthropic.messages.create({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: `You are a skilled Arabic language teacher giving constructive homework feedback.
Be encouraging but precise. Identify what was done well, what can improve, and give a specific tip.
End with a score from 0-100 on this line exactly: SCORE: <number>`,
        messages: [{
          role:    'user',
          content: `Homework title: "${hw.title}"\n\nInstructions:\n${hw.instructions}\n\nStudent answer:\n${content.trim()}`,
        }],
      })

      const raw = msg.content[0].type === 'text' ? msg.content[0].text : ''
      const scoreMatch = raw.match(/SCORE:\s*(\d+)/)
      if (scoreMatch) {
        score = Math.min(100, Math.max(0, parseInt(scoreMatch[1], 10)))
      }
      ai_feedback = raw.replace(/SCORE:\s*\d+\s*$/, '').trim()
    } catch {
      // Feedback generation failed — submission still saved
      ai_feedback = null
    }

    // Patch submission with feedback
    const { data: updated } = await admin
      .from('homework_submissions')
      .update({ ai_feedback, score })
      .eq('id', submission.id)
      .select()
      .single()

    return NextResponse.json({ submission: updated ?? { ...submission, ai_feedback, score } })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
