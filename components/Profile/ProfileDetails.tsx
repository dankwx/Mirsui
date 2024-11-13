import Profile from '@/components/Profile/Profile'
import { updateDisplayName } from '@/components/Profile/actions'
import { updateDescription } from '@/components/Profile/actions'

interface User {
    id: string
    first_name: string
    last_name: string
    avatar_url: string | null
    username: string | null
  }

interface ProfileDetailsProps {
    isLoggedIn: any
    userData: any
    isOwnProfile: boolean
    totalFollowers: number
    totalFollowing: User[]
    followingId: string
}



const ProfileDetails: React.FC<ProfileDetailsProps> = ({
    isLoggedIn,
    userData,
    isOwnProfile,
    totalFollowers,
    totalFollowing,
}) => {

    return (
        <Profile
            isLoggedIn={isLoggedIn}
            username={userData.username}
            displayName={userData.display_name || userData.username}
            updateDisplayNameAction={isOwnProfile ? updateDisplayName : undefined}
            updateDescriptionAction={
                isOwnProfile ? updateDescription : undefined
            }
            isOwnProfile={isOwnProfile}
            description={userData.description}
            totalFollowers={totalFollowers}
            totalFollowing={totalFollowing}
            followingId={userData.id}
            initialIsFollowing={userData.isFollowing}
        />
    )
}

export default ProfileDetails
