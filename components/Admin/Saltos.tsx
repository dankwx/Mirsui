'use client'

// components/Admin/Saltos.tsx
//
// A fila de saltos de audiência do painel (/admin/saltos). A rodada das 05:00
// põe aqui toda faixa que subiu 25 pontos ou mais em 10 dias (migration 052);
// o dono pesquisa, escreve o porquê com a fonte e publica. Só o que ele
// publica aparece na página da faixa, como um número na curva e a nota
// embaixo dela.
//
// Uma nota pode explicar vários saltos: quando várias faixas sobem pelo mesmo
// motivo (os funks da eleição), seleciona todas e escreve uma vez.

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode, Ref } from 'react'
import { popScore } from '@/utils/popScore'
import { enderecoDaFaixa } from '@/utils/trackHref'
import type {
    FilaDeSaltos as Fila,
    SaltoDoPainel,
    StatusDoSalto,
} from '@/utils/saltosTypes'

/* ------------------------------------------------------------------ *
 * Formatação
 * ------------------------------------------------------------------ */

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const FAIXA = 'mx-auto w-full max-w-[1320px] px-5 sm:px-10'
const DIA_MS = 86_400_000

/** "2026-10-27" → "27 out". As datas do banco são dias UTC. */
function dia(iso: string): string {
    const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`)
    if (Number.isNaN(d.getTime())) return '—'
    return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]}`
}

function diaComAno(iso: string): string {
    const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`)
    if (Number.isNaN(d.getTime())) return '—'
    return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

function diasEntre(a: string, b: string): number {
    return Math.round(
        (Date.parse(`${b.slice(0, 10)}T00:00:00Z`) -
            Date.parse(`${a.slice(0, 10)}T00:00:00Z`)) /
            DIA_MS
    )
}

function capa(md5: string | null): string | null {
    return md5
        ? `https://cdn-images.dzcdn.net/images/cover/${md5}/250x250-000000-80-0-0.jpg`
        : null
}

function enderecoDoSalto(s: SaltoDoPainel): string {
    return s.faixa.isrc
        ? enderecoDaFaixa(s.faixa.isrc, s.faixa.artist_name, s.faixa.title)
        : `/track/${s.faixa.deezer_track_id}`
}

/* ------------------------------------------------------------------ *
 * Onde pesquisar
 *
 * O título sem o que vem entre parênteses ("(Ao Vivo)", "(Remastered)"):
 * notícia não cita a edição. A busca do Google vai presa ao período do
 * salto, de duas semanas antes a três dias depois.
 * ------------------------------------------------------------------ */

function buscas(s: SaltoDoPainel): { nome: string; href: string }[] {
    const titulo =
        s.faixa.title.replace(/\s*[([].*?[)\]]\s*/g, ' ').trim() ||
        s.faixa.title
    const artista = s.faixa.artist_name
    const q = (t: string) => encodeURIComponent(t)
    const mdY = (deslocamento: number) => {
        const d = new Date(Date.parse(`${s.dia}T00:00:00Z`) + deslocamento * DIA_MS)
        return `${d.getUTCMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`
    }

    return [
        {
            nome: 'Google Notícias',
            href: `https://news.google.com/search?q=${q(`"${artista}" "${titulo}"`)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`,
        },
        {
            nome: 'Google no período',
            href: `https://www.google.com/search?q=${q(`"${artista}" ${titulo}`)}&tbs=cdr:1,cd_min:${mdY(-14)},cd_max:${mdY(3)}`,
        },
        {
            nome: 'TikTok',
            href: `https://www.tiktok.com/search?q=${q(`${artista} ${titulo}`)}`,
        },
        {
            nome: 'YouTube',
            href: `https://www.youtube.com/results?search_query=${q(`${artista} ${titulo}`)}`,
        },
        {
            nome: 'X',
            href: `https://x.com/search?q=${q(`"${titulo}" ${artista}`)}&f=live`,
        },
    ]
}

/* ------------------------------------------------------------------ *
 * A curvinha: o rank do mês em volta do salto, em degraus (o histórico
 * guarda só mudança), com o dia do salto marcado.
 * ------------------------------------------------------------------ */

