// utils/trackPageService.ts
//
// Monta a página de faixa a partir do ISRC.
//
// O desenho tem uma regra só: **nada de terceiro pode apagar dado que já é
// nosso.** Até 15/08/2026 a página inteira era derivada de uma linha —
// `fetchSpotifyTrackInfo(trackId)` — e quando ela devolvia null não existia
// plano B: sumia a capa, o artista, a ficha técnica e até a curva do
// Observatório, que é medida por nós e não depende de API nenhuma para existir.
//
// DESDE 22/09/2026 A FAIXA DO CATÁLOGO NÃO PERGUNTA AO DEEZER
// Até aqui as duas fontes eram consultadas em paralelo a cada visita:
// `/track/isrc:X` (cache de 15 min) e `/artist/{id}` (24 h). O site e a
// medição dividem a mesma cota do gateway, ~3 req/s, e um robô que percorre
// 100 mil páginas diferentes passa todas fora do cache — o cache protege o que
// é popular, e o robô percorre justamente o que não é. Ver a proposta 1 de
// mirsui-backend/docs/propostas-22-09-2026.md.
//
// Agora, quando o Observatório conhece a gravação, a página sai inteira do
// banco: título, artista, álbum, capa, gênero e popularidade já estavam lá, e
// a migration 037 passou a guardar duração, explícito, data, participações e
// SE existe prévia. A URL da prévia é assinada e vence em horas, então não é
// guardada: o player pede quando alguém aperta play (app/api/previa/[id]).
// Robô não aperta play.
//
// Um efeito que vale por si: a popularidade da ficha passa a ser o MESMO
// número da curva logo abaixo (a medição do dia), e não o rank ao vivo do
// Deezer, que podia não bater com ela na mesma tela.
//
// O Deezer continua sendo a fonte só para a gravação que o Observatório ainda
// não viu — alguém chegou nela pela busca. É um caminho raro: todo link
// interno do site é montado a partir do acervo, e o que alguém salva entra no
// catálogo na rodada seguinte.

import 'server-only'
import { cache } from 'react'
import { supabasePublic } from '@/utils/supabase/public'
import {
    fetchDeezerTrackByISRC,
    fetchDeezerAlbumGenres,
    coverFromMd5,
    type FaixaDeezer,
} from '@/utils/deezerService'
import {
    montarFaixaObservada,
    type FaixaObservada,
} from '@/utils/trackIdentity'
import { montarCurva, type CurvaDaFaixa } from '@/utils/observatoryService'
import type { QuemSalvou } from '@/utils/trackClaims'
import { enderecoDaFaixa } from '@/utils/trackHref'
import { popScore } from '@/utils/popScore'

export interface ArtistaDaPagina {
    /** null quando só temos o nome (fallback local): vira texto, não link */
    id: string | null
    name: string
}

export interface DadosDaFaixa {
    isrc: string
    deezerTrackId: string | null
    title: string
    artists: ArtistaDaPagina[]
    /** já pronto para exibir: "Artista A, Artista B" */
    artistNames: string
    albumName: string | null
    coverUrl: string | null
    releaseDate: string | null
    /** segundos (o Deezer conta em segundos; o Spotify contava em ms) */
    duration: number
    explicit: boolean
    genres: string[] | null
    /** 0-100 por popScore(rank): a MESMA escala da curva logo abaixo na página */
    popularity: number | null
    /**
     * Se há prévia de 30 s no Deezer. null = ainda não sabemos (a faixa não foi
     * medida desde a migration 037): o player aparece e descobre no play.
     * A URL em si nunca passa por aqui — é assinada e vence em horas; quem a
     * busca é app/api/previa/[id], no clique.
     */
    temPrevia: boolean | null
    /** camada 1 do "ouvir no Spotify": id que o job já pagou. Pode ser null. */
    spotifyTrackId: string | null
    /** de onde veio o grosso do que está na tela */
    fonte: 'deezer' | 'observatorio'
    /**
     * O endereço canônico desta gravação — null no caminho legado, que não tem
     * ISRC para endereçar.
     *
     * É montado AQUI, e não na rota, porque só aqui as duas fontes estão à
     * vista: o slug tem que sair do que o Observatório guardou, nunca do título
     * ao vivo do Deezer. Os dois divergem de verdade — medido: "Oitavo Anjo" no
     * acervo contra "Oitavo Anjo (Porque É Proibido Pisar Na Grama)" no Deezer —
     * e como TODO link interno do site é montado a partir do acervo, deixar o
     * canônico seguir o Deezer faria uma fatia dos cliques pagar um 308 à toa.
     *
     * É também o ponto inteiro da forma de URL escolhida: o endereço não pode se
     * mexer porque um terceiro reescreveu uma string.
     */
    enderecoCanonico: string | null
}

/* ------------------------------------------- tudo que é nosso, numa consulta */

/**
 * Uma faixa de um artista vizinho, pronta para a grade de "Parecidas".
 *
 * A vizinhança é montada pela rodada (migration 041) a partir do que a
 * descoberta já perguntou ao Deezer — rádio e artistas relacionados — e das
 * participações. Aqui só chega o que a página desenha.
 */
