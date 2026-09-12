import Link from 'next/link'
import FotoDePerfil from '@/components/FotoDePerfil'
import Carimbo from './Carimbo'
import Capa from './Capa'
import { diaMesAno, diaMesDeData, variacaoTexto } from './landingHelpers'
import type { FichaDaHome } from '@/utils/fichaDaHome'

/**
 * A ficha de uma gravação de verdade, no hero.
 *
 * Três coisas, na ordem em que o produto as produz: a capa, a curva que o
 * Observatório mediu, e quem salvou antes, com o carimbo de chegada. Não é
 * maquete: cada nome abre um perfil e a faixa abre a própria ficha.
 *
 * Por trás dela, duas fichas em branco deslocadas. É a marca (os discos
 * empilhados) virando layout: uma ficha em cima de uma pilha de fichas.
 */

function Curva({ valores }: { valores: number[] }) {
    const L = 100
    const A = 30
    const PAD = 2
    const min = Math.min(...valores)
    const max = Math.max(...valores)
    const amplitude = max - min
    // Mesma regra da página de faixa: a altura ocupada é proporcional ao
    // movimento real, para ruído continuar parecendo ruído.
    const ESCALA_CHEIA = 0.05
    const relativo = min > 0 ? amplitude / min : 0
    const ocupacao = Math.min(1, relativo / ESCALA_CHEIA)
    const util = (A - PAD * 2) * ocupacao
    const topo = (A - util) / 2

    const pontos = valores.map((v, i) => {
        const x = (i / (valores.length - 1)) * L
        const y = amplitude === 0 ? A / 2 : topo + (1 - (v - min) / amplitude) * util
        return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    const linha = pontos.join(' ')

    return (
        <svg
            viewBox={`0 0 ${L} ${A}`}
            preserveAspectRatio="none"
            className="h-14 w-full"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id="ficha-curva" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#cdef36" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#cdef36" stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={`0,${A} ${linha} ${L},${A}`} fill="url(#ficha-curva)" />
            <polyline
                points={linha}
                fill="none"
                stroke="#cdef36"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    )
}

export default function Ficha({ ficha }: { ficha: FichaDaHome }) {
    const variacao = variacaoTexto(ficha.variacao)
    const subiu = ficha.variacao !== null && ficha.variacao >= 0.5
    const medicoes = ficha.serie.length

    return (
        <div className="relative mx-auto w-full max-w-[440px] lg:mx-0 lg:ml-auto">
            {/* a pilha por baixo */}
            <div
                aria-hidden="true"
                className="absolute inset-0 -rotate-[4deg] translate-y-3 rounded-[20px] bg-mir-card/70 ring-1 ring-mir-line"
            />
            <div
                aria-hidden="true"
                className="absolute inset-0 -rotate-[1.5deg] translate-y-1.5 rounded-[20px] bg-mir-surface ring-1 ring-mir-line"
            />

            <article className="anim-pop relative rounded-[20px] border border-mir-line2 bg-mir-surface p-5 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.85)] sm:p-6">
                <div className="grid grid-cols-[92px_minmax(0,1fr)] items-center gap-4 sm:grid-cols-[112px_minmax(0,1fr)]">
                    <Link href={ficha.href} className="block">
                        <Capa
                            src={ficha.capa}
                            alt={`${ficha.titulo}, de ${ficha.artista}`}
                            semente={ficha.artista}
                            tamanho={224}
                            prioridade
                            className="aspect-square w-full rounded-[6px] ring-1 ring-mir-line"
                            iniClassName="text-[28px]"
                        />
                    </Link>
                    <div className="min-w-0">
                        <Link href={ficha.href} className="block">
                            <h2 className="m-0 truncate font-display text-[22px] font-black leading-[1.05] tracking-[-0.035em] text-mir-text sm:text-[26px]">
                                {ficha.titulo}
                            </h2>
                        </Link>
                        <p className="m-0 mt-1 truncate text-[14px] text-mir-text2">
                            {ficha.artista}
                        </p>
                        <p className="m-0 mt-3 font-mono text-[11px] tabular-nums text-mir-text3">
                            {ficha.salvamentos}{' '}
                            {ficha.salvamentos === 1 ? 'pessoa salvou' : 'pessoas salvaram'}
                        </p>
                    </div>
                </div>

                <div className="mt-5 border-t border-mir-line pt-4">
                    <div className="flex items-baseline justify-between gap-3">
                        <span
                            className={`font-display text-[30px] font-black leading-none tabular-nums tracking-[-0.04em] ${
                                subiu ? 'text-mir-acc' : 'text-mir-text'
                            }`}
                        >
                            {variacao}
                        </span>
                        <span className="text-right font-mono text-[11px] tabular-nums text-mir-text3">
                            audiência desde {diaMesDeData(ficha.desde)}
                            <br />
                            {medicoes} medições
                        </span>
                    </div>
                    <div className="mt-3">
                        <Curva valores={ficha.serie} />
                    </div>
                </div>

                <ol className="m-0 mt-4 flex list-none flex-col gap-1 border-t border-mir-line p-0 pt-4">
                    {ficha.quem.slice(0, 4).map((q) => (
                        <li key={`${q.username}-${q.position}`}>
                            <Link
                                href={`/user/${q.username}`}
                                className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-mir-fill1"
                            >
                                <Carimbo posicao={q.position} />
                                <span className="grid h-8 w-8 flex-none place-items-center overflow-hidden rounded-full bg-mir-card text-[11px] font-bold uppercase text-mir-text2 ring-1 ring-mir-line">
                                    <FotoDePerfil src={q.avatar} className="h-full w-full object-cover">
                                        {q.nome.charAt(0)}
                                    </FotoDePerfil>
                                </span>
                                <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-mir-text">
                                    {q.nome}
                                </span>
                                <span className="flex-none font-mono text-[11px] tabular-nums text-mir-text3">
                                    {diaMesAno(q.quando)}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ol>
            </article>
        </div>
    )
}
