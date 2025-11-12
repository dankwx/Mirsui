'use client'

import Link from 'next/link'
import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/utils/supabase/client'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [isValidSession, setIsValidSession] = useState(false)
    const [isCheckingSession, setIsCheckingSession] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const checkSession = async () => {
            setError('')
            const {
                data: { session },
            } = await supabase.auth.getSession()

            if (session) {
                setIsValidSession(true)
            } else {
                setIsValidSession(false)
                setError('Sessão expirada. Solicite um novo link de recuperação.')
            }

            setIsCheckingSession(false)
        }

        checkSession()
    }, [supabase])

    const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')
        setSuccess(false)
        setLoading(true)

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.')
            setLoading(false)
            return
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.')
            setLoading(false)
            return
        }

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password,
            })

            if (updateError) {
                throw updateError
            }

            setSuccess(true)
            setPassword('')
            setConfirmPassword('')

            setTimeout(() => {
                router.push('/')
            }, 2000)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao redefinir senha.'
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#05030f] text-white">
            <div className="pointer-events-none absolute -left-36 top-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(133,92,255,0.18),_transparent_70%)] blur-3xl" />
            <div className="pointer-events-none absolute -right-40 bottom-10 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(255,123,187,0.18),_transparent_75%)] blur-3xl" />

            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-16 lg:px-10">
                <div className="w-full max-w-md space-y-10">
                    <div className="space-y-3 text-center">
                        <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-white/60">
                            Segurança
                        </span>
                        <h1 className="text-3xl font-semibold tracking-tight text-white">
                            Redefinir senha
                        </h1>
                        <p className="text-sm leading-relaxed text-white/65">
                            {success
                                ? 'Senha atualizada com sucesso. Redirecionando...'
                                : 'Defina uma nova senha para voltar a descobrir músicas antes de todo mundo.'}
                        </p>
                    </div>

                    <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-8 shadow-[0_28px_70px_rgba(8,4,20,0.55)] backdrop-blur-xl">
                        {success ? (
                            <div className="space-y-6 text-center">
                                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-200">
                                    <CheckCircle2 className="h-8 w-8" />
                                </span>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-semibold text-white">
                                        Tudo certo!
                                    </h2>
                                    <p className="text-sm leading-relaxed text-white/70">
                                        Senha redefinida com sucesso. Você será redirecionado para o login em instantes.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleResetPassword} className="space-y-6">
                                {error && (
                                    <Alert
                                        variant="destructive"
                                        className="border-red-500/40 bg-red-500/10 text-red-100"
                                    >
                                        <AlertTriangle className="h-4 w-4 text-red-200" />
                                        <AlertDescription className="text-sm text-red-100">
                                            {error}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="password"
                                            className="text-sm font-medium text-white/80"
                                        >
                                            Nova senha
                                        </Label>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(event) => setPassword(event.target.value)}
                                            disabled={loading || !isValidSession || isCheckingSession}
                                            className="h-11 rounded-xl border-white/15 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-white/20 focus-visible:ring-offset-0"
                                            placeholder="Digite sua nova senha"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="confirmPassword"
                                            className="text-sm font-medium text-white/80"
                                        >
                                            Confirmar nova senha
                                        </Label>
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(event) => setConfirmPassword(event.target.value)}
                                            disabled={loading || !isValidSession || isCheckingSession}
                                            className="h-11 rounded-xl border-white/15 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-white/20 focus-visible:ring-offset-0"
                                            placeholder="Confirme sua nova senha"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading || !isValidSession || isCheckingSession}
                                    className="h-11 w-full rounded-xl border border-white/10 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 text-sm font-semibold uppercase tracking-[0.25em] text-white shadow-[0_22px_50px_rgba(132,94,255,0.45)] transition duration-200 hover:from-purple-400 hover:to-indigo-400 focus-visible:ring-white/25"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Redefinindo
                                        </>
                                    ) : isCheckingSession ? (
                                        'Validando sessão...'
                                    ) : (
                                        'Redefinir senha'
                                    )}
                                </Button>

                                <div className="text-center">
                                    <Link
                                        href="/login"
                                        className="text-sm text-white/60 underline decoration-white/20 underline-offset-4 transition hover:text-white"
                                    >
                                        Voltar para o login
                                    </Link>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
