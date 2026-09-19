'use client'

// A prévia da faixa, no cabeçalho da página.
//
// O Deezer entrega um MP3 de 30 s no MESMO objeto da faixa que a página já
// busca — sem requisição extra, sem chave, sem cota. A URL vem assinada com
// `hdnea=exp=` e vale poucas horas, então é resolvida no request e nunca
// gravada no banco (utils/deezerService.ts revalida em 15 min).
//
// A FORMA DE ONDA É REAL. O CDN de prévias responde com
// `access-control-allow-origin: *` (medido em 18/09/2026), então o mesmo
// arquivo que o <audio> toca pode ser lido e decodificado com a Web Audio API
// e virar 64 barras de amplitude. Nada é desenhado a partir de um número
// aleatório: se a decodificação falhar (navegador antigo, CORS que mude de
// ideia, rede), as barras ficam chapadas e o player continua funcionando —
// o arquivo entra no cache do navegador e o <audio> o reaproveita.
//
// O YouTube continua como segunda opção: a busca custa 100 unidades da cota
// de 10.000/dia e exigiu uma tabela de cache (migrations 002 e 017). Só é
// consultado quando não há prévia do Deezer.

import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { duracao as mmss } from './format'
import styles from './TrackPlayer.module.css'

interface TrackPlayerProps {
    /** MP3 de 30 s do Deezer. Primeira opção. */
    previewUrl: string | null
    /** id do vídeo no cache do YouTube. Segunda opção. */
    videoId: string | null
    trackTitle: string
    artistName: string
}

const BARRAS = 64
const ALTURA = 44
/** amplitude mínima de uma barra, para o silêncio não sumir do desenho */
const PISO = 0.12

/**
 * Lê o MP3 e devolve a amplitude (RMS) de cada trecho, normalizada em 0..1.
 * Roda uma vez por faixa e fora do caminho de pintura.
 */
async function medirOndas(src: string, signal: AbortSignal): Promise<number[]> {
    const res = await fetch(src, { signal })
    if (!res.ok) throw new Error(`prévia ${res.status}`)
    const bruto = await res.arrayBuffer()

    // OfflineAudioContext decodifica sem precisar de gesto do usuário.
    const contexto = new OfflineAudioContext(1, 1, 44100)
    const audio = await contexto.decodeAudioData(bruto)
    const amostras = audio.getChannelData(0)
    const porBarra = Math.floor(amostras.length / BARRAS)
    if (porBarra < 1) throw new Error('prévia curta demais')

    const rms: number[] = []
    for (let i = 0; i < BARRAS; i++) {
        let soma = 0
        let n = 0
        // Um a cada oito é o bastante para a média: 30 s × 44,1 kHz são 1,3
        // milhão de amostras, e a barra tem 2 px de largura.
        for (let j = i * porBarra; j < (i + 1) * porBarra; j += 8) {
            soma += amostras[j] * amostras[j]
            n++
        }
        rms.push(Math.sqrt(soma / Math.max(1, n)))
    }

    const maior = Math.max(...rms)
    if (!maior) throw new Error('prévia muda')
    return rms.map((v) => Math.max(PISO, v / maior))
}

function Ondas({
    picos,
    progresso,
    id,
}: {
    picos: number[] | null
    progresso: number
    id: string
}) {
    const largura = BARRAS * 3
    const alturas = picos ?? Array.from({ length: BARRAS }, () => PISO * 2)

    const barras = alturas.map((p, i) => {
        const h = Math.max(2, Math.round(p * ALTURA))
        return (
            <rect
                key={i}
                x={i * 3}
                y={(ALTURA - h) / 2}
                width={2}
                height={h}
                rx={1}
            />
        )
    })

    return (
        <svg
            className={styles.wave}
            viewBox={`0 0 ${largura} ${ALTURA}`}
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            <defs>
                <clipPath id={id} clipPathUnits="objectBoundingBox">
                    <rect
                        x="0"
                        y="0"
                        width={Math.min(1, progresso)}
                        height="1"
                    />
                </clipPath>
            </defs>
            <g className={styles.waveBase}>{barras}</g>
            <g className={styles.wavePlayed} clipPath={`url(#${id})`}>
                {barras}
            </g>
        </svg>
    )
}

