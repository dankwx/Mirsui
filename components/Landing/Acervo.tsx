import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import PilhaDaHome from './PilhaDaHome'
import { capaDoAcervo, type FaixaDoAcervo, type GeneroDoAcervo } from '@/utils/homeService'
import type { PileHeat, PileTrack } from '@/utils/pileTypes'

/**
 * O acervo: a pilha e os gêneros.
 *
 * A pilha é a densidade da página, do jeito que a parede de pôsteres é a do
 * Letterboxd: o Mirsui mede quase três mil faixas todo dia, todas com capa, e
 * isso é o único dado grande que existe aqui. Os gêneros embaixo dão um jeito
 * de entrar nela, com a contagem real de cada um no acervo inteiro.
 *
 * As capas de cada gênero ficam empilhadas de lado, como os discos da marca,
 * e se abrem no hover (.pile-band / .pile-teaser, em globals.css).
 */

/**
 * O calor de cada peça vem da ordem por rank dentro da amostra: as quatro
 * mais ouvidas viram peça grande, as doze seguintes média, o resto pequeno.
 * Uma amostra de sessenta com um terço de peças grandes daria uma pilha de
 * 1.300px; assim fica em ~800px no desktop.
 */
function calor(indice: number): PileHeat {
    if (indice < 4) return 'topo'
    if (indice < 16) return 'meio'
    return 'subsolo'
}

function pecasDaPilha(faixas: FaixaDoAcervo[]): PileTrack[] {
    return [...faixas]
        .sort((a, b) => (b.rank ?? 0) - (a.rank ?? 0))
        .map((f, i) => ({
            id: f.id,
            isrc: f.isrc,
            title: f.titulo,
            artist: f.artista,
            cover: capaDoAcervo(f.md5, 500),
            coverSmall: capaDoAcervo(f.md5, 250),
            genre: f.genero ?? 'outros',
            heat: calor(i),
            audiencia: 0,
        }))
}

function Genero({ g }: { g: GeneroDoAcervo }) {
    const rotacoes = [-6, -2, 2, 5, -3]
    return (
        <Link href="/pilha" className="pile-band group block min-w-0">
            <div className="flex h-[92px] items-end pl-2">
                {g.faixas.slice(0, 5).map((f, i) => (
                    <div
                        key={f.id}
                        className="pile-teaser -ml-5 h-[76px] w-[76px] flex-none overflow-hidden rounded-[6px] bg-mir-card ring-1 ring-mir-line first:ml-0"
                        style={
                            {
                                '--tr': `${rotacoes[i % rotacoes.length]}deg`,
                                zIndex: 5 - i,
                            } as React.CSSProperties
                        }
                    >
                        {f.md5 && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={capaDoAcervo(f.md5, 250)!}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-cover"
                            />
                        )}
                    </div>
                ))}
            </div>
            <div className="mt-3 flex items-baseline gap-2.5">
                <h3 className="m-0 truncate text-[16px] font-bold tracking-[-0.015em] text-mir-text transition-colors group-hover:underline group-hover:decoration-mir-line2 group-hover:underline-offset-4">
                    {g.nome}
                </h3>
                <span className="flex-none font-mono text-[11.5px] tabular-nums text-mir-text3">
                    {g.total.toLocaleString('pt-BR')} faixas
                </span>
            </div>
        </Link>
    )
}

export default function Acervo({
    parede,
    generos,
    medidas,
}: {
    parede: FaixaDoAcervo[]
    generos: GeneroDoAcervo[]
    medidas: number
}) {
    if (parede.length === 0 && generos.length === 0) return null

    return (
        // overflow-x clip: peça rotacionada na borda da pilha vazava para
        // fora do container e abria rolagem lateral no celular
        <section className="border-b border-mir-line [overflow-x:clip]">
            <div className="mx-auto w-full max-w-[1320px] px-5 pt-16 sm:px-10 lg:pt-24">
                <h2 className="m-0 max-w-[16ch] font-display text-[clamp(30px,4.2vw,52px)] font-black leading-[0.98] tracking-[-0.05em] text-mir-text">
                    {medidas > 0 ? (
                        <>
                            <span className="tabular-nums">
                                {medidas.toLocaleString('pt-BR')}
                            </span>{' '}
                            faixas medidas todo dia.
                        </>
                    ) : (
                        'O acervo que a gente mede.'
                    )}
                </h2>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
                    <p className="m-0 max-w-[48ch] text-[15.5px] leading-[1.5] text-mir-text2">
                        Capa maior, mais audiência. A Pilha é o catálogo que o
                        Observatório mede, despejado num lugar só.
                    </p>
                    <Link
                        href="/pilha"
                        className="group inline-flex items-center gap-2 whitespace-nowrap text-[14px] font-semibold text-mir-text2 transition-colors hover:text-mir-text"
                    >
                        Revirar a pilha
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                </div>
            </div>

            {parede.length > 0 && (
                <div className="mx-auto mt-8 w-full max-w-[1320px] px-5 sm:px-10">
                    <PilhaDaHome pecas={pecasDaPilha(parede)} />
                </div>
            )}

            {generos.length > 0 && (
                <div className="mx-auto grid w-full max-w-[1320px] grid-cols-1 gap-x-8 gap-y-10 px-5 pb-20 pt-16 sm:grid-cols-2 sm:px-10 lg:grid-cols-4 lg:pb-24">
                    {generos.map((g) => (
                        <Genero key={g.nome} g={g} />
                    ))}
                </div>
            )}
        </section>
    )
}
