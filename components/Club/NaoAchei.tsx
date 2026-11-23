// A página 404 do Mirsui: a toupeira cavou e não achou.
//
// Antes caía a 404 padrão do Next, em branco e sem cabeçalho. Agora fica no
// shell do clube, com a toupeira lá no fundo do buraco (só os olhos de fora) e
// duas saídas claras. O texto brinca no título e é direto no resto, como pede
// DESIGN.md para erros.

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import ToupeiraNoBuraco from '@/components/MirsuiLogo/ToupeiraNoBuraco'
import recipes from './club-recipes.module.css'
import shellStyles from './ClubShell.module.css'
import styles from './NaoAchei.module.css'

export default function NaoAchei({ inicio = '/' }: { inicio?: string }) {
    return (
        <section
            className={`${shellStyles.container} ${styles.page}`}
            aria-labelledby="nao-achei-titulo"
        >
            <ToupeiraNoBuraco nivel={0} size={96} className={styles.toupeira} />
            <p className={styles.codigo}>Erro 404</p>
            <h1 id="nao-achei-titulo" className={styles.titulo}>
                Cavei e não achei.
            </h1>
            <p className={styles.texto}>
                Não tem nada neste endereço. O link pode estar errado, ou a
                página mudou de lugar.
            </p>
            <div className={styles.acoes}>
                <Link href={inicio} className={recipes.button}>
                    Voltar ao início
                </Link>
                <Link href="/pilha" className={recipes.textLink}>
                    Garimpar na pilha <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
            </div>
        </section>
    )
}
