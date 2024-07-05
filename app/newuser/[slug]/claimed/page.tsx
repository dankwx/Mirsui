import ClaimedChannels from '@/components/ClaimedChannels/ClaimedChannel'
import Header from '@/components/Header/Header'

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
            <ClaimedChannels params={params} searchParams={searchParams} />
        </main>
    )
}
