import Capa from './Capa'
import type { TrendingTrack } from '@/utils/homepageService'

/**
 * Três tempos, um embaixo do outro, presos por um fio vertical.
 *
 * Não são três cards iguais lado a lado de propósito: os três tempos são uma
 * sequência no tempo, e três colunas dizem que acontecem em paralelo.
 *
 * O visual da direita é a pilha do próprio produto, montada com capas reais em
 * vez de um mockup desenhado com divs.
 */

const TEMPOS = [
    {
        titulo: 'Ache',
        corpo: 'Um som que quase ninguém ouviu ainda. O Observatório mostra o que está no subsolo, não o que já está no topo.',
    },
    {
        titulo: 'Salve',
        corpo: 'Um clique. O dia e a hora em que você chegou ficam gravados na faixa.',
    },
    {
        titulo: 'Prove',
        corpo: 'Quando a faixa estourar, sua posição na fila continua lá. Quem chegou depois vê que você veio antes.',
    },
]

/** Inclinação de cada capa da pilha, em graus. Fixa, para não dançar no SSR. */
const GIRO = [-7, 4, -3, 6]

export default function ComoFunciona({ faixas }: { faixas: TrendingTrack[] }) {
    const pilha = faixas.slice(0, 4)

    return (
        <section id="como" className="border-b border-mir-line bg-mir-bg">
            <div className="mx-auto grid w-full max-w-[1320px] gap-16 px-5 py-24 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-center lg:gap-24 lg:py-32">
                <div className="min-w-0">
                    <h2 className="m-0 max-w-[16ch] font-display text-[clamp(32px,4.6vw,56px)] font-black leading-[0.98] tracking-[-0.045em] text-mir-text">
                        Você ouve primeiro. A gente registra.
                    </h2>

                    <ol className="relative mt-12 grid gap-9 pl-9">
                        {/* O fio some antes do fim do último item, senão parece
                            que a sequência continua fora da tela. */}
                        <span
                            aria-hidden="true"
                            className="absolute bottom-8 left-[5px] top-2 w-px bg-gradient-to-b from-mir-line2 to-transparent"
                        />
                        {TEMPOS.map((t) => (
                            <li key={t.titulo} className="relative">
                                <span
                                    aria-hidden="true"
                                    className="absolute -left-9 top-[7px] h-[11px] w-[11px] rounded-full border-2 border-mir-line2 bg-mir-bg"
                                />
                                <h3 className="m-0 text-[20px] font-bold tracking-[-0.02em] text-mir-text">
                                    {t.titulo}
                                </h3>
                                <p className="m-0 mt-2 max-w-[46ch] text-[15.5px] leading-[1.6] text-mir-text2">
                                    {t.corpo}
                                </p>
                            </li>
                        ))}
                    </ol>
                </div>

                {pilha.length > 0 && (
                    <div
                        aria-hidden="true"
                        className="relative mx-auto h-[19rem] w-full max-w-[20rem] lg:h-[22rem]"
                    >
                        {/* O posicionamento vive no wrapper, não na Capa. A Capa
                            fixa `relative` para segurar a imagem em inset-0, e o
                            Tailwind gera `.relative` depois de `.absolute` — então
                            mandar `absolute` no className dela não vence a cascata
                            e as capas caem uma embaixo da outra. */}
                        {pilha.map((faixa, i) => (
                            <div
                                key={faixa.id}
                                // 56% + deslocamento máximo de 34,5% deixa ~10%
                                // de sobra, que é o que a rotação come: girar
                                // um quadrado aumenta a caixa dele, e sem essa
                                // folga as duas últimas capas passavam da
                                // margem da seção.
                                className="absolute h-[56%] w-[56%]"
                                style={{
                                    left: `${6 + i * 9.5}%`,
                                    top: `${6 + i * 10}%`,
                                    transform: `rotate(${GIRO[i]}deg)`,
                                    zIndex: i,
                                }}
                            >
                                <Capa
                                    src={faixa.track_thumbnail}
                                    alt=""
                                    semente={faixa.artist_name}
                                    tamanho={320}
                                    iniClassName="text-[44px]"
                                    className="h-full w-full rounded-[6px] shadow-[0_26px_60px_-24px_rgba(0,0,0,0.9)] ring-1 ring-mir-line"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}
