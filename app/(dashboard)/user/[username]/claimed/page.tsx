import ClaimedChannels from '@/components/ClaimedChannels/ClaimedChannel'
import Header from '@/components/Header/Header'
import Sidebar from '@/components/Sidebar/Sidebar'

export default function NewUser({
    params,
    searchParams,
}: {
    params: { slug: string }
    searchParams?: { [key: string]: string | string[] | undefined }
}) {
    return (
        <main className="flex min-h-screen flex-col">
            <Header />
            <div className="flex min-h-full w-full flex-1 flex-col justify-between font-mono text-sm">
                <div className="flex h-full flex-1">
                    <ClaimedChannels
                        params={params}
                        searchParams={searchParams}
                    />
                </div>
            </div>
        </main>
    )
}
