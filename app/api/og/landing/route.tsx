// app/api/og/landing/route.tsx
//
// Card de compartilhamento da home (1200x630). Diferente do /api/og/selo, que é
// story vertical por faixa, este é fixo e não depende de nenhuma imagem externa,
// então nunca falha por CDN fora do ar.

import { ImageResponse } from 'next/og'

export const runtime = 'edge'

const BG = '#16120c'
const ACC = '#cdef36'
const ON_ACC = '#16120c'
const TEXT = '#ece3d2'
const MUTED = '#9b958b'

export async function GET() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '1200px',
                    height: '630px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    backgroundColor: BG,
                    padding: '72px 80px',
                    position: 'relative',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        bottom: '-260px',
                        left: '-160px',
                        width: '820px',
                        height: '820px',
                        background: `radial-gradient(closest-side, ${ACC}26, transparent 70%)`,
                        display: 'flex',
                    }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <svg
                        width="44"
                        height="44"
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
                            letterSpacing: '-1.6px',
                            color: TEXT,
                        }}
                    >
                        mirsui
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div
                        style={{
                            display: 'flex',
                            fontSize: '78px',
                            fontWeight: 800,
                            letterSpacing: '-3.6px',
                            lineHeight: 1.04,
                            color: TEXT,
                            maxWidth: '900px',
                        }}
                    >
                        Salve a música antes dela estourar.
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            marginTop: '26px',
                            fontSize: '32px',
                            fontWeight: 500,
                            color: MUTED,
                        }}
                    >
                        Fica registrado que a descoberta foi sua.
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                        style={{
                            display: 'flex',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: ACC,
                        }}
                    />
                    <div
                        style={{
                            display: 'flex',
                            fontSize: '24px',
                            fontWeight: 600,
                            letterSpacing: '3px',
                            color: TEXT,
                        }}
                    >
                        A CENA, AO VIVO
                    </div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
            headers: {
                'cache-control':
                    'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
            },
        }
    )
}
