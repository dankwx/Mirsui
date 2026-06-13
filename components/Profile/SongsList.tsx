'use client'

import React, { useMemo, useState } from 'react'
import {
    MoreVerticalIcon,
    HeartIcon,
    TrashIcon,
    ImageIcon,
    PlayIcon,
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

// tom estável a partir do nome do artista (fallback sem thumbnail)
const TONES = ['#241f1a', '#1c2320', '#27201f', '#1b2026', '#231d27', '#202420', '#2a201b', '#1a2326', '#25211c', '#1d2126', '#26211f', '#1f231d']
const tone = (artist: string) => {
    let h = 0
    for (let i = 0; i < artist.length; i++) h = (h * 31 + artist.charCodeAt(i)) >>> 0
    return TONES[h % TONES.length]
}

const artistInitials = (artist: string) =>
    artist
        .split(',')[0]
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

const Cover = ({ song, className = '' }: { song: Song; className?: string }) => {
    if (song.track_thumbnail) {
        return (
            <img
                src={song.track_thumbnail}
                alt={song.track_title}
                className={`aspect-square w-full object-cover ${className}`}
            />
        )
    }
    return (
        <div
            className={`mir-cover aspect-square w-full ${className}`}
            style={{ '--tone': tone(song.artist_name) } as React.CSSProperties}
        >
            <span className="absolute bottom-0.5 left-2.5 select-none text-[46px] font-extrabold leading-[0.8] tracking-tighter text-white/[0.07]">
                {artistInitials(song.artist_name)}
            </span>
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

    const OwnerMenu = ({ song }: { song: Song }) => (
        <div
            className="absolute right-2 top-2 z-10"
            onClick={(e) => e.preventDefault()}
        >
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-black/55 text-mir-text opacity-0 backdrop-blur-sm transition hover:bg-black/75 hover:text-mir-text group-hover:opacity-100"
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
            <div className="my-10 rounded-xl border border-dashed border-mir-line2 px-8 py-14 text-center font-mono text-[13px] text-mir-text3">
                nenhuma faixa salva ainda
            </div>
        )
    }

    return (
        <>
            {/* FAVORITAS */}
            {favTracks.length > 0 && (
                <section className="pt-8">
                    <div className="mb-[18px] flex flex-wrap items-baseline gap-[11px]">
                        <h3 className="text-[13px] font-bold uppercase tracking-[0.13em] text-mir-text2">
                            Favoritas
                        </h3>
                        <span className="font-mono text-[11px] text-mir-text3">
                            {favTracks.length} {favTracks.length === 1 ? 'faixa' : 'faixas'}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
                        {favTracks.map((song) => (
                            <a
                                key={song.id}
                                href={song.track_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group"
                            >
                                <div className="relative">
                                    <Cover song={song} className="rounded-[13px]" />
                                    <div className="absolute right-[11px] top-[11px] z-[2] grid h-[27px] w-[27px] place-items-center rounded-full bg-black/50 text-mir-acc backdrop-blur-sm">
                                        <HeartIcon className="h-[13px] w-[13px] fill-current" />
                                    </div>
                                    {canRemove && <OwnerMenu song={song} />}
                                </div>
                                <div className="mt-[11px] truncate text-[14.5px] font-semibold text-mir-text">
                                    {song.track_title}
                                </div>
                                <div className="mt-0.5 truncate text-[12.5px] text-mir-text2">
                                    {song.artist_name}
                                </div>
                            </a>
                        ))}
                    </div>
                </section>
            )}

            {/* ACERVO SALVO */}
            <section className="pb-16 pt-9">
                <div className="mb-[18px] flex flex-wrap items-baseline justify-between gap-[18px]">
                    <div className="flex items-baseline gap-[11px]">
                        <h3 className="whitespace-nowrap text-[13px] font-bold uppercase tracking-[0.13em] text-mir-text2">
                            Acervo salvo
                        </h3>
                        <span className="font-mono text-[11px] text-mir-text3">
                            {list.length} {list.length === 1 ? 'faixa' : 'faixas'}
                            {filter === 'all' ? ` · ${earlyCount} antecipadas` : ''}
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-[11px]">
                        <div className="flex gap-1 rounded-full border border-mir-line bg-mir-fill1 p-[3px]">
                            {FILTERS.map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setFilter(f.id)}
                                    className={`rounded-full px-[15px] py-[7px] text-[12.5px] font-semibold transition-colors ${
                                        filter === f.id
                                            ? 'bg-mir-acc text-mir-on-acc'
                                            : 'text-mir-text2 hover:text-mir-text'
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
                                className="cursor-pointer appearance-none rounded-full border border-mir-line bg-mir-fill1 py-2 pl-3.5 pr-8 text-[12.5px] font-semibold text-mir-text outline-none transition hover:border-mir-line2"
                            >
                                <option value="recent">Mais recentes</option>
                                <option value="old">Mais antigas</option>
                                <option value="az">Título A–Z</option>
                                <option value="artist">Artista A–Z</option>
                            </select>
                            <ChevronDownIcon className="pointer-events-none absolute right-[11px] h-3.5 w-3.5 text-mir-text3" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-[repeat(auto-fill,minmax(126px,1fr))] gap-3.5 sm:grid-cols-[repeat(auto-fill,minmax(152px,1fr))] sm:gap-[18px]">
                    {list.length === 0 && (
                        <div className="col-span-full rounded-[13px] border border-dashed border-mir-line2 p-[54px] text-center font-mono text-[13px] text-mir-text3">
                            nenhuma faixa neste filtro
                        </div>
                    )}
                    {list.map((song) => (
                        <a
                            key={song.id}
                            href={song.track_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group"
                        >
                            <div className="relative">
                                <Cover
                                    song={song}
                                    className="rounded-[11px] transition duration-200 ease-out group-hover:-translate-y-[5px] group-hover:shadow-[0_16px_32px_rgba(0,0,0,0.42)]"
                                />
                                {isEarly(song) && (
                                    <span className="absolute left-[9px] top-[9px] z-[2] inline-flex items-center gap-[5px] rounded-md bg-mir-acc px-[7px] py-[3px] font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-mir-on-acc">
                                        <FlagIcon className="h-[9px] w-[9px]" />
                                        early
                                    </span>
                                )}
                                <span className="absolute bottom-2.5 right-2.5 z-[2] grid h-[38px] w-[38px] translate-y-[7px] scale-90 place-items-center rounded-full bg-mir-acc text-mir-on-acc opacity-0 shadow-[0_8px_20px_rgba(0,0,0,0.45)] transition-all duration-200 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100">
                                    <PlayIcon className="h-4 w-4 fill-current" />
                                </span>
                                {canRemove && <OwnerMenu song={song} />}
                            </div>
                            <div className="mt-2.5 truncate text-[13.5px] font-semibold text-mir-text">
                                {song.track_title}
                            </div>
                            <div className="mt-px truncate text-[11.5px] text-mir-text2">
                                {song.artist_name}
                            </div>
                            {savedWhen(song.claimedat) && (
                                <div className="mt-[5px] font-mono text-[10px] text-mir-text3">
                                    {savedWhen(song.claimedat)}
                                </div>
                            )}
                        </a>
                    ))}
                </div>
            </section>
        </>
    )
}

export default SongsList
