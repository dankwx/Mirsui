import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { capaDoAcervo, type GeneroDoAcervo } from '@/utils/homeService'

/**
 * O acervo por gênero.
 *
 * É daqui que vem a densidade da página. O Letterboxd enche a home com uma
 * centena de pôsteres porque tem milhões de pessoas alimentando o catálogo; o
 * Mirsui tem 2.994 faixas medidas todo dia, todas com capa, e é o único dado
 * grande que existe aqui hoje. Então a home mostra o catálogo, não uma lista de
 * argumentos sobre ele.
 *
 * Os números de cada gênero são a contagem real no acervo inteiro, não a
 * quantidade de capas na fileira.
 */

/** Só ~1/4 do catálogo tem par no Spotify; sem id não existe ficha para abrir. */
function Faixa({
    md5,
    titulo,
    artista,
    spotifyId,
}: {
    md5: string | null
    titulo: string
    artista: string
    spotifyId: string | null
}) {
    const capa = (
        <>
            <div className="aspect-square w-full overflow-hidden rounded-[6px] bg-mir-card ring-1 ring-mir-line transition duration-300 group-hover:-translate-y-1 group-hover:ring-mir-text3 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
                {md5 && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={capaDoAcervo(md5, 250)!}
                        alt={`${titulo}, de ${artista}`}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                    />
                )}
            </div>
            <div className="mt-2 truncate text-[13px] font-semibold tracking-[-0.01em] text-mir-text">
                {titulo}
            </div>
            <div className="mt-0.5 truncate text-[12px] text-mir-text3">{artista}</div>
        </>
    )

    const classe = 'group w-[clamp(7.5rem,20vw,9.5rem)] flex-none snap-start'

    if (!spotifyId) {
        return <div className={classe}>{capa}</div>
    }
    return (
        <Link href={`/track/${spotifyId}`} className={classe}>
            {capa}
        </Link>
    )
}

export default function Acervo({ generos }: { generos: GeneroDoAcervo[] }) {
    if (generos.length === 0) return null

    return (
        <section className="border-b border-mir-line bg-mir-bg">
            <div className="mx-auto w-full max-w-[1320px] px-5 pb-10 pt-16 sm:px-10 lg:pt-20">
                <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
                    <h2 className="m-0 max-w-[20ch] font-display text-[clamp(26px,3.4vw,40px)] font-black leading-[1] tracking-[-0.045em] text-mir-text">
                        O acervo que a gente mede.
                    </h2>
                    <Link
                        href="/pilha"
                        className="group inline-flex items-center gap-2 whitespace-nowrap text-[14px] font-semibold text-mir-text2 transition-colors hover:text-mir-text"
                    >
                        Revirar a pilha
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                </div>
            </div>

            {/* Uma fileira por gênero, no mesmo container do resto da página.
                A primeira versão sangrava até a borda da tela, e isso quebrava
                em monitor largo: num 2315px os títulos começavam em 530px (o
                container de 1320 centralizado) e as capas em 40px, 490px de
                desalinhamento. A rolagem lateral continua sendo a affordance de
                "tem mais do que cabe" — o overflow corta a última capa na borda
                direita do container, que é o mesmo recado. */}
            <div className="flex flex-col gap-9 pb-20 lg:pb-24">
                {generos.map((g) => (
                    <div key={g.nome}>
                        <div className="mx-auto flex w-full max-w-[1320px] items-baseline gap-3 px-5 sm:px-10">
                            <h3 className="m-0 text-[15px] font-bold tracking-[-0.01em] text-mir-text">
                                {g.nome}
                            </h3>
                            <span className="font-mono text-[11.5px] tabular-nums text-mir-text3">
                                {g.total.toLocaleString('pt-BR')} faixas
                            </span>
                            <span className="h-px flex-1 bg-mir-line" />
                        </div>

                        {/* scroll-pl acompanha o px: sem ele o scroll-snap
                            encosta o primeiro item na borda do scrollport e
                            ignora o padding, então a fileira nascia com
                            scrollLeft de 40px e as capas ficavam justamente
                            esse tanto à esquerda do título. */}
                        <div className="mx-auto mt-3.5 flex w-full max-w-[1320px] snap-x scroll-pl-5 gap-3.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:scroll-pl-10 sm:px-10 [&::-webkit-scrollbar]:hidden">
                            {g.faixas.map((f) => (
                                <Faixa
                                    key={f.id}
                                    md5={f.md5}
                                    titulo={f.titulo}
                                    artista={f.artista}
                                    spotifyId={f.spotifyId}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
