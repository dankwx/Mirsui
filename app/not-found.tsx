// A 404 de endereço que não existe em lugar nenhum, e do `notFound()` de fora
// do clube (o /admin para quem não é dono). Aqui só há o layout raiz, então a
// página monta o shell do clube sozinha, na paleta mostarda do resto do site.

import { AuthProvider } from '@/components/AuthProvider/AuthProvider'
import ClubLayoutShell from '@/components/Club/ClubLayoutShell'
import NaoAchei from '@/components/Club/NaoAchei'
import { getSessionProfile } from '@/lib/sessionProfile'

export default async function NotFound() {
    const { userProfile, dono } = await getSessionProfile()

    return (
        <AuthProvider>
            <ClubLayoutShell userProfile={userProfile} isDono={dono} mostarda>
                <NaoAchei inicio={userProfile ? '/feed' : '/'} />
            </ClubLayoutShell>
        </AuthProvider>
    )
}
