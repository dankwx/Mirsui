import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { isAdmin } from '@/lib/admin'
import LandingFooter from '@/components/Footer/LandingFooter'
import PerfisSemeados from '@/components/Admin/PerfisSemeados'
import { getSemeados } from './get-semeados'

export const metadata: Metadata = {
    title: 'Perfis semeados - Mirsui',
    // A página diz quais perfis são semeados. Fora do índice.
    robots: { index: false, follow: false },
}

// Lê a sessão e chama o backend: nada aqui pode ser cacheado nem pré-renderizado.
export const dynamic = 'force-dynamic'

export default async function PerfisSemeadosPage({
    searchParams,
}: {
    searchParams: { page?: string }
}) {
    const supabase = await createClient()

    // Mesma porta de /admin: getUser() valida o token, e quem não é dono
    // recebe 404 — uma tela de negação confirmaria que a rota existe.
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!isAdmin(user?.email)) {
        notFound()
    }

    const page = Math.max(Math.floor(Number(searchParams.page) || 1), 1)
    const { semeados, erro } = await getSemeados(page)

    return (
        <div className="flex min-h-[calc(100dvh-72px)] flex-col">
            <div className="flex-1">
                {semeados ? (
                    <PerfisSemeados dados={semeados} />
                ) : (
                    <div className="mx-auto grid min-h-[50vh] w-full max-w-[1320px] place-items-center px-5 text-center sm:px-10">
                        <div>
                            <p className="text-[19px] font-bold tracking-[-0.02em] text-mir-text">
                                A lista não carregou.
                            </p>
                            <p className="mt-1.5 text-[14px] text-mir-text2">
                                {erro}
                            </p>
                        </div>
                    </div>
                )}
            </div>
            <LandingFooter />
        </div>
    )
}
