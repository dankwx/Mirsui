import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// O conteúdo do Mirsui é aberto. Login serve para AGIR (salvar, botar ficha,
// seguir, comentar), não para OLHAR — mesmo modelo de Letterboxd e Last.fm.
//
// O motivo prático: um link de faixa mandado no WhatsApp precisa abrir para
// quem clica. Com o gate anterior, qualquer visitante caía num redirect para a
// landing, e o único canal de crescimento que um site deste tamanho tem é o
// compartilhamento.
//
// As páginas já estavam prontas para isso — track, artist e user calculam
// `isLoggedIn` e adaptam a interface. O cadeado era só este arquivo.

/** Rotas públicas por correspondência exata. */
const PUBLIC_EXACT = [
  '/',
  '/termos',
  '/privacidade',
  '/auth/check-email',
  '/reset-password',
]

/** Prefixos públicos: a própria rota e tudo abaixo dela. */
const PUBLIC_PREFIXES = [
  '/track', // ficha da faixa
  '/artist', // página do artista
  '/user', // perfil público
  '/feed', // o que a cena andou salvando
  '/pilha', // o catálogo que o Observatório mede
  '/auth/confirm',
  '/auth/callback',
]

// Segue exigindo sessão:
//   /stakes — estado de jogo pessoal (as fichas de quem está logado)

// Rotas de API públicas
const PUBLIC_API_ROUTES = [
  '/api/auth/',
  // Imagens de compartilhamento (selo, card da home). Precisam ser abertas:
  // crawler de WhatsApp/Twitter/Facebook nunca chega autenticado, então com o
  // gate de sessão elas respondiam 307 para "/" e o preview saía vazio.
  '/api/og/',
]

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.includes(pathname)) return true

  const isPublicPrefix = PUBLIC_PREFIXES.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  )
  const isPublicApiRoute = PUBLIC_API_ROUTES.some(route =>
    pathname.startsWith(route)
  )
  return isPublicPrefix || isPublicApiRoute
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
