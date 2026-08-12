import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Capa from './Capa'
import { trackHref } from './landingHelpers'
import type { TrendingTrack } from '@/utils/homepageService'

/**
 * A parede: rolagem horizontal das faixas mais salvas.
 *
 * Sem selo "early" sobre as capas. O que existia ali saía de `i < 2`, então as
 * duas primeiras ganhavam o selo fosse qual fosse a faixa — e o número de
 * pessoas que salvaram, logo abaixo, já é real e já diz mais.
 */
export default function Parede({ faixas }: { faixas: TrendingTrack[] }) {
    if (faixas.length === 0) return null

    return (
        // id="cena" é âncora antiga: o rodapé linka /#cena desde antes desta
        // reescrita. Trocar ou remover o id quebraria o link em todas as
        // páginas deslogadas.
        <section id="cena" className="scroll-mt-6 border-b border-mir-line bg-mir-bg">
            <div className="mx-auto w-full max-w-[1320px] px-5 pb-24 pt-24 sm:px-10 lg:pb-28 lg:pt-32">
                <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
                    <h2 className="m-0 max-w-[18ch] font-display text-[clamp(30px,4.2vw,50px)] font-black leading-[1] tracking-[-0.045em] text-mir-text">
                        O que a cena está salvando.
                    </h2>
                    <Link
                        href="/pilha"
                        className="group inline-flex items-center gap-2 whitespace-nowrap text-[14.5px] font-semibold text-mir-text2 transition-colors hover:text-mir-text"
                    >
                        Revirar a pilha
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                </div>
            </div>

            {/* Sangra até a borda da tela de propósito: a fileira precisa parecer
                que continua para fora do enquadramento, senão ninguém arrasta. */}
            <div className="-mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-24 [scrollbar-width:none] sm:gap-5 sm:px-10 lg:pb-32 [&::-webkit-scrollbar]:hidden">
                {faixas.map((faixa) => (
                    <Link
                        key={faixa.id}
                        href={trackHref(faixa.track_url)}
                        className="group w-[clamp(9.5rem,23vw,13rem)] flex-none snap-start"
                    >
                        <Capa
                            src={faixa.track_thumbnail}
                            alt={`${faixa.track_title}, de ${faixa.artist_name}`}
                            semente={faixa.artist_name}
                            tamanho={420}
                            iniClassName="text-[46px]"
                            className="aspect-square w-full rounded-[6px] ring-1 ring-mir-line transition duration-300 group-hover:-translate-y-1.5 group-hover:ring-mir-text3 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
                        />
                        <div className="mt-3.5 truncate text-[14.5px] font-semibold tracking-[-0.01em] text-mir-text">
                            {faixa.track_title}
                        </div>
                        <div className="mt-0.5 truncate text-[13px] text-mir-text3">
                            {faixa.artist_name}
                        </div>
                        <div className="mt-2 font-mono text-[11.5px] tabular-nums text-mir-text3">
                            {faixa.total_claims === 1
                                ? '1 já salvou'
                                : `${faixa.total_claims} já salvaram`}
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}
