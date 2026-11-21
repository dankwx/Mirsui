'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowUpRight, Check, Plus, RotateCcw, Disc3 } from 'lucide-react'
import AuthModalTrigger from '@/components/AuthModalTrigger/AuthModalTrigger'
import styles from './Club.module.css'

export default function ComoFunciona() {
    const [saved, setSaved] = useState(false)
    return (
        <section id="como" className={styles.how} aria-labelledby="how-title">
            <div className={`${styles.container} ${styles.howGrid}`}>
                <div className={styles.howCopy}>
                    <h2 id="how-title">Como guardar um achado</h2>
                    <ol className={styles.steps}>
                        <li>
                            <span>01</span>
                            <div>
                                <h3>Busque a faixa</h3>
                                <p>
                                    Pode ser uma faixa que você acabou de
                                    descobrir ou uma que já vive no repeat.
                                </p>
                            </div>
                        </li>
                        <li>
                            <span>02</span>
                            <div>
                                <h3>Registre a descoberta</h3>
                                <p>
                                    O Mirsui guarda a data e sua posição entre
                                    quem registrou a faixa.
                                </p>
                            </div>
                        </li>
                        <li>
                            <span>03</span>
                            <div>
                                <h3>Mostre seu acervo</h3>
                                <p>
                                    Compartilhe seus achados e acompanhe os de
                                    outras pessoas.
                                </p>
                            </div>
                        </li>
                    </ol>
                </div>
                <div className={styles.demoStage}>
                    <div
                        className={`${styles.discoveryReceipt} ${saved ? styles.receiptSaved : ''}`}
                    >
                        <div className={styles.receiptHeader}>
                            <Disc3 size={21} />
                            <span>REGISTRO DE DESCOBERTA</span>
                            <span>m.</span>
                        </div>
                        <Image
                            src="/assets/landing/record-1.webp"
                            alt="Capa do álbum Caju, de Liniker"
                            unoptimized
                            width={500}
                            height={500}
                            sizes="(max-width: 640px) 200px, 260px"
                            className={styles.receiptCover}
                        />
                        <div className={styles.receiptTrack}>
                            <h3>Pote de ouro</h3>
                            <p>Liniker · Caju</p>
                        </div>
                        <div
                            className={styles.receiptResult}
                            aria-live="polite"
                        >
                            <span className={styles.receiptPosition}>
                                {saved ? '1º' : '→'}
                            </span>
                            <div>
                                <strong>
                                    {saved
                                        ? 'Você chegou primeiro.'
                                        : 'Sua vez de testar'}
                                </strong>
                                <p>
                                    {saved
                                        ? 'Seu nome faz parte dessa história.'
                                        : 'Experimente salvar esta música.'}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            className={styles.demoButton}
                            onClick={() => setSaved(!saved)}
                        >
                            {saved ? (
                                <>
                                    <RotateCcw size={16} /> Experimentar de novo
                                </>
                            ) : (
                                <>
                                    <Plus size={18} /> Registrar descoberta
                                </>
                            )}
                        </button>
                        <p className={styles.demoNote}>
                            {saved ? (
                                <>
                                    <Check size={12} /> Exemplo salvo nesta
                                    demonstração
                                </>
                            ) : (
                                'Demonstração · nenhum registro real é criado'
                            )}
                        </p>
                    </div>
                    <AuthModalTrigger mode="signup" className={styles.textLink}>
                        Agora, criar meu acervo <ArrowUpRight size={17} />
                    </AuthModalTrigger>
                </div>
            </div>
        </section>
    )
}
