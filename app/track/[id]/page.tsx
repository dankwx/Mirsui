import Header from '@/components/Header/Header'
import Sidebar from '@/components/Sidebar/Sidebar'
import { fetchUserData, fetchAuthData } from '@/utils/profileService'



export default async function TrackPage({
    params,
}: {
    params: { id: string }
}) {
    console.log('Buscando musica:', params.id)

const authData = await fetchAuthData()
    const isLoggedIn = authData ? true : false

    return (
        <main>
            <Header />
            <div className='pt-20'>
                <h1>teste</h1>
                <p>musica: {params.id}</p>
                <p>logado?{isLoggedIn ? "logado" : "nao logado"}</p>
            </div>
            
        </main>
       
    )
}