function Curvinha({ serie, diaDoSalto }: { serie: SaltoDoPainel['serie']; diaDoSalto: string }) {
    const L = 168
    const A = 44
    const P = 4

    if (serie.length === 0) return null

    const hoje = new Date().toISOString().slice(0, 10)
    const t0 = Date.parse(`${serie[0].d}T00:00:00Z`)
    const t1 = Math.max(
        Date.parse(`${hoje}T00:00:00Z`),
        Date.parse(`${serie[serie.length - 1].d}T00:00:00Z`)
    )
    const ranks = serie.map((p) => p.r)
    const min = Math.min(...ranks)
    const max = Math.max(...ranks)
    const x = (d: string) =>
        t1 === t0 ? L / 2 : ((Date.parse(`${d}T00:00:00Z`) - t0) / (t1 - t0)) * L
    const y = (r: number) => (max === min ? A / 2 : P + (1 - (r - min) / (max - min)) * (A - 2 * P))

    const pts: string[] = []
    serie.forEach((p, i) => {
        if (i > 0) pts.push(`${x(p.d).toFixed(1)},${y(serie[i - 1].r).toFixed(1)}`)
        pts.push(`${x(p.d).toFixed(1)},${y(p.r).toFixed(1)}`)
    })
    pts.push(`${L},${y(serie[serie.length - 1].r).toFixed(1)}`)

    let valorNoSalto = serie[0].r
    for (const p of serie) if (p.d <= diaDoSalto) valorNoSalto = p.r

    return (
        <svg
            width={L}
            height={A}
            viewBox={`0 0 ${L} ${A}`}
            className="block shrink-0 overflow-visible text-mir-text2"
            aria-hidden="true"
        >
            <polyline
                points={pts.join(' ')}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinejoin="round"
            />
            <circle
                cx={x(diaDoSalto)}
                cy={y(valorNoSalto)}
                r={4}
                className="fill-mir-warm"
            />
        </svg>
    )
}

/* ------------------------------------------------------------------ *
 * Um salto
 * ------------------------------------------------------------------ */

function Salto({
    salto,
    selecionado,
    aoSelecionar,
    irmaos,
    aoSelecionarIrmaos,
    acoes,
}: {
    salto: SaltoDoPainel
    selecionado?: boolean
    aoSelecionar?: () => void
    irmaos?: number
    aoSelecionarIrmaos?: () => void
    acoes?: ReactNode
}) {
    const f = salto.faixa
    const antes = popScore(salto.rank_antes)
    const depois = popScore(salto.rank_depois)
    const hoje = f.last_rank ? popScore(f.last_rank) : null
    const lancamentoRecente =
        f.release_date !== null &&
        diasEntre(f.release_date, salto.dia) >= -3 &&
        diasEntre(f.release_date, salto.dia) <= 45
    const img = capa(f.cover_md5)

    return (
        <li
            className={`grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-3 border-b border-mir-line py-5 sm:grid-cols-[auto_56px_minmax(0,1fr)_auto] ${
                selecionado ? 'bg-mir-fill1' : ''
            }`}
        >
            {aoSelecionar ? (
                <input
                    type="checkbox"
                    checked={!!selecionado}
                    onChange={aoSelecionar}
                    aria-label={`Selecionar ${f.title}`}
                    className="mt-1 h-4 w-4 accent-[#e8734a]"
                />
            ) : (
                <span />
            )}

            {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={img}
                    alt=""
                    width={56}
                    height={56}
                    loading="lazy"
                    className="hidden h-14 w-14 rounded-[3px] object-cover sm:block"
                />
            ) : (
                <span className="hidden h-14 w-14 rounded-[3px] bg-mir-fill2 sm:block" />
            )}

            <div className="min-w-0">
                <Link
                    href={enderecoDoSalto(salto)}
                    target="_blank"
                    className="text-[15.5px] font-bold tracking-[-0.01em] text-mir-text transition-colors hover:text-mir-warm"
                >
                    {f.title}
                </Link>
                <p className="truncate text-[13.5px] text-mir-text2">
                    {f.artist_name}
                    {f.album_name && f.album_name !== f.title
                        ? ` · ${f.album_name}`
                        : ''}
                </p>
                <p className="mt-1 flex flex-wrap gap-x-3 font-mono text-[11.5px] text-mir-text3">
                    {f.genre && <span>{f.genre}</span>}
                    {f.release_date && (
                        <span className={lancamentoRecente ? 'text-mir-warm' : ''}>
                            {lancamentoRecente ? 'lançamento recente · ' : 'lançada em '}
                            {diaComAno(f.release_date)}
                        </span>
                    )}
                    {hoje !== null && <span>hoje {hoje}/100</span>}
                </p>

                {irmaos && irmaos > 0 && aoSelecionarIrmaos ? (
                    <p className="mt-2 text-[13px] text-mir-text2">
                        Mais {irmaos} {irmaos === 1 ? 'faixa' : 'faixas'} de{' '}
                        {f.artist_name} {irmaos === 1 ? 'saltou' : 'saltaram'}{' '}
                        neste dia.{' '}
                        <button
                            type="button"
                            onClick={aoSelecionarIrmaos}
                            className="underline decoration-mir-line2 underline-offset-[3px] hover:text-mir-text"
                        >
                            Selecionar todas
                        </button>
                    </p>
                ) : null}

                {salto.anteriores.length > 0 && (
                    <ul className="mt-2 grid gap-1 text-[13px] text-mir-text2">
                        {salto.anteriores.map((a) => (
                            <li key={`${a.dia}-${a.texto.slice(0, 20)}`}>
                                <span className="font-mono text-[11.5px] text-mir-text3">
                                    nota de {dia(a.dia)} (+{a.pontos}):
                                </span>{' '}
                                {a.texto}
                            </li>
                        ))}
                    </ul>
                )}

                {salto.status === 'pendente' && (
                    <p className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-mir-text3">
                        <span>Pesquisar:</span>
                        {buscas(salto).map((b) => (
                            <a
                                key={b.nome}
                                href={b.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline decoration-mir-line2 underline-offset-[3px] transition-colors hover:text-mir-text"
                            >
                                {b.nome}
                            </a>
                        ))}
                    </p>
                )}

                {acoes && <div className="mt-3 flex flex-wrap gap-2">{acoes}</div>}
            </div>

            <div className="col-span-2 flex items-center gap-4 sm:col-span-1 sm:flex-col sm:items-end sm:gap-1.5">
                <p className="font-mono text-[22px] font-bold leading-none tabular-nums text-mir-warm">
                    +{salto.pontos}
                </p>
                <p className="font-mono text-[11.5px] tabular-nums text-mir-text3">
                    de {antes} para {depois} · {dia(salto.dia)}
                </p>
                <Curvinha serie={salto.serie} diaDoSalto={salto.dia} />
            </div>
        </li>
    )
}

