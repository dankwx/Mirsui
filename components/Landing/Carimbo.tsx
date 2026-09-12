/**
 * O carimbo de chegada: "1ª", "2ª", "7ª".
 *
 * É o único desenho que o Mirsui tem e mais ninguém: a posição em que alguém
 * chegou numa faixa. Aparece igual na ficha, na esteira e na cena, para que a
 * página inteira leia como a mesma coisa.
 *
 * Lima só no primeiro lugar, igual ao resto do app — a cor de acento tem um
 * assunto só, que é precedência.
 */
export default function Carimbo({
    posicao,
    tamanho = 'md',
}: {
    posicao: number
    tamanho?: 'sm' | 'md' | 'lg'
}) {
    const primeiro = posicao === 1
    const box = {
        sm: 'h-6 min-w-6 px-1.5 text-[11px]',
        md: 'h-8 min-w-8 px-2 text-[13px]',
        lg: 'h-11 min-w-11 px-2.5 text-[17px]',
    }[tamanho]

    return (
        <span
            className={`inline-grid flex-none place-items-center rounded-full font-display font-black tabular-nums leading-none tracking-[-0.04em] ${box} ${
                primeiro
                    ? 'bg-mir-acc text-mir-on-acc'
                    : 'bg-mir-fill2 text-mir-text ring-1 ring-mir-line2'
            }`}
        >
            {posicao}ª
        </span>
    )
}