export interface FaixaRelacionada {
    isrc: string
    title: string
    artistId: string | null
    artistName: string
    albumName: string | null
    /** 500 px, como a discografia do artista: a capa passa de 200 px no
     * tablet e a tela de alta densidade dobra isso */
    coverUrl: string | null
    href: string
}

export interface DadosDaPagina {
    /** a linha do Observatório, ou null se ele ainda não viu esta gravação */
    observada: FaixaObservada | null
    /** a série de audiência medida; null quando não há medição */
    curva: CurvaDaFaixa | null
    /** quantas pessoas salvaram esta gravação, somando as duas formas de chave */
    salvamentos: number
    /** os oito primeiros a salvar, em ordem de chegada */
    quemSalvou: QuemSalvou[]
    /** até seis, uma por artista vizinho; vazio antes da 041 ou sem vizinhos */
    relacionadas: FaixaRelacionada[]
}

const NADA: DadosDaPagina = {
    observada: null,
    curva: null,
    salvamentos: 0,
    quemSalvou: [],
    relacionadas: [],
}

/**
 * Do jsonb da RPC para a grade. Linha sem ISRC, título ou artista fica de
 * fora em vez de virar um link quebrado.
 */
function montarRelacionadas(bruto: unknown): FaixaRelacionada[] {
    if (!Array.isArray(bruto)) return []
    return bruto.flatMap((linha) => {
        const r = linha as {
            isrc?: string | null
            title?: string | null
            deezer_artist_id?: string | null
            artist_name?: string | null
            album_name?: string | null
            cover_md5?: string | null
        }
        if (!r?.isrc || !r.title || !r.artist_name) return []
        return [
            {
                isrc: r.isrc,
                title: r.title,
                artistId: r.deezer_artist_id ?? null,
                artistName: r.artist_name,
                albumName: r.album_name ?? null,
                coverUrl: r.cover_md5 ? coverFromMd5(r.cover_md5, 500) : null,
                href: enderecoDaFaixa(r.isrc, r.artist_name, r.title),
            },
        ]
    })
}

/**
 * Tudo que esta página lê do NOSSO banco, numa requisição só. Desde a 041 vêm
 * junto as "Parecidas", sem requisição a mais.
 *
 * Eram quatro: a linha do Observatório, a curva, a contagem de salvamentos e a
 * lista de quem salvou. Todas chaveadas pelo mesmo ISRC, e três delas partindo
 * literalmente da mesma linha canônica.
 *
 * O motivo de juntar não é o tamanho do dado — é o número de requisições.
 * Medido em 25/08/2026: as quatro somavam ~640 bytes de corpo e ~4.000 bytes de
 * cabeçalho HTTP, porque o PostgREST responde com 1.012 bytes de cabeçalho toda
 * vez, venha o que vier no corpo. 89% do egress do projeto era protocolo. Ver
 * mirsui-backend/migrations/029_pagina_da_faixa_numa_requisicao.sql.
 *
 * `supabasePublic` e não o cliente com cookie: as três tabelas lidas
 * (`observed_tracks`, `tracks`, `profiles`) têm política de SELECT `true` para
 * anon e authenticated, então o papel não muda uma linha do resultado — foi
 * conferido antes de trocar. A RPC é `security invoker` justamente para que
 * continue assim se alguma dessas políticas fechar um dia.
 *
 * `cache()` do React, e só ele: `generateMetadata` e o componente da página
 * pedem os mesmos dados no mesmo request. Não há `unstable_cache` aqui de
 * propósito — quem salvou uma faixa precisa ver o próprio nome na lista ao
 * recarregar, e era assim que estas consultas já se comportavam.
 */
export const carregarDadosDaFaixa = cache(async function carregarDadosDaFaixa(
    isrc: string
): Promise<DadosDaPagina> {
    const { data, error } = await supabasePublic.rpc('get_track_page', {
        p_isrc: isrc,
    })

    if (error) {
        console.error('[faixa] falha ao carregar a página:', error.message)
        return NADA
    }
    if (!data) return NADA

    const b = data as {
        observada?: unknown
        curva?: unknown
        salvamentos?: number | string
        quem_salvou?: unknown
        relacionadas?: unknown
    }

    return {
        observada: montarFaixaObservada(
            (b.observada ?? null) as Parameters<typeof montarFaixaObservada>[0]
        ),
        curva: montarCurva(b.curva ?? null),
        salvamentos: Number(b.salvamentos) || 0,
        quemSalvou: Array.isArray(b.quem_salvou)
            ? (b.quem_salvou as QuemSalvou[])
            : [],
        relacionadas: montarRelacionadas(b.relacionadas),
    }
})

/**
 * A ficha completa de uma gravação. Devolve null só quando nem o Observatório
 * nem o Deezer conhecem o ISRC — e aí a rota responde 404 de verdade, em vez de
 * renderizar "Faixa Desconhecida" com 200.
 *
 * `cache()` do React: `generateMetadata` e o componente da página pedem a mesma
 * faixa no mesmo request, e sem isso seriam duas montagens completas.
 */
