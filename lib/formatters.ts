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
export function getAlbumTypeLabel(type: string): string {
    switch (type) {
        case 'album':
            return 'Álbum'
        case 'single':
            return 'Single'
        case 'compilation':
            return 'Coletânea'
        default:
            return type
    }
}