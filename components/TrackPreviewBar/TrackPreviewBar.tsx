'use client'

// A prévia da faixa.
//
// Era só um iframe do YouTube. O YouTube continua aqui, mas como segunda opção:
// a busca custa 100 unidades da cota de 10.000/dia (ou seja, 100 buscas por
// dia para o site inteiro) e exigiu uma tabela de cache só para não estourar
// (migrations 002 e 017).
//
// O Deezer entrega um MP3 de 30 s no MESMO objeto da faixa que a página já
// busca — sem requisição extra, sem chave, sem cota. Medido em 15/08/2026:
// 200 audio/mpeg, 479.827 bytes. É o campo que o Spotify cortou.
//
// A URL vem assinada com `hdnea=exp=` e vale poucas horas, então ela é
// resolvida no request e nunca gravada no banco — o que também é o motivo de
// utils/deezerService.ts revalidar a faixa em 15 min.

import { useEffect, useRef, useState } from 'react'
import { Music, Pause, Play } from 'lucide-react'
import SpotifyListenButton from '@/components/SpotifyListenButton/SpotifyListenButton'

interface TrackPreviewBarProps {
    /** MP3 de 30 s do Deezer. Primeira opção. */
    previewUrl: string | null
    /** id do vídeo no cache do YouTube. Segunda opção. */
    videoId: string | null
    isrc: string | null
    spotifyTrackId: string | null
    trackTitle: string
    artistName: string
}

function mmss(segundos: number) {
    if (!Number.isFinite(segundos) || segundos < 0) return '0:00'
    const m = Math.floor(segundos / 60)
    const s = Math.floor(segundos % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
}

function PlayerDoDeezer({
    src,
    trackTitle,
    artistName,
}: {
    src: string
    trackTitle: string
    artistName: string
}) {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [tocando, setTocando] = useState(false)
    const [posicao, setPosicao] = useState(0)
    const [duracao, setDuracao] = useState(30)

    // Fonte nova (o usuário navegou para outra faixa): volta ao início parado.
    useEffect(() => {
        setTocando(false)
        setPosicao(0)
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

    const progresso = duracao > 0 ? (posicao / duracao) * 100 : 0

    return (
        <div className="flex items-center gap-4 rounded-xl border border-mir-line bg-mir-bg px-4 py-3.5">
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
                onClick={alternar}
                aria-label={tocando ? 'Pausar prévia' : 'Tocar prévia'}
                className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-mir-acc text-mir-on-acc transition hover:brightness-[1.07] active:translate-y-px"
            >
                {tocando ? (
                    <Pause className="h-[18px] w-[18px]" fill="currentColor" />
                ) : (
                    <Play className="ml-0.5 h-[18px] w-[18px]" fill="currentColor" />
                )}
            </button>

            <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] font-semibold text-mir-text">
                    {trackTitle}
                </div>
                <div className="mt-0.5 truncate font-mono text-[11px] text-mir-text3">
                    {artistName}
                </div>
            </div>

            <div className="hidden w-[220px] flex-none items-center gap-2.5 sm:flex">
                <input
                    type="range"
                    min={0}
                    max={duracao}
                    step={0.1}
                    value={posicao}
                    onChange={irPara}
                    aria-label="Posição da prévia"
                    className="h-1 w-full cursor-pointer appearance-none rounded-full accent-mir-acc"
                    // O gradiente pinta a parte já tocada. Os tokens do tema
                    // são hex literais no tailwind.config (mir.acc = #cdef36),
                    // não custom properties, então não há var() a referenciar.
                    style={{
                        background: `linear-gradient(to right, #cdef36 ${progresso}%, rgba(255,255,255,0.12) ${progresso}%)`,
                    }}
                />
                <span className="flex-none font-mono text-[11px] tabular-nums text-mir-text3">
                    {mmss(duracao - posicao)}
                </span>
            </div>
        </div>
    )
}

export default function TrackPreviewBar({
    previewUrl,
    videoId,
    isrc,
    spotifyTrackId,
    trackTitle,
    artistName,
}: TrackPreviewBarProps) {
    return (
        <section className="overflow-hidden rounded-2xl border border-mir-line bg-mir-surface">
            <div className="flex items-center justify-between gap-3 px-[22px] pt-[18px]">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-mir-text3">
                    Prévia
                </span>
                <SpotifyListenButton
                    spotifyTrackId={spotifyTrackId}
                    isrc={isrc}
                    trackTitle={trackTitle}
                    artistName={artistName}
                />
            </div>

            <div className="p-[18px] pt-3.5">
                {previewUrl ? (
                    <PlayerDoDeezer
                        src={previewUrl}
                        trackTitle={trackTitle}
                        artistName={artistName}
                    />
                ) : videoId ? (
                    <div className="aspect-video w-full overflow-hidden rounded-xl border border-mir-line">
                        <iframe
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={`${trackTitle} - ${artistName}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="h-full w-full"
                        />
                    </div>
                ) : (
                    <div className="flex items-center justify-center rounded-xl border border-dashed border-mir-line2 bg-mir-bg py-10">
                        <div className="text-center text-mir-text3">
                            <Music className="mx-auto mb-2 h-9 w-9 opacity-50" />
                            <p className="font-mono text-[12px]">
                                Prévia não disponível
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
