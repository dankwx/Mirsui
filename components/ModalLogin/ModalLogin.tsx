'use client'

import React from 'react'
import { Sparkles, Target, Headphones } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login, signup } from '../../app/login/actions'
import { useRouter } from 'next/navigation'

interface LoginModalProps {
    trigger: React.ReactNode
    onLogin: (email: string, password: string) => void
}

type AuthMode = 'login' | 'register' | 'forgot'

const LoginModal: React.FC<LoginModalProps> = ({ trigger, onLogin }) => {
    const [mode, setMode] = React.useState<AuthMode>('login')
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [username, setUsername] = React.useState('')
    const [error, setError] = React.useState<string | null>(null)
    const [statusMessage, setStatusMessage] = React.useState<string | null>(
        null
    )
    const router = useRouter()

    const resetFeedback = () => {
        setError(null)
        setStatusMessage(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        resetFeedback()

        if (mode === 'forgot') {
            // Placeholder for future password recovery implementation
            console.log('Forgot password for email:', email)
            setStatusMessage(
                'Se o email estiver cadastrado, você receberá um link em instantes.'
            )
            return
        }

        const formData = new FormData()
        formData.append('email', email)
        formData.append('password', password)

        try {
            if (mode === 'register') {
                formData.append('username', username)
                const result = await signup(formData)
                if (result?.error) {
                    setError(result.error)
                } else {
                    router.push(
                        `/auth/check-email?email=${encodeURIComponent(email)}`
                    )
                }
                return
            }

            const result = await login(formData)
            if (result?.error) {
                setError(result.error)
            } else {
                onLogin(email, password)
                setStatusMessage('Login realizado com sucesso.')
            }
        } catch (err) {
            console.error('Authentication error', err)
            setError('Ocorreu um erro inesperado. Tente novamente.')
        }
    }

    const renderFormFields = () => (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <Label
                    htmlFor="email"
                    className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60"
                >
                    Email
                </Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-white placeholder:text-white/40 focus-visible:border-white/30 focus-visible:ring-2 focus-visible:ring-purple-400/70"
                    value={email}
                    placeholder="você@email.com"
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            {mode === 'register' && (
                <div className="flex flex-col gap-2">
                    <Label
                        htmlFor="username"
                        className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60"
                    >
                        Username
                    </Label>
                    <Input
                        id="username"
                        name="username"
                        type="text"
                        required
                        className="h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-white placeholder:text-white/40 focus-visible:border-white/30 focus-visible:ring-2 focus-visible:ring-purple-400/70"
                        placeholder="seuusuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
            )}

            {mode !== 'forgot' && (
                <div className="flex flex-col gap-2">
                    <Label
                        htmlFor="password"
                        className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60"
                    >
                        Senha
                    </Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-white placeholder:text-white/40 focus-visible:border-white/30 focus-visible:ring-2 focus-visible:ring-purple-400/70"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            )}
        </div>
    )

    const primaryActionLabel =
        mode === 'forgot' ? 'Enviar link' : mode === 'register' ? 'Criar conta' : 'Entrar'

    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="grid !max-w-3xl !grid-cols-1 overflow-hidden rounded-[34px] border border-white/15 bg-[#060214] p-0 text-white shadow-[0_45px_130px_rgba(137,97,255,0.6)] backdrop-blur-3xl md:!grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                <div className="relative flex min-h-[520px] flex-col justify-between bg-gradient-to-br from-purple-600/35 via-fuchsia-500/15 to-indigo-500/25 p-10 md:border-r md:border-white/10">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_55%)]" />
                    <div className="relative space-y-6">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/70">
                            <Sparkles className="h-4 w-4 text-purple-200" />
                            Early listeners club
                        </span>
                        <h2 className="text-3xl font-semibold leading-snug text-white">
                            Entre para descobrir sons antes de todo mundo.
                        </h2>
                        <p className="max-w-sm text-sm leading-relaxed text-white/70">
                            Salve suas apostas, acompanhe quando elas explodirem e mostre que seu ouvido capta tendências antes de virarem hype.
                        </p>
                    </div>
                    <div className="relative mt-12 space-y-4 text-sm text-white/75">
                        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4">
                            <Headphones className="h-5 w-5 text-purple-200" />
                            <span>Playlists curadas por quem realmente descobre música.</span>
                        </div>
                        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4">
                            <Target className="h-5 w-5 text-purple-200" />
                            <span>Ganhe score quando suas descobertas virarem hits.</span>
                        </div>
                    </div>
                </div>

                <div className="relative flex min-h-[520px] flex-col gap-6 bg-[#08031a] p-8 md:p-10">
                    <DialogHeader className="space-y-3 text-left">
                        <DialogTitle className="text-3xl font-semibold tracking-tight text-white">
                            {mode === 'forgot'
                                ? 'Recuperar acesso'
                                : mode === 'register'
                                    ? 'Criar conta'
                                    : 'Entrar no Mirsui'}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-white/65">
                            {mode === 'forgot'
                                ? 'Informe seu email e enviaremos instruções para redefinir sua senha.'
                                : 'Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 rounded-full border border-white/12 bg-white/5 p-1.5 text-xs font-semibold uppercase tracking-[0.22em]">
                            {(['login', 'register'] as AuthMode[]).map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => {
                                        setMode(value)
                                        resetFeedback()
                                    }}
                                    className={`rounded-full px-4 py-2 transition-all duration-200 ${
                                        mode === value
                                            ? 'bg-white text-[#08031a] shadow-[0_12px_30px_rgba(255,255,255,0.18)]'
                                            : 'text-white/70 hover:text-white'
                                    }`}
                                >
                                    {value === 'login' ? 'Entrar' : 'Registrar'}
                                </button>
                            ))}
                        </div>

                        {mode !== 'register' && (
                            <button
                                type="button"
                                onClick={() => {
                                    setMode(mode === 'forgot' ? 'login' : 'forgot')
                                    resetFeedback()
                                }}
                                className="text-xs font-semibold uppercase tracking-[0.22em] text-purple-100 transition hover:text-white"
                            >
                                {mode === 'forgot' ? 'Voltar para login' : 'Esqueci a senha'}
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {renderFormFields()}

                        {error && (
                            <div className="rounded-2xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-100">
                                {error}
                            </div>
                        )}

                        {statusMessage && (
                            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                                {statusMessage}
                            </div>
                        )}

                        <DialogFooter className="mt-2">
                            <Button
                                type="submit"
                                className="h-12 w-full rounded-full border border-white/15 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-[0_18px_48px_rgba(137,97,255,0.4)] transition hover:from-purple-600 hover:to-pink-600"
                            >
                                {primaryActionLabel}
                            </Button>
                        </DialogFooter>
                    </form>

                    <div className="space-y-3 text-center text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
                        {mode === 'login' && (
                            <button
                                type="button"
                                onClick={() => {
                                    setMode('register')
                                    resetFeedback()
                                }}
                                className="w-full rounded-full border border-white/12 bg-white/10 px-4 py-2 text-white/80 transition hover:bg-white/15 hover:text-white"
                            >
                                Não tem conta? Crie agora
                            </button>
                        )}
                        {mode === 'register' && (
                            <button
                                type="button"
                                onClick={() => {
                                    setMode('login')
                                    resetFeedback()
                                }}
                                className="w-full rounded-full border border-white/12 bg-white/10 px-4 py-2 text-white/80 transition hover:bg-white/15 hover:text-white"
                            >
                                Já é membro? Entre com sua conta
                            </button>
                        )}
                        {mode === 'forgot' && (
                            <span className="block text-white/60">
                                Use um email cadastrado para receber o link de redefinição.
                            </span>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default LoginModal
