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

/**
 * Rotas públicas por correspondência exata.
 *
 * A '/' não está aqui: ela tem tratamento próprio mais abaixo, porque além de
 * ser pública é a única que manda quem já está logado para outro lugar.
 */
const PUBLIC_EXACT = [
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

/**
 * Existe cookie de sessão do Supabase nesta requisição?
 *
 * É uma pergunta de string, sem ida à rede, e é ela que separa as duas
 * populações que pedem a home. Robô e visitante deslogado não têm cookie: saem
 * daqui direto para o HTML estático do CDN, sem tocar no Supabase. Só quem
 * traz cookie paga a validação, e são algumas dezenas por dia.
 *
 * O nome é `sb-<ref>-auth-token`, e o @supabase/ssr o fatia em `.0`, `.1`
 * quando o token não cabe num cookie só — daí a checagem ser por pedaço do
 * nome, e não por igualdade.
 */
function temCookieDeSessao(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some((c) => c.name.startsWith('sb-') && c.name.includes('-auth-token'))
}

/**
 * Valida a sessão junto ao Supabase.
 *
 * getUser() bate no servidor de auth. getSession() apenas lê o cookie, sem
 * validar, e não serve para proteger rota. Devolve também a `response` porque
 * é nela que o @supabase/ssr grava o token renovado.
 */
async function validarSessao(request: NextRequest) {
  const response = NextResponse.next({
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { user, response }
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

  /**
   * A home, que é estática (ver app/(public)/page.tsx).
   *
   * O "quem já está logado vai para o /feed" morava dentro da página, e era
   * ele que a obrigava a renderizar do zero para TODO visitante — uma regra
   * que interessa a algumas dezenas de pessoas por dia fazia milhares de robôs
   * pagarem 241 KB de banco cada um. Aqui em cima a mesma regra custa uma
   * leitura de cookie.
   *
   * A ordem importa: sem cookie devolvemos `NextResponse.next()` PURO.
   * Qualquer resposta que escreva cookie faz a Vercel pular o cache e servir a
   * página pelo servidor, que é justamente o que paramos de fazer — por isso o
   * cliente do Supabase nem chega a ser criado neste caminho.
   */
  if (pathname === '/') {
    if (!temCookieDeSessao(request)) return NextResponse.next()

    const { user, response } = await validarSessao(request)
    if (user) return NextResponse.redirect(new URL('/feed', request.url))

    // Cookie vencido ou inválido: segue para a landing mesmo. A `response`
    // leva junto a limpeza que o @supabase/ssr fez dos cookies mortos, senão
    // a pessoa ficaria presa pagando esta validação a cada visita.
    return response
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  const { user, response } = await validarSessao(request)

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
     * - ingest (proxy do PostHog)
     *
     * O /ingest fica de fora aqui, e não em PUBLIC_PREFIXES, porque assim o
     * middleware nem chega a ser invocado — e invocação é o que a Vercel
     * cobra.
     *
     * Ele é o reverse proxy do PostHog montado no next.config.mjs, e o
     * visitante deslogado é o caso NORMAL dele: o conteúdo é aberto, então
     * quase todo evento de analytics nasce sem sessão. Sem esta exceção o
     * middleware não reconhecia a rota como pública, respondia 307 para "/",
     * e cada evento — pageview, pageleave, cada clique do autocapture —
     * virava um render inteiro da landing. Eram 36 mil renders por dia, 241
     * KB de egress no Supabase e 239 KB de HTML em cada um: as três cotas
     * do plano gratuito estouradas de uma vez, por analytics.
     */
    '/((?!_next/static|_next/image|favicon.ico|ingest|.*\\..*|api/auth).*)',
  ],
}
