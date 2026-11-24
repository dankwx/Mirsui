// app/api/og/selo/route.tsx
//
// A imagem do story (1080x1920), via next/og, no formato de compartilhar um
// filme: a capa grande, o nome, o artista e o ano; embaixo, a linha de quem
// compartilha (avatar, nome, "salvou em") com a subida de audiência no lugar
// das estrelas, e a nota que a pessoa escreveu ao salvar. Sem frase de efeito
// nem "eu cheguei antes": o feito aparece pela data e pela curva.
//
// A rota só desenha o que vem no endereço (utils/story.ts monta e lê). Capa e
// avatar são baixados aqui, no servidor, e conferidos antes de entrar na
// imagem: o next/og só desenha PNG e JPEG, e uma imagem que falha derrubaria o
// story inteiro. Falhou, entra o quadrado de cor ou a inicial.
//
// As fontes são as do site, em TTF em app/api/og/fontes (o next/og não lê
// woff2). Sem elas a imagem saía na fonte padrão, fina.

import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

import {
    MARCA_RAZAO,
    MARCA_RISCOS,
    MARCA_SILHUETA,
    MARCA_TOUPEIRA,
    MARCA_VIEWBOX,
} from '@/components/MirsuiLogo/marca'
import { MESES } from '@/components/Track/format'
import { lerStory, type SubidaDoStory } from '@/utils/story'

export const runtime = 'edge'

const BG = '#f9d454'
const ACC = '#775500'
const TEXT = '#2d230f'
const MUTED = '#5a4714'
const CREAM = '#fffdf1'
const LINE = 'rgba(45,35,15,0.22)'

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

/** Baixa uma imagem que o next/og saiba desenhar, ou devolve null. */
async function baixarImagem(url: string | null): Promise<ArrayBuffer | null> {
    if (!url) return null
    const controle = new AbortController()
    const prazo = setTimeout(() => controle.abort(), 4000)
    try {
        const res = await fetch(url, { signal: controle.signal })
        if (!res.ok) return null
        const tipo = res.headers.get('content-type') || ''
        if (!/^image\/(png|jpe?g)\b/i.test(tipo)) return null
        return await res.arrayBuffer()
    } catch {
        return null
    } finally {
        clearTimeout(prazo)
    }
}

/** "17 set 2026", direto do YYYY-MM-DD, sem passar por fuso. */
function dataDoSave(iso: string): string {
    const [y, m, d] = iso.split('-').map((x) => parseInt(x, 10))
    return `${d} ${MESES[m - 1] ?? ''} ${y}`
}

/** Título longo encolhe em vez de empurrar o resto para fora da imagem. */
function tamanhoDoTitulo(titulo: string): number {
    if (titulo.length <= 20) return 80
    if (titulo.length <= 36) return 64
    return 52
}

