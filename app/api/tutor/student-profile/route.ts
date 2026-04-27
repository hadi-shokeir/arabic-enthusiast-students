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
    const [{ data: profile }, { data: { user: authUser } }] = await Promise.all([
      admin.from('profiles').select('*').eq('id', id).single(),
      admin.auth.admin.getUserById(id),
    ])

    return NextResponse.json({
      profile: profile ?? null,
      email:   authUser?.email ?? '',
    })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !TUTOR_EMAILS.includes(user.email ?? '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const body = await req.json()
    const admin = createAdminClient()
    const { data, error } = await admin.from('profiles').update(body).eq('id', id).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ profile: data })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
