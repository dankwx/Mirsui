// app/(club)/pilha/page.tsx
//
// A pilha: o catálogo que o Observatório mede todo dia, despejado num lugar só.
//
// Vive no grupo `(club)`, com o shell, o header e o rodapé compactos de
// DESIGN.md, na linha "Busca / pilha" do guia: as capas dominam, os filtros
// são acessíveis e os estados vazios dizem o que aconteceu. O cabeçalho é
// uma faixa fina de propósito — a pilha é o assunto da página, então o título
// não disputa tamanho com ela. Dados, cache e metadata não mudaram.

import type { Metadata } from 'next'
import Pile from '@/components/Pile/Pile'
import shellStyles from '@/components/Club/ClubShell.module.css'
import recipes from '@/components/Club/club-recipes.module.css'
import { getPileTracks } from '@/utils/pileService'
import styles from './page.module.css'

export const metadata: Metadata = {
    title: 'A pilha - Mirsui',
    // A descrição mudou junto com os dados: a pilha não é o que a cena salvou,
    // é o catálogo que o Mirsui mede todo dia. Prometer a primeira coisa e
    // entregar a segunda seria mentir na busca.
    description:
        'O catálogo que o Mirsui mede todo dia, despejado num lugar só. Capa maior, mais audiência.',
}

const nf = new Intl.NumberFormat('pt-BR')

export default async function PilhaPage() {
    const tracks = await getPileTracks()
    const generos = new Set(tracks.map((t) => t.genre)).size

    return (
        <div className={`${shellStyles.container} ${styles.page}`}>
            <header className={styles.heading}>
                <div>
                    <h1>A pilha</h1>
                    <p className={styles.lead}>
                        O catálogo que o Mirsui mede todo dia. Capa maior, mais
                        audiência.
                    </p>
                </div>
                {tracks.length > 0 && (
                    <p className={styles.count}>
                        <span className={recipes.smallNumber}>
                            {nf.format(tracks.length)}
                        </span>{' '}
                        {tracks.length === 1 ? 'faixa' : 'faixas'}
                        <span aria-hidden="true"> · </span>
                        <span className={recipes.smallNumber}>
                            {nf.format(generos)}
                        </span>{' '}
                        {generos === 1 ? 'gênero' : 'gêneros'}
                    </p>
                )}
            </header>

            {tracks.length > 0 ? (
                <Pile tracks={tracks} />
            ) : (
                // "Vazio" e "falhou" são coisas diferentes, e a única razão
                // de a pilha chegar vazia é a consulta ter falhado — o
                // Observatório mede milhares de faixas por noite.
                <p className={styles.failed} role="alert">
                    A pilha não carregou. Não é que esteja vazia — a consulta
                    falhou. Recarregue em instantes.
                </p>
            )}
        </div>
    )
}
