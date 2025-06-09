// utils/fetchTrackInfo.ts - Versão aprimorada com YouTube

import { createClient } from '@/utils/supabase/server'
import { searchYouTubeVideo } from '@/utils/youtubeService'

/**
 * Fetches the count of how many times a specific Spotify track URI appears in the 'tracks' table.
 *
 * @param {string} spotifyTrackUri - The Spotify URI of the track to count.
 * @returns {Promise<number>} A promise that resolves to the number of occurrences of the track URI.
 * Returns 0 if an error occurs or no occurrences are found.
 */
export async function countTrackOccurrences(
    spotifyTrackUri: string
): Promise<number> {
    const supabase = createClient()

    const { count, error } = await supabase
        .from('tracks')
        .select('*', { count: 'exact', head: true })
        .eq('track_uri', spotifyTrackUri)

    if (error) {
        console.error('Error counting track occurrences:', error)
        return 0
    }

    return count || 0
}

/**
 * Interface para dados de track completos (Spotify + YouTube)
 */
export interface TrackData {
    trackUri: string
    trackName: string
    artistName: string
    albumName: string
    spotifyUrl: string
    youtubeUrl?: string
    trackThumbnail: string
    popularity: number
    duration_ms: number
    userId: string
    position?: number
}

/**
 * Busca informações do YouTube para uma música e salva na tabela
 * @param trackData Dados da música do Spotify
 * @returns Promise com URL do YouTube ou null
 */
export async function findAndSaveYouTubeUrl(
    trackData: TrackData
): Promise<string | null> {
    try {
        console.log(
            '[fetchTrackInfo] Iniciando busca de URL do YouTube para:',
            trackData.trackName,
            '-',
            trackData.artistName
        )
        // Busca no YouTube
        const youtubeUrl = await searchYouTubeVideo(
            trackData.trackName,
            trackData.artistName
        )
        console.log(
            '[fetchTrackInfo] Resultado da busca de URL do YouTube:',
            youtubeUrl
        )
        if (youtubeUrl) {
            console.log(
                `[fetchTrackInfo] YouTube URL encontrada: ${youtubeUrl}`
            )
            return youtubeUrl
        } else {
            console.log(
                `[fetchTrackInfo] Nenhuma URL do YouTube encontrada para: ${trackData.trackName} - ${trackData.artistName}`
            )
            return null
        }
    } catch (error) {
        console.error('[fetchTrackInfo] Erro ao buscar URL do YouTube:', error)
        return null
    }
}

/**
 * Salva uma música na tabela tracks com informações do Spotify e YouTube
 * @param trackData Dados completos da música
 * @returns Promise com sucesso/erro
 */
export async function saveTrackWithYouTube(
    trackData: TrackData
): Promise<{ success: boolean; error?: string; data?: any }> {
    const supabase = createClient()

    try {
        console.log(
            '[fetchTrackInfo] Iniciando saveTrackWithYouTube para:',
            trackData
        )
        // Busca URL do YouTube
        const youtubeUrl = await findAndSaveYouTubeUrl(trackData)
        console.log(
            '[fetchTrackInfo] URL do YouTube retornada para inserção:',
            youtubeUrl
        )
        // Prepara dados para inserção
        const insertData = {
            user_id: trackData.userId,
            track_uri: trackData.trackUri,
            track_name: trackData.trackName,
            artist_name: trackData.artistName,
            album_name: trackData.albumName,
            spotify_url: trackData.spotifyUrl,
            youtube_url: youtubeUrl, // Pode ser null se não encontrar
            track_thumbnail: trackData.trackThumbnail,
            popularity: trackData.popularity,
            duration_ms: trackData.duration_ms,
            position: trackData.position,
            created_at: new Date().toISOString(),
        }
        console.log(
            '[fetchTrackInfo] Dados preparados para inserção na tabela tracks:',
            insertData
        )
        // Insere na tabela
        const { data, error } = await supabase
            .from('tracks')
            .insert(insertData)
            .select()
            .single()
        if (error) {
            console.error(
                '[fetchTrackInfo] Erro ao salvar track na database:',
                error
            )
            return { success: false, error: error.message }
        }
        console.log('[fetchTrackInfo] Track salvo com sucesso:', data)
        return { success: true, data }
    } catch (error) {
        console.error('[fetchTrackInfo] Erro geral ao salvar track:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
    }
}

/**
 * Verifica se o usuário já reivindicou uma música
 * @param userId ID do usuário
 * @param trackUri URI da música do Spotify
 * @returns Promise com informações da reivindicação ou null
 */
export async function checkUserTrackClaim(
    userId: string,
    trackUri: string
): Promise<{
    claimed: boolean
    position?: number
    youtubeUrl?: string
} | null> {
    const supabase = createClient()

    try {
        const { data, error } = await supabase
            .from('tracks')
            .select('position, youtube_url')
            .eq('user_id', userId)
            .eq('track_uri', trackUri)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                // Nenhum resultado encontrado
                return { claimed: false }
            }
            console.error('Erro ao verificar reivindicação:', error)
            return null
        }

        return {
            claimed: true,
            position: data.position,
            youtubeUrl: data.youtube_url,
        }
    } catch (error) {
        console.error('Erro ao verificar reivindicação:', error)
        return null
    }
}

/**
 * Atualiza uma música existente com URL do YouTube
 * @param trackUri URI da música
 * @param userId ID do usuário
 * @returns Promise com sucesso/erro
 */
export async function updateTrackWithYouTube(
    trackUri: string,
    userId: string,
    trackName: string,
    artistName: string
): Promise<{ success: boolean; youtubeUrl?: string; error?: string }> {
    const supabase = createClient()

    try {
        // Busca URL do YouTube
        const youtubeUrl = await searchYouTubeVideo(trackName, artistName)

        if (!youtubeUrl) {
            return { success: false, error: 'URL do YouTube não encontrada' }
        }

        // Atualiza a música existente
        const { data, error } = await supabase
            .from('tracks')
            .update({ youtube_url: youtubeUrl })
            .eq('track_uri', trackUri)
            .eq('user_id', userId)
            .select()

        if (error) {
            console.error('Erro ao atualizar track com YouTube:', error)
            return { success: false, error: error.message }
        }

        console.log('Track atualizado com YouTube URL:', youtubeUrl)
        return { success: true, youtubeUrl }
    } catch (error) {
        console.error('Erro ao atualizar track:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
    }
}
