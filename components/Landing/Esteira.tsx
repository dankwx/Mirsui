import Link from 'next/link'
import FotoDePerfil from '@/components/FotoDePerfil'
import Carimbo from './Carimbo'
import { diaMes, trackHref } from './landingHelpers'
import type { RecentActivityItem } from '@/utils/homepageService'

/**
 * A esteira de achados: quem salvou o quê, e em que posição chegou.
 *
 * É a camada de gente da página, passando na frente do visitante do jeito que
 * o feed de um lugar habitado passa. Cada item abre a faixa. Os nomes são os
 * cinco de verdade que a cena tem; ninguém aqui foi inventado.
 *
 * Com `prefers-reduced-motion` a esteira para e vira uma fileira que rola
 * com o dedo. A animação e a pausa no hover estão em globals.css (.mir-esteira).
 */
function Item({ item }: { item: RecentActivityItem }) {
    const quem = item.profiles?.display_name || item.profiles?.username || 'alguém'
    return (
        <Link
            href={trackHref(item)}
            className="flex flex-none items-center gap-3 rounded-full py-1.5 pl-1.5 pr-4 transition-colors hover:bg-mir-fill1"
        >
            <Carimbo posicao={item.position} tamanho="sm" />
            <span className="grid h-6 w-6 flex-none place-items-center overflow-hidden rounded-full bg-mir-card text-[10px] font-bold uppercase text-mir-text2 ring-1 ring-mir-line">
                <FotoDePerfil src={item.profiles?.avatar_url} className="h-full w-full object-cover">
                    {quem.charAt(0)}
                </FotoDePerfil>
            </span>
            <span className="whitespace-nowrap text-[13.5px] text-mir-text2">
                <b className="font-semibold text-mir-text">{quem}</b>
                {' salvou '}
                <b className="font-semibold text-mir-text">{item.track_title}</b>
                {', de '}
                {item.artist_name}
            </span>
            <span className="whitespace-nowrap font-mono text-[11px] tabular-nums text-mir-text3">
                {diaMes(item.claimedat)}
            </span>
        </Link>
    )
}

export default function Esteira({ achados }: { achados: RecentActivityItem[] }) {
    if (achados.length === 0) return null
    // duplicada para o loop fechar sem emenda; a segunda cópia é decorativa
    return (
        <section aria-label="Achados recentes" className="border-y border-mir-line">
            <div className="mir-esteira">
                <div className="mir-esteira-trilho">
                    {achados.map((a) => (
                        <Item key={a.id} item={a} />
                    ))}
                </div>
                <div className="mir-esteira-trilho" aria-hidden="true">
                    {achados.map((a) => (
                        <Item key={`c-${a.id}`} item={a} />
                    ))}
                </div>
            </div>
        </section>
    )
}
