//components/Artist/ArtistRecentFollowers.tsx

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserPlus } from 'lucide-react'

export default function ArtistRecentFollowers() {
    const users = [
        { name: 'Ana Silva', time: '5 min atrás', avatar: 'AS' },
        { name: 'Carlos Santos', time: '20 min atrás', avatar: 'CS' },
        { name: 'Maria Oliveira', time: '1 hora atrás', avatar: 'MO' },
        { name: 'João Pedro', time: '2 horas atrás', avatar: 'JP' },
        { name: 'Lucia Costa', time: '4 horas atrás', avatar: 'LC' },
    ]
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Seguidores Recentes
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {users.map((user, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={`/placeholder-user.jpg`} />
                            <AvatarFallback className="text-xs">
                                {user.avatar}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">
                                {user.name}
                            </p>
                            <p className="text-xs text-gray-500">{user.time}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
