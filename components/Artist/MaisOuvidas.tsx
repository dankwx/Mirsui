'use client'

// As faixas mais ouvidas do artista, como lista densa.
//
// A ordem do Deezer (audiência) é a padrão; a busca e as outras ordenações
// que existiam em ArtistAllTracksSimple continuam aqui, sem cartão, sem
// dropdown: um campo de texto e um `select` nativo — o teclado e o leitor de
// tela já sabem o que fazer com eles.
//
// O link de cada faixa é SEMPRE `track.href`, que vem pronto do serviço com o
// ISRC quando o Observatório o conhece. Nada aqui monta /track/<id> na mão.

import { useId, useMemo, useState } from 'react'
import Link from 'next/link'
import RecordCover from '@/components/Club/RecordCover'
import recipes from '@/components/Club/club-recipes.module.css'
import { enderecoDoArtista } from '@/utils/artistHref'
import type { Cobertura, FaixaDaVitrine } from '@/utils/artistPageService'
import { duracaoMs } from './format'
import styles from './MaisOuvidas.module.css'

/** A faixa da vitrine com o que a página acrescenta: ano e salvamentos. */
export interface FaixaListada extends FaixaDaVitrine {
    ano: string | null
    /** quantas pessoas guardam esta faixa no Mirsui; 0 quando ninguém */
    salvos: number
}

type Ordem = 'audiencia' | 'nome' | 'lancamento' | 'duracao'

const ORDENS: { id: Ordem; label: string }[] = [
    { id: 'audiencia', label: 'Mais ouvidas' },
    { id: 'nome', label: 'Nome, A–Z' },
    { id: 'lancamento', label: 'Lançamento, mais recente' },
    { id: 'duracao', label: 'Duração, mais longa' },
]

const INICIAIS = 10

function ordenar(faixas: FaixaListada[], ordem: Ordem): FaixaListada[] {
    const lista = [...faixas]
    switch (ordem) {
        case 'nome':
            return lista.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
        case 'lancamento':
            // Sem ano vai para o fim, em vez de virar NaN e embaralhar tudo.
            return lista.sort(
                (a, b) => Number(b.ano ?? -1) - Number(a.ano ?? -1)
            )
        case 'duracao':
            return lista.sort((a, b) => b.duration_ms - a.duration_ms)
        default:
            return lista.sort((a, b) => b.popularity - a.popularity)
    }
}

