import Image from 'next/image'
import Link from 'next/link'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import AuthModalTrigger from '@/components/AuthModalTrigger/AuthModalTrigger'
import MirsuiLogo from '@/components/MirsuiLogo/MirsuiLogo'
import { enderecoDaFaixa } from '@/utils/trackHref'
import { editorialRecords } from './editorialRecords'
import ThemeToggle from './ThemeToggle'
import styles from './Club.module.css'

export default function Hero() {
    return (
        <header className={styles.hero}>
            <a className={styles.skipLink} href="#acervo">
                Pular para o conteúdo
            </a>
            <nav
                className={`${styles.container} ${styles.nav}`}
                aria-label="Navegação principal"
            >
                <Link
                    href="/"
                    className={styles.wordmark}
                    aria-label="Mirsui, início"
                >
                    <MirsuiLogo
                        size={27}
                        ink="currentColor"
                        acc="var(--club-accent)"
                    />
                    mirsui
                </Link>
                <div className={styles.navLinks}>
                    <a href="#acervo">Descobrir</a>
                    <a href="#como">Como funciona</a>
                    <a href="#cena">A cena</a>
                </div>
                <div className={styles.navActions}>
                    <ThemeToggle />
                    <AuthModalTrigger mode="login" className={styles.login}>
                        Entrar
                    </AuthModalTrigger>
                    <AuthModalTrigger
                        mode="signup"
                        className={`${styles.button} ${styles.navSignup}`}
                    >
                        Fazer parte <ArrowUpRight size={15} />
                    </AuthModalTrigger>
                </div>
            </nav>
            <div className={`${styles.container} ${styles.heroCopy}`}>
                <p className={styles.eyebrow}>Seu ouvido chega antes.</p>
                <h1>
                    Você ouviu primeiro.
                    <br />
                    <span>O mundo vem depois.</span>
                </h1>
                <p className={styles.heroDescription}>
                    Descubra música, registre seus achados e encontre gente
                    <br className={styles.desktopBreak} /> que também escuta
                    fora do óbvio.
                </p>
                <div className={styles.heroActions}>
                    <AuthModalTrigger mode="signup" className={styles.button}>
                        Criar meu acervo grátis <ArrowUpRight size={18} />
                    </AuthModalTrigger>
                    <a href="#acervo" className={styles.textLink}>
                        Explorar os sons <ArrowDown size={16} />
                    </a>
                </div>
            </div>
            <div
                className={styles.recordShelf}
                aria-label="Uma seleção para começar a descobrir"
            >
                {editorialRecords.map((record, index) => (
                    <Link
                        key={record.isrc}
                        href={enderecoDaFaixa(
                            record.isrc,
                            record.artist,
                            record.title
                        )}
                        className={styles.heroRecord}
                        style={
                            {
                                '--record-angle': `${[-12, 7, -6, 9, -8, 11][index]}deg`,
                                '--record-offset': `${[35, 0, 20, 0, 12, 38][index]}px`,
                                '--record-index': index,
                            } as React.CSSProperties
                        }
                        aria-label={`${record.title}, de ${record.artist}. Ver faixa`}
                    >
                        <div className={styles.sleeve}>
                            <Image
                                src={record.cover}
                                alt={`Capa de ${record.title}, de ${record.artist}`}
                                width={500}
                                height={500}
                                priority={index < 2}
                                unoptimized
                                sizes="(max-width: 640px) 155px, (max-width: 1024px) 190px, 250px"
                            />
                        </div>
                        <span className={styles.recordCaption}>
                            {record.artist}
                            <ArrowUpRight size={13} />
                        </span>
                    </Link>
                ))}
            </div>
        </header>
    )
}