export const carregarFaixaPorIsrc = cache(async function carregarFaixaPorIsrc(
    isrc: string
): Promise<DadosDaFaixa | null> {
    const { observada } = await carregarDadosDaFaixa(isrc)
    if (observada) return faixaDoCatalogo(isrc, observada)

    // Fora do catálogo: o único caminho que ainda chama o Deezer na visita.
    const doDeezer = await fetchDeezerTrackByISRC(isrc)
    if (!doDeezer) return null
    return faixaDoDeezer(isrc, doDeezer)
})

/** A gravação que o Observatório mede: tudo do banco, nenhuma requisição. */
function faixaDoCatalogo(isrc: string, local: FaixaObservada): DadosDaFaixa {
    // As participações só existem quando a rodada mediu por /track/{id}; sem
    // elas, fica o artista principal — o crédito que o catálogo sempre teve.
    const artists: ArtistaDaPagina[] = local.contributors ?? [
        { id: local.deezerArtistId, name: local.artistName },
    ]
    const genero = local.genre?.trim() || null

    return {
        isrc,
        deezerTrackId: local.deezerTrackId,
        title: local.title,
        artists,
        artistNames:
            artists.map((a) => a.name).join(', ') || local.artistName,
        albumName: local.albumName,
        coverUrl: local.coverMd5 ? coverFromMd5(local.coverMd5, 1000) : null,
        releaseDate: local.releaseDate,
        duration: local.durationSeconds ?? 0,
        explicit: local.explicitLyrics ?? false,
        genres: genero ? [genero] : null,
        popularity: local.lastPopularity,
        temPrevia: local.hasPreview,
        spotifyTrackId: local.spotifyTrackId,
        fonte: 'observatorio',
        enderecoCanonico: enderecoDaFaixa(isrc, local.artistName, local.title),
    }
}

/**
 * A gravação que o Observatório ainda não viu. Uma requisição para a faixa e,
 * quando o álbum existe, uma para o gênero — que mora no álbum no Deezer.
 * Sem `/artist/{id}`: o número de fãs saiu da ficha junto com esta chamada.
 */
async function faixaDoDeezer(
    isrc: string,
    doDeezer: FaixaDeezer
): Promise<DadosDaFaixa> {
    const generos = doDeezer.albumId
        ? await fetchDeezerAlbumGenres(doDeezer.albumId)
        : null

    return {
        isrc,
        deezerTrackId: doDeezer.deezerId,
        title: doDeezer.title,
        artists: doDeezer.artists,
        artistNames:
            doDeezer.artists.map((a) => a.name).join(', ') ||
            'Artista Desconhecido',
        albumName: doDeezer.albumName,
        coverUrl: doDeezer.coverUrl,
        releaseDate: doDeezer.releaseDate,
        duration: doDeezer.duration,
        explicit: doDeezer.explicit,
        genres: generos,
        popularity: popScore(doDeezer.rank),
        temPrevia: !!doDeezer.previewUrl,
        spotifyTrackId: null,
        fonte: 'deezer',
        enderecoCanonico: enderecoDaFaixa(
            isrc,
            doDeezer.artists[0]?.name,
            doDeezer.title
        ),
    }
}

/**
 * O caminho legado: um id do Spotify que não deu para converter em ISRC nem
 * pela ponte do job, nem pelo acervo, nem perguntando ao Spotify.
 *
 * Não chama API nenhuma. O que sobra é o que o acervo guardou no momento em que
 * alguém salvou a faixa — título, artista, capa e a URL de origem. É pouco, mas
 * é nosso e não some quando um terceiro limita a taxa. Sem nem isso, a rota
 * responde 404 em vez de servir "Faixa Desconhecida" com status 200 para o
 * crawler.
 */
export async function carregarFaixaLegada(
    spotifyId: string
): Promise<DadosDaFaixa | null> {
    const { supabasePublic } = await import('@/utils/supabase/public')

    const { data } = await supabasePublic
        .from('tracks')
        .select('track_title, artist_name, album_name, track_thumbnail')
        .eq('track_uri', `spotify:track:${spotifyId}`)
        .limit(1)
        .maybeSingle()

    const linha = data as {
        track_title?: string
        artist_name?: string
        album_name?: string
        track_thumbnail?: string
    } | null

    if (!linha?.track_title || !linha.artist_name) return null

    return {
        isrc: '',
        deezerTrackId: null,
        title: linha.track_title,
        artists: [{ id: null, name: linha.artist_name }],
        artistNames: linha.artist_name,
        albumName: linha.album_name ?? null,
        coverUrl: linha.track_thumbnail ?? null,
        releaseDate: null,
        duration: 0,
        explicit: false,
        genres: null,
        popularity: null,
        temPrevia: false,
        spotifyTrackId: spotifyId,
        fonte: 'observatorio',
        // Sem ISRC não há endereço canônico a apontar: esta gravação só existe
        // pelo id do Spotify que alguém salvou um dia.
        enderecoCanonico: null,
    }
}
