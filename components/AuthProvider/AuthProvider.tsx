'use client'

import { createContext, useEffect, useState, ReactNode } from 'react'
import { identify, resetIdentity } from '@/lib/posthog'

interface User {
  id: string
  email: string
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar usuário logado UMA VEZ quando o app carrega
    const checkUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        const data = await response.json()
        
        if (data.authenticated && data.user) {
          setUser(data.user)
          // Vincula os eventos do PostHog a este usuário.
          identify(data.user.id, {
            email: data.user.email,
            username: data.profile?.username,
          })
        } else {
          setUser(null)
          resetIdentity()
        }
      } catch (error) {
        console.error('Erro ao verificar usuário:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()
  }, [])

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  )
}
