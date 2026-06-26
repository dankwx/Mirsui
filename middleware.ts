import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = [
  '/',
  '/how-it-works',
  '/termos',
  '/privacidade',
  '/auth/confirm',
  '/auth/callback',
  '/auth/check-email',
  '/reset-password',
  '/check-email',
]

// Rotas de API públicas
const PUBLIC_API_ROUTES = [
  '/api/auth/',
]

function isPublicPath(pathname: string): boolean {
  const isPublicRoute = PUBLIC_ROUTES.some(route =>
    route === '/'
      ? pathname === '/'
      : pathname === route || pathname.startsWith(`${route}/`)
  )
  const isPublicApiRoute = PUBLIC_API_ROUTES.some(route =>
    pathname.startsWith(route)
  )
  return isPublicRoute || isPublicApiRoute
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir arquivos estáticos e imagens
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Criar cliente Supabase para validar sessão
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // getUser() valida o token junto ao Supabase (getSession() apenas lê o cookie,
  // sem validar — não deve ser usado para proteger rotas)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Não há mais página de login: usuários não autenticados voltam para a
    // home (landing), onde o login/registro acontece via modal.
    const redirectUrl = new URL('/', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)',
  ],
}
