// Quais avisos por e-mail a pessoa recebe.
//
// Abre de dois jeitos: pelo link "Parar estes avisos" do rodapé do e-mail
// (?token=, sem login) ou logado, pelo "Editar perfil". O token vale mais que a
// sessão: quem clicou no e-mail está mexendo nos avisos daquele e-mail.

import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import shellStyles from '@/components/Club/ClubShell.module.css'
import PreferenciasDeEmail from '@/components/Emails/PreferenciasDeEmail'
import type { Preferencias } from '@/components/Emails/actions'
import { createClient } from '@/utils/supabase/server'
import { supabasePublic } from '@/utils/supabase/public'
import styles from './page.module.css'

export const metadata: Metadata = {
    title: 'Avisos por e-mail - Mirsui',
    robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function lerLinha(data: unknown): Preferencias | null {
    const linha = Array.isArray(data) ? data[0] : null
    if (!linha || typeof linha.seguidor !== 'boolean' || typeof linha.saltos !== 'boolean') {
        return null
    }
    return { seguidor: linha.seguidor, saltos: linha.saltos }
}

export default async function EmailsPage({
    searchParams,
}: {
    searchParams: { token?: string | string[] }
}) {
    const bruto = typeof searchParams.token === 'string' ? searchParams.token.trim() : ''
    const token = UUID.test(bruto) ? bruto.toLowerCase() : null

    let prefs: Preferencias | null = null
    let falhou = false

    if (token) {
        const { data, error } = await supabasePublic.rpc('preferencias_pelo_token', {
            p_token: token,
        })
        falhou = Boolean(error)
        prefs = lerLinha(data)
    } else {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) redirect('/')
        const { data, error } = await supabase.rpc('minhas_preferencias_de_email')
        falhou = Boolean(error)
        prefs = lerLinha(data)
    }

    return (
        <div className={`${shellStyles.container} ${styles.pagina}`}>
            <div className={styles.coluna}>
                <h1 className={styles.titulo}>Avisos por e-mail</h1>
                {prefs ? (
                    <PreferenciasDeEmail token={token} inicial={prefs} />
                ) : (
                    <p className={styles.aviso}>
                        {falhou
                            ? 'Não carregou agora. Tente de novo em instantes.'
                            : 'Este link não vale mais. Entre na sua conta e abra "Editar perfil".'}
                    </p>
                )}
            </div>
        </div>
    )
}