/* ------------------------------------------------------------------ *
 * Botões
 * ------------------------------------------------------------------ */

const BOTAO =
    'rounded-full border border-mir-line2 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-mir-text2 transition-colors hover:border-mir-text3 hover:text-mir-text disabled:cursor-not-allowed disabled:opacity-40'
const BOTAO_PRINCIPAL =
    'rounded-[7px] bg-mir-text px-4 py-2 text-[14px] font-bold text-mir-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40'
const CAMPO =
    'w-full rounded-[7px] border border-mir-line2 bg-mir-surface px-3 py-2 text-[14px] text-mir-text placeholder:text-mir-text3 focus:border-mir-text3 focus:outline-none'

async function chamar(caminho: string, metodo: string, corpo?: object) {
    const res = await fetch(`/api/admin/saltos/${caminho}`, {
        method: metodo,
        headers: corpo ? { 'Content-Type': 'application/json' } : undefined,
        body: corpo ? JSON.stringify(corpo) : undefined,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(data?.error || `O backend respondeu ${res.status}.`)
    }
    return data
}

/* ------------------------------------------------------------------ *
 * Campos da nota (publicar e editar usam os mesmos)
 * ------------------------------------------------------------------ */

function CamposDaNota({
    id,
    texto,
    setTexto,
    fonteUrl,
    setFonteUrl,
    fonteNome,
    setFonteNome,
    textoRef,
}: {
    id: string
    texto: string
    setTexto: (v: string) => void
    fonteUrl: string
    setFonteUrl: (v: string) => void
    fonteNome: string
    setFonteNome: (v: string) => void
    textoRef?: Ref<HTMLTextAreaElement>
}) {
    return (
        <div className="grid gap-2">
            <label htmlFor={`${id}-texto`} className="sr-only">
                Por que subiu
            </label>
            <textarea
                id={`${id}-texto`}
                ref={textoRef}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                maxLength={600}
                rows={3}
                placeholder="Por que subiu? O fato e a data, em uma ou duas frases."
                className={`${CAMPO} resize-y leading-[1.5]`}
            />
            <div className="grid gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto] sm:items-center">
                <label htmlFor={`${id}-url`} className="sr-only">
                    Link da fonte
                </label>
                <input
                    id={`${id}-url`}
                    type="url"
                    inputMode="url"
                    value={fonteUrl}
                    onChange={(e) => setFonteUrl(e.target.value)}
                    placeholder="https://… link da fonte"
                    className={CAMPO}
                />
                <label htmlFor={`${id}-nome`} className="sr-only">
                    Nome da fonte
                </label>
                <input
                    id={`${id}-nome`}
                    value={fonteNome}
                    onChange={(e) => setFonteNome(e.target.value)}
                    maxLength={80}
                    placeholder="Nome da fonte (ex.: g1)"
                    className={CAMPO}
                />
                <span className="text-right font-mono text-[11px] tabular-nums text-mir-text3">
                    {texto.length}/600
                </span>
            </div>
        </div>
    )
}

/* ------------------------------------------------------------------ *
 * Uma nota publicada, com as faixas que ela explica
 * ------------------------------------------------------------------ */

function NotaPublicada({
    saltos,
    aoMudar,
}: {
    saltos: SaltoDoPainel[]
    aoMudar: (aviso: string) => void
}) {
    const nota = saltos[0].nota!
    const [editando, setEditando] = useState(false)
    const [texto, setTexto] = useState(nota.texto)
    const [fonteUrl, setFonteUrl] = useState(nota.fonte_url ?? '')
    const [fonteNome, setFonteNome] = useState(nota.fonte_nome ?? '')
    const [confirmarTirar, setConfirmarTirar] = useState(false)
    const [ocupado, setOcupado] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    useEffect(() => {
        if (!confirmarTirar) return
        const t = setTimeout(() => setConfirmarTirar(false), 4000)
        return () => clearTimeout(t)
    }, [confirmarTirar])

    const salvar = async () => {
        setOcupado(true)
        setErro(null)
        try {
            await chamar(`notas/${nota.id}`, 'PATCH', {
                texto,
                fonte_url: fonteUrl,
                fonte_nome: fonteNome,
            })
            setEditando(false)
            aoMudar('Nota editada.')
        } catch (err) {
            setErro(err instanceof Error ? err.message : 'Erro ao editar.')
        } finally {
            setOcupado(false)
        }
    }

    const tirar = async () => {
        if (!confirmarTirar) {
            setConfirmarTirar(true)
            return
        }
        setOcupado(true)
        setErro(null)
        try {
            await chamar(`notas/${nota.id}`, 'DELETE')
            aoMudar('Nota tirada do ar. Os saltos voltaram para a fila.')
        } catch (err) {
            setErro(err instanceof Error ? err.message : 'Erro ao tirar a nota.')
            setOcupado(false)
        }
    }

    return (
        <li className="border-b border-mir-line py-6">
            {editando ? (
                <div className="max-w-[760px]">
                    <CamposDaNota
                        id={`nota-${nota.id}`}
                        texto={texto}
                        setTexto={setTexto}
                        fonteUrl={fonteUrl}
                        setFonteUrl={setFonteUrl}
                        fonteNome={fonteNome}
                        setFonteNome={setFonteNome}
                    />
                    <div className="mt-3 flex gap-2">
                        <button
                            type="button"
                            onClick={salvar}
                            disabled={ocupado || !texto.trim()}
                            className={BOTAO_PRINCIPAL}
                        >
                            Salvar
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setEditando(false)
                                setTexto(nota.texto)
                                setFonteUrl(nota.fonte_url ?? '')
                                setFonteNome(nota.fonte_nome ?? '')
                            }}
                            disabled={ocupado}
                            className={BOTAO}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <p className="max-w-[72ch] text-[16px] leading-[1.5] text-mir-text">
                        {nota.texto}
                    </p>
                    {nota.fonte_url && (
                        <a
                            href={nota.fonte_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-block text-[13px] text-mir-text3 underline decoration-mir-line2 underline-offset-[3px] hover:text-mir-text"
                        >
                            Fonte: {nota.fonte_nome ?? nota.fonte_url} ↗
                        </a>
                    )}
                </>
            )}

            <ul className="mt-3 grid gap-1">
                {saltos.map((s) => (
                    <li key={s.id} className="text-[13.5px] text-mir-text2">
                        <Link
                            href={enderecoDoSalto(s)}
                            target="_blank"
                            className="font-semibold text-mir-text hover:text-mir-warm"
                        >
                            {s.faixa.title}
                        </Link>{' '}
                        · {s.faixa.artist_name}{' '}
                        <span className="font-mono text-[11.5px] text-mir-text3">
                            +{s.pontos} em {dia(s.dia)}
                        </span>
                    </li>
                ))}
            </ul>

            {!editando && (
                <div className="mt-3 flex gap-2">
                    <button
                        type="button"
                        onClick={() => setEditando(true)}
                        disabled={ocupado}
                        className={BOTAO}
                    >
                        Editar
                    </button>
                    <button
                        type="button"
                        onClick={tirar}
                        disabled={ocupado}
                        className={`${BOTAO} ${confirmarTirar ? 'border-mir-warm text-mir-warm' : ''}`}
                    >
                        {confirmarTirar ? 'Tirar mesmo?' : 'Tirar do ar'}
                    </button>
                </div>
            )}
            {erro && <p className="mt-2 text-[12.5px] text-mir-warm">{erro}</p>}
        </li>
    )
}

