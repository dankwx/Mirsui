// app/(dashboard)/artist/[id]/page.tsx
//
// A página de artista, endereçada pelo id do Deezer.
//
// Era 100% Spotify, e a seção principal estava quebrada havia meses sem que
// nada gritasse: `/artists/{id}/top-tracks` responde **403** desde abril — não
// é rate limit, é restrição de plataforma. O equivalente do Deezer funciona,
// devolve até 99 faixas por requisição (contra 10) e cada uma vem com rank, que
// é a métrica que o Observatório e os Stakes já usam.
//
// Ver docs/plano-independencia-do-spotify.md, fase 3.

import { permanentRedirect, notFound } from 'next/navigation'
import { carregarArtista } from '@/utils/artistPageService'
import { searchDeezerArtists } from '@/utils/deezerService'
import type { Metadata } from 'next'

import ArtistHeroSection from '@/components/Artist/ArtistHeroSection'
import ArtistStatsGrid from '@/components/Artist/ArtistStatsGrid'
import ArtistTopTracks from '@/components/Artist/ArtistTopTracks'
import ArtistDiscographyTabs from '@/components/Artist/ArtistDiscographyTabs'
import ArtistRecentFollowers from '@/components/Artist/ArtistRecentFollowers'
import ArtistTopFans from '@/components/Artist/ArtistTopFans'
import ArtistDetailsCard from '@/components/Artist/ArtistDetailsCard'
import ArtistAllTracksSimple from '@/components/Artist/ArtistAllTracksSimple'
import ArtistTrackStats from '@/components/Artist/ArtistTrackStats'

const DEEZER_ID_RE = /^\d+$/
const SPOTIFY_ID_RE = /^[A-Za-z0-9]{22}$/

/**
 * URL antiga, com id de artista do Spotify.
 *
 * A única ponte possível é o nome: o Deezer não conhece ids do Spotify e nós
 * nunca guardamos essa correspondência (observed_tracks tem deezer_artist_id,
 * não o do Spotify). Então pergunta-se o nome ao Spotify uma vez, acha-se o
 * artista no Deezer e redireciona-se de vez — depois disso a URL nunca mais
 * precisa de ninguém.
 *
 * Sem credencial do Spotify isto simplesmente não roda, e a URL antiga vira
 * 404. É o preço de um formato de id que nunca foi nosso, e é a razão de o
 * endereço novo ser de outra natureza.
 */
async function idDoDeezerPorIdDoSpotify(
    spotifyArtistId: string
): Promise<string | null> {
    const temCredencial =
        !!(process.env.SPOTIFY_CLIENT_ID || process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID) &&
        !!(process.env.SPOTIFY_CLIENT_SECRET || process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET)
    if (!temCredencial) return null

    try {
        const { fetchSpotifyArtistInfo } = await import('@/utils/spotifyService')
        const doSpotify = await fetchSpotifyArtistInfo(spotifyArtistId)
        if (!doSpotify?.name) return null

        const achados = await searchDeezerArtists(doSpotify.name, 1)
        return achados[0]?.id ?? null
    } catch {
        return null
    }
}

/** `permanentRedirect` lança, então quem chama não continua depois dele. */
async function resolver(bruto: string): Promise<string | null> {
    const id = decodeURIComponent(bruto || '').trim()

    if (DEEZER_ID_RE.test(id)) return id

    if (SPOTIFY_ID_RE.test(id)) {
        const doDeezer = await idDoDeezerPorIdDoSpotify(id)
        if (doDeezer) permanentRedirect(`/artist/${doDeezer}`)
    }

    return null
}

export async function generateMetadata({
    params,
}: {
    params: { id: string }
}): Promise<Metadata> {
    const id = await resolver(params.id).catch(() => null)
    const dados = id ? await carregarArtista(id) : null

    if (!dados) {
        return {
            title: 'Artista - Mirsui',
            description: 'Descubra informações sobre este artista no Mirsui.',
        }
    }

    const fas = dados.artista.followers.total
        ? new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(
              dados.artista.followers.total
          )
        : ''

    return {
        title: `${dados.artista.name} | Mirsui`,
        description: `Descubra ${dados.artista.name} no Mirsui${
            fas ? ` — ${fas} fãs` : ''
        }. Veja quem descobriu suas músicas primeiro e explore a discografia completa.`,
    }
}

export default async function ArtistDetailsPage({
    params,
}: {
    params: { id: string }
}) {
    const id = await resolver(params.id)
    if (!id) notFound()

    const dados = await carregarArtista(id)
    if (!dados) notFound()

    const { artista, topTracks, albuns } = dados

    const albums = albuns.filter((a) => a.album_type === 'album')
    const singles = albuns.filter((a) => a.album_type === 'single')
    const compilations = albuns.filter((a) => a.album_type === 'compilation')

    const artistImageUrl = artista.images[0]?.url || '/placeholder-artist.svg'
    const artistUrl = artista.external_urls.spotify

    // Seguidores do artista DENTRO do Mirsui. O número era 142 chumbado no
    // código; virou 0 porque essa feature não existe, e zero honesto vale mais
    // que cento e quarenta e dois inventados.
    const totalFollows = 0
    const hasUserFollowed = false

    const formatFollowers = (count: number) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
        return count.toString()
    }

    const fas = artista.followers.total
        ? formatFollowers(artista.followers.total)
        : 'N/A'

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Column - Artist Info */}
                <div className="space-y-6 lg:col-span-2">
                    <ArtistHeroSection
                        artistInfo={artista}
                        artistImageUrl={artistImageUrl}
                        artistUrl={artistUrl}
                        hasUserFollowed={hasUserFollowed}
                    />
                    <ArtistStatsGrid
                        totalFollows={totalFollows}
                        fas={fas}
                        popularity={artista.popularity}
                        totalAlbums={albuns.length}
                    />
                    <ArtistTopTracks topTracks={topTracks} />

                    <ArtistTrackStats topTracks={topTracks} albums={albuns} />

                    <ArtistAllTracksSimple topTracks={topTracks} albums={albuns} />

                    <ArtistDiscographyTabs
                        albums={albums}
                        singles={singles}
                        compilations={compilations}
                    />
                </div>

                {/* Right Column - Activity */}
                <div className="space-y-6">
                    <ArtistRecentFollowers />
                    <ArtistTopFans />
                    <ArtistDetailsCard
                        genres={artista.genres}
                        popularity={artista.popularity}
                        fas={fas}
                        totalAlbums={albuns.length}
                        formatFollowers={formatFollowers}
                    />
                </div>
            </div>
        </div>
    )
}
