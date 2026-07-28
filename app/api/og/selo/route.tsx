// app/api/og/selo/route.tsx
//
// Gera a imagem de compartilhamento (formato story 1080x1920) via next/og,
// estilo Letterboxd: capa do álbum em destaque sobre fundo escuro, faixa e
// artista, com marca discreta. O servidor busca a capa do Spotify, então não
// há problema de CORS no client — o componente só baixa/compartilha o PNG.

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
    const total = parseInt(searchParams.get('total') || '0', 10)
    const year = searchParams.get('year') || ''

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
                    position: 'relative',
                }}
            >
                {/* glow sutil */}
                <div
                    style={{
                        position: 'absolute',
                        top: '120px',
                        left: '50%',
                        marginLeft: '-450px',
                        width: '900px',
                        height: '900px',
                        background: `radial-gradient(closest-side, ${ACC}22, transparent 70%)`,
                        display: 'flex',
                    }}
                />

                {/* topo — marca */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                    }}
                >
                    <svg
                        width="46"
                        height="46"
                        viewBox="0 0 100 100"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle cx="50" cy="50" r="49" fill={ON_ACC} />
                        <path
                            d="M50 1 a49 49 0 0 1 0 98 a24.5 24.5 0 0 1 0-49 a24.5 24.5 0 0 0 0-49z"
                            fill={ACC}
                        />
                        <circle cx="50" cy="25.5" r="7.2" fill={ON_ACC} />
                        <circle cx="50" cy="74.5" r="7.2" fill={ACC} />
                    </svg>
                    <div
                        style={{
                            display: 'flex',
                            fontSize: '34px',
                            fontWeight: 800,
                            letterSpacing: '-1.5px',
                            color: TEXT,
                        }}
                    >
                        mirsui
                    </div>
                </div>

                {/* miolo — capa + faixa (texto alinhado à esquerda da capa) */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '700px',
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
                                borderRadius: '28px',
                                border: '1px solid rgba(243,236,219,0.12)',
                                objectFit: 'cover',
                                boxShadow: '0 60px 120px -40px rgba(0,0,0,0.8)',
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                width: '700px',
                                height: '700px',
                                borderRadius: '28px',
                                backgroundColor: '#221d15',
                                display: 'flex',
                            }}
                        />
                    )}

                    <div
                        style={{
                            display: 'flex',
                            marginTop: '56px',
                            fontSize: '74px',
                            fontWeight: 800,
                            letterSpacing: '-3px',
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
                            backgroundColor: 'rgba(243,236,219,0.18)',
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
                        cravei antes de virar mainstream
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            marginTop: '16px',
                            fontSize: '24px',
                            color: MUTED,
                        }}
                    >
                        {footer}
                    </div>
                </div>
            </div>
        ),
        { width: 1080, height: 1920 }
    )
}
