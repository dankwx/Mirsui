'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { PerfilSemeado, Semeados } from '@/utils/painelTypes'
import FotoDePerfil from '@/components/FotoDePerfil'

/* ------------------------------------------------------------------ *
 * Formatação — a mesma régua do Painel: "12 nov 25", sem preposição.
 * ------------------------------------------------------------------ */

const nf = new Intl.NumberFormat('pt-BR')
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const dd = (n: number) => String(n).padStart(2, '0')

function dataCurta(iso: string): string {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return '—'
    return `${dd(d.getDate())} ${MESES[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`
}

const FAIXA = 'mx-auto w-full max-w-[1320px] px-5 sm:px-10'

// O mesmo fundo que fica por baixo de todo avatar do site (ProfileHeader,
// Header): quando a foto não carrega, sobra o orbe e não um quadrado vazio.
const AVATAR_GRADIENT =
    'radial-gradient(130% 130% at 30% 22%,#f3ecdb 0%,#cdef36 20%,#c14a26 52%,#16120c 88%)'

/* ------------------------------------------------------------------ *
 * A linha
 *
 * Cada linha guarda a própria foto: o "Trocar foto" responde com a URL nova
 * (com outro `?v=`) e o nome do JPEG, e é só isso que muda — a página não
 * recarrega, e as outras linhas nem ficam sabendo.
 * ------------------------------------------------------------------ */

