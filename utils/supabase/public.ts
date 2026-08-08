import 'server-only'
import { createClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase SEM cookies, para dados públicos que não dependem de quem
 * está olhando.
 *
 * Existe por causa do `unstable_cache`: ele não aceita função que leia cookies,
 * e o cliente de `utils/supabase/server.ts` lê. Sem este cliente, os dados
 * públicos da landing não teriam como ser cacheados e cada visita bateria no
 * banco de novo.
 *
 * Não use para nada que dependa do usuário logado: aqui não existe sessão, o
 * RLS enxerga sempre o papel `anon`.
 */
export const supabasePublic = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
)
