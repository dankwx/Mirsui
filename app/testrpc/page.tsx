'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
// import { Auth, ThemeSupa } from '@supabase/auth-ui-react'

export default function ProfilePage() {
    const supabase = createClient()
    const [profile, setProfile] = useState<any>(null)

    async function handleGetProfile() {
        const {
            data: { session },
        } = await supabase.auth.getSession()
        if (session) {
            const { data, error } = await supabase.rpc('get_user_profile', {
                user_id: session.user.id,
            })

            if (error) {
                console.error('Error fetching profile:', error)
            } else {
                setProfile(data)
            }
        }
    }

    return (
        <div className="container" style={{ padding: '50px 0 100px 0' }}>
            <div>
                <h1>Perfil do Usuário</h1>
                <pre>{JSON.stringify(profile, null, 2)}</pre>
                <button onClick={handleGetProfile}>Atualizar Perfil</button>
            </div>
        </div>
    )
}
