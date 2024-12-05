import React from 'react'
import { fetchChannels } from '@/utils/fetchChannels'
import { CircleIcon, StarIcon, TrendingUpIcon, ClockIcon } from 'lucide-react'

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
        <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse border border-gray-300 bg-white shadow-md">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                            Thumbnail
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                            Channel Name
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                            Claim Date
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                            Subscribers
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                            Status
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {channels.map((channel, index) => (
                        <tr
                            key={channel.id}
                            className={
                                index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                            }
                        >
                            <td className="border border-gray-300 px-4 py-2">
                                <img
                                    src={channel.channel_thumbnail}
                                    alt={channel.channel_name}
                                    className="h-16 w-16 rounded object-cover"
                                />
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                                <span className="font-semibold">
                                    {channel.channel_name}
                                </span>
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                                <div className="flex items-center gap-1">
                                    <ClockIcon className="h-4 w-4 text-gray-500" />
                                    {new Date(
                                        channel.claim_date
                                    ).toLocaleDateString('pt-BR')}
                                </div>
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                                <div className="flex items-center gap-1">
                                    <TrendingUpIcon className="h-4 w-4 text-blue-500" />
                                    {channel.subscriber_count_at_claim.toLocaleString()}
                                </div>
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                                {channel.subscriber_count_at_claim > 1000000 ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-600">
                                        🔥 Massive Channel
                                    </span>
                                ) : channel.subscriber_count_at_claim >
                                  100000 ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-600">
                                        🚀 Growing Fast
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-600">
                                        🌱 Up and Coming
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
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
