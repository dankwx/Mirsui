import Link from 'next/link'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import AuthModalTrigger from '@/components/AuthModalTrigger/AuthModalTrigger'
import MirsuiLogo from '@/components/MirsuiLogo/MirsuiLogo'
import ThemeToggle from '@/components/Club/ThemeToggle'
import styles from './Club.module.css'

export default function Hero() {
    return (
        <header>
            <a className={styles.skipLink} href="#verbete">
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
                    <MirsuiLogo size={27} />
                    mirsui
                </Link>
                <div className={styles.navLinks}>
                    <a href="#acervo">Descobrir</a>
                    <a href="#como">Como funciona</a>
                    <a href="#cena">A cena</a>
                </div>
                <div className={styles.navActions}>
                    <ThemeToggle className={styles.themeToggle} defaultTheme="light" />
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
            <div className={styles.masthead}>
                <div className={styles.container}>
                    <h1 id="verbete" tabIndex={-1}>
                        mirsui
                    </h1>
                    <div className={styles.entry}>
                        <div>
                            <p className={styles.entryGrammar}>
                                <span>mir·su·i</span> <i>substantivo inventado</i>
                            </p>
                            <p className={styles.definition}>
                                Sensação de ter descoberto algo antes de virar
                                assunto.
                            </p>
                        </div>
                        <p className={styles.usage}>
                            <q>
                                Tocou na festa e todo mundo cantou. Me deu
                                um mirsui danado.
                            </q>
                        </p>
                    </div>
                </div>
            </div>
            <div className={styles.introBand}>
                <div className={`${styles.container} ${styles.heroIntro}`}>
                    <p>
                        O Mirsui é um clube de descobertas musicais. Por aqui,
                        dá pra achar som novo e registrar quando você ouviu.
                    </p>
                    <div className={styles.heroActions}>
                        <AuthModalTrigger
                            mode="signup"
                            className={styles.button}
                        >
                            Criar meu acervo <ArrowUpRight size={17} />
                        </AuthModalTrigger>
                        <a href="#acervo" className={styles.textLink}>
                            Explorar o acervo <ArrowDown size={15} />
                        </a>
                    </div>
                </div>
            </div>
        </header>
    )
}
