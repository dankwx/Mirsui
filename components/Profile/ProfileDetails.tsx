import Profile from '@/components/Profile/Profile'
import { updateUsername } from '@/components/Profile/actions'
import { updateDescription } from '@/components/Profile/actions'

interface ProfileDetailsProps {
    isLoggedIn: any
    userData: any
    isOwnProfile: boolean
    totalFollowers: number
    totalFollowing: number
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
            updateUsernameAction={isOwnProfile ? updateUsername : undefined}
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
