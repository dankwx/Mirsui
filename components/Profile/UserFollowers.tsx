import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'

interface User {
    id: string
    first_name: string
    last_name: string
    avatar_url: string | null
    username: string | null
}

interface FollowersFollowingSectionProps {
    totalFollowers: User[]
    totalFollowing: User[]
}

const FollowersFollowingSection: React.FC<FollowersFollowingSectionProps> = ({
    totalFollowers,
    totalFollowing,
}) => {
    return (
        <div className="ml-6 mr-2 flex items-center space-x-4 rounded-md bg-neutral-200 px-6 font-sans">
            <Dialog>
                <DialogTrigger asChild>
                    <div className="flex cursor-pointer flex-col items-center hover:opacity-80">
                        <span className="text-2xl font-bold text-gray-800">
                            {totalFollowers.length}
                        </span>
                        <span className="text-sm text-gray-600">
                            Seguidores
                        </span>
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Seguidores</DialogTitle>
                    </DialogHeader>
                    <div className="p-4">
                        {totalFollowers.map((user) => (
                            <div key={user.id} className="flex flex-row py-2 bg-red-300">
                                <Avatar className="mr-4 h-20 w-20">
                                    {user.avatar_url ? (
                                        <AvatarImage src={user.avatar_url} />
                                    ) : (
                                        <AvatarFallback>PF</AvatarFallback>
                                    )}
                                </Avatar>

                                <p className="text-gray-800">
                                    {user.last_name}
                                </p>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog>
                <DialogTrigger asChild>
                    <div className="flex cursor-pointer flex-col items-center hover:opacity-80">
                        <span className="text-2xl font-bold text-gray-800">
                            {totalFollowing.length}
                        </span>
                        <span className="text-sm text-gray-600">Seguindo</span>
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Seguindo</DialogTitle>
                    </DialogHeader>
                    <div className="p-4">
                        {totalFollowing.map((user) => (
                            <div key={user.id} className="flex flex-row py-2 bg-red-300">
                            <Avatar className="mr-4 h-20 w-20">
                                {user.avatar_url ? (
                                    <AvatarImage src={user.avatar_url} />
                                ) : (
                                    <AvatarFallback>PF</AvatarFallback>
                                )}
                            </Avatar>

                            <p className="text-gray-800">
                                {user.last_name}
                            </p>
                        </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default FollowersFollowingSection
