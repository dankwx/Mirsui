import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import AuthModalTrigger from '@/components/AuthModalTrigger/AuthModalTrigger'
import styles from './Club.module.css'

export default function Fechamento() {
    return (
        <section className={styles.closing} aria-labelledby="closing-title">
            <div className={`${styles.container} ${styles.closingGrid}`}>
                <div className={styles.closingIllustration}>
                    <Image
                        src="/assets/landing/digging-records.webp"
                        alt="Ilustração de uma mão garimpando um disco de vinil entre capas"
                        unoptimized
                        width={960}
                        height={640}
                        sizes="(max-width: 768px) 85vw, 500px"
                    />
                </div>
                <div>
                    <h2 id="closing-title">
                        Ainda bem que
                        <br />
                        você chegou cedo.
                    </h2>
                    <p>
                        O próximo som que vai marcar sua vida
                        <br />
                        ainda está por aí. Vamos encontrar?
                    </p>
                    <AuthModalTrigger mode="signup" className={styles.button}>
                        Fazer parte do Mirsui <ArrowUpRight size={18} />
                    </AuthModalTrigger>
                    <span className={styles.closingNote}>
                        Seu acervo é grátis. Seu gosto é seu.
                    </span>
                </div>
            </div>
        </section>
    )
}