function PlayerDoDeezer({
    src,
    trackTitle,
}: {
    src: string
    trackTitle: string
}) {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [tocando, setTocando] = useState(false)
    const [posicao, setPosicao] = useState(0)
    const [duracao, setDuracao] = useState(30)
    const [picos, setPicos] = useState<number[] | null>(null)

    // Fonte nova (o usuário navegou para outra faixa): volta ao início parado
    // e mede a onda de novo.
    useEffect(() => {
        setTocando(false)
        setPosicao(0)
        setPicos(null)

        // Quem pediu economia de dados não baixa 480 KB só para ver a onda:
        // fica com as barras chapadas até apertar play.
        const conexao = (
            navigator as Navigator & { connection?: { saveData?: boolean } }
        ).connection
        if (conexao?.saveData) return

        const cancelar = new AbortController()
        medirOndas(src, cancelar.signal)
            .then((p) => setPicos(p))
            .catch(() => {
                /* barras chapadas; o player continua de pé */
            })
        return () => cancelar.abort()
    }, [src])

    const alternar = () => {
        const a = audioRef.current
        if (!a) return
        if (a.paused) {
            void a.play().then(
                () => setTocando(true),
                () => setTocando(false)
            )
        } else {
            a.pause()
            setTocando(false)
        }
    }

    const irPara = (e: React.ChangeEvent<HTMLInputElement>) => {
        const a = audioRef.current
        const t = Number(e.target.value)
        setPosicao(t)
        if (a) a.currentTime = t
    }

    const progresso = duracao > 0 ? posicao / duracao : 0

    return (
        <div className={styles.player}>
            <audio
                ref={audioRef}
                src={src}
                preload="metadata"
                onLoadedMetadata={(e) => {
                    const d = e.currentTarget.duration
                    if (Number.isFinite(d) && d > 0) setDuracao(d)
                }}
                onTimeUpdate={(e) => setPosicao(e.currentTarget.currentTime)}
                onEnded={() => {
                    setTocando(false)
                    setPosicao(0)
                }}
            />

            <button
                type="button"
                onClick={alternar}
                aria-label={
                    tocando ? 'Pausar prévia' : `Tocar prévia de ${trackTitle}`
                }
                aria-pressed={tocando}
                className={styles.playButton}
            >
                {tocando ? (
                    <Pause size={20} fill="currentColor" aria-hidden="true" />
                ) : (
                    <Play
                        size={20}
                        fill="currentColor"
                        aria-hidden="true"
                        className={styles.playIcon}
                    />
                )}
            </button>

            <div className={styles.track}>
                <Ondas picos={picos} progresso={progresso} id="preview-clip" />
                {/* O range fica por cima da onda, invisível: dá clique para
                    buscar, arraste, setas do teclado e leitor de tela, sem
                    reinventar um slider. */}
                <input
                    type="range"
                    min={0}
                    max={duracao}
                    step={0.1}
                    value={posicao}
                    onChange={irPara}
                    aria-label="Posição da prévia"
                    aria-valuetext={`${mmss(posicao)} de ${mmss(duracao)}`}
                    className={styles.seek}
                />
            </div>

            <span className={styles.time}>
                <span>{mmss(posicao)}</span>
                <span aria-hidden="true"> / </span>
                <span>{mmss(duracao)}</span>
            </span>
        </div>
    )
}

export default function TrackPlayer({
    previewUrl,
    videoId,
    trackTitle,
    artistName,
}: TrackPlayerProps) {
    if (previewUrl) {
        return (
            <div className={styles.wrap}>
                <PlayerDoDeezer src={previewUrl} trackTitle={trackTitle} />
                <p className={styles.note}>Prévia de 30 segundos</p>
            </div>
        )
    }

    if (videoId) {
        return (
            <div className={styles.wrap}>
                <div className={styles.video}>
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={`${trackTitle} - ${artistName}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                    />
                </div>
                <p className={styles.note}>Prévia via YouTube</p>
            </div>
        )
    }

    return (
        <div className={styles.wrap}>
            <p className={styles.unavailable}>
                Sem prévia para esta gravação. Ouça na plataforma ao lado.
            </p>
        </div>
    )
}
