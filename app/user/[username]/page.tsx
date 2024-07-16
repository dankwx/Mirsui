import { createClient } from '@/utils/supabase/server'
import Profile from '@/components/Profile/Profile'
import { updateUsername } from '@/components/Profile/actions'
import { notFound } from 'next/navigation'

export default async function ProfilePage({
  params,
}: {
  params: { username: string }
}) {
  const supabase = createClient()

  console.log("Buscando usuário:", params.username)

  // Buscar o usuário pelo username na URL
  const { data: userData, error } = await supabase
  
      .from('profiles')
      .select('*')
      .eq('username', params.username)
      .single()

  console.log("Resultado da busca:", userData, error)

  if (error || !userData) {
      console.log("Usuário não encontrado ou erro:", error)
      notFound()
  }

    const { data: authData } = await supabase.auth.getUser()
    console.log("Dados de autenticação:", authData)
    const isOwnProfile = authData.user?.id === userData.id

    return (
        <Profile
            username={userData.username}
            displayName={userData.display_name || userData.username}
            updateUsernameAction={isOwnProfile ? updateUsername : undefined}
            isOwnProfile={isOwnProfile}
        />
    )
}
