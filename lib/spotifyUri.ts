/**
 * Extrai o ID de uma URI do Spotify no formato "spotify:track:<ID>"
 *
 * @param uri A URI do Spotify (ex: "spotify:track:4HlKWrtnTpOZWJXcKtDLGl")
 * @returns O ID do item (ex: "4HlKWrtnTpOZWJXcKtDLGl")
 */
export function extractSpotifyIdFromUri(uri: string): string {
    const parts = uri.split(':')
    if (parts.length === 3 && parts[0] === 'spotify') {
        return parts[2]
    }
    throw new Error(`Formato de URI inválido: ${uri}`)
}
