'use client'

import React, { useState } from 'react'
import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Music } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    // Definir título da página
    useEffect(() => {
        document.title = 'Login - Mirsui'
    }, [])

    const handleForgotPassword = async () => {
        if (!email) {
            setError('Digite seu email primeiro')
            return
        }
        
        setError(null)
        setSuccess(null)
        setLoading(true)

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/confirm`,
            })

            if (error) throw error

            setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.')
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar email de recuperação.')
        } finally {
            setLoading(false)
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)
        setLoading(true)

        try {
            const formData = new FormData()
            formData.append('email', email)
            formData.append('password', password)
            
            const result = await login(formData)
            
            if (result?.error) {
                setError(result.error)
            } else {
                // Redirecionar para a página principal após login bem-sucedido
                router.push('/')
                router.refresh()
            }
        } catch (err) {
            setError('Erro interno do servidor. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)
        setLoading(true)

        try {
            const formData = new FormData()
            formData.append('email', email)
            formData.append('password', password)
            formData.append('username', username)
            
            const result = await signup(formData)
            
            if (result?.error) {
                setError(result.error)
            } else {
                // Redirecionar para a página de confirmação de email após registro
                const nextUrl = `/auth/check-email?email=${encodeURIComponent(email)}`
                router.push(nextUrl)
            }
        } catch (err) {
            setError('Erro interno do servidor. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center gap-2 mb-4">
                        <Music className="h-8 w-8 text-purple-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Mirsui</h1>
                    </div>
                    <p className="text-gray-600">Descubra e compartilhe sua música favorita</p>
                </div>

                <Card className="shadow-xl border-0">
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Entrar</TabsTrigger>
                            <TabsTrigger value="register">Registrar</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="login">
                            <CardHeader>
                                <CardTitle>Bem-vindo de volta</CardTitle>
                                <CardDescription>
                                    Entre com sua conta para continuar
                                </CardDescription>
                            </CardHeader>
                            <form onSubmit={handleLogin}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="login-email">Email</Label>
                                        <Input
                                            id="login-email"
                                            type="email"
                                            placeholder="seu@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="login-password">Senha</Label>
                                        <Input
                                            id="login-password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    {error && (
                                        <Alert variant="destructive">
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}
                                    {success && (
                                        <Alert className="bg-green-50 border-green-200 text-green-800">
                                            <AlertDescription>{success}</AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                                <CardFooter className="flex flex-col space-y-4">
                                    <Button 
                                        type="submit" 
                                        className="w-full"
                                        disabled={loading}
                                    >
                                        {loading ? 'Entrando...' : 'Entrar'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="w-full text-sm text-purple-600 hover:text-purple-700"
                                        onClick={handleForgotPassword}
                                        disabled={loading}
                                    >
                                        Esqueci minha senha
                                    </Button>
                                    <p className="text-sm text-center text-gray-600">
                                        Não tem uma conta?{' '}
                                        <span className="text-purple-600 cursor-pointer">
                                            Clique em &quot;Registrar&quot; acima
                                        </span>
                                    </p>
                                </CardFooter>
                            </form>
                        </TabsContent>
                        
                        <TabsContent value="register">
                            <CardHeader>
                                <CardTitle>Criar conta</CardTitle>
                                <CardDescription>
                                    Junte-se à comunidade Mirsui
                                </CardDescription>
                            </CardHeader>
                            <form onSubmit={handleSignup}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="register-username">Nome de usuário</Label>
                                        <Input
                                            id="register-username"
                                            type="text"
                                            placeholder="seuusername"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="register-email">Email</Label>
                                        <Input
                                            id="register-email"
                                            type="email"
                                            placeholder="seu@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="register-password">Senha</Label>
                                        <Input
                                            id="register-password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    {error && (
                                        <Alert variant="destructive">
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                                <CardFooter className="flex flex-col space-y-4">
                                    <Button 
                                        type="submit" 
                                        className="w-full"
                                        disabled={loading}
                                    >{loading ? 'Criando conta...' : 'Criar conta'}
                                    </Button>
                                    <p className="text-sm text-center text-gray-600">
                                        Já tem uma conta?{' '}
                                        <span className="text-purple-600 cursor-pointer">
                                            Clique em &quot;Entrar&quot; acima
                                        </span>
                                    </p>
                                </CardFooter>
                            </form>
                        </TabsContent>
                    </Tabs>
                </Card>

                <div className="text-center mt-6">
                    <Link href="/" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                        ← Voltar para a página inicial
                    </Link>
                </div>
            </div>
        </div>
    )
}
