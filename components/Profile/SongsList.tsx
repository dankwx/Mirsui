'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    ChevronDown,
    Heart,
    ImageIcon,
    MoreHorizontal,
    Trash2,
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import RecordCover from '@/components/Club/RecordCover'
import shellStyles from '@/components/Club/ClubShell.module.css'
import recipes from '@/components/Club/club-recipes.module.css'
import { useCertificateGeneratorSimple } from '@/hooks/use-certificate-generator-simple'
import { removeTrack, toggleFavorite } from './actions'
import { trackHref } from './trackHref'
import type { Song } from '@/types/profile'
import styles from './SongsList.module.css'

type SongsListProps = {
    songs: Song[]
    canRemove?: boolean
    userData?: {
        display_name: string
        username: string
        avatar_url?: string | null
    }
}

const MESES = [
    'jan',
    'fev',
    'mar',
    'abr',
    'mai',
    'jun',
    'jul',
    'ago',
    'set',
    'out',
    'nov',
    'dez',
]

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

const SongsList: React.FC<SongsListProps> = ({ songs, canRemove = false, userData }) => {
    const [filter, setFilter] = useState<Filter>('all')
    const [sort, setSort] = useState<Sort>('recent')
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
    const [favoriteStates, setFavoriteStates] = useState<Record<string, boolean>>({})
    const router = useRouter()
    const { generateCertificate, isGenerating } = useCertificateGeneratorSimple()

    const firstCount = songs.filter((song) => song.position === 1).length
    const favCount = songs.filter((song) => song.is_favorited).length

    const filters = useMemo(() => {
        const list: { id: Filter; label: string; count: number }[] = [
            { id: 'all', label: 'Tudo', count: songs.length },
        ]
        if (firstCount > 0) {
            list.push({ id: 'first', label: 'Cheguei em 1º', count: firstCount })
        }
        if (favCount > 0) {
            list.push({ id: 'fav', label: 'Favoritas', count: favCount })
        }
        return list
    }, [songs.length, firstCount, favCount])

    const list = useMemo(() => {
        let result = songs.slice()
        if (filter === 'first') result = result.filter((song) => song.position === 1)
        if (filter === 'fav') result = result.filter((song) => song.is_favorited)

        const time = (song: Song) =>
            song.claimedat ? new Date(song.claimedat).getTime() : 0
        if (sort === 'recent') result.sort((a, b) => time(b) - time(a))
        else if (sort === 'old') result.sort((a, b) => time(a) - time(b))
        else if (sort === 'position') {
            result.sort((a, b) => (a.position ?? 1e9) - (b.position ?? 1e9))
        } else if (sort === 'az') {
            result.sort((a, b) => a.track_title.localeCompare(b.track_title))
        } else {
            result.sort((a, b) => a.artist_name.localeCompare(b.artist_name))
        }
        return result
    }, [songs, filter, sort])

    const grouped = sort === 'recent' || sort === 'old'

    const items = useMemo(() => {
        let currentMonth: string | null = null
        return list.map((song) => {
            if (!grouped) return { song, month: null as string | null }
            const label = mesAno(song.claimedat)
            const isNew = label && label !== currentMonth
            if (isNew) currentMonth = label
            return { song, month: isNew ? label : null }
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
        <div className={styles.ownerMenu} onClick={(event) => event.preventDefault()}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        aria-label="Opções da faixa"
                        className={styles.ownerTrigger}
                    >
                        <MoreHorizontal size={15} aria-hidden="true" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={styles.menu}>
                    <DropdownMenuItem
                        onClick={() => handleToggleFavorite(song.id, song.is_favorited)}
                        disabled={favoriteStates[song.id]}
                        className={styles.menuItem}
                    >
                        <Heart
                            className={song.is_favorited ? styles.favoriteMenuIcon : ''}
                            aria-hidden="true"
                        />
                        {favoriteStates[song.id] ? (
                            <span className={styles.processing}>Processando...</span>
                        ) : song.is_favorited ? (
                            'Tirar das favoritas'
                        ) : (
                            'Botar nas favoritas'
                        )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className={styles.menuSeparator} />
                    <DropdownMenuItem
                        onClick={() => handleGenerateCertificate(song)}
                        disabled={isGenerating}
                        className={styles.menuItem}
                    >
                        <ImageIcon aria-hidden="true" />
                        {isGenerating ? 'Gerando discovery card...' : 'Gerar discovery card'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className={styles.menuSeparator} />
                    <DropdownMenuItem
                        onClick={() => handleRemoveTrack(song.id, song.track_title)}
                        disabled={loadingStates[song.id]}
                        className={`${styles.menuItem} ${styles.removeItem}`}
                    >
                        <Trash2 aria-hidden="true" />
                        {loadingStates[song.id] ? 'Removendo...' : 'Remover do acervo'}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )

    const Tile = ({ song, month }: { song: Song; month: string | null }) => (
        <div className={styles.tile}>
            {grouped && (
                <div className={styles.monthMarker}>
                    {month && (
                        <>
                            <span>{month}</span>
                            <span aria-hidden="true" />
                        </>
                    )}
                </div>
            )}
            <div className={styles.coverWrap}>
                <Link href={trackHref(song)} aria-label={`${song.track_title}, ${song.artist_name}`}>
                    <RecordCover
                        src={song.track_thumbnail}
                        alt={`Capa de ${song.track_title}`}
                    />
                </Link>
                {canRemove && <OwnerMenu song={song} />}
            </div>
            <Link href={trackHref(song)} className={styles.tileInfo}>
                <div className={styles.title} title={song.track_title}>
                    {song.track_title}
                </div>
                <div className={styles.artist} title={song.artist_name}>
                    {song.artist_name}
                </div>
                <div className={styles.dataLine}>
                    {song.position !== null && (
                        <span
                            title={`${song.position}ª a salvar`}
                            className={song.position === 1 ? styles.positionAccent : styles.position}
                        >
                            {song.position}ª
                        </span>
                    )}
                    {!grouped && <span>{mesAno(song.claimedat)}</span>}
                    {song.is_favorited && (
                        <Heart size={12} fill="currentColor" aria-label="Favorita" />
                    )}
                </div>
            </Link>
        </div>
    )

    if (!songs.length) {
        return (
            <section className={styles.section}>
                <div className={`${shellStyles.container} ${styles.container}`}>
                    <div className={styles.heading}>
                        <h2>Acervo</h2>
                        <p>0 faixas</p>
                    </div>
                    <div className={styles.empty}>
                        <p>Nenhuma faixa salva ainda.</p>
                        <Link href="/pilha" className={recipes.button}>
                            Revirar a pilha ↗
                        </Link>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className={styles.section}>
            <div className={`${shellStyles.container} ${styles.container}`}>
                <div className={styles.headingRow}>
                    <div className={styles.heading}>
                        <h2>Acervo</h2>
                        <p>
                            {list.length} {list.length === 1 ? 'faixa' : 'faixas'}
                        </p>
                    </div>
                    <div className={styles.sortControl}>
                        <select
                            value={sort}
                            onChange={(event) => setSort(event.target.value as Sort)}
                            aria-label="Ordenar acervo"
                        >
                            {SORTS.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={14} aria-hidden="true" />
                    </div>
                </div>

                {filters.length > 1 && (
                    <div className={`${recipes.filters} ${styles.filters}`} role="group" aria-label="Filtrar acervo">
                        {filters.map((item) => (
                            <button
                                type="button"
                                key={item.id}
                                onClick={() => setFilter(item.id)}
                                aria-pressed={filter === item.id}
                                className={filter === item.id ? recipes.filterActive : recipes.filter}
                            >
                                {item.label}{' '}
                                <span className={styles.filterCount}>{item.count}</span>
                            </button>
                        ))}
                    </div>
                )}

                {list.length === 0 ? (
                    <div className={styles.emptyFilter}>Nenhuma faixa neste filtro.</div>
                ) : (
                    <div className={styles.grid}>
                        {items.map(({ song, month }) => (
                            <Tile key={song.id} song={song} month={month} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default SongsList
