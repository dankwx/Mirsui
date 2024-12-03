import Profile from '@/components/Profile/Profile'
import { updateDisplayName } from '@/components/Profile/actions'
import { updateDescription } from '@/components/Profile/actions'

interface User {
    id: string
    first_name: string
    last_name: string
    avatar_url: string | null
    username: string | null
    rating: number
    followingId: string
}

interface Achievments {
    achievement_id: string
    title: string
    description: string
    achieved_at: string
}

interface Rating {
    id: string
    rating: number
}

interface ProfileDetailsProps {
    isLoggedIn: any
    userData: any
    isOwnProfile: boolean
    totalFollowers: User[]
    totalFollowing: User[]
    rating: Rating[]
    userAchievments: Achievments[]
    followingId: string
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({
    isLoggedIn,
    userData,
    isOwnProfile,
    totalFollowers,
    totalFollowing,
    rating,
    userAchievments,
}) => {
    return (
        <Profile
            isLoggedIn={isLoggedIn}
            username={userData.username}
            displayName={userData.display_name || userData.username}
            avatar_url={userData.avatar_url}
            updateDisplayNameAction={
                isOwnProfile ? updateDisplayName : undefined
            }
            updateDescriptionAction={
                isOwnProfile ? updateDescription : undefined
            }
            isOwnProfile={isOwnProfile}
            description={userData.description}
            totalFollowers={totalFollowers}
            totalFollowing={totalFollowing}
            rating={rating}
            userAchievments={userAchievments}
            followingId={userData.id}
            initialIsFollowing={userData.isFollowing}
        />
    )
}

export default ProfileDetails
