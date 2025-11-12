'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [isValidSession, setIsValidSession] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    // Verificar se há uma sessão válida ao carregar a página
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                setIsValidSession(true)
            } else {
                setError('Sessão inválida. Solicite um novo link de recuperação.')
            }
        }
        checkSession()
    }, [supabase])

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        // Validação básica
        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres')
            setLoading(false)
            return
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem')
            setLoading(false)
            return
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error

            setSuccess(true)
            setTimeout(() => {
                router.push('/')
            }, 2000)
        } catch (error: any) {
            setError(error.message || 'Erro ao redefinir senha')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-foreground">Redefinir Senha</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Digite sua nova senha
                    </p>
                </div>

                {success ? (
                    <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 text-center">
                        <p className="text-green-800 dark:text-green-200">
                            Senha redefinida com sucesso! Redirecionando para login...
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleResetPassword} className="mt-8 space-y-6">
                        {error && (
                            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
                                <p className="text-sm text-red-800 dark:text-red-200">
                                    {error}
                                </p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label 
                                    htmlFor="password" 
                                    className="block text-sm font-medium text-foreground mb-2"
                                >
                                    Nova Senha
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Digite sua nova senha"
                                />
                            </div>

                            <div>
                                <label 
                                    htmlFor="confirmPassword" 
                                    className="block text-sm font-medium text-foreground mb-2"
                                >
                                    Confirmar Nova Senha
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Confirme sua nova senha"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Redefinindo...' : 'Redefinir Senha'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
