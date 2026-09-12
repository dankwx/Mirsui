import Link from 'next/link'
import MirsuiLogo from '@/components/MirsuiLogo/MirsuiLogo'
import AuthModalTrigger from '@/components/AuthModalTrigger/AuthModalTrigger'
import { ArrowRight } from 'lucide-react'
import Ficha from './Ficha'
import type { FichaDaHome } from '@/utils/fichaDaHome'

/**
 * Topo da home: a nav e a promessa, com a ficha de uma faixa real ao lado.
 *
 * Saiu o mosaico de fundo. Ele dizia "isto é sobre música" e qualquer app
 * diria o mesmo; a ficha diz o que só o Mirsui faz, que é registrar quem
 * chegou antes e medir o que aconteceu depois.
 *
 * Raio de canto desta página:
 *   capa            6px (3px nas peças da pilha, que são miniatura)
 *   ficha e cartão  20px
 *   botão, pílula e carimbo   círculo cheio
 */
export default function Hero({ ficha }: { ficha: FichaDaHome | null }) {
    return (
        <header className="relative">
            <nav className="mx-auto flex h-16 w-full max-w-[1320px] items-center gap-7 px-5 sm:px-10">
                <Link
                    href="/"
                    className="flex flex-none items-center gap-2.5 text-[20px] font-extrabold tracking-[-0.04em] text-mir-text"
                >
                    <MirsuiLogo size={26} />
                    mirsui
                </Link>
                <div className="hidden items-center gap-6 text-[14px] font-semibold text-mir-text2 md:flex">
                    <Link href="/feed" className="transition-colors hover:text-mir-text">
                        Achados
                    </Link>
                    <Link href="/pilha" className="transition-colors hover:text-mir-text">
                        A pilha
                    </Link>
                </div>
                <div className="ml-auto flex flex-none items-center gap-1">
                    <AuthModalTrigger
                        mode="login"
                        className="rounded-full px-4 py-2 text-[13.5px] font-semibold text-mir-text2 transition hover:bg-mir-fill1 hover:text-mir-text"
                    >
                        Entrar
                    </AuthModalTrigger>
                    <AuthModalTrigger
                        mode="signup"
                        className="rounded-full bg-mir-text px-4 py-2 text-[13.5px] font-bold text-mir-bg transition hover:brightness-105 active:translate-y-px"
                    >
                        Criar conta
                    </AuthModalTrigger>
                </div>
            </nav>

            <div className="mx-auto grid w-full max-w-[1320px] items-center gap-12 px-5 pb-16 pt-10 sm:px-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16 lg:pb-24 lg:pt-14">
                <div className="min-w-0">
                    <h1 className="m-0 max-w-[12ch] font-display text-[clamp(44px,6.6vw,88px)] font-black leading-[0.92] tracking-[-0.055em] text-mir-text">
                        Fica registrado que foi você.
                    </h1>
                    <p className="mt-6 max-w-[40ch] text-[clamp(16px,1.6vw,19px)] leading-[1.5] text-mir-text2">
                        Salve uma faixa antes dela estourar. A ordem em que
                        você chegou fica gravada, e ninguém tira de você.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                        <AuthModalTrigger
                            mode="signup"
                            className="inline-flex items-center gap-2 rounded-full bg-mir-text px-7 py-3.5 text-[15px] font-bold text-mir-bg transition hover:brightness-105 active:translate-y-px"
                        >
                            Criar conta
                            <ArrowRight className="h-4 w-4" />
                        </AuthModalTrigger>
                        <Link
                            href="/feed"
                            className="group inline-flex items-center gap-2 text-[15px] font-semibold text-mir-text2 transition-colors hover:text-mir-text"
                        >
                            Ver os achados
                            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                </div>

                {ficha && <Ficha ficha={ficha} />}
            </div>
        </header>
    )
}