/* ------------------------------------------------------------------ *
 * A página
 * ------------------------------------------------------------------ */

const ABAS: { status: StatusDoSalto; nome: string }[] = [
    { status: 'pendente', nome: 'Na fila' },
    { status: 'publicado', nome: 'Publicadas' },
    { status: 'ignorado', nome: 'Ignoradas' },
    { status: 'expirado', nome: 'Expiradas' },
]

export default function FilaDeSaltos({ fila }: { fila: Fila }) {
    const router = useRouter()
    const { status, contagem, saltos } = fila

    const [selecionados, setSelecionados] = useState<Set<number>>(new Set())
    const [texto, setTexto] = useState('')
    const [fonteUrl, setFonteUrl] = useState('')
    const [fonteNome, setFonteNome] = useState('')
    const [ocupado, setOcupado] = useState(false)
    const [erro, setErro] = useState<string | null>(null)
    const [aviso, setAviso] = useState<string | null>(null)
    const textoRef = useRef<HTMLTextAreaElement>(null)
    const [focar, setFocar] = useState(false)

    // A lista muda depois de cada ação (router.refresh). Seleção de um salto
    // que saiu da fila não pode continuar valendo.
    useEffect(() => {
        const ids = new Set(saltos.map((s) => s.id))
        setSelecionados((atual) => {
            const filtrado = new Set(Array.from(atual).filter((id) => ids.has(id)))
            return filtrado.size === atual.size ? atual : filtrado
        })
    }, [saltos])

    useEffect(() => {
        if (focar && selecionados.size > 0) {
            textoRef.current?.focus()
            setFocar(false)
        }
    }, [focar, selecionados])

    const porDia = useMemo(() => {
        const grupos = new Map<string, SaltoDoPainel[]>()
        for (const s of saltos) {
            const lista = grupos.get(s.dia) ?? []
            lista.push(s)
            grupos.set(s.dia, lista)
        }
        return Array.from(grupos.entries())
    }, [saltos])

    // Outras faixas do mesmo artista no mesmo dia: quase sempre a mesma causa.
    const irmaosDe = useMemo(() => {
        const mapa = new Map<string, number[]>()
        for (const s of saltos) {
            if (!s.faixa.deezer_artist_id) continue
            const chave = `${s.faixa.deezer_artist_id}|${s.dia}`
            mapa.set(chave, [...(mapa.get(chave) ?? []), s.id])
        }
        return (s: SaltoDoPainel) =>
            s.faixa.deezer_artist_id
                ? mapa.get(`${s.faixa.deezer_artist_id}|${s.dia}`) ?? [s.id]
                : [s.id]
    }, [saltos])

    const porNota = useMemo(() => {
        const grupos = new Map<number, SaltoDoPainel[]>()
        for (const s of saltos) {
            if (!s.nota) continue
            grupos.set(s.nota.id, [...(grupos.get(s.nota.id) ?? []), s])
        }
        return Array.from(grupos.values())
    }, [saltos])

    const alternar = (id: number) =>
        setSelecionados((atual) => {
            const novo = new Set(atual)
            if (novo.has(id)) novo.delete(id)
            else novo.add(id)
            return novo
        })

    const juntar = (ids: number[]) =>
        setSelecionados((atual) => new Set([...Array.from(atual), ...ids]))

    const depois = (mensagem: string) => {
        setAviso(mensagem)
        setErro(null)
        router.refresh()
    }

    const executar = async (acao: () => Promise<string>) => {
        setOcupado(true)
        setErro(null)
        setAviso(null)
        try {
            depois(await acao())
        } catch (err) {
            setErro(err instanceof Error ? err.message : 'Algo deu errado.')
        } finally {
            setOcupado(false)
        }
    }

    const publicar = () =>
        executar(async () => {
            const ids = Array.from(selecionados)
            await chamar('notas', 'POST', {
                saltos: ids,
                texto,
                fonte_url: fonteUrl,
                fonte_nome: fonteNome,
            })
            setSelecionados(new Set())
            setTexto('')
            setFonteUrl('')
            setFonteNome('')
            return ids.length === 1
                ? 'Nota publicada. Já aparece na página da faixa.'
                : `Nota publicada em ${ids.length} faixas.`
        })

    const marcar = (ids: number[], novo: 'ignorado' | 'pendente') =>
        executar(async () => {
            await chamar('status', 'POST', { saltos: ids, status: novo })
            setSelecionados((atual) => {
                const resto = new Set(atual)
                ids.forEach((id) => resto.delete(id))
                return resto
            })
            const n = ids.length
            if (novo === 'pendente') {
                return n === 1 ? 'Voltou para a fila.' : `${n} voltaram para a fila.`
            }
            return n === 1 ? 'Ignorado.' : `${n} ignorados.`
        })

    const selecionadosNaTela = saltos.filter((s) => selecionados.has(s.id))

    return (
        <div className={`pb-40 ${FAIXA}`}>
            <header className="pt-7">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                    <h1 className="text-[clamp(28px,2.8vw,36px)] font-extrabold leading-none tracking-[-0.04em] text-mir-text">
                        Saltos
                    </h1>
                    <Link
                        href="/admin"
                        className="font-mono text-[11px] uppercase tracking-[0.12em] text-mir-text3 transition-colors hover:text-mir-text"
                    >
                        ← painel
                    </Link>
                </div>
                <p className="mt-4 max-w-[68ch] text-[16px] leading-[1.5] text-mir-text2">
                    Toda faixa que subiu 25 pontos ou mais em 10 dias entra
                    aqui, na rodada das 05:00. Pesquise o porquê, escreva com a
                    fonte e publique: a nota aparece na curva da página da
                    faixa. O que você ignora não aparece em lugar nenhum. O que
                    fica mais de 30 dias na fila expira.
                </p>

                <nav
                    className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-b border-mir-line"
                    aria-label="Status"
                >
                    {ABAS.map((aba) => {
                        const ativa = aba.status === status
                        return (
                            <Link
                                key={aba.status}
                                href={
                                    aba.status === 'pendente'
                                        ? '/admin/saltos'
                                        : `/admin/saltos?status=${aba.status}`
                                }
                                aria-current={ativa ? 'page' : undefined}
                                className={`-mb-px border-b-2 pb-2.5 text-[14px] transition-colors ${
                                    ativa
                                        ? 'border-mir-warm font-bold text-mir-text'
                                        : 'border-transparent text-mir-text3 hover:text-mir-text'
                                }`}
                            >
                                {aba.nome}{' '}
                                <span className="font-mono text-[12px] tabular-nums">
                                    {contagem[aba.status] ?? 0}
                                </span>
                            </Link>
                        )
                    })}
                </nav>
            </header>

            {aviso && (
                <p className="mt-4 text-[14px] text-mir-text" role="status">
                    {aviso}
                </p>
            )}

            {saltos.length === 0 && (
                <p className="py-12 text-[15px] text-mir-text3">
                    {status === 'pendente'
                        ? 'A fila está vazia. A rodada das 05:00 traz os próximos.'
                        : 'Nada aqui.'}
                </p>
            )}

            {/* ---- na fila: por dia, do mais novo ---- */}
            {status === 'pendente' &&
                porDia.map(([d, lista]) => (
                    <section key={d} className="mt-8">
                        <h2 className="font-mono text-[11.5px] uppercase tracking-[0.12em] text-mir-text3">
                            {diaComAno(d)} · {lista.length}{' '}
                            {lista.length === 1 ? 'salto' : 'saltos'}
                        </h2>
                        <ul className="mt-1">
                            {lista.map((s) => {
                                const irmaos = irmaosDe(s)
                                return (
                                    <Salto
                                        key={s.id}
                                        salto={s}
                                        selecionado={selecionados.has(s.id)}
                                        aoSelecionar={() => alternar(s.id)}
                                        irmaos={irmaos.length - 1}
                                        aoSelecionarIrmaos={() => juntar(irmaos)}
                                        acoes={
                                            <>
                                                <button
                                                    type="button"
                                                    className={BOTAO}
                                                    disabled={ocupado}
                                                    onClick={() => {
                                                        setSelecionados(new Set([s.id]))
                                                        setFocar(true)
                                                    }}
                                                >
                                                    Escrever nota
                                                </button>
                                                <button
                                                    type="button"
                                                    className={BOTAO}
                                                    disabled={ocupado}
                                                    onClick={() => marcar([s.id], 'ignorado')}
                                                >
                                                    Ignorar
                                                </button>
                                            </>
                                        }
                                    />
                                )
                            })}
                        </ul>
                    </section>
                ))}

            {/* ---- publicadas: uma linha por nota ---- */}
            {status === 'publicado' && porNota.length > 0 && (
                <ul className="mt-4">
                    {porNota.map((grupo) => (
                        <NotaPublicada
                            key={grupo[0].nota!.id}
                            saltos={grupo}
                            aoMudar={depois}
                        />
                    ))}
                </ul>
            )}

            {/* ---- ignoradas e expiradas: dá para devolver à fila ---- */}
            {(status === 'ignorado' || status === 'expirado') && saltos.length > 0 && (
                <ul className="mt-4">
                    {saltos.map((s) => (
                        <Salto
                            key={s.id}
                            salto={s}
                            acoes={
                                <button
                                    type="button"
                                    className={BOTAO}
                                    disabled={ocupado}
                                    onClick={() => marcar([s.id], 'pendente')}
                                >
                                    Voltar para a fila
                                </button>
                            }
                        />
                    ))}
                </ul>
            )}

            {status !== 'pendente' && erro && (
                <p className="mt-4 text-[13px] text-mir-warm">{erro}</p>
            )}

            {/* ---- a nota: fica presa embaixo enquanto houver seleção ---- */}
            {status === 'pendente' && selecionadosNaTela.length > 0 && (
                <div className="fixed inset-x-0 bottom-0 z-40 border-t border-mir-line2 bg-mir-surface/95 pb-[max(16px,env(safe-area-inset-bottom))] pt-4 backdrop-blur">
                    <div className={FAIXA}>
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                            <p className="min-w-0 truncate text-[13.5px] text-mir-text2">
                                <b className="text-mir-text">
                                    {selecionadosNaTela.length}{' '}
                                    {selecionadosNaTela.length === 1
                                        ? 'selecionado'
                                        : 'selecionados'}
                                </b>
                                {': '}
                                {selecionadosNaTela
                                    .slice(0, 4)
                                    .map((s) => s.faixa.title)
                                    .join(', ')}
                                {selecionadosNaTela.length > 4
                                    ? ` e mais ${selecionadosNaTela.length - 4}`
                                    : ''}
                            </p>
                            <button
                                type="button"
                                onClick={() => setSelecionados(new Set())}
                                className="font-mono text-[11px] uppercase tracking-[0.1em] text-mir-text3 hover:text-mir-text"
                            >
                                Limpar seleção
                            </button>
                        </div>

                        <div className="mt-3">
                            <CamposDaNota
                                id="nova-nota"
                                texto={texto}
                                setTexto={setTexto}
                                fonteUrl={fonteUrl}
                                setFonteUrl={setFonteUrl}
                                fonteNome={fonteNome}
                                setFonteNome={setFonteNome}
                                textoRef={textoRef}
                            />
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={publicar}
                                disabled={ocupado || !texto.trim()}
                                className={BOTAO_PRINCIPAL}
                            >
                                {ocupado ? 'Enviando…' : 'Publicar nota'}
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    marcar(
                                        selecionadosNaTela.map((s) => s.id),
                                        'ignorado'
                                    )
                                }
                                disabled={ocupado}
                                className={BOTAO}
                            >
                                Ignorar{' '}
                                {selecionadosNaTela.length === 1
                                    ? 'este'
                                    : `os ${selecionadosNaTela.length}`}
                            </button>
                            {erro && (
                                <p className="text-[13px] text-mir-warm">{erro}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
