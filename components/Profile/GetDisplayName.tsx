import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/utils/supabase/server'

export default async function UserProfile({
    params,
    searchParams,
}: {
    params: { slug: string }
    searchParams?: { [key: string]: string | string[] | undefined }
}) {
    const supabase = createClient()

    const { data, error } = await supabase.auth.getUser()

    const username = data.user?.user_metadata?.username || 'User'
    const displayname = data.user?.user_metadata?.display_name || 'User'

    return (
        <div className="flex flex-col">
            <p className="font-sans text-3xl font-bold">{displayname}</p>
            <p>{username}</p>
        </div>
    )
}
