import Header from '@/app/components/Header/Header'
import Sidebar from '@/app/components/Sidebar/Sidebar'

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
                    <p>usuairo: {params.slug}</p>
                </div>
            </div>
        </main>
    )
}
