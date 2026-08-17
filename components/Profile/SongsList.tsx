'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    MoreVerticalIcon,
    HeartIcon,
    TrashIcon,
    ImageIcon,
    ChevronDownIcon,
} from 'lucide-react'
import { Button } from '../ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '../ui/dropdown-menu'
import { removeTrack, toggleFavorite } from './actions'
import { trackHref } from './trackHref'
import { useCertificateGeneratorSimple } from '@/hooks/use-certificate-generator-simple'
import type { Song } from '@/types/profile'

/**
 * O acervo.
 *
 * Duas mudanças de fundo em relação à versão anterior:
 *
 * 1. O mês entra como marcador dentro da própria grade, e não como faixa
 *    horizontal. O acervo já vinha ordenado por data, mas nada na tela mostrava
 *    o tempo passando: era um saco de capas. A primeira tentativa foi agrupar
 *    por mês em blocos, e ficou pior: com 20 faixas em 8 meses, cada bloco
 *    tinha 1 ou 2 capas e o resto da linha era vazio. Como marcador em linha,
 *    as capas continuam correndo sem buraco e o tempo aparece do mesmo jeito.
 *
 * 2. Saiu o selo EARLY de cima das capas. Neste acervo ele aparecia em 17 das
 *    20 faixas: um selo que quase todo mundo tem não distingue ninguém, e era
 *    o elemento mais claro de cada capa. No lugar entra a posição real, que
 *    varia de verdade de faixa para faixa.
 */

type SongsListProps = {
    songs: Song[]
    canRemove?: boolean
    userData?: {
        display_name: string
        username: string
        avatar_url?: string | null
    }
}

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

const mesAno = (iso: string | null) => {
    if (!iso) return null
    const d = new Date(iso)
    if (isNaN(d.getTime())) return null
    return `${MESES[d.getMonth()]} ${d.getFullYear()}`
}

type Filter = 'all' | 'first' | 'fav'
type Sort = 'recent' | 'old' | 'position' | 'az' | 'artist'

const SORTS: { id: Sort; label: string }[] = [
    { id: 'recent', label: 'Mais recentes' },
    { id: 'old', label: 'Mais antigas' },
    { id: 'position', label: 'Melhor posição' },
    { id: 'az', label: 'Título A-Z' },
    { id: 'artist', label: 'Artista A-Z' },
]

/** Capa sem thumbnail: tipografia sobre o card, sem cor sorteada. */
const Capa = ({ song }: { song: Song }) => {
    if (song.track_thumbnail) {
        return (
            <img
                src={song.track_thumbnail}
                alt={song.track_title}
                className="aspect-square w-full object-cover transition duration-300 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
        )
    }
    return (
        <div className="flex aspect-square w-full flex-col justify-end bg-mir-card p-2.5">
            <div className="truncate font-mono text-[9.5px] lowercase text-mir-text3">
                {song.artist_name}
            </div>
            <div className="mt-1 line-clamp-3 text-[13px] font-extrabold leading-[1.08] tracking-[-0.02em] text-mir-text2">
                {song.track_title}
            </div>
        </div>
    )
}

