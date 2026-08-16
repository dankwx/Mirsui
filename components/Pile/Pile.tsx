'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, LayoutGrid, List, Shuffle, X } from 'lucide-react'
import { HEAT_LABEL, type PileTrack } from '@/utils/pileTypes'
import { packPile } from './pileLayout'

const nf = new Intl.NumberFormat('pt-BR')

/* fundo tonal quando a faixa não tem capa — mesma família de tons do resto do app */
const TONES = [
    '#241f1a',
    '#1c2320',
    '#27201f',
    '#1b2026',
    '#231d27',
    '#202420',
    '#2a201b',
    '#1a2326',
    '#25211c',
    '#1d2126',
    '#26211f',
    '#1f231d',
]
function tone(seed: string) {
    let h = 0
    for (let i = 0; i < seed.length; i++)
        h = (h * 31 + seed.charCodeAt(i)) >>> 0
    return TONES[h % TONES.length]
}
function initials(name: string) {
    return (name || '')
        .split(' ')
        .map((n) => n[0])
        .filter(Boolean)
        .join('')
        .toUpperCase()
        .slice(0, 2)
}
function spotifySearch(t: PileTrack) {
    return `https://open.spotify.com/search/${encodeURIComponent(`${t.artist} ${t.title}`)}`
}

/* ---------- ficha da faixa, ao clicar numa peça ---------- */
function PieceSheet({
    track,
    onClose,
}: {
    track: PileTrack
    onClose: () => void
}) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
        window.addEventListener('keydown', onKey)
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            window.removeEventListener('keydown', onKey)
            document.body.style.overflow = prev
        }
    }, [onClose])

    return (
        <div
            className="fixed inset-0 z-[70] flex animate-[mir-fade_.18s_ease-out] items-center justify-center p-5"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-mir-bg/80 backdrop-blur-md" />

            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-[430px] animate-[mir-pop_.22s_cubic-bezier(.2,.9,.3,1.1)] overflow-hidden rounded-[20px] border border-mir-line2 bg-mir-surface shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]"
            >
                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-mir-bg/70 text-mir-text2 backdrop-blur transition hover:text-mir-text"
                >
                    <X className="h-4 w-4" />
                </button>

                <div
                    className="relative aspect-square w-full"
                    style={{ background: tone(track.artist) }}
                >
                    <span className="absolute inset-0 grid select-none place-items-center text-[86px] font-extrabold tracking-[-0.05em] text-mir-text/10">
                        {initials(track.artist)}
                    </span>
                    {track.cover && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={track.cover}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    )}
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-mir-surface to-transparent" />
                </div>

                <div className="relative -mt-8 px-6 pb-6">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-mir-line2 bg-mir-fill2 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-mir-text2">
                            {track.genre}
                        </span>
                        <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-mir-text3">
                            {HEAT_LABEL[track.heat]}
                        </span>
                    </div>

                    <h2 className="mt-3 text-[26px] font-extrabold leading-[1.05] tracking-[-0.035em] text-mir-text">
                        {track.title}
                    </h2>
                    <p className="mt-1 font-mono text-[13px] tracking-[0.03em] text-mir-text2">
                        {track.artist}
                    </p>

                    {/* Um número só, e ele é medido. Antes eram dois — "no
                        acervo" e "a primeira" —, os dois saídos de um hash do
                        nome da faixa. Ver migrations/013_pilha_real.sql. */}
                    <div className="mt-5 border-t border-mir-line pt-4">
                        <div className="flex items-baseline gap-2">
                            {/* Audiência é contagem de gente, não precedência:
                                vai no laranja, junto com seguidores e recados. */}
                            <span className="text-[22px] font-extrabold tabular-nums tracking-[-0.03em] text-mir-warm">
                                {track.audiencia}
                            </span>
                            <span className="text-[13px] tabular-nums text-mir-text3">
                                /100
                            </span>
                        </div>
                        <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-mir-text3">
                            audiência hoje
                        </div>
                    </div>

                    {/* Ia para /claimtrack, genérico: a página não sabia de que
                        faixa se tratava, e para visitante deslogado era só uma
                        parede de login. Agora abre a ficha da própria faixa, que
                        é pública e tem o botão de salvar de verdade. */}
                    <div className="mt-5 flex gap-2.5">
                        {track.isrc ? (
                            <Link
                                href={`/track/${track.isrc}`}
                                className="flex-1 rounded-full bg-mir-text px-5 py-3 text-center text-[14px] font-bold text-mir-bg transition hover:brightness-110 active:translate-y-px"
                            >
                                Abrir a faixa
                            </Link>
                        ) : (
                            <span className="flex-1 rounded-full border border-mir-line2 px-5 py-3 text-center text-[14px] font-semibold text-mir-text3">
                                Sem ficha no Spotify
                            </span>
                        )}
                        <a
                            href={spotifySearch(track)}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-mir-line2 px-5 py-3 text-[14px] font-semibold text-mir-text2 transition hover:border-mir-text3 hover:bg-mir-fill1 hover:text-mir-text active:translate-y-px"
                        >
                            Ouvir
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ---------- a pilha ---------- */
export default function Pile({ tracks }: { tracks: PileTrack[] }) {
    const wrapRef = useRef<HTMLDivElement>(null)
    const [width, setWidth] = useState(0)
    const [run, setRun] = useState(0)
    const [genre, setGenre] = useState<string | null>(null)
    const [open, setOpen] = useState<PileTrack | null>(null)
    const [vista, setVista] = useState<'mosaico' | 'lista'>('mosaico')

    useEffect(() => {
        const el = wrapRef.current
        if (!el) return
        // a pilha só existe depois de medir: as posições são em px, calculadas
        // a partir da largura real do container
        const ro = new ResizeObserver(([entry]) => {
            setWidth(Math.round(entry.contentRect.width))
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    const layout = useMemo(
        () => packPile(tracks, width, run + 1),
        [tracks, width, run]
    )

    // Os chips vêm das faixas que chegaram, não de uma lista fixa: os gêneros
    // são os do Deezer e mudam conforme o Observatório cresce.
    // Array.from em vez de espalhar o Set: o target do tsconfig é anterior a
    // es2015 e não itera Set sem downlevelIteration.
    const generos = useMemo(
        () =>
            Array.from(new Set(tracks.map((t) => t.genre))).sort((a, b) =>
                a.localeCompare(b, 'pt-BR')
            ),
        [tracks]
    )
    const matches = useMemo(
        () =>
            genre
                ? tracks.filter((t) => t.genre === genre).length
                : tracks.length,
        [genre, tracks]
    )

    const despejar = useCallback(() => {
        setGenre(null)
        setRun((r) => r + 1)
    }, [])

    return (
        <div className="pile-root">
            <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-10">
                {/* ---- cabeçalho ----
                    Uma faixa fina, de propósito: a pilha é o assunto da página,
                    então o título não disputa tamanho com ela. Antes eram 367px
                    de cabeçalho (título de 86px + parágrafo de 3 linhas) e a
                    massa da pilha só começava depois da primeira dobra. */}
                <header className="pt-5 sm:pt-6">
                    <Link
                        href="/feed"
                        className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-mir-text3 transition-colors hover:text-mir-text"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        voltar ao feed
                    </Link>

                    <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-2">
                        <h1 className="text-[clamp(26px,2.6vw,34px)] font-extrabold leading-none tracking-[-0.04em] text-mir-text">
                            A pilha
                        </h1>
                        <span className="rounded-full border border-mir-line2 px-2 py-[3px] font-mono text-[9.5px] uppercase tracking-[0.14em] text-mir-text3">
                            prévia
                        </span>

                        {/* a legenda que a pilha precisa, na horizontal: no
                            desktop ocupa zero altura em vez das 3 linhas do
                            parágrafo antigo; abaixo de lg cai pra própria linha
                            em vez de sumir, porque é ela que explica o tamanho
                            das capas */}
                        <p className="w-full text-[13px] leading-snug text-mir-text3 lg:w-auto lg:leading-none">
                            capa maior, mais audiência · clique pra abrir a
                            faixa
                        </p>

                        <div className="flex w-full items-baseline gap-5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-mir-text3 lg:ml-auto lg:w-auto">
                            <span>
                                <b className="mr-1.5 font-sans text-[19px] font-extrabold tabular-nums tracking-[-0.035em] text-mir-text">
                                    {nf.format(tracks.length)}
                                </b>
                                faixas
                            </span>
                            <span>
                                <b className="mr-1.5 font-sans text-[19px] font-extrabold tabular-nums tracking-[-0.035em] text-mir-text">
                                    {nf.format(generos.length)}
                                </b>
                                gêneros
                            </span>
                        </div>
                    </div>
                </header>

                {/* ---- filtros ---- */}
                <div className="sticky top-[72px] z-30 -mx-5 mt-4 flex flex-wrap items-center gap-2 bg-mir-bg/85 px-5 py-2.5 backdrop-blur-xl sm:-mx-10 sm:px-10">
                    <button
                        onClick={() => setGenre(null)}
                        className={`pile-chip ${genre === null ? 'is-on' : ''}`}
                    >
                        tudo
                    </button>
                    {generos.map((g) => (
                        <button
                            key={g}
                            onClick={() =>
                                setGenre((cur) => (cur === g ? null : g))
                            }
                            className={`pile-chip ${genre === g ? 'is-on' : ''}`}
                        >
                            {g}
                        </button>
                    ))}

                    <div className="ml-auto flex items-center gap-2">
                        {vista === 'mosaico' && (
                            <button
                                onClick={despejar}
                                className="inline-flex items-center gap-2 rounded-full border border-mir-line2 px-4 py-[7px] font-mono text-[11px] uppercase tracking-[0.1em] text-mir-text2 transition hover:border-mir-text3 hover:text-mir-text active:translate-y-px"
                            >
                                <Shuffle className="h-3.5 w-3.5" />
                                despejar de novo
                            </button>
                        )}
                        <button
                            onClick={() =>
                                setVista((v) =>
                                    v === 'mosaico' ? 'lista' : 'mosaico'
                                )
                            }
                            className="inline-flex items-center gap-2 rounded-full border border-mir-line2 px-4 py-[7px] font-mono text-[11px] uppercase tracking-[0.1em] text-mir-text2 transition hover:border-mir-text3 hover:text-mir-text active:translate-y-px"
                        >
                            {vista === 'mosaico' ? (
                                <>
                                    <List className="h-3.5 w-3.5" />
                                    ver em lista
                                </>
                            ) : (
                                <>
                                    <LayoutGrid className="h-3.5 w-3.5" />
                                    ver a pilha
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {genre && (
                    <p className="pt-3 font-mono text-[11px] uppercase tracking-[0.1em] text-mir-text3">
                        {matches} {matches === 1 ? 'faixa' : 'faixas'} de{' '}
                        {genre} na pilha
                    </p>
                )}

                {/* ---- a lista ----
                    As duas vistas ficam SEMPRE no DOM, alternadas por CSS, e não
                    montadas condicionalmente. O motivo é o mosaico: as posições
                    dele são calculadas em px a partir da largura medida pelo
                    ResizeObserver, que no servidor não roda — então o HTML que
                    sai do servidor tem zero peça de mosaico, e as 168 faixas
                    existem lá só como JSON do payload do React.

                    Renderizando a lista de verdade, o conteúdo da Pilha passa a
                    existir em HTML semântico para quem não executa JavaScript.
                    E não é só crawler: ninguém acha uma faixa específica varrendo
                    168 capas sem título, então a lista é uma vista útil por si.

                    (Ainda sem link para /track: aquelas páginas são endereçadas
                    por id do Spotify e o Observatório mede por id do Deezer.
                    Falta a ponte ISRC -> Spotify.) */}
                <div className={vista === 'lista' ? 'pb-24 pt-3' : 'hidden'}>
                    <ol className="divide-y divide-mir-line border-y border-mir-line">
                        {tracks
                            .filter((t) => genre === null || t.genre === genre)
                            .map((t, i) => {
                                const conteudo = (
                                    <>
                                        <span className="w-8 shrink-0 text-right font-mono text-[11px] tabular-nums text-mir-text3">
                                            {i + 1}
                                        </span>
                                        {t.coverSmall ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={t.coverSmall}
                                                alt=""
                                                loading="lazy"
                                                decoding="async"
                                                className="h-11 w-11 shrink-0 rounded object-cover"
                                            />
                                        ) : (
                                            <span
                                                className="grid h-11 w-11 shrink-0 place-items-center rounded font-mono text-[11px] text-mir-text3"
                                                style={{
                                                    background: tone(t.artist),
                                                }}
                                            >
                                                {initials(t.artist)}
                                            </span>
                                        )}

                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-[15px] font-semibold tracking-[-0.01em] text-mir-text">
                                                {t.title}
                                            </span>
                                            <span className="block truncate font-mono text-[12px] text-mir-text2">
                                                {t.artist}
                                            </span>
                                        </span>

                                        <span className="hidden shrink-0 font-mono text-[10.5px] uppercase tracking-[0.12em] text-mir-text3 sm:block">
                                            {t.genre}
                                        </span>
                                        <span className="hidden w-24 shrink-0 font-mono text-[10.5px] uppercase tracking-[0.12em] text-mir-text3 md:block">
                                            {HEAT_LABEL[t.heat]}
                                        </span>
                                        <span className="w-14 shrink-0 text-right text-[15px] font-extrabold tabular-nums tracking-[-0.02em] text-mir-warm">
                                            {t.audiencia}
                                        </span>
                                    </>
                                )

                                const classe =
                                    'flex w-full items-center gap-4 py-3 text-left transition-colors hover:bg-mir-fill1'

                                return (
                                    <li key={t.id}>
                                        {/* Link de verdade quando a ponte para o
                                            Spotify resolveu — é o que o crawler
                                            segue e o que tira a Pilha do papel de
                                            beco sem saída. Sem id, cai no card,
                                            que ao menos mostra o que se sabe. */}
                                        {t.isrc ? (
                                            <Link
                                                href={`/track/${t.isrc}`}
                                                className={classe}
                                            >
                                                {conteudo}
                                            </Link>
                                        ) : (
                                            <button
                                                onClick={() => setOpen(t)}
                                                className={classe}
                                            >
                                                {conteudo}
                                            </button>
                                        )}
                                    </li>
                                )
                            })}
                    </ol>
                </div>

                {/* ---- o mosaico ----
                    Fica no mesmo container dos filtros de propósito: se estivesse
                    em outra div, o bloco sticky perderia o contexto e os chips
                    sumiriam já nos primeiros 300px de rolagem da pilha. */}
                <div className={vista === 'mosaico' ? 'pb-24 pt-3' : 'hidden'}>
                    <div
                        ref={wrapRef}
                        className="pile-stage"
                        style={{ height: layout.height || 620 }}
                    >
                        {layout.pieces.map((p) => {
                            const t = p.track
                            const dim = genre !== null && t.genre !== genre
                            const src = p.size > 170 ? t.cover : t.coverSmall

                            return (
                                <div
                                    key={`${run}-${t.id}`}
                                    className={`pile-slot ${dim ? 'is-dim' : ''}`}
                                    style={{
                                        left: p.x,
                                        top: p.y,
                                        width: p.size,
                                        height: p.size,
                                        zIndex: p.z,
                                    }}
                                    onClick={() => setOpen(t)}
                                >
                                    <div
                                        className="pile-piece"
                                        style={
                                            {
                                                '--r': `${p.rot}deg`,
                                                '--d': `${p.delay}ms`,
                                                background: tone(t.artist),
                                            } as React.CSSProperties
                                        }
                                    >
                                        <span className="pile-ini">
                                            {initials(t.artist)}
                                        </span>
                                        {src && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={src}
                                                alt=""
                                                loading="lazy"
                                                decoding="async"
                                                draggable={false}
                                            />
                                        )}
                                    </div>

                                    <div
                                        className={`pile-tip pile-tip--${p.align}`}
                                    >
                                        <strong>{t.title}</strong>
                                        <span className="pile-tip-artist">
                                            {t.artist}
                                        </span>
                                        <span className="pile-tip-meta">
                                            audiência {t.audiencia}/100 ·{' '}
                                            {t.genre} · {HEAT_LABEL[t.heat]}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}

                        {width === 0 && (
                            <div className="grid h-full place-items-center font-mono text-[12px] uppercase tracking-[0.14em] text-mir-text3">
                                despejando…
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {open && <PieceSheet track={open} onClose={() => setOpen(null)} />}
        </div>
    )
}
