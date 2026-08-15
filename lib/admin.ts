import 'server-only'

/**
 * Quem pode abrir /admin.
 *
 * Cópia deliberada da lista do backend (`src/lib/admins.ts`), e não um import:
 * são dois processos e dois deploys. O front usa isto para decidir entre
 * renderizar o painel e devolver 404; o backend usa a dele para decidir se
 * chama a service role. As duas checagens existem porque cada lado é a última
 * defesa do outro — quem chamar `GET /admin/overview` direto, sem passar pelo
 * Next, encontra a mesma porta.
 *
 * `server-only` no topo garante que a lista nunca entre num bundle de cliente.
 */
const PADRAO = ['danielkondlatsch.p@gmail.com']

const doAmbiente = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

const LISTA = doAmbiente.length > 0 ? doAmbiente : PADRAO

export function isAdmin(email: string | null | undefined): boolean {
    if (!email) return false
    return LISTA.includes(email.trim().toLowerCase())
}
