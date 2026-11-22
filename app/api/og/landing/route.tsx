// app/api/og/landing/route.tsx
//
// Card de compartilhamento da home (1200x630). Diferente do /api/og/selo, que é
// story vertical por faixa, este é fixo e não depende de nenhuma imagem externa,
// então nunca falha por CDN fora do ar.

import { ImageResponse } from 'next/og'

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
const MUTED = '#473710'
const CREAM = '#fffdf1'

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
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                    }}
                >
                    <svg
                        width={Math.round(56 * MARCA_RAZAO)}
                        height="56"
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
                            fontSize: '66px',
                            fontWeight: 800,
                            letterSpacing: '-3.6px',
                            lineHeight: 1.04,
                            color: TEXT,
                            maxWidth: '900px',
                        }}
                    >
                        Sensação de ter descoberto algo antes de virar assunto.
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
                        Um clube de descobertas musicais.
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                    }}
                >
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
                        SUBSTANTIVO INVENTADO
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
