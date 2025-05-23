import { createClient } from '@/utils/supabase/server'
import { fetchAuthData } from '@/utils/profileService' // Assume que fetchUserData não é mais necessário aqui ou foi movido.
import Header from '@/components/Header/Header'
import Sidebar from '@/components/Sidebar/Sidebar'
import { fetchSpotifyTrackInfo, SpotifyTrack } from '@/utils/spotifyService' // Importa o novo serviço

export default async function ProfilePage({
    params,
}: {
    params: { id: string } // `id` será o ID da faixa do Spotify neste exemplo
}) {
    const { id: trackId } = params // Renomeia 'id' para 'trackId' para clareza

    const authData = await fetchAuthData()
    const isLoggedIn = authData?.user ? true : false // Correção: isLoggedIn deve ser true se houver um usuário autenticado

    const supabase = createClient()
    const {
        data: { session },
    } = await supabase.auth.getSession()

    let trackInfo: SpotifyTrack | null = null
    if (trackId) {
        trackInfo = await fetchSpotifyTrackInfo(trackId)
    }

    return (
        <main className="flex min-h-screen flex-col">
            <Header />
            <div className="flex min-h-full w-full flex-1 flex-col justify-between font-mono text-sm">
                <div className="flex h-full flex-1">
                    <Sidebar />
                    <div className="ml-20 flex w-full flex-col px-6 font-sans">
                        <div className="flex flex-col p-20">
                            {' '}
                            {/* Adicione flex-col para os parágrafos */}
                            <p>
                                Bem-vindo ao perfil de:{' '}
                                <strong>
                                    {params.id}{' '}
                                    {authData?.user?.email &&
                                        `e ${authData.user.email}`}
                                </strong>
                            </p>
                            <p className="mt-4">
                                Esta é uma página de perfil simples para
                                demonstração.
                            </p>
                            {/* Exibir informações da música se disponível */}
                            {trackInfo ? (
                                <div className="mt-8 rounded border p-4 shadow-md">
                                    <h2 className="text-xl font-bold">
                                        Informações da Música:
                                    </h2>
                                    <p>**Título:** {trackInfo.name}</p>
                                    <p>
                                        **Artista:**{' '}
                                        {trackInfo.artists
                                            .map((artist) => artist.name)
                                            .join(', ')}
                                    </p>
                                    <p>**Álbum:** {trackInfo.album.name}</p>
                                    <p>
                                        **Popularidade:** {trackInfo.popularity}
                                    </p>
                                    {trackInfo.album.images.length > 0 && (
                                        <img
                                            src={trackInfo.album.images[0].url}
                                            alt={`Capa do álbum ${trackInfo.album.name}`}
                                            className="mt-4 h-32 w-32 object-cover"
                                        />
                                    )}
                                </div>
                            ) : (
                                <p className="mt-8 text-red-500">
                                    Nenhuma informação da música encontrada para
                                    o ID: {trackId}. Verifique se o ID está
                                    correto ou se houve um erro na busca.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
