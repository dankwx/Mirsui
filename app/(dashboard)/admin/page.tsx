import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { isAdmin } from '@/lib/admin'
import LandingFooter from '@/components/Footer/LandingFooter'
import PainelDoDono from '@/components/Admin/Painel'
import { getOverview } from './get-overview'

export const metadata: Metadata = {
    title: 'Painel - Mirsui',
    // A página lista e-mails de contas reais. Fora do índice, e sem preview
    // em link compartilhado por engano.
    robots: { index: false, follow: false },
}

// Lê a sessão e chama o backend: nada aqui pode ser cacheado nem pré-renderizado.
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    const supabase = await createClient()

    // getUser() valida o token no Supabase; getSession() só lê o cookie e não
    // serve para decidir permissão. O middleware já garante que existe sessão
    // (a rota não está na lista de públicas), então o que falta é saber de quem.
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 404 e não "acesso negado": uma tela de negação confirma que a rota
    // existe. O backend responde 404 pela mesma razão.
    if (!isAdmin(user?.email)) {
        notFound()
    }

    const { painel, erro } = await getOverview()

    return (
        <div className="flex min-h-[calc(100dvh-72px)] flex-col">
            <div className="flex-1">
                {painel ? (
                    <PainelDoDono dados={painel} />
                ) : (
                    <div className="mx-auto grid min-h-[50vh] w-full max-w-[1320px] place-items-center px-5 text-center sm:px-10">
                        <div>
                            <p className="text-[19px] font-bold tracking-[-0.02em] text-mir-text">
                                O painel não carregou.
                            </p>
                            <p className="mt-1.5 text-[14px] text-mir-text2">
                                {erro ?? 'Motivo desconhecido.'} Nenhum número
                                aqui está zerado: eles não chegaram.
                            </p>
                        </div>
                    </div>
                )}
            </div>
            <LandingFooter compact />
        </div>
    )
}
