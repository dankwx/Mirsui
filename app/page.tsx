import Header from '../components/Header/Header'
import Sidebar from '../components/Sidebar/Sidebar'
import GetAuth from '../components/GetAuth/GetAuth'
import { createClient } from '@/utils/supabase/server'
import Sidobar from '../components/Sidobar/Sidobar'

export default async function Home() {
    const supabase = createClient()
    const { data: notes } = await supabase.from('notes').select()

    const fetchChannelInfo = async () => {
        try {
            console.log('teste')
        } catch {
            console.log('errooooooo')
        }
    }
    fetchChannelInfo()
    return (
        <main className="flex min-h-screen flex-col">
            <Header />
            <div className="flex min-h-full w-full flex-1 flex-col justify-between font-mono text-sm">
                <div className="flex h-full flex-1">
                    <Sidebar />
                    <div className="flex">
                        <p>home</p>
                        <Sidobar />
                        {/* <pre>{JSON.stringify(notes, null, 2)}</pre> */}
                    </div>
                </div>
            </div>
        </main>
    )
}
