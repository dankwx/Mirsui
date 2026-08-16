// lib/formatters.ts

// Helper function to format duration
export function formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// Helper function to format release date
export function formatReleaseDate(dateString: string): string {
    const date = new Date(dateString)
    return date.getFullYear().toString()
}

// Helper function to get album type in Portuguese
//
// O vocabulário do Deezer (`record_type`) é quase o mesmo do Spotify, com duas
// diferenças: ele diz 'compile' em vez de 'compilation' e tem 'ep', que o
// Spotify não distingue. A página de artista normaliza para os três tipos que
// as abas mostram; os apelidos do Deezer ficam aqui para que nenhum rótulo cru
// vaze para a tela.
export function getAlbumTypeLabel(type: string): string {
    switch (type) {
        case 'album':
            return 'Álbum'
        case 'single':
            return 'Single'
        case 'ep':
            return 'EP'
        case 'compilation':
        case 'compile':
            return 'Coletânea'
        default:
            return type
    }
}