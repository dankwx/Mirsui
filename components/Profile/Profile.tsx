import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/utils/supabase/server'
import GetDisplayName from './GetDisplayName'
import GetUsername from './GetUsername'

export default async function UserProfile({
    params,
    searchParams,
}: {
    params: { slug: string }
    searchParams?: { [key: string]: string | string[] | undefined }
}) {
    const supabase = createClient()

    return (
        <div className="mt-16 w-full bg-red-50 pl-10 pt-4">
            <div className="flex">
                <Avatar className="mr-4 h-20 w-20">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>PF</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">

                    <GetDisplayName
                        params={params}
                        searchParams={searchParams}
                    />
                </div>
            </div>
        </div>
    )
}