const SongsList: React.FC<SongsListProps> = ({ songs, canRemove = false, userData }) => {
    const [filter, setFilter] = useState<Filter>('all')
    const [sort, setSort] = useState<Sort>('recent')
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
    const [favoriteStates, setFavoriteStates] = useState<Record<string, boolean>>({})
    const router = useRouter()
    const { generateCertificate, isGenerating } = useCertificateGeneratorSimple()

    const firstCount = songs.filter((s) => s.position === 1).length
    const favCount = songs.filter((s) => s.is_favorited).length

    // Só oferece o filtro quando ele tem o que filtrar. Chip que leva a uma
    // grade vazia é armadilha.
    const filters = useMemo(() => {
        const list: { id: Filter; label: string }[] = [{ id: 'all', label: 'Tudo' }]
        if (firstCount > 0) list.push({ id: 'first', label: 'Cheguei em 1º' })
        if (favCount > 0) list.push({ id: 'fav', label: 'Favoritas' })
        return list
    }, [firstCount, favCount])

    const list = useMemo(() => {
        let l = songs.slice()
        if (filter === 'first') l = l.filter((s) => s.position === 1)
        if (filter === 'fav') l = l.filter((s) => s.is_favorited)

        const time = (s: Song) => (s.claimedat ? new Date(s.claimedat).getTime() : 0)
        if (sort === 'recent') l.sort((a, b) => time(b) - time(a))
        else if (sort === 'old') l.sort((a, b) => time(a) - time(b))
        else if (sort === 'position')
            l.sort((a, b) => (a.position ?? 1e9) - (b.position ?? 1e9))
        else if (sort === 'az') l.sort((a, b) => a.track_title.localeCompare(b.track_title))
        else if (sort === 'artist') l.sort((a, b) => a.artist_name.localeCompare(b.artist_name))
        return l
    }, [songs, filter, sort])

    // Marcar o mês só faz sentido quando a ordem é cronológica.
    const grouped = sort === 'recent' || sort === 'old'

    /**
     * O mês vai numa faixa de altura fixa acima de cada capa, preenchida só na
     * primeira faixa do mês. Todas as células reservam a mesma altura, então a
     * grade não desalinha e nenhuma célula é gasta só com texto.
     */
    const items = useMemo(() => {
        let atual: string | null = null
        return list.map((song) => {
            if (!grouped) return { song, mes: null as string | null }
            const label = mesAno(song.claimedat)
            const novo = label && label !== atual
            if (novo) atual = label
            return { song, mes: novo ? label : null }
        })
    }, [list, grouped])

    const handleRemoveTrack = async (trackId: string, trackTitle: string) => {
        if (!confirm(`Tem certeza que deseja remover "${trackTitle}"?`)) return

        setLoadingStates((prev) => ({ ...prev, [trackId]: true }))
        try {
            const result = await removeTrack(trackId)
            if (result.success) router.refresh()
            else alert(result.message || 'Erro ao remover a música')
        } catch (error) {
            console.error('Error removing track:', error)
            alert('Erro inesperado ao remover a música')
        } finally {
            setLoadingStates((prev) => ({ ...prev, [trackId]: false }))
        }
    }

    const handleToggleFavorite = async (trackId: string, currentFavoriteState: boolean) => {
        setFavoriteStates((prev) => ({ ...prev, [trackId]: true }))
        try {
            const result = await toggleFavorite(trackId, !currentFavoriteState)
            if (result.success) router.refresh()
            else alert(result.message || 'Erro ao alterar favorito')
        } catch (error) {
            console.error('Error toggling favorite:', error)
            alert('Erro inesperado ao alterar favorito')
        } finally {
            setFavoriteStates((prev) => ({ ...prev, [trackId]: false }))
        }
    }

    const handleGenerateCertificate = async (song: Song) => {
        if (!userData) {
            alert('Dados do usuário não disponíveis')
            return
        }
        const result = await generateCertificate(song, userData)
        if (result.success) alert(result.message || 'Discovery card gerado!')
        else alert(result.error || 'Erro ao gerar discovery card')
    }

    const OwnerMenu = ({ song }: { song: Song }) => (
        <div className="absolute right-1.5 top-1.5 z-10" onClick={(e) => e.preventDefault()}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Opções da faixa"
                        className="h-7 w-7 rounded-full bg-black/55 text-mir-text opacity-0 backdrop-blur-sm transition hover:bg-black/75 hover:text-mir-text focus-visible:opacity-100 group-hover:opacity-100"
                    >
                        <MoreVerticalIcon className="h-3.5 w-3.5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-56 border border-mir-line bg-mir-raised text-mir-text2 shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
                >
                    <DropdownMenuItem
                        onClick={() => handleToggleFavorite(song.id, song.is_favorited)}
                        disabled={favoriteStates[song.id]}
                        className="cursor-pointer focus:bg-mir-fill2 focus:text-mir-text"
                    >
                        <HeartIcon
                            className={`mr-2 h-4 w-4 ${song.is_favorited ? 'fill-current text-mir-warm' : ''}`}
                        />
                        {favoriteStates[song.id] ? (
                            <span className="flex items-center">
                                <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-mir-text3 border-t-transparent" />
                                Processando...
                            </span>
                        ) : song.is_favorited ? (
                            'Tirar das favoritas'
                        ) : (
                            'Botar nas favoritas'
                        )}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-mir-line" />

                    <DropdownMenuItem
                        onClick={() => handleGenerateCertificate(song)}
                        disabled={isGenerating}
                        className="cursor-pointer focus:bg-mir-fill2 focus:text-mir-text"
                    >
                        <ImageIcon className="mr-2 h-4 w-4" />
                        {isGenerating ? (
                            <span className="flex items-center">
                                <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-mir-text3 border-t-transparent" />
                                Gerando discovery card...
                            </span>
                        ) : (
                            'Gerar discovery card'
                        )}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-mir-line" />

                    <DropdownMenuItem
                        onClick={() => handleRemoveTrack(song.id, song.track_title)}
                        disabled={loadingStates[song.id]}
                        className="cursor-pointer text-red-400 focus:bg-red-400/10 focus:text-red-300"
                    >
                        <TrashIcon className="mr-2 h-4 w-4" />
                        {loadingStates[song.id] ? (
                            <span className="flex items-center">
                                <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                                Removendo...
                            </span>
                        ) : (
                            'Remover do acervo'
                        )}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )

    const Tile = ({ song, mes }: { song: Song; mes: string | null }) => (
        <Link href={trackHref(song)} className="group block min-w-0">
            {/* O mês é cronologia, não precedência: em lima ele ficava mais
                aceso que o ordinal logo abaixo, que é o dado que distingue a
                pessoa. Ambos os assuntos são "tempo", mas só um é conquista. */}
            {grouped && (
                <div className="mb-2 flex h-[15px] items-center gap-2 font-mono text-[11px] text-mir-text3">
                    {mes && (
                        <>
                            <span className="truncate">{mes}</span>
                            <span className="h-px flex-1 bg-mir-line" />
                        </>
                    )}
                </div>
            )}
            <div className="relative overflow-hidden rounded-[4px] bg-mir-card ring-1 ring-mir-line transition group-hover:ring-mir-text3">
                <Capa song={song} />
                {canRemove && <OwnerMenu song={song} />}
            </div>
            <div className="mt-2 truncate text-[13.5px] font-bold tracking-[-0.01em] text-mir-text">
                {song.track_title}
            </div>
            <div className="mt-0.5 truncate text-[12px] text-mir-text2">
                {song.artist_name}
            </div>
            <div className="mt-1.5 flex items-center gap-2 font-mono text-[11px]">
                {song.position !== null && (
                    // sem rótulo: "a salvar" repetido em 200 capas vira ruído.
                    // O title cobre quem não conhece a convenção.
                    <span
                        title={`${song.position}ª a salvar`}
                        className={`tabular-nums ${
                            song.position === 1
                                ? 'font-bold text-mir-acc'
                                : 'text-mir-text3'
                        }`}
                    >
                        {song.position}ª
                    </span>
                )}
                {!grouped && (
                    <span className="truncate text-mir-text3">{mesAno(song.claimedat)}</span>
                )}
                {song.is_favorited && (
                    <HeartIcon className="ml-auto h-3 w-3 flex-none fill-current text-mir-warm" />
                )}
            </div>
        </Link>
    )

    if (!songs.length) {
        return (
            <section className="w-full border-b border-mir-line bg-mir-bg">
                <div className="mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8">
                    <h2 className="m-0 mb-7 text-[clamp(26px,3.6vw,34px)] font-extrabold tracking-[-0.04em] text-mir-text">
                        Acervo
                    </h2>
                    <div className="rounded-[12px] border border-dashed border-mir-line2 px-8 py-16 text-center">
                        <p className="m-0 text-[15px] text-mir-text2">
                            Nenhuma faixa salva ainda.
                        </p>
                        {/* Ia para /claimtrack, que era a "página de salvar" e
                            não existe mais. Salvar se faz na ficha da faixa, e
                            a pilha é o lugar onde se acha uma para abrir. */}
                        <Link
                            href="/pilha"
                            className="mt-5 inline-flex rounded-full bg-mir-text px-5 py-2.5 text-[13.5px] font-bold text-mir-bg transition hover:brightness-105 active:translate-y-px"
                        >
                            Revirar a pilha
                        </Link>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="w-full border-b border-mir-line bg-mir-bg">
            <div className="mx-auto w-full max-w-[1200px] px-5 py-14 sm:px-8">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
                    <div>
                        <h2 className="m-0 text-[clamp(26px,3.6vw,34px)] font-extrabold tracking-[-0.04em] text-mir-text">
                            Acervo
                        </h2>
                        <p className="m-0 mt-1.5 font-mono text-[11.5px] tabular-nums text-mir-text3">
                            {list.length} {list.length === 1 ? 'faixa' : 'faixas'}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {filters.length > 1 && (
                            <div className="flex gap-1 rounded-full bg-mir-fill1 p-1">
                                {filters.map((f) => (
                                    <button
                                        key={f.id}
                                        onClick={() => setFilter(f.id)}
                                        aria-pressed={filter === f.id}
                                        className={`rounded-full px-3.5 py-1.5 font-mono text-[11.5px] transition ${
                                            filter === f.id
                                                ? 'bg-mir-text text-mir-bg'
                                                : 'text-mir-text3 hover:text-mir-text'
                                        }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="relative flex items-center">
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value as Sort)}
                                aria-label="Ordenar acervo"
                                className="cursor-pointer appearance-none rounded-full border border-mir-line2 bg-transparent py-2 pl-4 pr-9 font-mono text-[11.5px] text-mir-text2 outline-none transition hover:border-mir-text3 hover:text-mir-text focus-visible:ring-1 focus-visible:ring-mir-acc"
                            >
                                {SORTS.map((s) => (
                                    <option
                                        key={s.id}
                                        value={s.id}
                                        className="bg-mir-surface text-mir-text"
                                    >
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDownIcon className="pointer-events-none absolute right-3.5 h-3.5 w-3.5 text-mir-text3" />
                        </div>
                    </div>
                </div>

                {list.length === 0 ? (
                    <div className="rounded-[12px] border border-dashed border-mir-line2 px-8 py-14 text-center font-mono text-[13px] text-mir-text3">
                        nenhuma faixa neste filtro
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-x-4 gap-y-7 sm:grid-cols-[repeat(auto-fill,minmax(132px,1fr))] sm:gap-x-5">
                        {items.map(({ song, mes }) => (
                            <Tile key={song.id} song={song} mes={mes} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default SongsList
