import { ArrowUpRight } from 'lucide-react'
import AuthModalTrigger from '@/components/AuthModalTrigger/AuthModalTrigger'
import styles from './Club.module.css'

export default function Fechamento() {
    return (
        <section className={styles.closing} aria-labelledby="closing-title">
            <div className={`${styles.container} ${styles.closingInner}`}>
                <h2 id="closing-title">Qual música você ouviu antes?</h2>
                <AuthModalTrigger mode="signup" className={styles.button}>
                    Guardar um achado <ArrowUpRight size={17} />
                </AuthModalTrigger>
            </div>
        </section>
    )
}
