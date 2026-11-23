// A 404 de dentro do clube: faixa, artista ou perfil que não existe
// (`notFound()` nas páginas do grupo). O cabeçalho e o rodapé vêm do layout.

import NaoAchei from '@/components/Club/NaoAchei'
import { getSessionProfile } from '@/lib/sessionProfile'

export default async function ClubNotFound() {
    const { userProfile } = await getSessionProfile()
    return <NaoAchei inicio={userProfile ? '/feed' : '/'} />
}
