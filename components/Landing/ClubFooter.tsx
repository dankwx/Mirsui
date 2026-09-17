import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import styles from './Club.module.css'

export default function ClubFooter() {
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