function Linha({
    perfil,
    poolVazio,
    aoTrocar,
}: {
    perfil: PerfilSemeado
    poolVazio: boolean
    aoTrocar: () => void
}) {
    const [foto, setFoto] = useState({
        avatar_url: perfil.avatar_url,
        image_file: perfil.image_file,
    })
    const [trocando, setTrocando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    const trocar = async () => {
        setTrocando(true)
        setErro(null)
        try {
            const res = await fetch(`/api/admin/seed/${perfil.id}/trocar-foto`, {
                method: 'POST',
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data?.error || `O backend respondeu ${res.status}.`)
            }
            setFoto({ avatar_url: data.avatar_url, image_file: data.image_file })
            aoTrocar()
        } catch (err) {
            console.error('Erro ao trocar a foto do semeado:', err)
            setErro(err instanceof Error ? err.message : 'Erro ao trocar a foto')
        } finally {
            setTrocando(false)
        }
    }

    const nome = perfil.username ? `@${perfil.username}` : 'sem username'

    return (
        <tr className="border-b border-mir-line align-middle">
            <td className="py-2.5 pr-3">
                <span
                    className="block h-10 w-10 overflow-hidden rounded-full ring-1 ring-mir-line2"
                    style={{ background: AVATAR_GRADIENT }}
                >
                    {/* `key` na URL: a troca devolve o mesmo objeto com outro
                        `?v=`, e o FotoDePerfil já zera o estado de quebrado por
                        `src`, mas recriar o <img> garante que o navegador não
                        reaproveita o pixel antigo em nenhum caso. */}
                    <FotoDePerfil
                        key={foto.avatar_url ?? ''}
                        src={foto.avatar_url}
                        className="h-full w-full object-cover"
                    />
                </span>
            </td>
            <td className="py-2.5 pr-4">
                {perfil.username ? (
                    <Link
                        href={`/user/${perfil.username}`}
                        className="font-mono text-[13.5px] font-semibold text-mir-text transition-colors hover:text-mir-warm"
                    >
                        {nome}
                    </Link>
                ) : (
                    <span className="font-mono text-[13.5px] text-mir-text3">
                        {nome}
                    </span>
                )}
                <p className="truncate text-[12.5px] text-mir-text3">
                    {perfil.display_name ?? '—'}
                </p>
            </td>
            <td className="hidden py-2.5 pr-4 font-mono text-[11.5px] text-mir-text3 md:table-cell">
                <span className="block max-w-[200px] truncate" title={foto.image_file}>
                    {foto.image_file}
                </span>
            </td>
            <td className="hidden py-2.5 pr-4 font-mono text-[11.5px] text-mir-text3 sm:table-cell">
                {perfil.batch}
            </td>
            <td
                className={`py-2.5 pr-4 text-right font-mono text-[12.5px] tabular-nums ${
                    perfil.fichas > 0 ? 'text-mir-text' : 'text-mir-text3'
                }`}
            >
                {perfil.fichas}
            </td>
            <td className="hidden py-2.5 pr-4 font-mono text-[11.5px] tabular-nums text-mir-text3 sm:table-cell">
                {dataCurta(perfil.created_at)}
            </td>
            <td className="py-2.5 text-right">
                <button
                    type="button"
                    onClick={trocar}
                    disabled={trocando || poolVazio}
                    className="rounded-full border border-mir-line2 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-mir-text2 transition-colors hover:border-mir-text3 hover:text-mir-text disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {trocando ? 'trocando…' : 'Trocar foto'}
                </button>
                {erro && (
                    <p className="mt-1 text-right text-[11.5px] text-mir-warm">
                        {erro}
                    </p>
                )}
            </td>
        </tr>
    )
}

/* ------------------------------------------------------------------ *
 * A lista
 * ------------------------------------------------------------------ */

export default function PerfisSemeados({ dados }: { dados: Semeados }) {
    // Cada troca tira uma foto do pool e devolve nenhuma (a antiga é apagada):
    // o contador do cabeçalho desce junto, sem pedir a página de novo.
    const [pool, setPool] = useState(dados.pool)

    const paginas = Math.max(1, Math.ceil(dados.total / dados.limit))
    const inicio = dados.total === 0 ? 0 : (dados.page - 1) * dados.limit + 1
    const fim = Math.min(dados.page * dados.limit, dados.total)

    return (
        <div className="pb-24">
            <div className={FAIXA}>
                <header className="pt-7">
                    <Link
                        href="/admin"
                        className="font-mono text-[11px] uppercase tracking-[0.12em] text-mir-text3 transition-colors hover:text-mir-text"
                    >
                        ← painel
                    </Link>
                    <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                        <h1 className="text-[clamp(28px,2.8vw,36px)] font-extrabold leading-none tracking-[-0.04em] text-mir-text">
                            Perfis semeados
                        </h1>
                        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mir-text3">
                            fotos no pool: {nf.format(pool)}
                        </span>
                    </div>
                    <p className="mt-4 max-w-[64ch] text-[17px] leading-[1.45] text-mir-text2">
                        <b className="font-bold text-mir-text">
                            {nf.format(dados.total)}{' '}
                            {dados.total === 1 ? 'perfil semeado' : 'perfis semeados'}
                        </b>
                        {dados.total > 0 && (
                            <>
                                , do mais novo para o mais velho. Mostrando{' '}
                                {inicio}–{fim}.
                            </>
                        )}
                        {pool === 0 && (
                            <> O pool de fotos acabou: nada mais pode ser trocado.</>
                        )}
                    </p>
                </header>

                <section className="mt-8">
                    {dados.profiles.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-t border-mir-line text-left">
                                <thead>
                                    <tr className="border-b border-mir-line">
                                        <th className="w-10 py-2 pr-3" />
                                        <Cabecalho>perfil</Cabecalho>
                                        <Cabecalho className="hidden md:table-cell">
                                            foto
                                        </Cabecalho>
                                        <Cabecalho className="hidden sm:table-cell">
                                            lote
                                        </Cabecalho>
                                        <Cabecalho className="text-right">
                                            fichas
                                        </Cabecalho>
                                        <Cabecalho className="hidden sm:table-cell">
                                            entrou
                                        </Cabecalho>
                                        <th className="py-2" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {dados.profiles.map((p) => (
                                        <Linha
                                            key={p.id}
                                            perfil={p}
                                            poolVazio={pool === 0}
                                            aoTrocar={() =>
                                                setPool((n) => Math.max(0, n - 1))
                                            }
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="border-y border-mir-line py-7 text-center text-[14px] text-mir-text3">
                            Nenhum perfil semeado. O script{' '}
                            <code className="font-mono text-mir-text2">
                                seed:perfis
                            </code>{' '}
                            no backend é quem cria.
                        </p>
                    )}
                </section>

                {paginas > 1 && (
                    <nav className="mt-6 flex items-center justify-between font-mono text-[11.5px] uppercase tracking-[0.1em] text-mir-text3">
                        <PaginaLink
                            page={dados.page - 1}
                            ativo={dados.page > 1}
                        >
                            ← anteriores
                        </PaginaLink>
                        <span>
                            página {dados.page} de {paginas}
                        </span>
                        <PaginaLink
                            page={dados.page + 1}
                            ativo={dados.page < paginas}
                        >
                            próximos →
                        </PaginaLink>
                    </nav>
                )}
            </div>
        </div>
    )
}

function Cabecalho({
    children,
    className = '',
}: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <th
            className={`py-2 pr-4 font-mono text-[10.5px] font-normal uppercase tracking-[0.12em] text-mir-text3 ${className}`}
        >
            {children}
        </th>
    )
}

function PaginaLink({
    page,
    ativo,
    children,
}: {
    page: number
    ativo: boolean
    children: React.ReactNode
}) {
    if (!ativo) return <span className="opacity-40">{children}</span>
    return (
        <Link
            href={`/admin/perfis?page=${page}`}
            className="transition-colors hover:text-mir-text"
        >
            {children}
        </Link>
    )
}
