import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import UserProfile from './GetUsername'

interface ProfileProps {
    isLoggedIn: boolean
    username: string
    displayName: string
    avatar_url: string
    description: string

    updateDisplayNameAction?: (
        formData: FormData
    ) => Promise<{ success: boolean; newDisplayName?: string }>
    updateDescriptionAction?: (
        formData: FormData
    ) => Promise<{ success: boolean; newDescription?: string | null }>
    isOwnProfile: boolean
    totalFollowers: User[]
    totalFollowing: User[]
    followingId: string
    initialIsFollowing: boolean
}

interface User {
    id: string
    first_name: string
    last_name: string
    avatar_url: string | null
    username: string | null
  }

export default function Profile({
    username,
    displayName,
    description,
    avatar_url,
    updateDisplayNameAction,
    updateDescriptionAction,
    isLoggedIn,
    isOwnProfile,
    totalFollowers,
    totalFollowing,
    followingId,
    initialIsFollowing,
}: ProfileProps) {
    return (
        <div className="mt-16 pt-4">
            <div className="flex">
                <Avatar className="mr-4 h-20 w-20">
                    <AvatarImage src={avatar_url} />
                    <AvatarFallback>PF</AvatarFallback>
                </Avatar>
                <UserProfile
                    isLoggedIn={isLoggedIn}
                    username={username}
                    displayName={displayName}
                    updateDisplayNameAction={updateDisplayNameAction}
                    isOwnProfile={isOwnProfile}
                    description={description}
                    updateDescriptionAction={updateDescriptionAction}
                    totalFollowers={totalFollowers}
                    totalFollowing={totalFollowing}
                    followingId={followingId}
                    initialIsFollowing={initialIsFollowing}
                />
            </div>
        </div>
    )
}
