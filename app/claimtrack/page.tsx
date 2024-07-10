import ClaimTrack from '@/app/components/ClaimTrack/ClaimTrack'
import Header from '@/app/components/Header/Header'
import Sidebar from '@/app/components/Sidebar/Sidebar'

export default function ClaimTrackPage() {
    return (
        <main className="flex min-h-screen flex-col">
            <Header />
            <div className="flex min-h-full w-full flex-1 flex-col justify-between font-mono text-sm">
                <div className="flex h-full flex-1">
                    <Sidebar />
                    <ClaimTrack />
                </div>
            </div>
        </main>
    )
}
