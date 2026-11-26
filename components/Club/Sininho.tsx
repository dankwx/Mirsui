'use client'

// O sino do header: os avisos da pessoa (novo seguidor, faixas do acervo que
// subiram na semana), os mesmos que saem por e-mail (migrations 053 e 054 do
// backend).
//
// O número de não lidos é pedido ao montar, ao navegar e ao voltar para a
// aba, no máximo uma vez por minuto: sem polling, que com muita gente logada
// viraria uma consulta por pessoa a cada poucos segundos. Abrir o sino marca
// tudo como lido; os itens novos ficam destacados enquanto o painel está
// aberto.

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'
import FotoDePerfil from '@/components/FotoDePerfil'
import { quando } from '@/components/Feed/format'
import { enderecoDaFaixa } from '@/utils/trackHref'
import { createClient } from '@/utils/supabase/client'
import styles from './Sininho.module.css'

interface Aviso {
    id: number
    tipo: string
    dados: unknown
    criada_em: string
    lida: boolean
    ator_username: string | null
    ator_nome: string | null
    ator_avatar: string | null
}

interface Salto {
    isrc?: string
    titulo?: string
    artista?: string | null
    capaMd5?: string | null
    antes?: number
    agora?: number
}

const INTERVALO_MS = 60_000

function capa(md5: string | null | undefined): string | null {
    return md5 && /^[0-9a-f]{32}$/i.test(md5)
        ? `https://cdn-images.dzcdn.net/images/cover/${md5}/120x120-000000-80-0-0.jpg`
        : null
}

function Item({ aviso, fechar }: { aviso: Aviso; fechar: () => void }) {
    const classe = `${styles.item} ${aviso.lida ? '' : styles.novo}`
    const tempo = <span className={styles.quando}>{quando(aviso.criada_em)}</span>

    if (aviso.tipo === 'seguidor' && aviso.ator_username) {
        const nome = aviso.ator_nome?.trim() || `@${aviso.ator_username}`
        return (
            <Link href={`/user/${aviso.ator_username}`} onClick={fechar} className={classe}>
                <span className={styles.foto}>
                    <FotoDePerfil src={aviso.ator_avatar} className={styles.fotoImg} loading="lazy">
                        <span className={styles.inicial}>
                            {nome.replace(/^@/, '').charAt(0).toUpperCase()}
                        </span>
                    </FotoDePerfil>
                </span>
                <span className={styles.texto}>
                    <strong>{nome}</strong> começou a te seguir {tempo}
                </span>
            </Link>
        )
    }

    if (aviso.tipo === 'saltos_semana') {
        const dados = (aviso.dados ?? {}) as { saltos?: Salto[]; total?: number }
        const saltos = Array.isArray(dados.saltos) ? dados.saltos : []
        const maior = saltos[0]
        if (!maior?.isrc || !maior.titulo) return null
        const total = Math.max(Number(dados.total) || 0, saltos.length)
        const img = capa(maior.capaMd5)
        const href = `${enderecoDaFaixa(maior.isrc, maior.artista, maior.titulo)}#observatorio-title`
        return (
            <Link href={href} onClick={fechar} className={classe}>
                {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt="" className={styles.capa} loading="lazy" />
                ) : (
                    <span className={`${styles.capa} ${styles.capaVazia}`} />
                )}
                <span className={styles.texto}>
                    <strong>{maior.titulo}</strong> subiu de{' '}
                    <span className={styles.numero}>{maior.antes}</span> para{' '}
                    <span className={styles.numero}>{maior.agora}</span> nesta semana
                    {total > 1 ? `, e mais ${total - 1} do seu acervo` : ''} {tempo}
                </span>
            </Link>
        )
    }

    return null
}

export default function Sininho() {
    const [supabase] = useState(() => createClient())
    const [naoLidas, setNaoLidas] = useState(0)
    const [aberto, setAberto] = useState(false)
    const [avisos, setAvisos] = useState<Aviso[] | null>(null)
    const [falhou, setFalhou] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const ultimaConta = useRef(0)
    const pathname = usePathname()

    const contar = useCallback(async () => {
        if (Date.now() - ultimaConta.current < INTERVALO_MS) return
        ultimaConta.current = Date.now()
        const { data, error } = await supabase.rpc('contar_notificacoes_nao_lidas')
        if (!error && typeof data === 'number') setNaoLidas(data)
    }, [supabase])

    useEffect(() => {
        void contar()
    }, [pathname, contar])

    useEffect(() => {
        const voltou = () => {
            if (document.visibilityState === 'visible') void contar()
        }
        document.addEventListener('visibilitychange', voltou)
        return () => document.removeEventListener('visibilitychange', voltou)
    }, [contar])

    useEffect(() => {
        if (!aberto) return
        const fora = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false)
        }
        const esc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setAberto(false)
        }
        document.addEventListener('mousedown', fora)
        document.addEventListener('keydown', esc)
        return () => {
            document.removeEventListener('mousedown', fora)
            document.removeEventListener('keydown', esc)
        }
    }, [aberto])

    async function alternar() {
        if (aberto) {
            setAberto(false)
            return
        }
        setAberto(true)
        setFalhou(false)
        const { data, error } = await supabase.rpc('minhas_notificacoes', { p_limite: 20 })
        if (error) {
            setFalhou(true)
            return
        }
        const lista = (data ?? []) as Aviso[]
        setAvisos(lista)
        if (naoLidas > 0 || lista.some((a) => !a.lida)) {
            const { error: erroLidas } = await supabase.rpc('marcar_notificacoes_lidas')
            if (!erroLidas) setNaoLidas(0)
        }
    }

    const fechar = () => setAberto(false)
    const rotulo = naoLidas > 0 ? `Avisos, ${naoLidas > 99 ? 'mais de 99' : naoLidas} novos` : 'Avisos'

    return (
        <div className={styles.sininho} ref={ref}>
            <button
                type="button"
                onClick={alternar}
                aria-label={rotulo}
                aria-expanded={aberto}
                aria-haspopup="true"
                className={styles.botao}
            >
                <Bell aria-hidden="true" />
                {naoLidas > 0 && (
                    <span className={styles.contador} aria-hidden="true">
                        {naoLidas > 99 ? '99+' : naoLidas}
                    </span>
                )}
            </button>

            {aberto && (
                <div className={styles.painel} role="region" aria-label="Avisos">
                    <p className={styles.titulo}>Avisos</p>
                    {falhou ? (
                        <p className={styles.vazio}>Não carregou. Tente de novo.</p>
                    ) : avisos === null ? (
                        <p className={styles.vazio}>Carregando…</p>
                    ) : avisos.length === 0 ? (
                        <p className={styles.vazio}>Nenhum aviso ainda.</p>
                    ) : (
                        <div className={styles.lista}>
                            {avisos.map((a) => (
                                <Item key={a.id} aviso={a} fechar={fechar} />
                            ))}
                        </div>
                    )}
                    <Link href="/emails" onClick={fechar} className={styles.rodape}>
                        Avisos por e-mail
                    </Link>
                </div>
            )}
        </div>
    )
}
