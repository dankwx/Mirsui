import Link from 'next/link'
import FotoDePerfil from '@/components/FotoDePerfil'
import Capa from './Capa'
import Carimbo from './Carimbo'
import { diaMes, trackHref } from './landingHelpers'
import type { RecentActivityItem } from '@/utils/homepageService'
import type { PessoaDaCena } from '@/utils/homeService'

/**
 * A cena: quem está aqui e o que escreveu.
 *
 * Cinco pessoas e algumas dezenas de salvamentos. Aparece assim, do tamanho
 * que é; "junte-se a milhares" seria uma mentira que qualquer clique desmente.
 *
 * Os recados são a parte escrita à mão do produto. Quase nenhum salvamento
 * tem um (três em quarenta e seis), então quando existem eles vêm em citação;
 * quando não, entram os salvamentos mais recentes, sem a frase.
 */

/** Recado curto demais não é recado: "222" é gente passando da caixa. */
const RECADO_MINIMO = 5

function Avatar({ src, nome, classe }: { src: string | null | undefined; nome: string; classe: string }) {
    return (
        <span
            className={`${classe} grid flex-none place-items-center overflow-hidden rounded-full bg-mir-card font-bold uppercase text-mir-text2 ring-1 ring-mir-line`}
        >
            <FotoDePerfil src={src} className="h-full w-full object-cover">
                {nome.charAt(0)}
            </FotoDePerfil>
        </span>
    )
}

function Pessoa({ p }: { p: PessoaDaCena }) {
    return (
        <Link
            href={`/user/${p.username}`}
            className="group flex min-w-0 items-center gap-4 rounded-[20px] py-2 pr-4 transition-colors hover:bg-mir-fill1"
        >
            <Avatar src={p.avatar} nome={p.nome} classe="h-14 w-14 text-[18px]" />
            <span className="min-w-0">
                <span className="block truncate text-[16px] font-bold tracking-[-0.015em] text-mir-text">
                    {p.nome}
                </span>
                <span className="block font-mono text-[11.5px] tabular-nums text-mir-text3">
                    {p.faixas} no acervo
                    {p.primeiros > 0 && (
                        <>
                            {' · '}
                            <span className="text-mir-acc">{p.primeiros} em 1º</span>
                        </>
                    )}
                </span>
            </span>
        </Link>
    )
}

function Recado({ item, comFrase }: { item: RecentActivityItem; comFrase: boolean }) {
    const quem = item.profiles?.display_name || item.profiles?.username || 'alguém'
    return (
        <li className="grid grid-cols-[56px_minmax(0,1fr)] gap-4 py-5">
            <Link href={trackHref(item)} className="block">
                <Capa
                    src={item.track_thumbnail}
                    alt={`${item.track_title}, de ${item.artist_name}`}
                    semente={item.artist_name}
                    tamanho={112}
                    className="h-14 w-14 rounded-[6px] ring-1 ring-mir-line"
                    iniClassName="text-[15px]"
                />
            </Link>
            <div className="min-w-0">
                {comFrase && item.claim_message && (
                    // Laranja é a cor da camada humana no app inteiro.
                    <p className="m-0 mb-2.5 border-l-2 border-mir-warm/60 pl-3 text-[17px] italic leading-[1.4] text-mir-text">
                        {item.claim_message.trim()}
                    </p>
                )}
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[13.5px] text-mir-text2">
                    <Carimbo posicao={item.position} tamanho="sm" />
                    <Link href={`/user/${item.profiles?.username ?? ''}`} className="font-semibold text-mir-text hover:underline">
                        {quem}
                    </Link>
                    <span>em</span>
                    <Link href={trackHref(item)} className="min-w-0 truncate font-semibold text-mir-text hover:underline">
                        {item.track_title}
                    </Link>
                    <span className="truncate text-mir-text3">{item.artist_name}</span>
                    <span className="font-mono text-[11px] tabular-nums text-mir-text3">
                        {diaMes(item.claimedat)}
                    </span>
                </div>
            </div>
        </li>
    )
}

export default function Cena({
    achados,
    pessoas,
}: {
    achados: RecentActivityItem[]
    pessoas: PessoaDaCena[]
}) {
    if (pessoas.length === 0 && achados.length === 0) return null

    const comRecado = achados.filter(
        (a) => (a.claim_message?.trim().length ?? 0) >= RECADO_MINIMO
    )
    const lista = comRecado.length > 0 ? comRecado.slice(0, 3) : achados.slice(0, 3)
    const comFrase = comRecado.length > 0

    return (
        // id="cena" é âncora antiga: o rodapé linka /#cena.
        <section id="cena" className="scroll-mt-6 border-b border-mir-line">
            <div className="mx-auto w-full max-w-[1320px] px-5 py-16 sm:px-10 lg:py-24">
                <h2 className="m-0 font-display text-[clamp(30px,4.2vw,52px)] font-black leading-[0.98] tracking-[-0.05em] text-mir-text">
                    Quem está aqui.
                </h2>
                <p className="m-0 mt-4 max-w-[44ch] text-[15.5px] leading-[1.5] text-mir-text2">
                    A cena está começando agora. É exatamente por isso que dá
                    pra chegar em primeiro.
                </p>

                {pessoas.length > 0 && (
                    <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                        {pessoas.map((p) => (
                            <Pessoa key={p.username} p={p} />
                        ))}
                    </div>
                )}

                {lista.length > 0 && (
                    <div className="mt-14 max-w-[760px]">
                        <h3 className="m-0 text-[15px] font-bold tracking-[-0.01em] text-mir-text">
                            {comFrase ? 'O que escreveram ao salvar' : 'Salvos por último'}
                        </h3>
                        <ul className="m-0 mt-1 list-none divide-y divide-mir-line p-0">
                            {lista.map((a) => (
                                <Recado key={a.id} item={a} comFrase={comFrase} />
                            ))}
                        </ul>
                        <Link
                            href="/feed"
                            className="group mt-2 inline-flex items-center gap-2 text-[14px] font-semibold text-mir-text2 transition-colors hover:text-mir-text"
                        >
                            Ver todos os achados
                        </Link>
                    </div>
                )}
            </div>
        </section>
    )
}
