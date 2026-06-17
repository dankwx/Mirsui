import { Music } from 'lucide-react'

interface TrackPreviewBarProps {
    videoId: string | null
    spotifyUrl: string
    trackTitle: string
    artistName: string
}

function SpotifyIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="9" />
            <path d="M7.5 10c3-.8 6-.5 8.5 1" />
            <path d="M8 13c2.4-.6 4.7-.3 6.6 1" />
            <path d="M8.6 15.6c1.8-.4 3.4-.2 4.9.8" />
        </svg>
    )
}

export default function TrackPreviewBar({
    videoId,
    spotifyUrl,
    trackTitle,
    artistName,
}: TrackPreviewBarProps) {
    return (
        <section className="overflow-hidden rounded-2xl border border-mir-line bg-mir-surface">
            <div className="flex items-center justify-between gap-3 px-[22px] pt-[18px]">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-mir-text3">
                    Prévia
                </span>
                <a
                    href={spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-[9px] border border-mir-line2 px-3.5 py-[9px] text-[12.5px] font-semibold text-mir-text2 transition hover:border-mir-text3 hover:bg-mir-fill1 hover:text-mir-text"
                >
                    <SpotifyIcon /> Ouvir no Spotify
                </a>
            </div>

            <div className="p-[18px] pt-3.5">
                {videoId ? (
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
                    <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-mir-line2 bg-mir-bg">
                        <div className="text-center text-mir-text3">
                            <Music className="mx-auto mb-2 h-9 w-9 opacity-50" />
                            <p className="font-mono text-[12px]">
                                Vídeo não disponível
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
