import Header from '@/components/Header/Header'
import Sidebar from '@/components/Sidebar/Sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import UserProfile from '@/components/Profile/Profile'

export default function User({
    params,
    searchParams,
}: {
    params: { slug: string }
    searchParams?: { [key: string]: string | string[] | undefined }
}) {
    return (
        <main className="flex min-h-screen flex-col">
            <Header />
            <div className="flex min-h-full w-full flex-1 flex-col justify-between font-sans text-sm">
                <div className="flex h-full flex-1">
                    <Sidebar />
                    <UserProfile params={params} searchParams={searchParams} />
                </div>
            </div>
        </main>
    )
}
