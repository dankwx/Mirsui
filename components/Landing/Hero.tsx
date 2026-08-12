import Link from 'next/link'
import MirsuiLogo from '@/components/MirsuiLogo/MirsuiLogo'
import AuthModalTrigger from '@/components/AuthModalTrigger/AuthModalTrigger'
import { ArrowRight } from 'lucide-react'
import Capa from './Capa'
import { diaMes, trackHref } from './landingHelpers'
import type { RecentActivityItem } from '@/utils/homepageService'

/**
 * O hero é o registro.
 *
 * A home antiga abria com uma fotografia em tela cheia. Era bonita e podia
 * pertencer a qualquer app de música — nada nela dizia o que o Mirsui faz de
 * diferente. O que só existe aqui é a posição: a ordem em que cada pessoa
 * chegou numa faixa. Então a coluna da direita não é ilustração do produto, é
 * o produto, com nomes, posições e datas de verdade vindos do banco.
 */

/* Raio de canto desta página, para não virar sopa:
 *   capa de faixa       6px
 *   painel e cartão     16px (rounded-2xl)
 *   botão e pílula      círculo cheio
 */

/** Linhas do registro. Seis cabem na dobra sem espremer o texto da esquerda. */
const LINHAS = 6

function Linha({ item, indice }: { item: RecentActivityItem; indice: number }) {
    const quem =
        item.profiles?.display_name || item.profiles?.username || 'alguém'
    const primeiro = item.position === 1

    return (
        <Link
            href={trackHref(item.track_uri)}
            style={{ animationDelay: `${indice * 70}ms` }}
            className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both grid grid-cols-[2.25rem_2.5rem_minmax(0,1fr)_auto] items-center gap-3 border-t border-mir-line px-4 py-3 transition-colors duration-200 first:border-t-0 hover:bg-mir-fill1 motion-reduce:animate-none sm:gap-4 sm:px-5"
        >
            {/* A posição é o único lima da página inteira, e só quando é 1. */}
            <span
                className={`font-mono text-[13px] font-bold tabular-nums ${
                    primeiro ? 'text-mir-acc' : 'text-mir-text3'
                }`}
            >
                {item.position}ª
            </span>

            <Capa
                src={item.track_thumbnail}
                alt=""
                semente={item.artist_name}
                tamanho={80}
                className="h-10 w-10 rounded-[6px]"
                iniClassName="text-[11px]"
            />

            <span className="min-w-0">
                <span className="block truncate text-[14px] font-semibold tracking-[-0.01em] text-mir-text">
                    {item.track_title}
                </span>
                <span className="block truncate text-[12.5px] text-mir-text3">
                    {item.artist_name}
                </span>
            </span>

            <span className="text-right">
                <span className="block max-w-[9ch] truncate text-[12.5px] text-mir-text2">
                    {quem}
                </span>
                <span className="block font-mono text-[11px] tabular-nums text-mir-text3">
                    {diaMes(item.claimedat)}
                </span>
            </span>
        </Link>
    )
}

export default function Hero({ atividade }: { atividade: RecentActivityItem[] }) {
    const linhas = atividade.slice(0, LINHAS)

    return (
        <header className="relative min-h-[100dvh] overflow-hidden border-b border-mir-line">
            {/* Brilho de canto. Fica em 6% porque o trabalho dele é dar
                profundidade ao fundo, não pintar a seção de verde. */}
            <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-40 -top-56 h-[36rem] w-[36rem] rounded-full bg-mir-acc/[0.06] blur-[120px]"
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

            {/* Padding curto de propósito: o hero é min-h-[100dvh] com o
                conteúdo centrado, então a folga vem da altura da tela. Com
                pt-16/pb-20 o bloco passava de 700px e estourava a dobra em
                telas de 650px, que é laptop com a janela pela metade. */}
            <div className="relative z-10 mx-auto grid w-full max-w-[1320px] items-center gap-12 px-5 pb-14 pt-10 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-20 lg:pb-20 lg:pt-14">
                <div className="min-w-0">
                    <h1 className="m-0 font-display text-[clamp(44px,7.4vw,88px)] font-black leading-[0.94] tracking-[-0.05em] text-mir-text">
                        Fica registrado
                        <br />
                        que foi você.
                    </h1>
                    <p className="mt-7 max-w-[46ch] text-[clamp(16px,1.7vw,20px)] leading-[1.5] text-mir-text2">
                        Salve uma faixa antes dela estourar. A ordem em que você
                        chegou fica gravada, e ninguém tira de você.
                    </p>

                    <div className="mt-9 flex flex-wrap items-center gap-3">
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
                </div>

                {linhas.length > 0 && (
                    <div className="min-w-0 overflow-hidden rounded-2xl border border-mir-line bg-mir-surface">
                        <div className="flex items-center gap-2.5 border-b border-mir-line px-4 py-3.5 sm:px-5">
                            {/* Ponto de estado real: estas linhas são as últimas
                                do banco, não uma amostra escrita à mão. */}
                            <span className="h-[7px] w-[7px] flex-none rounded-full bg-mir-acc" />
                            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-mir-text3">
                                Últimos achados
                            </span>
                        </div>
                        {linhas.map((item, i) => (
                            <Linha key={item.id} item={item} indice={i} />
                        ))}
                    </div>
                )}
            </div>
        </header>
    )
}
