import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import MirsuiLogo from '@/components/MirsuiLogo/MirsuiLogo'
import styles from './Club.module.css'

export default function ClubFooter({ compact = false }: { compact?: boolean }) {
    if (compact) {
        return (
            <footer className={`${styles.footer} ${styles.footerCompact}`}>
                <div className={styles.container}>
                    <div className={styles.compactInner}>
                        <Link
                            className={styles.compactBrand}
                            href="/"
                            aria-label="Mirsui, voltar ao início"
                        >
                            mirsui
                            <MirsuiLogo
                                size={16}
                                ink="currentColor"
                                acc="var(--club-accent)"
                            />
                        </Link>
                        <nav aria-label="Links do rodapé">
                            <Link href="/#cena">
                                A cena <ArrowUpRight size={13} />
                            </Link>
                            <Link href="/termos">Termos</Link>
                            <Link href="/privacidade">Privacidade</Link>
                        </nav>
                    </div>
                </div>
            </footer>
        )
    }

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.footerTop}>
                    <p>Feito por quem ouve cedo demais.</p>
                    <nav aria-label="Links do rodapé">
                        <Link href="/#cena">
                            A cena <ArrowUpRight size={13} />
                        </Link>
                        <Link href="/termos">Termos</Link>
                        <Link href="/privacidade">Privacidade</Link>
                    </nav>
                </div>
                <Link
                    className={styles.footerWordmark}
                    href="/"
                    aria-label="Mirsui, voltar ao início"
                >
                    mirsui<span>↗</span>
                </Link>
                <div className={styles.footerBottom}>
                    <span>Um lugar para o seu lado B.</span>
                    <span>Descobrir é só o começo.</span>
                </div>
            </div>
        </footer>
    )
}
