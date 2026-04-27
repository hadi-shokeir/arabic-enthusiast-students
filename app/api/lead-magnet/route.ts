import { NextResponse }      from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/lead-magnet
   Body: { email: string, resource_id: string, source?: string }

   Saves the email to the lead_captures table in Supabase.
   Does NOT send an email (Resend not yet configured).
   Returns { success: true, download_url: string | null }
───────────────────────────────────────────────────────────────────────────── */

// Map resource slugs to download URLs (update when PDFs are ready)
const DOWNLOAD_URLS: Record<string, string | null> = {
  'quranic-taster':   null,  // Replace with real URL when PDF is ready
  'levantine-phrases': null,
  'alphabet-workbook': null,
}

export async function POST(req: Request) {
  try {
    const { email, resource_id, source } =
      await req.json() as { email?: string; resource_id?: string; source?: string }

    if (!email || !resource_id) {
      return NextResponse.json({ error: 'email and resource_id required' }, { status: 400 })
    }

    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRx.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Upsert — prevent duplicate entries for same email + resource
    await admin.from('lead_captures').upsert(
      { email: email.toLowerCase().trim(), resource_id, source: source ?? 'resources_page' },
      { onConflict: 'email,resource_id', ignoreDuplicates: true }
    )

    const download_url = DOWNLOAD_URLS[resource_id] ?? null

    return NextResponse.json({ success: true, download_url })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
