import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/* ─────────────────────────────────────────────────────────────────────────────
   Auth middleware — only runs on /portal/*, /tutor/*, and /login.
   Falls back gracefully if Supabase is unreachable (portal pages do their
   own server-side auth check as a second layer).
───────────────────────────────────────────────────────────────────────────── */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  try {
    let response = NextResponse.next({ request })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            )
            response = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              response.cookies.set(name, value, options as any),
            )
          },
        },
      },
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Protected — redirect to login if not authenticated
    if ((pathname.startsWith('/portal') || pathname.startsWith('/tutor')) && !user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }

    // Login page — redirect to portal if already authenticated
    if (pathname === '/login' && user) {
      const url = request.nextUrl.clone()
      url.pathname = '/portal'
      return NextResponse.redirect(url)
    }

    return response
  } catch {
    // Supabase unreachable on Edge — let the request through.
    // Each portal page does its own server-side auth check.
    return NextResponse.next()
  }
}

export const config = {
  // Only run middleware on routes that actually need auth checks
  matcher: ['/portal/:path*', '/tutor/:path*', '/login'],
}
