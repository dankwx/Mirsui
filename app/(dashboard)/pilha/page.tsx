import type { Metadata } from 'next'
import Pile from '@/components/Pile/Pile'
import LandingFooter from '@/components/Footer/LandingFooter'
import { getPileTracks } from '@/utils/pileService'

export const metadata: Metadata = {
    title: 'A pilha - Mirsui',
    // A descrição mudou junto com os dados: a pilha não é o que a cena salvou,
    // é o catálogo que o Mirsui mede todo dia. Prometer a primeira coisa e
    // entregar a segunda seria mentir na busca.
    description:
        'O catálogo que o Mirsui mede todo dia, despejado num lugar só. Capa maior, mais audiência.',
}

export default async function PilhaPage() {
    const tracks = await getPileTracks()

    return (
        <div className="flex min-h-[calc(100dvh-72px)] flex-col">
            <div className="flex-1">
                {tracks.length > 0 ? (
                    <Pile tracks={tracks} />
                ) : (
                    // "Vazio" e "falhou" são coisas diferentes, e a única razão
                    // de a pilha chegar vazia é a consulta ter falhado — o
                    // Observatório mede milhares de faixas por noite.
                    <div className="mx-auto grid min-h-[50vh] w-full max-w-[1320px] place-items-center px-5 text-center sm:px-10">
                        <div>
                            <p className="text-[19px] font-bold tracking-[-0.02em] text-mir-text">
                                A pilha não carregou.
                            </p>
                            <p className="mt-1.5 text-[14px] text-mir-text2">
                                Não é que esteja vazia — a consulta falhou.
                                Recarregue em instantes.
                            </p>
                        </div>
                    </div>
                )}
            </div>
            <LandingFooter compact />
        </div>
    )
}
