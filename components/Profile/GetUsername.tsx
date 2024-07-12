// pages/get-usernames.tsx
import { createClient } from '@/utils/supabase/server'

export default async function GetUsernames({
    params,
    searchParams,
}: {
    params: { slug: string }
    searchParams?: { [key: string]: string | string[] | undefined }
}) {
    const supabase = createClient()

    // Query para buscar os usernames
    const { data, error } = await supabase
        .from('profiles')
        .select('username')

    if (error) {
        console.error('Erro ao buscar usernames:', error)
        return <div>Erro ao buscar usernames</div>
    }

    return (
        <div>
            <h1>Usernames</h1>
            <ul>
                {data?.map((profile) => (
                    <li key={profile.username}>{profile.username}</li>
                ))}
            </ul>
        </div>
    )
}
