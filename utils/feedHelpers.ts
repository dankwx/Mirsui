// Função para determinar o badge do usuário baseado na posição e discover rating
export function getUserBadge(position: number, discoverRating?: number): string {
    if (position === 1) return 'Primeiro!'
    if (position <= 3) return 'Early Bird'
    if (position <= 10) return 'Hipster'
    if (discoverRating && discoverRating > 90) return 'Taste Maker'
    if (position <= 50) return 'Discoverer'
    return 'Music Lover'
}

// Função para determinar se o usuário é verificado (baseado em critérios simples)
export function isUserVerified(position: number): boolean {
    return position === 1 // Por exemplo, apenas primeiros claimers são "verificados"
}

// Helper function para formatar timestamp
export function formatTimestamp(timestamp: string): string {
    const now = new Date()
    const claimedDate = new Date(timestamp)
    const diffInSeconds = Math.floor(
        (now.getTime() - claimedDate.getTime()) / 1000
    )

    const minutes = Math.floor(diffInSeconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (diffInSeconds < 60) {
        return 'agora mesmo'
    } else if (minutes < 60) {
        return `${minutes}min`
    } else if (hours < 24) {
        return `${hours}h`
    } else if (days < 7) {
        return `${days}d`
    } else {
        return claimedDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
        })
    }
}