/** A minicurva: o marco vazado (o save, ou 7 dias atrás) e hoje cheio. */
function Minicurva({ subida }: { subida: SubidaDoStory }) {
    const L = 130
    const A = 52
    const { pontos, marco } = subida
    const min = Math.min(...pontos)
    const max = Math.max(...pontos)
    const faixa = max - min || 1
    const xy = pontos.map((v, i) => ({
        x: 5 + (i * (L - 10)) / (pontos.length - 1),
        y: A - 8 - ((v - min) / faixa) * (A - 16),
    }))
    const ultimo = xy[xy.length - 1]
    const doMarco = xy[marco] ?? xy[0]

    return (
        <svg width={L} height={A} viewBox={`0 0 ${L} ${A}`}>
            <polyline
                points={xy.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
                fill="none"
                stroke={TEXT}
                strokeWidth="3.5"
                strokeLinejoin="round"
                strokeLinecap="round"
            />
            <circle cx={doMarco.x} cy={doMarco.y} r="4.5" fill={BG} stroke={TEXT} strokeWidth="3" />
            <circle cx={ultimo.x} cy={ultimo.y} r="5.5" fill={ACC} />
        </svg>
    )
}

export async function GET(req: NextRequest) {
    const story = lerStory(req.nextUrl.searchParams)
    const { pessoa, subida } = story

    const [[archivo, hanken, spaceGrotesk], capa, avatar] = await Promise.all([
        fontes,
        baixarImagem(story.capa),
        baixarImagem(pessoa?.avatar ?? null),
    ])

    const inicial = (pessoa?.nome.replace(/^@/, '').trim()[0] || '·').toUpperCase()
    const linhaDoArtista = [story.artista, story.ano].filter(Boolean).join(' · ')

    return new ImageResponse(
        (
            <div
                style={{
                    width: '1080px',
                    height: '1920px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: BG,
                    padding: '140px 140px 110px',
                    fontFamily: 'Hanken Grotesk',
                    color: TEXT,
                }}
            >
                {/* a faixa e a pessoa */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        flexGrow: 1,
                        width: '800px',
                    }}
                >
                    {capa ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={capa as unknown as string}
                            width={800}
                            height={800}
                            alt=""
                            style={{
                                borderRadius: '8px',
                                objectFit: 'cover',
                                boxShadow: '0 50px 90px -40px rgba(45,35,15,0.65)',
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                display: 'flex',
                                width: '800px',
                                height: '800px',
                                borderRadius: '8px',
                                backgroundColor: '#eabc43',
                            }}
                        />
                    )}

                    <div
                        style={{
                            display: 'flex',
                            marginTop: '56px',
                            fontFamily: 'Archivo',
                            fontSize: `${tamanhoDoTitulo(story.titulo)}px`,
                            fontWeight: 800,
                            letterSpacing: '-0.05em',
                            lineHeight: 1.05,
                        }}
                    >
                        {story.titulo}
                    </div>
                    {linhaDoArtista && (
                        <div
                            style={{
                                display: 'flex',
                                marginTop: '14px',
                                fontSize: '40px',
                                fontWeight: 600,
                                color: ACC,
                                lineHeight: 1.2,
                            }}
                        >
                            {linhaDoArtista}
                        </div>
                    )}

                    {pessoa && (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginTop: '48px',
                                paddingTop: '40px',
                                borderTop: `2px solid ${LINE}`,
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexGrow: 1,
                                    flexShrink: 1,
                                    minWidth: 0,
                                }}
                            >
                                {avatar ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={avatar as unknown as string}
                                        width={84}
                                        height={84}
                                        alt=""
                                        style={{ borderRadius: '42px', objectFit: 'cover', flexShrink: 0 }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '84px',
                                            height: '84px',
                                            borderRadius: '42px',
                                            flexShrink: 0,
                                            backgroundColor: ACC,
                                            color: CREAM,
                                            fontFamily: 'Archivo',
                                            fontSize: '40px',
                                            fontWeight: 800,
                                        }}
                                    >
                                        {inicial}
                                    </div>
                                )}
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        marginLeft: '22px',
                                        minWidth: 0,
                                        flexShrink: 1,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'block',
                                            fontSize: '36px',
                                            fontWeight: 600,
                                            lineHeight: 1.15,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                    >
                                        {pessoa.nome}
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            marginTop: '6px',
                                            fontSize: '28px',
                                            fontWeight: 600,
                                            color: MUTED,
                                        }}
                                    >
                                        {`salvou em ${dataDoSave(pessoa.salvouEm)}`}
                                    </div>
                                </div>
                            </div>

                            {subida && (
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexShrink: 0,
                                        marginLeft: '24px',
                                    }}
                                >
                                    <Minicurva subida={subida} />
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-end',
                                            marginLeft: '16px',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                fontFamily: 'Space Grotesk',
                                                fontSize: '44px',
                                                fontWeight: 700,
                                                letterSpacing: '-0.03em',
                                                lineHeight: 1,
                                            }}
                                        >
                                            <span>{subida.de}</span>
                                            <svg
                                                width="34"
                                                height="24"
                                                viewBox="0 0 34 24"
                                                style={{ margin: '0 10px' }}
                                            >
                                                <path
                                                    d="M3 12h26M20 4l9 8-9 8"
                                                    fill="none"
                                                    stroke={TEXT}
                                                    strokeWidth="3.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                            <span>{subida.para}</span>
                                        </div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                marginTop: '8px',
                                                fontSize: '19px',
                                                fontWeight: 600,
                                                letterSpacing: '0.13em',
                                                color: MUTED,
                                            }}
                                        >
                                            {subida.janela === 'semana' ? 'NA SEMANA' : 'AUDIÊNCIA'}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {pessoa?.nota && (
                        <div
                            style={{
                                display: 'flex',
                                marginTop: '36px',
                                fontSize: '40px',
                                fontWeight: 600,
                                lineHeight: 1.35,
                            }}
                        >
                            {`“${pessoa.nota}”`}
                        </div>
                    )}
                </div>

                {/* a marca */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <svg
                        width={Math.round(42 * MARCA_RAZAO)}
                        height="42"
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
                            marginLeft: '12px',
                            fontFamily: 'Archivo',
                            fontSize: '34px',
                            fontWeight: 800,
                            letterSpacing: '-1px',
                        }}
                    >
                        mirsui
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
