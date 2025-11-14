import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/how-it-works',
  '/auth/confirm',
  '/reset-password',
  '/check-email',
]

// Rotas de API públicas
const PUBLIC_API_ROUTES = [
  '/api/auth/',
]

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

  // Verificar se é rota pública
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route))
  const isPublicApiRoute = PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))

  if (isPublicRoute || isPublicApiRoute) {
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

  // Verificar sessão do usuário
  const { data: { session } } = await supabase.auth.getSession()

  // Se não houver sessão e a rota não for pública, redirecionar para login
  if (!session) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Se houver sessão mas está na página de login, redirecionar para feed
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/feed', request.url))
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
