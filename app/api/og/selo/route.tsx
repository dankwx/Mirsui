// app/api/og/selo/route.tsx
//
// Gera o "selo de descoberta" como imagem 1080x1920 (formato story) via
// next/og. O servidor busca a capa do Spotify, então não há problema de CORS
// no client — o componente só baixa/compartilha o PNG resultante.

import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

const BG = '#14110b'
const ACC = '#cdef36'
const ON_ACC = '#16120c'
const TEXT = '#f3ecdb'
const MUTED = '#9a9180'

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl
    const title = (searchParams.get('title') || 'Faixa').slice(0, 80)
    const artist = (searchParams.get('artist') || '').slice(0, 80)
    const cover = searchParams.get('cover') || ''
    const position = parseInt(searchParams.get('position') || '0', 10)
    const total = parseInt(searchParams.get('total') || '0', 10)
    const year = searchParams.get('year') || ''

    const isFirst = position === 1
    const bigLabel = isFirst ? '1º HIPSTER' : position > 0 ? `#${position}` : '✦'
    const kicker = isFirst ? 'primeiro a cravar' : 'no acervo desde cedo'

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
                    padding: '110px 90px',
                    position: 'relative',
                }}
            >
                {/* glow */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-260px',
                        left: '50%',
                        marginLeft: '-450px',
                        width: '900px',
                        height: '900px',
                        background: `radial-gradient(closest-side, ${ACC}38, transparent 72%)`,
                        display: 'flex',
                    }}
                />

                {/* topo */}
                <div
                    style={{
                        display: 'flex',
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            fontSize: '40px',
                            fontWeight: 800,
                            letterSpacing: '-2px',
                            color: TEXT,
                        }}
                    >
                        mirsui
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            fontSize: '22px',
                            letterSpacing: '8px',
                            color: MUTED,
                        }}
                    >
                        SELO DE DESCOBERTA
                    </div>
                </div>

                {/* miolo */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={cover}
                            width={560}
                            height={560}
                            alt=""
                            style={{
                                borderRadius: '32px',
                                border: `2px solid ${ACC}55`,
                                objectFit: 'cover',
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                width: '560px',
                                height: '560px',
                                borderRadius: '32px',
                                backgroundColor: '#221d15',
                                display: 'flex',
                            }}
                        />
                    )}

                    <div
                        style={{
                            display: 'flex',
                            marginTop: '64px',
                            padding: '16px 40px',
                            borderRadius: '999px',
                            backgroundColor: ACC,
                            color: ON_ACC,
                            fontSize: '64px',
                            fontWeight: 800,
                            letterSpacing: '-1px',
                        }}
                    >
                        {bigLabel}
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            marginTop: '20px',
                            fontSize: '24px',
                            letterSpacing: '6px',
                            textTransform: 'uppercase',
                            color: MUTED,
                        }}
                    >
                        {kicker}
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            marginTop: '44px',
                            fontSize: '78px',
                            fontWeight: 800,
                            letterSpacing: '-3px',
                            color: TEXT,
                            textAlign: 'center',
                            maxWidth: '900px',
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
                                fontWeight: 700,
                                color: ACC,
                                textAlign: 'center',
                                maxWidth: '900px',
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
                            fontSize: '34px',
                            fontWeight: 700,
                            color: TEXT,
                            textAlign: 'center',
                        }}
                    >
                        cravei antes de virar mainstream
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            marginTop: '22px',
                            fontSize: '24px',
                            color: MUTED,
                        }}
                    >
                        {total > 0
                            ? `${total} já cravaram${year ? ` · desde ${year}` : ''}`
                            : 'mirsui.app'}
                    </div>
                </div>
            </div>
        ),
        { width: 1080, height: 1920 }
    )
}
