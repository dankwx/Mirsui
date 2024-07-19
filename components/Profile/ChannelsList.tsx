import React from 'react'
import { fetchChannels } from '@/utils/fetchChannels'
import { Badge } from '../ui/badge'
import { CircleIcon } from 'lucide-react'
import { Button } from '../ui/button'

type Channel = {
    id: string
    channel_id: string
    channel_name: string
    channel_thumbnail: string
    subscriber_count_at_claim: number
    claim_date: string
}

type ChannelsListProps = {
    channels: Channel[]
}

const ChannelsList: React.FC<ChannelsListProps> = ({ channels }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {channels.map((channel) => (
                <div key={channel.id} className="flex items-center gap-4 bg-muted p-4 rounded-lg">
                    <img
                        src={channel.channel_thumbnail}
                        alt={channel.channel_name}
                        width={64} height={64} className="rounded-md"
                    />
                    <div className="flex-1">
                        <div className="text-lg font-medium">{channel.channel_name}</div>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="border-green-600 bg-background">
                                <CircleIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-green-300 text-green-300" />
                                Watched before it went viral
                            </Badge>
                        </div>
                        <Button variant="outline" size="sm" className="mt-2">
                            View Channel
                        </Button>
                        {/* <p>
                            Claimed on: {new Date(channel.claim_date).toLocaleDateString()}
                        </p>
                        <p>Subscribers at claim: {channel.subscriber_count_at_claim}</p> */}
                    </div>
                </div>
            ))}
        </div>
    )
}

export async function getServerSideProps(context: {
    params: { userId: string }
}) {
    const { userId } = context.params
    const channels = await fetchChannels(userId)
    return { props: { channels } }
}

export default ChannelsList
