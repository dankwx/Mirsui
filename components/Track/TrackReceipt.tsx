// O registro de descoberta desta faixa.
//
// É o mesmo objeto da home ("Como funciona"), mas reto e com dados reais: quem
// chegou primeiro, quando, quantas pessoas guardam a faixa e a audiência de
// hoje. Quando quem olha já salvou, o registro é o dela — posição e data —,
// porque é esse o comprovante que ela vai querer compartilhar.

import { Disc3 } from 'lucide-react'
import RecordCover from '@/components/Club/RecordCover'
import recipes from '@/components/Club/club-recipes.module.css'
import StoryShareButton from './StoryShareButton'
import { dataCompleta, dataCurta } from './format'
import styles from './TrackReceipt.module.css'

export interface RegistroDoRecibo {
    /** posição de quem aparece no registro */
    posicao: number | null
    nome: string
    data: string | null
    /** true quando o registro é de quem está olhando */
    seu: boolean
}

interface TrackReceiptProps {
    trackUri: string
    trackTitle: string
    artistName: string
    coverUrl: string | null
    year: number | null
    registro: RegistroDoRecibo | null
    totalClaims: number
    /** 0-100 na escala do Observatório; null quando não há medição */
    popularity: number | null
    /** desde quando o Observatório mede esta gravação */
    medindoDesde: string | null
}

export default function TrackReceipt({
    trackUri,
    trackTitle,
    artistName,
    coverUrl,
    year,
    registro,
    totalClaims,
    popularity,
    medindoDesde,
}: TrackReceiptProps) {
    return (
        <aside className={styles.receipt} aria-labelledby="receipt-title">
            <div className={styles.header}>
                <Disc3 size={19} aria-hidden="true" />
                <span id="receipt-title">
                    {registro?.seu ? 'SEU REGISTRO' : 'REGISTRO DE DESCOBERTA'}
                </span>
                <span aria-hidden="true">m.</span>
            </div>

            <div className={styles.track}>
                <RecordCover
                    src={coverUrl}
                    alt=""
                    className={`${recipes.sleeve} ${styles.cover}`}
                />
                <div>
                    <h3>{trackTitle}</h3>
                    <p>{artistName}</p>
                </div>
            </div>

            <div className={styles.result}>
                {registro ? (
                    <>
                        <span className={styles.position}>
                            {registro.posicao ? `${registro.posicao}º` : '·'}
                        </span>
                        <div>
                            <strong>
                                {registro.seu
                                    ? registro.posicao === 1
                                        ? 'Você chegou primeiro.'
                                        : 'Você chegou cedo.'
                                    : `${registro.nome} chegou primeiro.`}
                            </strong>
                            <p>
                                {registro.seu ? 'Salva em ' : 'Salvou em '}
                                {dataCompleta(registro.data)}
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <span className={styles.position} aria-hidden="true">
                            →
                        </span>
                        <div>
                            <strong>Todo achado começa aqui.</strong>
                            <p>Ninguém registrou esta faixa ainda.</p>
                        </div>
                    </>
                )}
            </div>

            <dl className={styles.facts}>
                <div>
                    <dt>No acervo</dt>
                    <dd className={recipes.smallNumber}>{totalClaims}</dd>
                </div>
                {popularity != null && (
                    <div>
                        <dt>Audiência hoje</dt>
                        <dd className={recipes.smallNumber}>
                            {popularity}
                            <span>/100</span>
                        </dd>
                    </div>
                )}
                {medindoDesde && (
                    <div>
                        <dt>Medida desde</dt>
                        <dd className={recipes.smallNumber}>
                            {dataCurta(medindoDesde)}
                        </dd>
                    </div>
                )}
            </dl>

            <StoryShareButton
                trackUri={trackUri}
                trackTitle={trackTitle}
                artistName={artistName}
                albumImageUrl={coverUrl || ''}
                year={year}
                totalClaims={totalClaims}
            />
        </aside>
    )
}
