import Link from 'next/link'
import Capa from './Capa'
import { diaMes, trackHref } from './landingHelpers'
import type { RecentActivityItem } from '@/utils/homepageService'
import type { PessoaDaCena } from '@/utils/homeService'

/**
 * O que a cena salvou, com as pessoas junto.
 *
 * Esta seção existe porque a home não tinha um rosto sequer. O produto é sobre
 * pessoas chegando primeiro numa faixa, e a página falava só de faixas.
 *
 * A cena tem cinco pessoas e algumas dezenas de salvamentos. Aparece assim, do
 * tamanho que é: nada de "junte-se a milhares". Um número inflado numa página
 * pública é uma mentira que qualquer clique desmente.
 */

function Avatar({
    src,
    nome,
    tamanho = 'h-7 w-7',
}: {
    src: string | null | undefined
    nome: string
    tamanho?: string
}) {
    return (
        <span
            className={`${tamanho} grid flex-none place-items-center overflow-hidden rounded-full bg-mir-card text-[10px] font-bold uppercase text-mir-text2 ring-1 ring-mir-line`}
        >
            {src ? (
                // <img> cru: avatar de OAuth vem de domínios variados que não
                // estão liberados em next.config, e o otimizador quebraria.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt="" className="h-full w-full object-cover" />
            ) : (
                nome.charAt(0)
            )}
        </span>
    )
}

/**
 * Recado curto demais não é recado.
 *
 * O campo é livre e tem gente que digita "222" só para passar da caixa. Numa
 * citação destacada, três caracteres soltos fazem o produto parecer bobo. Com
 * cinco caracteres passam os que dizem alguma coisa: "muchooo", "brabo dms".
 */
const RECADO_MINIMO = 5

function Achado({ item }: { item: RecentActivityItem }) {
    const quem = item.profiles?.display_name || item.profiles?.username || 'alguém'
    const bruto = item.claim_message?.trim()
    const recado = bruto && bruto.length >= RECADO_MINIMO ? bruto : null

    return (
        <article className="grid grid-cols-[64px_minmax(0,1fr)] gap-4 rounded-2xl border border-mir-line bg-mir-surface p-4">
            <Link href={trackHref(item.track_uri)} className="block">
                <Capa
                    src={item.track_thumbnail}
                    alt={`${item.track_title}, de ${item.artist_name}`}
                    semente={item.artist_name}
                    tamanho={160}
                    className="h-16 w-16 rounded-[6px] ring-1 ring-mir-line"
                    iniClassName="text-[17px]"
                />
            </Link>

            <div className="min-w-0">
                <Link href={trackHref(item.track_uri)} className="block w-max max-w-full">
                    <h3 className="m-0 truncate text-[17px] font-bold leading-tight tracking-[-0.02em] text-mir-text underline-offset-4 transition hover:underline hover:decoration-mir-line2 hover:decoration-2">
                        {item.track_title}
                    </h3>
                </Link>
                <p className="m-0 mt-0.5 truncate text-[13.5px] text-mir-text3">
                    {item.artist_name}
                </p>

                <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[13px] text-mir-text2">
                    <Link
                        href={`/user/${item.profiles?.username ?? ''}`}
                        className="flex items-center gap-2 transition-colors hover:text-mir-text"
                    >
                        <Avatar src={item.profiles?.avatar_url} nome={quem} />
                        <span className="font-semibold text-mir-text">{quem}</span>
                    </Link>
                    <span className="font-mono text-[11.5px] tabular-nums text-mir-text3">
                        {/* Lima só no primeiro lugar, igual ao resto do app. */}
                        <span
                            className={
                                item.position === 1
                                    ? 'font-bold text-mir-acc'
                                    : 'text-mir-text2'
                            }
                        >
                            {item.position}ª
                        </span>{' '}
                        a salvar · {diaMes(item.claimedat)}
                    </span>
                </div>

                {recado && (
                    // Laranja é a cor da camada humana no app inteiro: seguir,
                    // recado, favoritar. Alguém escreveu isto com a própria mão.
                    <p className="m-0 mt-3 border-l-2 border-mir-warm/50 pl-3 text-[14px] italic leading-[1.5] text-mir-text2">
                        {recado}
                    </p>
                )}
            </div>
        </article>
    )
}

export default function Cena({
    achados,
    pessoas,
}: {
    achados: RecentActivityItem[]
    pessoas: PessoaDaCena[]
}) {
    if (achados.length === 0) return null

    return (
        // id="cena" é âncora antiga: o rodapé linka /#cena desde antes das
        // reescritas da home, e esta seção é literalmente a cena.
        <section id="cena" className="scroll-mt-6 border-b border-mir-line bg-mir-bg">
            <div className="mx-auto grid w-full max-w-[1320px] gap-12 px-5 py-16 sm:px-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-16 lg:py-20">
                <div className="min-w-0">
                    <h2 className="m-0 mb-7 font-display text-[clamp(26px,3.4vw,40px)] font-black leading-[1] tracking-[-0.045em] text-mir-text">
                        O que a cena salvou.
                    </h2>
                    {/* Duas colunas a partir do sm: quase nenhum salvamento tem
                        recado (três em quarenta e seis), então numa lista de
                        largura cheia cada linha ficava com metade da faixa
                        vazia à direita. Em cartões lado a lado o mesmo conteúdo
                        preenche a seção. */}
                    <div className="grid gap-3 sm:grid-cols-2">
                        {achados.map((item) => (
                            <Achado key={item.id} item={item} />
                        ))}
                    </div>
                    <Link
                        href="/feed"
                        className="mt-7 inline-flex items-center gap-2 rounded-full border border-mir-line2 px-6 py-2.5 text-[13.5px] font-semibold text-mir-text2 transition hover:border-mir-text3 hover:text-mir-text"
                    >
                        Ver todos os achados
                    </Link>
                </div>

                {pessoas.length > 0 && (
                    <aside className="min-w-0">
                        <h2 className="m-0 mb-5 font-mono text-[11px] uppercase tracking-[0.16em] text-mir-text3">
                            Quem está aqui
                        </h2>
                        <ul className="m-0 flex list-none flex-col gap-1 p-0">
                            {pessoas.map((p) => (
                                <li key={p.username}>
                                    <Link
                                        href={`/user/${p.username}`}
                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-mir-fill1"
                                    >
                                        <Avatar
                                            src={p.avatar}
                                            nome={p.nome}
                                            tamanho="h-9 w-9"
                                        />
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-[14px] font-semibold text-mir-text">
                                                {p.nome}
                                            </span>
                                            <span className="block font-mono text-[11.5px] tabular-nums text-mir-text3">
                                                {p.faixas} no acervo
                                                {p.primeiros > 0 && (
                                                    <>
                                                        {' · '}
                                                        <span className="text-mir-acc">
                                                            {p.primeiros} em 1º
                                                        </span>
                                                    </>
                                                )}
                                            </span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <p className="m-0 mt-5 px-3 text-[13px] leading-[1.55] text-mir-text3">
                            A cena está começando agora. É exatamente por isso
                            que dá pra chegar em primeiro.
                        </p>
                    </aside>
                )}
            </div>
        </section>
    )
}
