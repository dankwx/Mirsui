'use client'

// components/FotoDePerfil.tsx

import { useEffect, useState, type ReactNode } from 'react'

/**
 * Foto de perfil que cai no fallback também quando a imagem quebra.
 *
 * O fallback de avatar já existia em todo lugar, mas só disparava quando
 * `avatar_url` era nulo. O caso que a migração expôs é outro: a URL existe e
 * está morta — 14 perfis ainda apontam para o Storage da nuvem, que responde
 * 402. O React desenhava o <img>, o navegador tentava, falhava, e sobrava o
 * ícone de imagem quebrada. Ou seja: exatamente o que o fallback deveria
 * evitar, e nunca era chamado.
 *
 * Isto não é remendo de migração. Avatar de OAuth apodrece sozinho quando a
 * pessoa troca a foto no Google, e um dia isso ia aparecer de qualquer jeito.
 *
 * `children` é o fallback de cada tela — inicial, orbe de gradiente, ícone —,
 * e cada uma continua com o desenho que já tinha.
 */
export default function FotoDePerfil({
    src,
    className,
    children,
}: {
    src?: string | null
    className?: string
    children?: ReactNode
}) {
    const [quebrou, setQuebrou] = useState(false)

    // Sem isto, quem trocou a própria foto continuaria vendo o fallback: o
    // estado de quebrado sobreviveria à troca de src no mesmo componente.
    useEffect(() => setQuebrou(false), [src])

    if (!src || quebrou) return <>{children}</>

    return (
        // <img> cru de propósito, e a razão é a mesma que já estava escrita nas
        // telas: avatar de OAuth vem de domínios variados que não estão em
        // next.config, e o otimizador quebraria em runtime.
        //
        // alt="" também é de propósito. O nome de quem é a foto já está
        // desenhado do lado em todos os usos, então a imagem é decorativa; e
        // alt vazio é o que faz o navegador colapsar a imagem quebrada em vez
        // de desenhar o ícone de erro no intervalo entre o HTML chegar e o
        // React hidratar.
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt=""
            className={className}
            onError={() => setQuebrou(true)}
        />
    )
}
