// Vazio e erro são estados diferentes: antes, falha de rede ou 429 do
// backend caía no vazio e a tela dizia que a cena estava parada.

import { Loader2, RotateCw } from 'lucide-react'
import recipes from '@/components/Club/club-recipes.module.css'
import styles from './FeedStates.module.css'

export function EmptyState({ title, body }: { title: string; body: string }) {
    return (
        <div className={styles.box}>
            <p className={styles.title}>{title}</p>
            <p className={styles.body}>{body}</p>
        </div>
    )
}

export function ErrorState({
    onRetry,
    retrying,
}: {
    onRetry: () => void
    retrying: boolean
}) {
    return (
        <div className={styles.box} role="alert">
            <p className={styles.title}>Não conseguimos carregar a cena</p>
            <p className={styles.body}>
                O problema é do nosso lado, não seu. Nada foi perdido: os
                achados continuam salvos.
            </p>
            <button
                type="button"
                onClick={onRetry}
                disabled={retrying}
                className={`${recipes.outlineButton} ${styles.retry}`}
            >
                {retrying ? (
                    <Loader2 size={15} className={styles.spin} aria-hidden="true" />
                ) : (
                    <RotateCw size={15} aria-hidden="true" />
                )}
                {retrying ? 'Tentando…' : 'Tentar de novo'}
            </button>
        </div>
    )
}
