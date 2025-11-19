// lib/backendClient.ts
import { createClient } from '@/utils/supabase/client'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'

/**
 * Cliente para fazer requisições ao backend Fastify
 */
export class BackendClient {
    private static async getAuthToken(): Promise<string | null> {
        try {
            const supabase = createClient()
            
            // Primeiro tenta getSession
            let { data: { session }, error } = await supabase.auth.getSession()
            
            if (error) {
                console.error('❌ Erro ao obter sessão:', error)
                return null
            }
            
            // Se não há sessão, tenta refresh
            if (!session) {
                console.log('⚠️ Nenhuma sessão encontrada, tentando refresh...')
                const { data, error: refreshError } = await supabase.auth.refreshSession()
                
                if (refreshError) {
                    console.error('❌ Erro ao fazer refresh da sessão:', refreshError)
                    return null
                }
                
                session = data.session
            }
            
            if (session?.access_token) {
                console.log('✅ Token obtido com sucesso')
                return session.access_token
            }
            
            console.log('⚠️ Nenhuma sessão encontrada mesmo após refresh')
            return null
        } catch (error) {
            console.error('❌ Erro ao buscar token:', error)
            return null
        }
    }

    static async get(endpoint: string, requireAuth: boolean = false) {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        }

        if (requireAuth) {
            const token = await this.getAuthToken()
            if (!token) {
                throw new Error('Não autenticado')
            }
            headers['Authorization'] = `Bearer ${token}`
        }

        const response = await fetch(`${BACKEND_URL}${endpoint}`, {
            method: 'GET',
            headers,
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Erro ${response.status}: ${error}`)
        }

        return response.json()
    }

    static async post(endpoint: string, body: any, requireAuth: boolean = true) {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        }

        if (requireAuth) {
            const token = await this.getAuthToken()
            console.log('🔑 Token para requisição:', token ? `${token.substring(0, 20)}...` : 'null')
            
            if (!token) {
                console.error('❌ ERRO: Token não disponível. Usuário precisa fazer login.')
                throw new Error('Não autenticado. Por favor, faça login novamente.')
            }
            headers['Authorization'] = `Bearer ${token}`
            console.log('✅ Header Authorization adicionado')
        }

        const response = await fetch(`${BACKEND_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        })

        if (!response.ok) {
            const errorText = await response.text()
            let errorMessage = errorText
            try {
                const errorJson = JSON.parse(errorText)
                errorMessage = errorJson.error || errorJson.message || errorText
            } catch {
                // Se não for JSON, usar o texto direto
            }
            throw new Error(errorMessage)
        }

        return response.json()
    }

    static async delete(endpoint: string, requireAuth: boolean = true) {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        }

        if (requireAuth) {
            const token = await this.getAuthToken()
            if (!token) {
                throw new Error('Não autenticado')
            }
            headers['Authorization'] = `Bearer ${token}`
        }

        const response = await fetch(`${BACKEND_URL}${endpoint}`, {
            method: 'DELETE',
            headers,
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Erro ${response.status}: ${error}`)
        }

        return response.json()
    }
}

export const BACKEND_API = {
    // Prophet/Previsões
    prophet: {
        getPredictions: (userId: string) => BackendClient.get(`/prophet/predictions/${userId}`, false),
        getStats: (userId: string) => BackendClient.get(`/prophet/stats/${userId}`, false),
        createPrediction: (data: any) => BackendClient.post('/prophet/predictions', data, true),
        processExpired: () => BackendClient.post('/prophet/process-expired', {}, true),
    },
}
