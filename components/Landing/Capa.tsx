import Image from 'next/image'
import { iniciais, tom } from './landingHelpers'

/**
 * Capa de faixa com fallback tipográfico.
 *
 * As iniciais ficam por baixo da imagem em vez de serem alternativa a ela: se
 * a thumbnail demora ou falha, o quadrado continua legível em vez de virar um
 * buraco preto na fileira.
 */
export default function Capa({
    src,
    alt,
    semente,
    tamanho,
    className = '',
    prioridade = false,
    iniClassName = 'text-[15px]',
}: {
    src: string | null
    alt: string
    /** o que gera o tom de fundo do fallback, normalmente o nome do artista */
    semente: string
    /** lado em px, para o next/image pedir o arquivo no tamanho certo */
    tamanho: number
    className?: string
    prioridade?: boolean
    iniClassName?: string
}) {
    // `relative` é fixo aqui porque a imagem e as iniciais vivem em inset-0.
    // Quem precisa posicionar a capa (a pilha do "como funciona") põe um
    // wrapper absoluto em volta: mandar `absolute` pelo className não funciona,
    // o Tailwind gera `.relative` depois de `.absolute` e a cascata decide.
    return (
        <div
            className={`relative overflow-hidden ${className}`}
            style={{ backgroundColor: tom(semente) }}
        >
            <span
                aria-hidden="true"
                className={`absolute inset-0 grid select-none place-items-center font-extrabold leading-none tracking-[-0.05em] text-mir-text/15 ${iniClassName}`}
            >
                {iniciais(semente)}
            </span>
            {src && (
                <Image
                    src={src}
                    alt={alt}
                    width={tamanho}
                    height={tamanho}
                    priority={prioridade}
                    className="absolute inset-0 h-full w-full object-cover"
                />
            )}
        </div>
    )
}
