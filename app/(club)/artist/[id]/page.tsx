// app/(club)/artist/[id]/page.tsx
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
//
// A PÁGINA NA IDENTIDADE CLUB (19/09/2026)
// Vive no grupo `(club)`, com o shell, o header e o rodapé compactos de
// DESIGN.md, na linha "Faixa / artista" do guia: foto, nome, contexto e ação
// dominam a abertura; os números têm função; as mais ouvidas são uma lista
// densa; a discografia é um grid de capas; a precedência é dado real do
// acervo. Saíram as listas de seguidores e fãs com nomes fictícios, o
// "Artista Verificado" e o contador de seguidores no Mirsui que era sempre 0.
// Desde a migration 038, artistas medidos saem do catálogo; o Deezer atende
// apenas artistas que ainda não estão nele.

import { permanentRedirect, notFound } from 'next/navigation'
import { carregarArtista } from '@/utils/artistPageService'
import { precedenciaDoArtista } from '@/utils/artistClaims'
import { searchDeezerArtists } from '@/utils/deezerService'
import { enderecoDoArtista, idDoArtistaNoEndereco } from '@/utils/artistHref'
import type { Metadata } from 'next'
import shellStyles from '@/components/Club/ClubShell.module.css'
import ArtistHero from '@/components/Artist/ArtistHero'
import MaisOuvidas, { type FaixaListada } from '@/components/Artist/MaisOuvidas'
import Discografia from '@/components/Artist/Discografia'
import QuemGarimpou from '@/components/Artist/QuemGarimpou'
import { ano } from '@/components/Artist/format'
import styles from '@/components/Artist/ArtistPage.module.css'

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
        !!(
            process.env.SPOTIFY_CLIENT_ID ||
            process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
        ) &&
        !!(
            process.env.SPOTIFY_CLIENT_SECRET ||
            process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET
        )
    if (!temCredencial) return null

    try {
        const { fetchSpotifyArtistInfo } = await import(
            '@/utils/spotifyService'
        )
        const doSpotify = await fetchSpotifyArtistInfo(spotifyArtistId)
        if (!doSpotify?.name) return null

        const achados = await searchDeezerArtists(doSpotify.name, 1)
        return achados[0]?.id ?? null
    } catch {
        return null
    }
}

/** O endereço canônico de um id do Deezer, já com o nome do artista no slug. */
async function canonicoDe(deezerId: string): Promise<string> {
    const dados = await carregarArtista(deezerId)
    return enderecoDoArtista(deezerId, dados?.artista.name)
}

/** `permanentRedirect` lança, então quem chama não continua depois dele. */
async function resolver(bruto: string): Promise<string | null> {
    const id = decodeURIComponent(bruto || '').trim()

    // O id do Spotify vem primeiro porque é o único formato de comprimento
    // fixo e sem hífen: nenhum endereço `slug-id` pode ser confundido com ele.
    if (SPOTIFY_ID_RE.test(id)) {
        const doDeezer = await idDoDeezerPorIdDoSpotify(id)
        if (doDeezer) permanentRedirect(await canonicoDe(doDeezer))
        return null
    }

    // Cobre as duas formas de uma vez: o id puro (`/artist/4050205`, que é como
    // as URLs antigas circularam) e a forma com slug. `DEEZER_ID_RE` saiu daqui
    // porque `idDoArtistaNoEndereco` já trata "só dígitos" como caso próprio.
    const doDeezer = idDoArtistaNoEndereco(id)
    if (!doDeezer) return null

    const canonico = await canonicoDe(doDeezer)
    if (`/artist/${id}` !== canonico) permanentRedirect(canonico)

    return doDeezer
}

export async function generateMetadata({
    params,
}: {
    params: { id: string }
}): Promise<Metadata> {
    const id = await resolver(params.id).catch(() => null)
    const dados = id ? await carregarArtista(id) : null

    // `!id` junto com `!dados` só para o TypeScript estreitar o tipo: `dados`
    // não existe sem `id`, mas ele não deduz isso sozinho.
    if (!id || !dados) {
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
        }. Veja quem descobriu suas músicas primeiro e explore seus lançamentos.`,
        // Um artista, um endereço — mesma razão da ficha da faixa.
        alternates: { canonical: enderecoDoArtista(id, dados.artista.name) },
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

    const { artista, topTracks, albuns, fonte } = dados

    /**
     * `/artist/{id}/top` do Deezer não traz data de lançamento, mas traz o id
     * do álbum — e a lista de álbuns, já carregada, traz a data. Casar os dois
     * aqui dá o ano de cada faixa sem requisição nova, e conserta a ordenação
     * por lançamento, que comparava datas vazias.
     */
    const anoPorAlbum = new Map(
        albuns.map((a) => [a.id, ano(a.release_date)] as const)
    )

    // O que é nosso: quem já guardou estas faixas. Uma consulta, dado real;
    // se falhar, a seção simplesmente não aparece.
    const precedencia = await precedenciaDoArtista(topTracks)

    const faixas: FaixaListada[] = topTracks.map((t) => ({
        ...t,
        ano: ano(t.album.release_date) ?? anoPorAlbum.get(t.album.id) ?? null,
        salvos: precedencia?.porFaixa[t.uri] ?? 0,
    }))

    return (
        <div>
            <ArtistHero
                artista={artista}
                lancamentos={albuns.length}
                faixasMedidas={topTracks.length}
                fonte={fonte}
            />

            <div className={`${shellStyles.container} ${styles.body}`}>
                <MaisOuvidas
                    faixas={faixas}
                    artistaId={artista.id}
                    fonte={fonte}
                />

                {precedencia && (
                    <aside className={styles.rail}>
                        <QuemGarimpou
                            precedencia={precedencia}
                            nomeDoArtista={artista.name}
                        />
                    </aside>
                )}
            </div>

            <div className={styles.discography}>
                <div className={shellStyles.container}>
                    <Discografia albuns={albuns} fonte={fonte} />
                </div>
            </div>
        </div>
    )
}
