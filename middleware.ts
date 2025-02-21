import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if we're on a custom subdomain
  const url = req.nextUrl.clone()
  const hostname = req.headers.get("host") || ""
  const currentHost = hostname.split(":")[0]
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN

  if (currentHost !== rootDomain) {
    // We're on a custom subdomain
    const tenant = currentHost.split(".")[0]

    // If the user is not logged in and trying to access a protected route, redirect to login
    if (!user && !url.pathname.startsWith("/login") && !url.pathname.startsWith("/signup")) {
      return NextResponse.redirect(new URL(`/login`, req.url))
    }

    // If the user is logged in but doesn't belong to this tenant, redirect to their own tenant
    if (user && user.user_metadata.tenant_name !== tenant) {
      return NextResponse.redirect(new URL(`https://${user.user_metadata.tenant_name}.${rootDomain}`, req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}

