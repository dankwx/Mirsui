'use client'

// components/FotoDePerfil.tsx

import { useEffect, useRef, useState, type ReactNode } from 'react'

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
    const ref = useRef<HTMLImageElement>(null)

    useEffect(() => {
        // Sem isto, quem trocou a própria foto continuaria vendo o fallback: o
        // estado de quebrado sobreviveria à troca de src no mesmo componente.
        setQuebrou(false)

        // E sem ISTO, o `onError` abaixo não valia para a primeira carga de uma
        // página renderizada no servidor — que é justamente a home.
        //
        // O <img> já vem no HTML, então o navegador dispara a requisição no
        // instante em que o parser vê a tag. O 402 do Storage antigo volta em
        // ~200 ms; a hidratação, com cache frio, demora bem mais. Quando o
        // React finalmente pendura o `onError`, o evento `error` já passou — e
        // evento perdido não redispara. `quebrou` ficava `false` para sempre e
        // o ícone de imagem partida ficava na tela até a próxima navegação.
        //
        // Era esse o sintoma esquisito de abrir um perfil e voltar: em
        // navegação client-side o React CRIA o <img>, com o handler já
        // pendurado, e aí o fallback funcionava. Mesmo componente, dois
        // caminhos, dois resultados.
        //
        // `complete` com `naturalWidth` zero é a única forma de perguntar ao
        // DOM o que aconteceu antes do React chegar: imagem que terminou de
        // tentar e não trouxe pixel nenhum é imagem que falhou.
        const img = ref.current
        if (img?.complete && img.naturalWidth === 0) setQuebrou(true)
    }, [src])

    if (!src || quebrou) return <>{children}</>

    return (
        // <img> cru de propósito, e a razão é a mesma que já estava escrita nas
        // telas: avatar de OAuth vem de domínios variados que não estão em
        // next.config, e o otimizador quebraria em runtime.
        //
        // alt="" é porque o nome de quem é a foto já está desenhado do lado em
        // todos os usos: a imagem é decorativa, e leitor de tela não deve
        // anunciá-la duas vezes. Só isso — não conte com o alt vazio para
        // esconder a imagem quebrada. O navegador colapsa a imagem sem alt
        // quando ela não tem tamanho, e aqui todo uso dá tamanho por CSS
        // (`h-full w-full` dentro de um círculo), então o Chrome desenha o
        // glifo de erro no meio. Quem esconde é o efeito acima.
        // eslint-disable-next-line @next/next/no-img-element
        <img
            ref={ref}
            src={src}
            alt=""
            className={className}
            onError={() => setQuebrou(true)}
        />
    )
}
