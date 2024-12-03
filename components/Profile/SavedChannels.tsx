import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CircleIcon } from 'lucide-react'

interface Channel {
    id: string
    channel_id: string
    channel_name: string
    channel_thumbnail: string
    subscriber_count_at_claim: number
    claim_date: string
}

interface SavedChannelsProps {
    channels: Channel[]
}

const SavedChannels: React.FC<SavedChannelsProps> = ({ channels }) => {
    if (!channels || channels.length === 0) {
        return <div>No saved channels found.</div>
    }

    return (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
            {channels.map((channel) => (
                <div
                    key={channel.id}
                    className="flex items-center gap-4 rounded-lg bg-muted p-4"
                >
                    {channel.channel_thumbnail && (
                        <img
                            src={channel.channel_thumbnail}
                            alt={channel.channel_name}
                            width={64}
                            height={64}
                            className="rounded-full"
                        />
                    )}
                    <div className="flex-1">
                        <div className="text-lg font-medium">
                            {channel.channel_name}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className="border-green-600 bg-background"
                            >
                                <CircleIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-green-300 text-green-300" />
                                Watched before it went viral
                            </Badge>
                        </div>
                        <Button variant="outline" size="sm" className="mt-2">
                            View Channel
                        </Button>
                        <p>
                            Claimed on:{' '}
                            {new Date(channel.claim_date).toLocaleDateString()}
                        </p>
                        <p>
                            Subscribers at claim:{' '}
                            {channel.subscriber_count_at_claim}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default SavedChannels
