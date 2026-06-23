import Link from 'next/link'

interface CheckEmailPageProps {
    searchParams: {
        email?: string
    }
}

export default function CheckEmailPage({ searchParams }: CheckEmailPageProps) {
    const email = searchParams?.email

    return (
        <div className="min-h-screen bg-mir-bg flex items-center justify-center p-4">
            <div className="w-full max-w-[600px]">
                <div className="overflow-hidden rounded-[18px] border border-mir-line bg-mir-surface">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-mir-line bg-mir-bg px-8 py-[22px]">
                        <span className="text-[22px] font-black tracking-[-0.04em] text-mir-text">
                            Mirsui<span className="text-mir-acc">.</span>
                        </span>
                        <span className="inline-flex items-center gap-[6px] rounded-full border border-mir-acc/30 bg-mir-acc-soft px-[11px] py-[5px] font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-mir-acc">
                            <span className="h-[7px] w-[7px] rounded-full bg-mir-acc" />
                            No ar
                        </span>
                    </div>

                    {/* Conteúdo */}
                    <div className="px-8 pb-12 pt-11">
                        <p className="mb-[14px] font-mono text-[11px] uppercase tracking-[0.22em] text-mir-text3">
                            Confirmação de cadastro
                        </p>

                        <h1 className="mb-[18px] text-[32px] font-black leading-[1.05] tracking-[-0.045em] text-mir-text">
                            Falta um clique pra<br />você entrar no ar.
                        </h1>

                        <p className="mb-7 text-base leading-[1.6] text-mir-text2">
                            {email ? (
                                <>
                                    Enviamos um link de confirmação para{' '}
                                    <span className="font-semibold text-mir-text">{email}</span>.
                                    Abra sua caixa de entrada pra ativar sua conta e começar a descobrir as faixas{' '}
                                    <span className="font-semibold text-mir-acc">antes de todo mundo</span>.
                                </>
                            ) : (
                                <>
                                    Enviamos um link de confirmação para o email cadastrado.
                                    Abra sua caixa de entrada pra ativar sua conta e começar a descobrir as faixas{' '}
                                    <span className="font-semibold text-mir-acc">antes de todo mundo</span>.
                                </>
                            )}
                        </p>

                        <Link
                            href="/"
                            className="inline-block rounded-full bg-mir-acc px-10 py-4 text-base font-bold tracking-[-0.01em] text-mir-on-acc no-underline transition-opacity hover:opacity-90"
                        >
                            Voltar para o início &rarr;
                        </Link>

                        <p className="mb-2 mt-[26px] text-[13px] leading-[1.6] text-mir-text3">
                            Não encontrou o email? Verifique a pasta de spam ou lixo eletrônico, ou
                            aguarde alguns minutos. Depois de confirmar, você será redirecionado
                            automaticamente para o aplicativo.
                        </p>

                        {/* nota de segurança */}
                        <div className="mt-8 rounded-[10px] border border-mir-line border-l-[3px] border-l-mir-acc bg-mir-card px-[18px] py-4">
                            <p className="text-[13.5px] leading-[1.6] text-mir-text2">
                                <strong className="text-mir-text">Segurança:</strong> se não foi você
                                que criou esta conta, é só ignorar o email. O link expira em 24 horas.
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-mir-line bg-mir-bg px-8 py-7">
                        <p className="mb-[10px] text-[13px] font-bold tracking-[-0.02em] text-mir-text">
                            Mir-sui? I heard it first.
                        </p>
                        <p>
                            <Link
                                href="/privacidade"
                                className="text-xs text-mir-text2 no-underline hover:text-mir-text"
                            >
                                Política de Privacidade
                            </Link>
                            <span className="px-2 text-mir-text3">&middot;</span>
                            <Link
                                href="/termos"
                                className="text-xs text-mir-text2 no-underline hover:text-mir-text"
                            >
                                Termos de Serviço
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="mt-[18px] text-center font-mono text-[11px] uppercase tracking-[0.1em] text-mir-text3">
                    Descubra antes &middot; Mirsui
                </p>
            </div>
        </div>
    )
}
