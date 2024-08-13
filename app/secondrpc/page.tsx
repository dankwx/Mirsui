// app/profile/page.tsx
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  let followingData = null
  if (session) {
    const { data, error } = await supabase.rpc('get_user_following', {
      user_uuid: session.user.id,
    })

    if (error) {
      console.error('Error fetching profile:', error)
    } else {
      followingData = data
      console.log(followingData)
    }
  }

  return (
    <div className="container" style={{ padding: '50px 0 100px 0' }}>
      <div>
        <h1>Perfil do Usuário</h1>
        <pre>{JSON.stringify(followingData, null, 2)}</pre>
      </div>
    </div>
  )
}