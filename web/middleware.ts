import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import createIntlMiddleware from 'next-intl/middleware'

const PUBLIC_PATHS = [
  '/auth/signin',
  '/auth/signup',
  '/api/auth',
  '/api/health',
  '/_next',
  '/favicon',
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  // Always run next-intl middleware first to set up locale context
  const handleI18n = createIntlMiddleware({
    locales: ['en', 'it'],
    defaultLocale: 'en',
    localeDetection: false,
    localePrefix: 'never',
  })
  const i18nResponse = handleI18n(req)

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return i18nResponse

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = '/auth/signin'
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  // Require onboarding (inviteCode) before accessing the app
  if (!(token as any).inviteCode && pathname !== '/onboarding' && !pathname.startsWith('/api/onboarding')) {
    const url = req.nextUrl.clone()
    url.pathname = '/onboarding'
    return NextResponse.redirect(url)
  }

  return i18nResponse
}

export const config = {
  // Run on all pages except API routes and static assets
  matcher: ['/((?!api|_next/static|_next/image|.*\\.\w+$|favicon.ico).*)'],
}
