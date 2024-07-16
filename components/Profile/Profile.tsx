import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import UserProfile from './GetUsername';

interface ProfileProps {
  username: string;
  displayName: string;
  updateUsernameAction?: (formData: FormData) => Promise<{ success: boolean; newUsername?: string }>;
  isOwnProfile: boolean;
}

export default function Profile({ username, displayName, updateUsernameAction, isOwnProfile }: ProfileProps) {
  return (
    <div className="mt-16 w-full bg-red-50 pl-10 pt-4">
      <div className="flex">
        <Avatar className="mr-4 h-20 w-20">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>PF</AvatarFallback>
        </Avatar>
        <UserProfile
          username={username}
          displayName={displayName}
          updateUsernameAction={updateUsernameAction}
          isOwnProfile={isOwnProfile}
        />
      </div>
    </div>
  )
}