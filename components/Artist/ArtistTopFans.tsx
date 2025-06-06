import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Award, Star } from 'lucide-react'

export default function ArtistTopFans() {
  const users = [
    { name: 'MusicFan2024', follows: 156, rank: 1 },
    { name: 'ArtistLover', follows: 134, rank: 2 },
    { name: 'SoundExplorer', follows: 98, rank: 3 },
  ]
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Maiores Fãs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {users.map((user, index) => (
          <div key={index} className="flex items-center gap-3">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                user.rank === 1
                  ? 'bg-yellow-100 text-yellow-800'
                  : user.rank === 2
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-orange-100 text-orange-800'
              }`}
            >
              {user.rank}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-gray-500">{user.follows} artistas seguidos</p>
            </div>
            {user.rank === 1 && <Star className="h-4 w-4 text-yellow-500" />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
