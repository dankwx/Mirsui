'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { packPile } from '@/components/Pile/pileLayout'
import type { PileTrack } from '@/utils/pileTypes'
import { enderecoDaFaixa } from '@/utils/trackHref'
import { iniciais, tom } from './landingHelpers'

/**
 * A pilha, na home.
 *
 * O mesmo empacotamento por gravidade de /pilha (components/Pile/pileLayout),
 * sem os filtros e sem a ficha: aqui ela é o acervo despejado na página,
 * e cada peça abre a faixa. O tamanho da capa é a audiência medida, como lá.
 *
 * As peças chegam prontas do servidor (ver `pecasDaPilha` em Acervo.tsx):
 * este arquivo é cliente e homeService é server-only.
 */
const SEMENTE = 11

export default function PilhaDaHome({ pecas }: { pecas: PileTrack[] }) {
    const ref = useRef<HTMLDivElement>(null)
    const [largura, setLargura] = useState(0)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        const ro = new ResizeObserver(([e]) => setLargura(Math.round(e.contentRect.width)))
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    const layout = useMemo(() => packPile(pecas, largura, SEMENTE), [pecas, largura])

    return (
        <div ref={ref} className="pile-stage" style={{ height: layout.height || 560 }}>
            {layout.pieces.map((p) => {
                const t = p.track
                const capa = (
                    <div
                        className="pile-piece"
                        style={
                            {
                                '--r': `${p.rot}deg`,
                                '--d': `${p.delay}ms`,
                                background: tom(t.artist),
                            } as React.CSSProperties
                        }
                    >
                        <span className="pile-ini">{iniciais(t.artist)}</span>
                        {t.coverSmall && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={t.coverSmall} alt="" loading="lazy" decoding="async" />
                        )}
                    </div>
                )
                const dica = (
                    <span className={`pile-tip pile-tip--${p.align}`}>
                        <strong>{t.title}</strong>
                        <span className="pile-tip-artist">{t.artist}</span>
                    </span>
                )
                const estilo = {
                    left: p.x,
                    top: p.y,
                    width: p.size,
                    height: p.size,
                    zIndex: p.z,
                }
                return t.isrc ? (
                    <Link
                        key={t.id}
                        href={enderecoDaFaixa(t.isrc, t.artist, t.title)}
                        className="pile-slot"
                        style={estilo}
                        aria-label={`${t.title}, de ${t.artist}`}
                    >
                        {capa}
                        {dica}
                    </Link>
                ) : (
                    <div key={t.id} className="pile-slot" style={estilo}>
                        {capa}
                        {dica}
                    </div>
                )
            })}
        </div>
    )
}
