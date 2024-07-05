import Header from '../components/Header/Header'
import Sidebar from '../components/Sidebar/Sidebar'
import GetAuth from '../components/GetAuth/GetAuth'
import { createClient } from '@/utils/supabase/server'
import ClaimedChannels from '@/components/ClaimedChannels/ClaimedChannel'

export default async function Home() {
    const supabase = createClient()

    return (
        <main className="flex min-h-screen flex-col">
            <Header />
            <div className="flex min-h-full w-full flex-1 flex-col justify-between font-mono text-sm">
                <div className="flex h-full flex-1">
                    <Sidebar />
                    <div className="flex">
                        <p>
                            Now you can proof that you hear that music allday
                            before gets viral
                        </p>
                    </div>
                </div>
            </div>
        </main>
    )
}
