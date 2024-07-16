// import { createClient } from '@/utils/supabase/server'
// import UserProfile from './GetUsername'
// import { updateUsername } from './actions'

// export default async function ProfilePage() {
//   const supabase = createClient()
//   const { data, error } = await supabase.auth.getUser()
//   const username = data.user?.user_metadata?.username || 'User'
//   const displayname = data.user?.user_metadata?.display_name || 'User'

//   return <UserProfile 
//     initialUsername={username} 
//     initialDisplayName={displayname} 
//     updateUsernameAction={updateUsername}
//   />
// }