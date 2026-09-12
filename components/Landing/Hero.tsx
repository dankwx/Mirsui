import Link from 'next/link'
import MirsuiLogo from '@/components/MirsuiLogo/MirsuiLogo'
import AuthModalTrigger from '@/components/AuthModalTrigger/AuthModalTrigger'
import { ArrowRight } from 'lucide-react'
import { capaDoAcervo, type FaixaDoAcervo } from '@/utils/homeService'

/**
 * Topo da home.
 *
 * O fundo é o acervo de verdade: dezenas de capas do Observatório, em mosaico.
 * Antes era uma fotografia em tela cheia, bonita e genérica — servia para
 * qualquer app de música. Capa de disco só serve para um.
 *
 * O bloco não ocupa a tela inteira de propósito. A home passou a ser uma
 * página de conteúdo, e conteúdo tem que começar a aparecer antes da dobra.
 */

/* Raio de canto desta página:
 *   capa            6px (2px nas do mosaico, que são miniatura)
 *   painel e cartão 16px
 *   botão e pílula  círculo cheio
 */

function Mosaico({ faixas }: { faixas: FaixaDoAcervo[] }) {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 grid grid-cols-6 gap-1 opacity-60 sm:grid-cols-9 lg:grid-cols-12"
        >
            {faixas.map((f) => (
                <div key={f.id} className="aspect-square overflow-hidden rounded-[2px] bg-mir-card">
                    {f.md5 && (
                        // <img> cru: são dezenas de miniaturas decorativas e o
                        // otimizador do Next cobraria uma transformação por
                        // capa sem nenhum ganho visível a 90px.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={capaDoAcervo(f.md5, 120)!}
                            alt=""
                            loading="eager"
                            decoding="async"
                            className="h-full w-full object-cover"
                        />
                    )}
                </div>
            ))}
        </div>
    )
}

export default function Hero({
    mosaico,
    medidas,
}: {
    mosaico: FaixaDoAcervo[]
    medidas: number
}) {
    return (
        <header className="relative overflow-hidden border-b border-mir-line">
            <Mosaico faixas={mosaico} />

            {/* O véu segura a legibilidade do texto sem apagar o mosaico. A
                primeira tentativa usava 95%/88% de opacidade mais um radial
                quase opaco, e as capas simplesmente sumiam — o que anulava o
                motivo de existirem. Agora o gradiente vertical é leve e o
                radial só cobre o canto onde a manchete mora, deixando o lado
                direito mostrar o acervo. */}
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-b from-mir-bg/70 via-mir-bg/45 to-mir-bg"
            />
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(95%_105%_at_-5%_55%,rgba(22,18,12,0.97)_25%,rgba(22,18,12,0.6)_55%,transparent_78%)]"
            />

            <nav className="relative z-10 mx-auto flex h-[72px] w-full max-w-[1320px] items-center gap-7 px-5 sm:px-10">
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
                <div className="ml-auto flex flex-none items-center gap-2.5">
                    <AuthModalTrigger
                        mode="login"
                        className="rounded-full border border-mir-line2 px-4 py-2 text-[13.5px] font-semibold text-mir-text2 transition hover:border-mir-text3 hover:text-mir-text"
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

            <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5 pb-16 pt-12 sm:px-10 lg:pb-20 lg:pt-16">
                <h1 className="m-0 max-w-[14ch] font-display text-[clamp(40px,6.4vw,76px)] font-black leading-[0.96] tracking-[-0.05em] text-mir-text">
                    Fica registrado que foi você.
                </h1>
                <p className="mt-6 max-w-[44ch] text-[clamp(15.5px,1.6vw,19px)] leading-[1.5] text-mir-text2">
                    Salve uma faixa antes dela estourar. A ordem em que você
                    chegou fica gravada, e ninguém tira de você.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                    <AuthModalTrigger
                        mode="signup"
                        className="inline-flex items-center gap-2 rounded-full bg-mir-text px-7 py-3.5 text-[15px] font-bold text-mir-bg transition hover:brightness-105 active:translate-y-px"
                    >
                        Criar conta grátis
                        <ArrowRight className="h-4 w-4" />
                    </AuthModalTrigger>
                    <Link
                        href="/feed"
                        className="inline-flex items-center gap-2 rounded-full border border-mir-line2 px-7 py-3.5 text-[15px] font-semibold text-mir-text2 transition hover:border-mir-text3 hover:text-mir-text active:translate-y-px"
                    >
                        Ver os achados
                    </Link>
                </div>

                {medidas > 0 && (
                    <p className="mt-8 font-mono text-[11.5px] uppercase tracking-[0.14em] tabular-nums text-mir-text3">
                        {medidas.toLocaleString('pt-BR')} faixas sob medição
                        diária · o histórico começa agora
                    </p>
                )}
            </div>
        </header>
    )
}
