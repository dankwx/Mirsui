'use server'

// Salvar as preferências de aviso por e-mail.
//
// Duas portas, como na migration 053 do backend:
//   - com token (o link do rodapé do e-mail): sem login, pela chave anon. O
//     token é um uuid aleatório por pessoa; quem tem o link é a pessoa.
//   - sem token: a pessoa logada, pelo auth.uid().

import { createClientForActions } from '@/utils/supabase/server'
import { supabasePublic } from '@/utils/supabase/public'

export interface Preferencias {
    seguidor: boolean
    saltos: boolean
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function lerLinha(data: unknown): Preferencias | null {
    const linha = Array.isArray(data) ? data[0] : null
    if (!linha || typeof linha.seguidor !== 'boolean' || typeof linha.saltos !== 'boolean') {
        return null
    }
    return { seguidor: linha.seguidor, saltos: linha.saltos }
}

export async function salvarPreferenciasDeEmail(entrada: {
    token: string | null
    seguidor?: boolean
    saltos?: boolean
}): Promise<Preferencias | null> {
    const seguidor = typeof entrada.seguidor === 'boolean' ? entrada.seguidor : null
    const saltos = typeof entrada.saltos === 'boolean' ? entrada.saltos : null
    if (seguidor === null && saltos === null) return null

    if (entrada.token) {
        if (!UUID.test(entrada.token)) return null
        const { data, error } = await supabasePublic.rpc('salvar_preferencias_pelo_token', {
            p_token: entrada.token,
            p_seguidor: seguidor,
            p_saltos: saltos,
        })
        if (error) {
            console.error('Preferências de e-mail (token):', error)
            return null
        }
        return lerLinha(data)
    }

    const supabase = await createClientForActions()
    const { data, error } = await supabase.rpc('salvar_minhas_preferencias_de_email', {
        p_seguidor: seguidor,
        p_saltos: saltos,
    })
    if (error) {
        console.error('Preferências de e-mail:', error)
        return null
    }
    return lerLinha(data)
}
