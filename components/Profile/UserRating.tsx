import { HeadphonesIcon, TrendingUpIcon, UsersIcon } from 'lucide-react'
import { Badge } from '../ui/badge'

export default function UserRating() {
    return (
        <div>
            <div className="ml-8 flex h-fit w-20 flex-col items-center justify-center rounded-full bg-gray-200 p-2">
                <h2 className="text-2xl font-bold">87</h2>
            </div>
            <div className="ml-0 mt-2 flex justify-center">
                <Badge
                    variant={'outline'}
                    className="mr-2 border-purple-300 bg-purple-100 text-purple-800"
                >
                    <HeadphonesIcon className="mr-2 h-4 w-4" />
                    <p>Audiophile</p>
                </Badge>
                <Badge
                    variant={'outline'}
                    className="mr-2 border-green-300 bg-green-100 text-green-800"
                >
                    <TrendingUpIcon className="mr-2 h-4 w-4" />
                    <p>Trending Spotter</p>
                </Badge>
                <Badge
                    variant={'outline'}
                    className="mr-2 border-blue-300 bg-blue-100 text-blue-800"
                >
                    <UsersIcon className="mr-2 h-4 w-4" />
                    <p>Subscriber Magnet</p>
                </Badge>
            </div>
        </div>
    )
}
