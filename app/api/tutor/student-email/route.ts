import { NextResponse }      from 'next/server'
import { createClient }      from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const TUTOR_EMAILS = ['hadishokeir@gmail.com', 'hadishkeir123@gmail.com']

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !TUTOR_EMAILS.includes(user.email ?? '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const admin = createAdminClient()
    const { data: { user: targetUser } } = await admin.auth.admin.getUserById(id)
    return NextResponse.json({ email: targetUser?.email ?? '' })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
