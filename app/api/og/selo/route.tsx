// app/api/og/selo/route.tsx
//
// A imagem do story (1080x1920), via next/og: capa grande, faixa, artista e a
// marca, na paleta mostarda do site. O servidor busca a capa, então não há
// problema de CORS no client: o componente só baixa ou compartilha o PNG.
//
// As fontes são as do site, em TTF em app/api/og/fontes (o next/og não lê woff2).
// Sem elas a imagem saía na fonte padrão, fina.

import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

import {
    MARCA_RAZAO,
    MARCA_RISCOS,
    MARCA_SILHUETA,
    MARCA_TOUPEIRA,
    MARCA_VIEWBOX,
} from '@/components/MirsuiLogo/marca'

export const runtime = 'edge'

const BG = '#f9d454'
const ACC = '#775500'
const TEXT = '#2d230f'
const MUTED = '#5a4714'
const CREAM = '#fffdf1'

// Lidas uma vez por processo, não a cada story.
const fontes = Promise.all([
    fetch(new URL('../fontes/Archivo_800ExtraBold.ttf', import.meta.url)).then((r) =>
        r.arrayBuffer()
    ),
    fetch(new URL('../fontes/HankenGrotesk_600SemiBold.ttf', import.meta.url)).then((r) =>
        r.arrayBuffer()
    ),
    fetch(new URL('../fontes/SpaceGrotesk_700Bold.ttf', import.meta.url)).then((r) =>
        r.arrayBuffer()
    ),
])

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl
    const title = (searchParams.get('title') || 'Faixa').slice(0, 80)
    const artist = (searchParams.get('artist') || '').slice(0, 80)
    const cover = searchParams.get('cover') || ''
    const total = parseInt(searchParams.get('total') || '0', 10)
    const year = searchParams.get('year') || ''

    const [archivo, hanken, spaceGrotesk] = await fontes

    const footer =
        total > 0
            ? `${total} no acervo${year ? ` · desde ${year}` : ''}`
            : 'mirsui.app'

    return new ImageResponse(
        (
            <div
                style={{
                    width: '1080px',
                    height: '1920px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: BG,
                    padding: '120px 90px',
                    fontFamily: 'Hanken Grotesk',
                }}
            >
                {/* topo: a marca */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                    }}
                >
                    <svg
                        width={Math.round(58 * MARCA_RAZAO)}
                        height="58"
                        viewBox={MARCA_VIEWBOX}
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d={MARCA_SILHUETA} fill={CREAM} />
                        <path fillRule="evenodd" d={MARCA_TOUPEIRA} fill={TEXT} />
                        <path d={MARCA_RISCOS} fill={TEXT} />
                    </svg>
                    <div
                        style={{
                            display: 'flex',
                            fontFamily: 'Archivo',
                            fontSize: '42px',
                            fontWeight: 800,
                            letterSpacing: '-1.5px',
                            color: TEXT,
                        }}
                    >
                        mirsui
                    </div>
                </div>

                {/* miolo: capa e faixa */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '700px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            position: 'relative',
                            width: '700px',
                            height: '700px',
                        }}
                    >
                        {cover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={cover}
                                width={700}
                                height={700}
                                alt=""
                                style={{
                                    borderRadius: '10px',
                                    objectFit: 'cover',
                                    boxShadow: '0 50px 90px -40px rgba(45,35,15,0.65)',
                                }}
                            />
                        ) : (
                            <div
                                style={{
                                    width: '700px',
                                    height: '700px',
                                    borderRadius: '10px',
                                    backgroundColor: '#eabc43',
                                    display: 'flex',
                                }}
                            />
                        )}
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            marginTop: '64px',
                            fontFamily: 'Archivo',
                            fontSize: '74px',
                            fontWeight: 800,
                            letterSpacing: '-3.5px',
                            color: TEXT,
                            lineHeight: 1.04,
                        }}
                    >
                        {title}
                    </div>
                    {artist && (
                        <div
                            style={{
                                display: 'flex',
                                marginTop: '18px',
                                fontSize: '40px',
                                fontWeight: 600,
                                color: ACC,
                            }}
                        >
                            {artist}
                        </div>
                    )}
                </div>

                {/* rodapé */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            width: '80px',
                            height: '2px',
                            backgroundColor: 'rgba(45,35,15,0.28)',
                            marginBottom: '26px',
                        }}
                    />
                    <div
                        style={{
                            display: 'flex',
                            fontSize: '32px',
                            fontWeight: 600,
                            color: TEXT,
                            textAlign: 'center',
                        }}
                    >
                        salvei antes de virar mainstream
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            marginTop: '16px',
                            fontFamily: 'Space Grotesk',
                            fontSize: '24px',
                            fontWeight: 700,
                            color: MUTED,
                        }}
                    >
                        {footer}
                    </div>
                </div>
            </div>
        ),
        {
            width: 1080,
            height: 1920,
            fonts: [
                { name: 'Archivo', data: archivo, weight: 800, style: 'normal' },
                { name: 'Hanken Grotesk', data: hanken, weight: 600, style: 'normal' },
                { name: 'Space Grotesk', data: spaceGrotesk, weight: 700, style: 'normal' },
            ],
        }
    )
}
