'use client'

// O "ouvir no Spotify" sem API do Spotify.
//
// Esta é a parte que parece impossível e não é. Três camadas, em ordem de
// preferência, e nenhuma delas no caminho de render (ver
// docs/plano-independencia-do-spotify.md §5):
//
//   1. o id que já temos. Está em observed_tracks, foi pago pelo job, não
//      expira. Chega pronto do servidor: custo zero.
//   2. resolução preguiçosa. Quem não tem id resolve `isrc:` -> Spotify quando
//      ALGUÉM ABRE A PÁGINA, e o backend grava para sempre. Escala com
//      interesse, não com o tamanho do catálogo — e roda depois da pintura, em
//      efeito, então um 429 não atrasa nem um pixel.
//   3. deep link de busca, zero API: open.spotify.com/search/<artista título>.
//      Abre o Spotify com a busca feita. Não é tão bom quanto cair na faixa
//      exata, mas é infinitamente melhor que botão ausente — e nunca falha.
//
// Por isso o href já nasce válido (camada 3) e é PROMOVIDO no lugar se a
// camada 2 responder. O usuário nunca vê um botão morto nem um estado de
// carregamento.

import { useEffect, useState } from 'react'

interface SpotifyListenButtonProps {
    /** camada 1: id já conhecido, vindo do servidor */
    spotifyTrackId: string | null
    /** chave da camada 2. Sem ISRC, só resta a camada 3. */
    isrc: string | null
    trackTitle: string
    artistName: string
    className?: string
    children?: React.ReactNode
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

export default function SpotifyListenButton({
    spotifyTrackId,
    isrc,
    trackTitle,
    artistName,
    className,
    children,
}: SpotifyListenButtonProps) {
    const [id, setId] = useState<string | null>(spotifyTrackId)

    useEffect(() => {
        // Já temos o id, ou não há ISRC para perguntar: nada a fazer.
        if (id || !isrc) return

        const cancelar = new AbortController()
        fetch('/api/spotify/resolve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isrc }),
            signal: cancelar.signal,
        })
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
                if (d?.spotifyTrackId) setId(d.spotifyTrackId)
            })
            // Silêncio de propósito: falhar aqui significa continuar com a
            // camada 3, que é um botão que funciona. Não é erro de usuário.
            .catch(() => {})

        return () => cancelar.abort()
    }, [id, isrc])

    const href = id
        ? `https://open.spotify.com/track/${id}`
        : `https://open.spotify.com/search/${encodeURIComponent(
              `${artistName} ${trackTitle}`.trim()
          )}`

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={
                id
                    ? `Ouvir "${trackTitle}" no Spotify`
                    : `Procurar "${trackTitle}" no Spotify`
            }
            className={
                className ??
                'inline-flex items-center gap-2 rounded-[9px] border border-mir-line2 px-3.5 py-[9px] text-[12.5px] font-semibold text-mir-text2 transition hover:border-mir-text3 hover:bg-mir-fill1 hover:text-mir-text'
            }
        >
            {children ?? (
                <>
                    <SpotifyIcon /> Ouvir no Spotify
                </>
            )}
        </a>
    )
}
