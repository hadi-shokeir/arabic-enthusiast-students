import { NextResponse }      from 'next/server'
import { createClient }      from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const TUTOR_EMAILS = ['hadishokeir@gmail.com', 'hadishkeir123@gmail.com']

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !TUTOR_EMAILS.includes(user.email ?? '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { studentId, title, instructions, due_date } =
      await req.json() as { studentId?: string; title?: string; instructions?: string; due_date?: string | null }

    if (!studentId || !title?.trim() || !instructions?.trim()) {
      return NextResponse.json({ error: 'studentId, title, and instructions required' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: homework, error } = await admin
      .from('homework')
      .insert({
        tutor_id:     user.id,
        student_id:   studentId,
        title:        title.trim(),
        instructions: instructions.trim(),
        due_date:     due_date ?? null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ homework })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
