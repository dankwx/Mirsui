import Profile from '@/components/Profile/Profile'
import { updateUsername } from '@/components/Profile/actions'
import { updateDescription } from '@/components/Profile/actions';


interface ProfileDetailsProps {
    userData: any;
    isOwnProfile: boolean;
    
}


const ProfileDetails: React.FC<ProfileDetailsProps> = ({ userData, isOwnProfile}) => {
    return (
        <Profile
            username={userData.username}
            displayName={userData.display_name || userData.username}
            updateUsernameAction={isOwnProfile ? updateUsername : undefined}
            updateDescriptionAction={isOwnProfile ? updateDescription : undefined}
            isOwnProfile={isOwnProfile}
            description={userData.description}
        />
    )
}

export default ProfileDetails