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