export default function MaisOuvidas({
    faixas,
    artistaId,
    cobertura,
}: {
    faixas: FaixaListada[]
    /** para não linkar o próprio artista da página nas participações */
    artistaId: string
    cobertura: Cobertura
}) {
    const [busca, setBusca] = useState('')
    const [ordem, setOrdem] = useState<Ordem>('audiencia')
    const [todas, setTodas] = useState(false)
    const buscaId = useId()
    const ordemId = useId()

    const filtradas = useMemo(() => {
        const termo = busca.trim().toLocaleLowerCase('pt-BR')
        const base = termo
            ? faixas.filter(
                  (f) =>
                      f.name.toLocaleLowerCase('pt-BR').includes(termo) ||
                      f.album.name.toLocaleLowerCase('pt-BR').includes(termo)
              )
            : faixas
        return ordenar(base, ordem)
    }, [faixas, busca, ordem])

    const visiveis = todas ? filtradas : filtradas.slice(0, INICIAIS)
    const escondidas = filtradas.length - visiveis.length

    return (
        <section
            className={styles.section}
            aria-labelledby="mais-ouvidas-title"
        >
            <div className={styles.heading}>
                <div>
                    <h2 id="mais-ouvidas-title">Mais ouvidas</h2>
                    <p>
                        {cobertura === 'acervo'
                            ? `As ${faixas.length} faixas com mais audiência entre as medidas pelo Observatório.`
                            : faixas.length === 0
                              ? 'O Deezer ainda não lista as faixas mais tocadas deste artista.'
                              : `As ${faixas.length} faixas com mais audiência no Deezer.`}
                    </p>
                </div>

                {faixas.length > 1 && (
                    <div className={styles.controls}>
                        <label className={styles.control}>
                            <span id={buscaId}>Buscar</span>
                            <input
                                type="search"
                                aria-labelledby={buscaId}
                                placeholder="Título ou álbum"
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                className={styles.input}
                            />
                        </label>
                        <label className={styles.control}>
                            <span id={ordemId}>Ordenar por</span>
                            <select
                                aria-labelledby={ordemId}
                                value={ordem}
                                onChange={(e) =>
                                    setOrdem(e.target.value as Ordem)
                                }
                                className={styles.select}
                            >
                                {ORDENS.map((o) => (
                                    <option key={o.id} value={o.id}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                )}
            </div>

            {faixas.length > 0 && filtradas.length === 0 && (
                <p className={styles.empty} role="status">
                    Nenhuma faixa com “{busca.trim()}” entre as mais ouvidas.
                </p>
            )}

            {visiveis.length > 0 && (
                <ol className={styles.list} aria-live="polite">
                    <li className={styles.header} aria-hidden="true">
                        <span />
                        <span />
                        <span>Faixa</span>
                        <span>Duração</span>
                        <span>Audiência</span>
                    </li>
                    {visiveis.map((f, index) => {
                        const convidados = f.artists.filter(
                            (a) => a.id !== artistaId
                        )
                        return (
                            <li key={f.id} className={styles.row}>
                                <span
                                    className={`${recipes.smallNumber} ${styles.position}`}
                                >
                                    {index + 1}
                                </span>

                                {f.href ? (
                                    <Link
                                        href={f.href}
                                        tabIndex={-1}
                                        aria-hidden="true"
                                        className={styles.coverLink}
                                    >
                                        <RecordCover
                                            src={f.album.images[0]?.url ?? null}
                                            alt=""
                                            className={styles.cover}
                                        />
                                    </Link>
                                ) : (
                                    <RecordCover
                                        src={f.album.images[0]?.url ?? null}
                                        alt=""
                                        className={styles.cover}
                                    />
                                )}

                                <div className={styles.who}>
                                    <h3 className={styles.title}>
                                        {f.href ? (
                                            <Link href={f.href}>{f.name}</Link>
                                        ) : (
                                            f.name
                                        )}
                                    </h3>
                                    <p className={styles.context}>
                                        {f.album.name && (
                                            <span>{f.album.name}</span>
                                        )}
                                        {f.ano && (
                                            <span
                                                className={recipes.smallNumber}
                                            >
                                                {f.ano}
                                            </span>
                                        )}
                                        {convidados.length > 0 && (
                                            <span>
                                                com{' '}
                                                {convidados.map((a, i) => (
                                                    <span
                                                        key={`${a.id ?? a.name}-${i}`}
                                                    >
                                                        {a.id ? (
                                                            <Link
                                                                href={enderecoDoArtista(
                                                                    a.id,
                                                                    a.name
                                                                )}
                                                            >
                                                                {a.name}
                                                            </Link>
                                                        ) : (
                                                            a.name
                                                        )}
                                                        {i <
                                                            convidados.length -
                                                                1 && ', '}
                                                    </span>
                                                ))}
                                            </span>
                                        )}
                                        {f.salvos > 0 && (
                                            <span className={styles.saved}>
                                                {f.salvos === 1
                                                    ? '1 pessoa guarda'
                                                    : `${f.salvos} pessoas guardam`}
                                            </span>
                                        )}
                                    </p>
                                </div>

                                <span className={styles.meta}>
                                    <span
                                        className={`${recipes.smallNumber} ${styles.duration}`}
                                    >
                                        <span className={styles.srOnly}>
                                            Duração{' '}
                                        </span>
                                        {duracaoMs(f.duration_ms)}
                                    </span>
                                    <span
                                        className={`${recipes.smallNumber} ${styles.audience}`}
                                        title="Audiência no Deezer, de 0 a 100"
                                    >
                                        <span className={styles.srOnly}>
                                            Audiência{' '}
                                        </span>
                                        {f.popularity}
                                    </span>
                                </span>
                            </li>
                        )
                    })}
                </ol>
            )}

            {(escondidas > 0 || (todas && filtradas.length > INICIAIS)) && (
                <div className={styles.more}>
                    <button
                        type="button"
                        onClick={() => setTodas((v) => !v)}
                        className={recipes.textLink}
                    >
                        {todas
                            ? `Mostrar só as ${INICIAIS} primeiras`
                            : `Mostrar todas as ${filtradas.length}`}
                    </button>
                </div>
            )}
        </section>
    )
}
