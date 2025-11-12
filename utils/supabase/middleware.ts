import { NextResponse, type NextRequest } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

// Função auxiliar para obter o nome do cookie do Supabase
function getSupabaseCookieName(): string {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const projectId = supabaseUrl.split('//')[1]?.split('.')[0] || 'unknown'
    return `sb-${projectId}-auth-token`
}

export async function updateSession(request: NextRequest) {
    const response = NextResponse.next({
        request,
    })

    // Rotas públicas que não precisam de autenticação
    const publicPaths = [
        '/login',
        '/auth',
        '/reset-password',
        '/',
        '/how-it-works',
        '/user',
        '/logout'
    ]

    const isPublicPath = publicPaths.some(path => 
        request.nextUrl.pathname === path || 
        request.nextUrl.pathname.startsWith(path + '/')
    )

    // Se for rota pública, deixa passar
    if (isPublicPath) {
        return response
    }

    // Buscar o token do cookie
    const cookieName = getSupabaseCookieName()
    const cookieValue = request.cookies.get(cookieName)?.value

    if (!cookieValue) {
        console.log(`[Middleware] Sem cookie em ${request.nextUrl.pathname}`)
        // Sem token, redirecionar para home (modal de login)
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    try {
        // Parsear o cookie para pegar o access_token
        const session = JSON.parse(cookieValue)
        const accessToken = session.access_token

        if (!accessToken) {
            console.log(`[Middleware] Token não encontrado no cookie`)
            throw new Error('Token não encontrado no cookie')
        }

        // Verificar o token com o backend
        const verifyResponse = await fetch(`${BACKEND_URL}/auth/verify`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            // Timeout de 5 segundos
            signal: AbortSignal.timeout(5000)
        })

        if (!verifyResponse.ok) {
            console.log(`[Middleware] Verificação falhou: ${verifyResponse.status}`)
            // Token inválido, redirecionar para home (modal de login)
            const url = request.nextUrl.clone()
            url.pathname = '/'
            return NextResponse.redirect(url)
        }

        const data = await verifyResponse.json()

        if (!data.authenticated) {
            console.log(`[Middleware] Não autenticado`)
            // Não autenticado, redirecionar para home (modal de login)
            const url = request.nextUrl.clone()
            url.pathname = '/'
            return NextResponse.redirect(url)
        }

        console.log(`[Middleware] ✅ Autenticado - permitindo acesso a ${request.nextUrl.pathname}`)
        // Token válido, deixar passar
        return response

    } catch (error) {
        console.error('[Middleware] Erro ao verificar autenticação:', error)
        // Em caso de erro de conexão, deixar passar (fail open)
        // Isso evita que o site fique inacessível se o backend estiver offline
        if (error instanceof Error && error.name === 'AbortError') {
            console.log('[Middleware] Timeout na verificação - permitindo acesso')
            return response
        }
        // Em caso de erro, redirecionar para home (modal de login)
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }
}
