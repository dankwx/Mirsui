'use client'

// Salvar direto do feed.
//
// Salvar é mão única: não existe "dessalvar", porque tirar um salvamento
// abriria buraco na numeração de quem veio depois. Então o estado salvo não é
// um botão desabilitado (que parece quebrado) e sim um selo — a ação acabou.
//
// Faixa sem track_uri (dado antigo) não tem como ser salva: o backend precisa
// dela para calcular a posição. Nesse caso não mostramos botão nenhum, em vez
// de oferecer uma ação que vai falhar. O retorno é inline, ao lado do que
// falhou, como na página de faixa.

import { Check, Loader2, Plus } from 'lucide-react'
import recipes from '@/components/Club/club-recipes.module.css'
import styles from './SaveButton.module.css'

/** o que cada linha precisa saber sobre salvar, resolvido no Feed por faixa */
export interface SaveState {
    saved: boolean
    savers: number
    busy: boolean
    error: string | null
    canSave: boolean
    onSave: () => void
}

export default function SaveButton({
    state,
    size = 'small',
}: {
    state: SaveState
    size?: 'small' | 'large'
}) {
    if (!state.canSave && !state.saved) return null

    const large = size === 'large'

    if (state.saved) {
        return (
            <span
                className={`${styles.saved} ${large ? styles.large : ''}`}
                aria-live="polite"
            >
                <Check size={large ? 16 : 14} aria-hidden="true" />
                {large ? 'No seu acervo' : 'Salva'}
            </span>
        )
    }

    return (
        <span className={`${styles.wrap} ${large ? styles.large : ''}`}>
            <button
                type="button"
                onClick={state.onSave}
                disabled={state.busy}
                className={`${recipes.button} ${large ? '' : styles.small}`}
            >
                {state.busy ? (
                    <Loader2
                        size={large ? 16 : 14}
                        className={styles.spin}
                        aria-hidden="true"
                    />
                ) : (
                    <Plus size={large ? 16 : 14} aria-hidden="true" />
                )}
                {state.busy ? 'Salvando…' : large ? 'Salvar no acervo' : 'Salvar'}
            </button>
            {state.error && (
                <span className={styles.error} role="alert">
                    {state.error}
                </span>
            )}
        </span>
    )
}
