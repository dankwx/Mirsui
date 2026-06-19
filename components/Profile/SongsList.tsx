'use client'

import React, { useMemo, useState } from 'react'
import {
    MoreVerticalIcon,
    HeartIcon,
    TrashIcon,
    ImageIcon,
    FlagIcon,
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
import { isEarly } from './early'
import { useRouter } from 'next/navigation'
import { useCertificateGeneratorSimple } from '@/hooks/use-certificate-generator-simple'

type Song = {
    id: string
    track_url: string
    track_uri: string | null
    track_title: string
    artist_name: string
    album_name: string
    popularity: number
    discover_rating: number | null
    track_thumbnail: string | null
    claimedat: string | null
    is_favorited: boolean // Favorito do DONO do perfil (público)
    is_user_favorited?: boolean // Favorito do usuário logado (para funcionalidade)
    favorite_count?: number
}

type SongsListProps = {
    songs: Song[]
    canRemove?: boolean // Para controlar se o usuário pode remover (ex: se é o próprio perfil)
    userData?: {
        display_name: string
        username: string
        avatar_url?: string | null
    }
}

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

const savedWhen = (claimedat: string | null) => {
    if (!claimedat) return null
    const d = new Date(claimedat)
    if (isNaN(d.getTime())) return null
    return `salvo ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

const hashStr = (s: string) => {
    let h = 0
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
    return h
}

// margem antecipada (mock determinístico) — meses antes do pico
const earlyMargin = (song: Song) =>
    `+${(hashStr(song.track_title + '|' + song.artist_name) % 11) + 2} meses`

// paleta tipográfica das capas (espelha a referência editorial)
type Palette = { bg: string; fg: string; mut: string }
const PALETTES: Palette[] = [
    { bg: '#cdef36', fg: '#16120c', mut: 'rgba(22,18,12,0.6)' },
    { bg: '#16120c', fg: '#ece3d2', mut: 'rgba(236,227,210,0.5)' },
    { bg: '#c14a26', fg: '#f7ead7', mut: 'rgba(247,234,215,0.62)' },
    { bg: '#e3d8c1', fg: '#16120c', mut: 'rgba(22,18,12,0.5)' },
    { bg: '#27203a', fg: '#e7ddff', mut: 'rgba(231,221,255,0.55)' },
    { bg: '#173a4a', fg: '#dcf0fb', mut: 'rgba(220,240,251,0.55)' },
    { bg: '#3f3f17', fg: '#eef36a', mut: 'rgba(238,243,106,0.6)' },
]
const paletteFor = (song: Song) =>
    PALETTES[hashStr(song.track_title + '|' + song.artist_name) % PALETTES.length]

const Cover = ({
    song,
    big = false,
    className = '',
}: {
    song: Song
    big?: boolean
    className?: string
}) => {
    if (song.track_thumbnail) {
        return (
            <img
                src={song.track_thumbnail}
                alt={song.track_title}
                className={`aspect-square w-full object-cover ${className}`}
            />
        )
    }
    const p = paletteFor(song)
    return (
        <div
            className={`flex aspect-square w-full flex-col justify-end overflow-hidden ${
                big ? 'p-[18px]' : 'p-3'
            } ${className}`}
            style={{ background: p.bg }}
        >
            <div
                className={`mb-[5px] w-full truncate font-mono ${
                    big ? 'text-[10px]' : 'text-[9.5px]'
                } uppercase tracking-[0.13em]`}
                style={{ color: p.mut }}
            >
                {song.artist_name}
            </div>
            <div
                className={`font-extrabold leading-[0.96] tracking-[-0.025em] ${
                    big ? 'text-[30px]' : 'text-[18px]'
                }`}
                style={{ color: p.fg }}
            >
                {song.track_title}
            </div>
        </div>
    )
}

type Filter = 'all' | 'early' | 'fav'
type Sort = 'recent' | 'old' | 'az' | 'artist'

const FILTERS: { id: Filter; label: string }[] = [
    { id: 'all', label: 'Tudo' },
    { id: 'early', label: 'Antecipadas' },
    { id: 'fav', label: 'Favoritas' },
]

const SongsList: React.FC<SongsListProps> = ({ songs, canRemove = false, userData }) => {
    const [filter, setFilter] = useState<Filter>('all')
    const [sort, setSort] = useState<Sort>('recent')
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
    const [favoriteStates, setFavoriteStates] = useState<Record<string, boolean>>({})
    const router = useRouter()
    const { generateCertificate, isGenerating } = useCertificateGeneratorSimple()

    const earlyCount = songs.filter(isEarly).length
    const favTracks = songs.filter((s) => s.is_favorited).slice(0, 4)

    const list = useMemo(() => {
        let l = songs.slice()
        if (filter === 'early') l = l.filter(isEarly)
        if (filter === 'fav') l = l.filter((s) => s.is_favorited)
        const time = (s: Song) => (s.claimedat ? new Date(s.claimedat).getTime() : 0)
        if (sort === 'recent') l.sort((a, b) => time(b) - time(a))
        else if (sort === 'old') l.sort((a, b) => time(a) - time(b))
        else if (sort === 'az') l.sort((a, b) => a.track_title.localeCompare(b.track_title))
        else if (sort === 'artist') l.sort((a, b) => a.artist_name.localeCompare(b.artist_name))
        return l
    }, [songs, filter, sort])

    const handleRemoveTrack = async (trackId: string, trackTitle: string) => {
        if (!confirm(`Tem certeza que deseja remover "${trackTitle}"?`)) {
            return
        }

        setLoadingStates((prev) => ({ ...prev, [trackId]: true }))

        try {
            const result = await removeTrack(trackId)

            if (result.success) {
                router.refresh()
            } else {
                alert(result.message || 'Erro ao remover a música')
            }
        } catch (error) {
            console.error('Error removing track:', error)
            alert('Erro inesperado ao remover a música')
        } finally {
            setLoadingStates((prev) => ({ ...prev, [trackId]: false }))
        }
    }

    const handleToggleFavorite = async (
        trackId: string,
        currentFavoriteState: boolean
    ) => {
        setFavoriteStates((prev) => ({ ...prev, [trackId]: true }))

        try {
            const result = await toggleFavorite(trackId, !currentFavoriteState)

            if (result.success) {
                router.refresh()
            } else {
                alert(result.message || 'Erro ao alterar favorito')
            }
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

        if (result.success) {
            alert(result.message || 'Certificado gerado com sucesso!')
        } else {
            alert(result.error || 'Erro ao gerar certificado')
        }
    }

    const OwnerMenu = ({ song, dark = true }: { song: Song; dark?: boolean }) => (
        <div
            className="absolute right-2 top-2 z-10"
            onClick={(e) => e.preventDefault()}
        >
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 rounded-full backdrop-blur-sm transition group-hover:opacity-100 ${
                            dark
                                ? 'bg-black/55 text-[#ece3d2] opacity-0 hover:bg-black/75 hover:text-[#ece3d2]'
                                : 'bg-[#16120c]/15 text-[#16120c] opacity-0 hover:bg-[#16120c]/25 hover:text-[#16120c]'
                        }`}
                    >
                        <MoreVerticalIcon className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-56 border border-mir-line bg-mir-surface text-mir-text2 shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
                >
                    <DropdownMenuItem
                        onClick={() => handleToggleFavorite(song.id, song.is_favorited)}
                        disabled={favoriteStates[song.id]}
                        className="cursor-pointer focus:bg-mir-fill2 focus:text-mir-text"
                    >
                        <HeartIcon
                            className={`mr-2 h-4 w-4 ${song.is_favorited ? 'fill-current text-mir-acc' : ''}`}
                        />
                        {favoriteStates[song.id] ? (
                            <span className="flex items-center">
                                <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-mir-text3 border-t-transparent" />
                                Processando...
                            </span>
                        ) : song.is_favorited ? (
                            'Remover dos favoritos'
                        ) : (
                            'Adicionar aos favoritos'
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
                            'Remover música'
                        )}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )

    if (!songs.length) {
        return (
            <section className="w-full bg-[#ece3d2]">
                <div className="mx-auto w-full max-w-[1200px] px-5 py-20 sm:px-8">
                    <div className="rounded-[5px] border border-dashed border-[#16120c]/20 px-8 py-14 text-center font-mono text-[13px] text-[#16120c]/50">
                        nenhuma faixa salva ainda
                    </div>
                </div>
            </section>
        )
    }

    return (
        <>
            {/* FAVORITAS — dark */}
            {favTracks.length > 0 && (
                <section className="w-full border-t border-[#ece3d2]/10 bg-[#16120c]">
                    <div className="mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8">
                        <div className="mb-[30px] flex flex-wrap items-baseline justify-between gap-2.5">
                            <h2 className="m-0 text-[clamp(30px,5vw,40px)] font-extrabold tracking-[-0.04em] text-[#ece3d2]">
                                Favoritas
                            </h2>
                            <span className="font-mono text-[11px] tracking-[0.14em] text-[#ece3d2]/45">
                                {favTracks.length} {favTracks.length === 1 ? 'FAIXA' : 'FAIXAS'} · SELEÇÃO PESSOAL
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-[18px] sm:grid-cols-4 sm:gap-[22px]">
                            {favTracks.map((song) => (
                                <a
                                    key={song.id}
                                    href={song.track_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group"
                                >
                                    <div className="relative overflow-hidden rounded-[5px] shadow-[0_12px_30px_-14px_rgba(0,0,0,0.7)]">
                                        <Cover song={song} big />
                                        <div className="absolute right-[11px] top-[11px] z-[2] grid h-[30px] w-[30px] place-items-center rounded-full bg-[#16120c]/55 text-[#cdef36] backdrop-blur-sm">
                                            <HeartIcon className="h-[15px] w-[15px] fill-current" />
                                        </div>
                                        {canRemove && <OwnerMenu song={song} />}
                                    </div>
                                    <div className="mt-3 truncate text-[15px] font-bold text-[#ece3d2]">
                                        {song.track_title}
                                    </div>
                                    <div className="mt-0.5 truncate font-mono text-[11px] text-[#ece3d2]/50">
                                        {song.artist_name}
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ACERVO SALVO — paper */}
            <section className="w-full bg-[#ece3d2] text-[#16120c]">
                <div className="mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8">
                    <div className="mb-[30px] flex flex-wrap items-end justify-between gap-[18px]">
                        <div>
                            <h2 className="m-0 mb-1.5 text-[clamp(30px,5vw,40px)] font-extrabold tracking-[-0.04em]">
                                Acervo salvo
                            </h2>
                            <span className="font-mono text-[11px] tracking-[0.14em] text-[#16120c]/50">
                                {list.length} {list.length === 1 ? 'FAIXA' : 'FAIXAS'}
                                {filter === 'all' ? ` · ${earlyCount} ANTECIPADAS` : ''}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3.5">
                            <div className="flex gap-1 rounded-full bg-[#16120c]/[0.06] p-1">
                                {FILTERS.map((f) => (
                                    <button
                                        key={f.id}
                                        onClick={() => setFilter(f.id)}
                                        className={`rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] transition ${
                                            filter === f.id
                                                ? 'bg-[#cdef36] text-[#16120c]'
                                                : 'text-[#16120c]/45 hover:text-[#16120c]/70'
                                        }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                            <div className="relative flex items-center">
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value as Sort)}
                                    aria-label="Ordenar"
                                    className="cursor-pointer appearance-none rounded-full border-[1.5px] border-[#16120c]/20 bg-transparent py-2 pl-3.5 pr-8 font-mono text-[12px] text-[#16120c] outline-none transition hover:border-[#16120c]/40"
                                >
                                    <option value="recent">Mais recentes</option>
                                    <option value="old">Mais antigas</option>
                                    <option value="az">Título A–Z</option>
                                    <option value="artist">Artista A–Z</option>
                                </select>
                                <ChevronDownIcon className="pointer-events-none absolute right-[11px] h-3.5 w-3.5 text-[#16120c]/50" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-3.5 gap-y-[22px] sm:grid-cols-[repeat(auto-fill,minmax(170px,1fr))] sm:gap-x-[18px]">
                        {list.length === 0 && (
                            <div className="col-span-full rounded-[5px] border border-dashed border-[#16120c]/20 p-[54px] text-center font-mono text-[13px] text-[#16120c]/50">
                                nenhuma faixa neste filtro
                            </div>
                        )}
                        {list.map((song) => {
                            const early = isEarly(song)
                            return (
                                <a
                                    key={song.id}
                                    href={song.track_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group"
                                >
                                    <div className="relative overflow-hidden rounded-[5px] shadow-[0_10px_22px_-12px_rgba(22,18,12,0.4)] transition duration-200 ease-out group-hover:-translate-y-[5px] group-hover:shadow-[0_18px_34px_-12px_rgba(22,18,12,0.5)]">
                                        <Cover song={song} />
                                        {early && (
                                            <span className="absolute left-[9px] top-[9px] z-[2] inline-flex items-center gap-[5px] rounded-[3px] bg-[#cdef36] px-[7px] py-[3px] font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[#16120c] shadow-[0_2px_6px_rgba(0,0,0,0.25)]">
                                                <FlagIcon className="h-[9px] w-[9px]" />
                                                early
                                            </span>
                                        )}
                                        {song.is_favorited && (
                                            <span className="absolute right-[9px] top-[9px] z-[2] grid h-6 w-6 place-items-center rounded-full bg-[#16120c]/50 text-[#cdef36] backdrop-blur-sm">
                                                <HeartIcon className="h-3 w-3 fill-current" />
                                            </span>
                                        )}
                                        {canRemove && <OwnerMenu song={song} dark={false} />}
                                    </div>
                                    <div className="mt-2.5 truncate text-[14px] font-bold text-[#16120c]">
                                        {song.track_title}
                                    </div>
                                    <div className="mt-0.5 truncate font-mono text-[10px] text-[#16120c]/55">
                                        {song.artist_name}
                                    </div>
                                    <div className="mt-2 flex items-center justify-between font-mono text-[10px]">
                                        <span className="text-[#16120c]/42">
                                            {savedWhen(song.claimedat)}
                                        </span>
                                        {early && (
                                            <span className="flex items-center gap-1 font-bold text-[#16120c]">
                                                <span className="inline-block h-1.5 w-1.5 bg-[#cdef36]" />
                                                {earlyMargin(song)}
                                            </span>
                                        )}
                                    </div>
                                </a>
                            )
                        })}
                    </div>
                </div>
            </section>
        </>
    )
}

export default SongsList
