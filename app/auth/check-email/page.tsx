import Link from 'next/link'
import { MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CheckEmailPageProps {
    searchParams: {
        email?: string
    }
}

export default function CheckEmailPage({ searchParams }: CheckEmailPageProps) {
    const email = searchParams?.email

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8 flex flex-col items-center gap-4">
                    <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                        <MailCheck className="h-8 w-8" aria-hidden />
                    </span>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Confirme seu email
                    </h1>
                    <p className="text-gray-700">
                        {email ? (
                            <>
                                Enviamos um link de confirmação para{' '}
                                <span className="font-semibold text-gray-900">{email}</span>.
                            </>
                        ) : (
                            'Enviamos um link de confirmação para o email cadastrado.'
                        )}
                    </p>
                    <p className="text-gray-600 text-sm">
                        Abra sua caixa de entrada e clique no link para concluir o cadastro.
                        Caso não encontre o email, verifique a pasta de spam ou lixo eletrônico.
                    </p>
                </div>

                <div className="bg-white shadow-xl rounded-2xl border border-white/60 backdrop-blur-sm p-6 space-y-4">
                    <p className="text-sm text-gray-600">
                        Depois de confirmar o email, você será redirecionado automaticamente para o aplicativo. Se o link expirar, você pode solicitar um novo pelo botão abaixo.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button asChild className="w-full">
                            <Link href="/login">Voltar para o login</Link>
                        </Button>
                        <p className="text-xs text-gray-500 text-center">
                            Ainda sem o email? Aguarde alguns minutos ou tente reenviar a confirmação a partir da tela de login.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
