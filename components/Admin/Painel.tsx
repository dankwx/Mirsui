import Link from 'next/link'
import type { ReactNode } from 'react'
import type {
    FaixaSalva,
    FichaNaMesa,
    Mes,
    Painel as DadosDoPainel,
    Pessoa,
    Registro,
    TipoRegistro,
} from '@/utils/painelTypes'
import { enderecoDaFaixa } from '@/utils/trackHref'

/* ------------------------------------------------------------------ *
 * Formatação
 * ------------------------------------------------------------------ */

const nf = new Intl.NumberFormat('pt-BR')

// Datas escritas à mão porque o Intl em pt-BR insiste nas preposições:
// `month: 'short'` devolve "12 de nov. de 25", que numa coluna de 76px quebra
// em duas linhas e desalinha a lista inteira. Aqui sai "12 nov 25".
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const dd = (n: number) => String(n).padStart(2, '0')

const dataCurta = (d: Date) =>
    `${dd(d.getDate())} ${MESES[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`

const dataHora = (d: Date) =>
    `${dd(d.getDate())} ${MESES[d.getMonth()]} ${dd(d.getHours())}:${dd(d.getMinutes())}`

/**
 * Com ano, para a linha do tempo.
 *
 * Sem ele a lista pula de "11 jun" para "14 nov" e parece ordenada errado: são
 * junho de 2026 e novembro de 2025, e a ordem está certa. Nas linhas de "As
 * rotinas" o ano não entra porque ali tudo é de hoje ou de ontem.
 */
const dataHoraAno = (d: Date) =>
    `${dd(d.getDate())} ${MESES[d.getMonth()]} ${String(d.getFullYear()).slice(2)} ${dd(d.getHours())}:${dd(d.getMinutes())}`

function msDesde(iso: string | null): number | null {
    if (!iso) return null
    const t = new Date(iso).getTime()
    return Number.isNaN(t) ? null : Date.now() - t
}

/** "há 9 min", "há 15 h", "há 2 meses". A unidade muda com a distância. */
function haQuanto(iso: string | null): string {
    const ms = msDesde(iso)
    if (ms === null) return 'nunca'
    const min = Math.floor(ms / 60000)
    if (min < 1) return 'agora'
    if (min < 60) return `há ${min} min`
    const h = Math.floor(min / 60)
    if (h < 24) return `há ${h} h`
    const d = Math.floor(h / 24)
    if (d < 45) return `há ${d} ${d === 1 ? 'dia' : 'dias'}`
    const meses = Math.round(d / 30)
    if (meses < 18) return `há ${meses} ${meses === 1 ? 'mês' : 'meses'}`
    const anos = Math.round(d / 365)
    return `há ${anos} ${anos === 1 ? 'ano' : 'anos'}`
}

function dias(iso: string | null): number | null {
    const ms = msDesde(iso)
    return ms === null ? null : Math.floor(ms / 86400000)
}

const quando = (iso: string | null, fmt: (d: Date) => string) =>
    iso ? fmt(new Date(iso)) : '—'

const pct = (parte: number, todo: number) =>
    todo > 0 ? `${Math.round((parte / todo) * 100)}%` : '—'

/** Versão que não explode: `extractSpotifyIdFromUri` lança, e um painel não pode cair por causa de uma linha antiga. */
/**
 * O endereço da ficha, a partir da chave opaca do acervo.
 *
 * `tracks.track_uri` guarda `spotify:track:<id>` para tudo que foi salvo antes
 * da migration 023 e `isrc:<ISRC>` para o que veio depois. O segundo formato não
 * era tratado aqui, então a capa da faixa salva recente aparecia sem link.
 */
function hrefDaFaixaSalva(faixa: FaixaSalva): string | null {
    const partes = (faixa.uri || '').split(':')

    if (partes.length === 2 && partes[0] === 'isrc' && partes[1]) {
        return enderecoDaFaixa(partes[1], faixa.artista, faixa.titulo)
    }
    // Id do Spotify não recebe slug: a rota troca a URL inteira por 308 assim
    // que descobre o ISRC.
    if (partes.length === 3 && partes[0] === 'spotify' && partes[2]) {
        return `/track/${partes[2]}`
    }
    return null
}

const CAPA_VAZIA =
    'grid place-items-center bg-mir-fill1 font-mono text-[10px] uppercase tracking-[0.1em] text-mir-text3'

/* ------------------------------------------------------------------ *
 * Peças de layout
 *
 * Sem card em lugar nenhum: a página é um instrumento, e o que separa um
 * número do outro é um fio de 1px. Caixa com sombra em volta de cada métrica
 * é o que faz um painel parecer template.
 * ------------------------------------------------------------------ */

const FAIXA = 'mx-auto w-full max-w-[1320px] px-5 sm:px-10'

function Secao({
    titulo,
    nota,
    children,
}: {
    titulo: string
    nota?: string
    children: ReactNode
}) {
    return (
        <section className="pt-11">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="text-[19px] font-extrabold tracking-[-0.03em] text-mir-text">
                    {titulo}
                </h2>
                {nota && <p className="text-[13px] text-mir-text3">{nota}</p>}
            </div>
            <div className="mt-4">{children}</div>
        </section>
    )
}

/** Rótulo curto de uma linha de dado. Não é chapéu de seção: é a legenda do número. */
const Rotulo = ({ children }: { children: ReactNode }) => (
    <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-mir-text3">
        {children}
    </span>
)

function Vazio({ children }: { children: ReactNode }) {
    return (
        <p className="border-y border-mir-line py-7 text-center text-[14px] text-mir-text3">
            {children}
        </p>
    )
}

/* ------------------------------------------------------------------ *
 * Os números
 * ------------------------------------------------------------------ */

function Numero({
    valor,
    rotulo,
    nota,
    acento,
}: {
    valor: number
    rotulo: string
    nota: string
    /** laranja = contagem de gente, que é o assunto do mir-warm no design system */
    acento?: boolean
}) {
    return (
        <div className="border-b border-r border-mir-line px-5 py-6">
            <div
                className={`text-[clamp(28px,3vw,34px)] font-extrabold leading-none tabular-nums tracking-[-0.04em] ${
                    acento ? 'text-mir-warm' : 'text-mir-text'
                }`}
            >
                {nf.format(valor)}
            </div>
            <div className="mt-2">
                <Rotulo>{rotulo}</Rotulo>
            </div>
            <p className="mt-1 text-[12.5px] leading-snug text-mir-text2">
                {nota}
            </p>
        </div>
    )
}

/* ------------------------------------------------------------------ *
 * Os meses
 *
 * Uma barra por mês desde o primeiro registro que existe. Com 46 salvamentos
 * em dois anos, quase tudo é zero — e é justamente esse o formato do projeto
 * até aqui. Mês vazio ganha um tracinho na base para continuar existindo na
 * régua em vez de virar buraco.
 * ------------------------------------------------------------------ */

function Meses({ meses }: { meses: Mes[] }) {
    const teto = Math.max(1, ...meses.map((m) => Math.max(m.achados, m.contas)))

    return (
        <div>
            <div className="flex items-end gap-[3px] border-b border-mir-line pb-px sm:gap-[5px]">
                {meses.map((m) => {
                    const alturaA = m.achados
                        ? Math.max(3, (m.achados / teto) * 72)
                        : 1
                    const alturaC = m.contas
                        ? Math.max(3, (m.contas / teto) * 72)
                        : 1
                    return (
                        <div
                            key={m.mes}
                            className="flex flex-1 items-end justify-center gap-[2px]"
                            style={{ height: 72 }}
                            title={`${m.mes}: ${m.achados} achados, ${m.contas} contas, ${m.fichas} fichas`}
                        >
                            <span
                                className={`w-full max-w-[9px] ${m.achados ? 'bg-mir-text2' : 'bg-mir-line2'}`}
                                style={{ height: alturaA }}
                            />
                            <span
                                className={`w-full max-w-[9px] ${m.contas ? 'bg-mir-warm' : 'bg-mir-line2'}`}
                                style={{ height: alturaC }}
                            />
                        </div>
                    )
                })}
            </div>

            <div className="mt-1.5 flex gap-[3px] sm:gap-[5px]">
                {meses.map((m, i) => (
                    <div
                        key={m.mes}
                        className="flex-1 text-center font-mono text-[9.5px] tabular-nums text-mir-text3"
                    >
                        {i === 0 || m.mes.endsWith('-01')
                            ? m.mes.slice(2, 4)
                            : ''}
                    </div>
                ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5">
                <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 bg-mir-text2" />
                    <Rotulo>achados</Rotulo>
                </span>
                <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 bg-mir-warm" />
                    <Rotulo>contas criadas</Rotulo>
                </span>
                <span className="text-[12.5px] text-mir-text3">
                    pico de {teto} num mês só
                </span>
            </div>
        </div>
    )
}

/* ------------------------------------------------------------------ *
 * A mesa
 * ------------------------------------------------------------------ */

function LinhaDaMesa({ ficha }: { ficha: FichaNaMesa }) {
    const delta = ficha.atual - ficha.base
    const d = dias(ficha.desde)

    return (
        <li className="flex flex-wrap items-center gap-x-5 gap-y-4 border-b border-mir-line py-4">
            <div className="flex min-w-[240px] flex-1 items-center gap-3.5">
                {ficha.capa ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={ficha.capa}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded object-cover"
                    />
                ) : (
                    <span className={`h-14 w-14 shrink-0 rounded ${CAPA_VAZIA}`}>
                        sem capa
                    </span>
                )}
                <div className="min-w-0">
                    <p className="truncate text-[15.5px] font-bold tracking-[-0.015em] text-mir-text">
                        {ficha.titulo}
                    </p>
                    <p className="truncate font-mono text-[12px] text-mir-text2">
                        {ficha.artista}
                    </p>
                    {ficha.username && (
                        <Link
                            href={`/user/${ficha.username}`}
                            className="font-mono text-[11.5px] text-mir-text3 transition-colors hover:text-mir-warm"
                        >
                            @{ficha.username}
                        </Link>
                    )}
                </div>
            </div>

            {/* Larguras fixas por coluna, e não `gap` entre blocos que se
                dimensionam sozinhos: "19 → 11 -8" e "70 → 70 estável" têm
                larguras diferentes, e sem a trava cada linha alinhava num lugar
                e a leitura vertical da coluna sumia.

                `medicoes` ficou de fora: o snapshot roda uma vez por dia, então
                ele é sempre ~ o número de dias e não diz nada novo. Quando o
                job atrasa, quem conta a história é "As rotinas". */}
            {/* `dt` antes de `dd` no DOM, invertido de volta pelo
                flex-col-reverse. O valor aparece em cima, que é o que a tela
                pede, mas um leitor de tela ainda lê "multiplicador, 2,72x" em
                vez de "2,72x, multiplicador". */}
            <dl className="flex flex-wrap items-end gap-y-3">
                <div className="flex w-[124px] flex-col-reverse">
                    <dt>
                        <Rotulo>multiplicador</Rotulo>
                    </dt>
                    <dd className="mb-1.5 text-[17px] font-extrabold tabular-nums leading-none tracking-[-0.03em] text-mir-text">
                        {ficha.multiplicador.toFixed(2).replace('.', ',')}x
                    </dd>
                </div>
                <div className="flex w-[72px] flex-col-reverse">
                    <dt>
                        <Rotulo>pontos</Rotulo>
                    </dt>
                    <dd className="mb-1.5 text-[17px] font-extrabold tabular-nums leading-none tracking-[-0.03em] text-mir-text">
                        {nf.format(ficha.pontos)}
                    </dd>
                </div>
                <div className="flex w-[140px] flex-col-reverse">
                    <dt>
                        <Rotulo>popularidade</Rotulo>
                    </dt>
                    <dd className="mb-1.5 text-[17px] font-bold tabular-nums leading-none tracking-[-0.03em] text-mir-text">
                        {ficha.base}{' '}
                        <span className="text-mir-text3">&rarr;</span>{' '}
                        {ficha.atual}
                        <span className="ml-1.5 font-mono text-[12px] font-normal text-mir-text3">
                            {delta === 0
                                ? 'estável'
                                : `${delta > 0 ? '+' : ''}${delta}`}
                        </span>
                    </dd>
                </div>
                <div className="flex w-[100px] flex-col-reverse">
                    <dt>
                        <Rotulo>dias na mesa</Rotulo>
                    </dt>
                    <dd className="mb-1.5 text-[17px] font-bold tabular-nums leading-none tracking-[-0.03em] text-mir-text">
                        {d === null ? '—' : d}
                    </dd>
                </div>
            </dl>
        </li>
    )
}

/* ------------------------------------------------------------------ *
 * Quem entrou
 * ------------------------------------------------------------------ */

function Conta({
    valor,
    unidade,
    largura,
    acento,
}: {
    valor: number
    unidade: string
    largura: string
    acento?: boolean
}) {
    const cor = valor === 0 ? 'text-mir-text3' : acento ? 'text-mir-warm' : 'text-mir-text'
    return (
        <span
            className={`${largura} shrink-0 text-right text-[13.5px] tabular-nums ${cor}`}
        >
            {valor}
            <span className="ml-1 text-[11px] text-mir-text3">{unidade}</span>
        </span>
    )
}

function LinhaDaPessoa({ pessoa }: { pessoa: Pessoa }) {
    const nome = pessoa.username ? `@${pessoa.username}` : 'sem perfil'
    const fez = pessoa.achados + pessoa.fichas > 0

    return (
        <li className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-mir-line py-3">
            <div className="flex min-w-[210px] flex-1 flex-wrap items-baseline gap-x-2.5">
                {pessoa.username ? (
                    <Link
                        href={`/user/${pessoa.username}`}
                        className={`font-mono text-[13.5px] transition-colors hover:text-mir-warm ${
                            fez
                                ? 'font-semibold text-mir-text'
                                : 'text-mir-text2'
                        }`}
                    >
                        {nome}
                    </Link>
                ) : (
                    <span className="font-mono text-[13.5px] text-mir-text3">
                        {nome}
                    </span>
                )}
                <span className="truncate text-[12.5px] text-mir-text3">
                    {pessoa.email ?? 'sem e-mail'}
                </span>
                {!pessoa.confirmada && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-mir-text3">
                        não confirmou
                    </span>
                )}
            </div>

            <span className="hidden w-[76px] shrink-0 font-mono text-[11.5px] tabular-nums text-mir-text3 sm:block">
                {quando(pessoa.entrou, dataCurta)}
            </span>
            <span className="hidden w-[104px] shrink-0 font-mono text-[11.5px] text-mir-text3 md:block">
                {pessoa.ultimo_acesso ? haQuanto(pessoa.ultimo_acesso) : 'sem login'}
            </span>

            {/* Zero apaga. São 15 linhas e a maioria não fez nada: com todos os
                números no mesmo tom, as três contas que usaram o site somem no
                meio de uma parede de zeros. */}
            <Conta valor={pessoa.achados} unidade="ach." largura="w-[68px]" />
            <Conta valor={pessoa.fichas} unidade="fic." largura="w-[56px]" />
            <Conta
                valor={pessoa.seguidores}
                unidade="seg."
                largura="w-[62px]"
                acento
            />
        </li>
    )
}

/* ------------------------------------------------------------------ *
 * O que salvaram
 * ------------------------------------------------------------------ */

function Capa({ faixa }: { faixa: FaixaSalva }) {
    const href = hrefDaFaixaSalva(faixa)

    const miolo = (
        <>
            <div className="relative">
                {faixa.capa ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={faixa.capa}
                        alt=""
                        loading="lazy"
                        className="aspect-square w-full rounded object-cover"
                    />
                ) : (
                    <span
                        className={`aspect-square w-full rounded ${CAPA_VAZIA}`}
                    >
                        sem capa
                    </span>
                )}
                <span className="absolute right-1.5 top-1.5 rounded-full bg-mir-bg/85 px-2 py-[3px] font-mono text-[10.5px] tabular-nums text-mir-text backdrop-blur">
                    {faixa.salvamentos}x
                </span>
            </div>
            <p className="mt-2 truncate text-[13px] font-semibold tracking-[-0.01em] text-mir-text">
                {faixa.titulo ?? 'sem título'}
            </p>
            <p className="truncate font-mono text-[11.5px] text-mir-text3">
                {faixa.artista ?? 'sem artista'}
            </p>
        </>
    )

    return href ? (
        <Link href={href} className="group block">
            {miolo}
        </Link>
    ) : (
        <div>{miolo}</div>
    )
}

/* ------------------------------------------------------------------ *
 * Últimos registros
 * ------------------------------------------------------------------ */

const TIPO: Record<TipoRegistro, string> = {
    conta: 'conta',
    achado: 'achado',
    ficha: 'ficha',
    recado: 'recado',
    comentario: 'comentário',
    seguiu: 'seguiu',
}

function frase(r: Registro): ReactNode {
    const quem = (
        <span className="font-semibold text-mir-text">
            {r.quem ?? 'alguém'}
        </span>
    )
    const faixa = r.titulo ? (
        <span className="text-mir-text">
            {r.titulo}
            {r.artista ? (
                <span className="text-mir-text3"> de {r.artista}</span>
            ) : null}
        </span>
    ) : null

    switch (r.tipo) {
        case 'conta':
            return <>{quem} criou conta</>
        case 'achado':
            return (
                <>
                    {quem} salvou {faixa}
                    {r.detalhe && (
                        <span className="text-mir-text3">
                            {' '}
                            &ldquo;{r.detalhe}&rdquo;
                        </span>
                    )}
                </>
            )
        case 'ficha':
            // `detalhe` chega como "2.72" e vira "2,72x", que é como o
            // multiplicador aparece em "A mesa" e no resto do produto.
            return (
                <>
                    {quem} botou ficha em {faixa}
                    {r.detalhe && (
                        <span className="text-mir-text3">
                            {' '}
                            {r.detalhe.replace('.', ',')}x
                        </span>
                    )}
                </>
            )
        case 'recado':
            return (
                <>
                    {quem} deixou um recado
                    {r.detalhe && (
                        <span className="text-mir-text3">
                            {' '}
                            &ldquo;{r.detalhe}&rdquo;
                        </span>
                    )}
                </>
            )
        case 'comentario':
            return (
                <>
                    {quem} comentou em {faixa ?? 'uma faixa'}
                    {r.detalhe && (
                        <span className="text-mir-text3">
                            {' '}
                            &ldquo;{r.detalhe}&rdquo;
                        </span>
                    )}
                </>
            )
        case 'seguiu':
            return (
                <>
                    {quem} passou a seguir{' '}
                    <span className="font-semibold text-mir-text">
                        {r.detalhe ?? 'alguém'}
                    </span>
                </>
            )
    }
}

/* ------------------------------------------------------------------ *
 * As rotinas
 * ------------------------------------------------------------------ */

function Linha({
    rotulo,
    valor,
    acento,
}: {
    rotulo: string
    valor: string
    acento?: boolean
}) {
    return (
        <div className="flex items-baseline justify-between gap-4 border-b border-mir-line py-2.5">
            <Rotulo>{rotulo}</Rotulo>
            <span
                className={`text-right text-[13.5px] tabular-nums ${
                    acento
                        ? 'font-semibold text-mir-acc'
                        : 'text-mir-text2'
                }`}
            >
                {valor}
            </span>
        </div>
    )
}

function Rotina({
    titulo,
    quandoRoda,
    children,
}: {
    titulo: string
    quandoRoda: string
    children: ReactNode
}) {
    return (
        <div>
            <h3 className="text-[14.5px] font-bold tracking-[-0.02em] text-mir-text">
                {titulo}
            </h3>
            <p className="mb-2.5 mt-0.5 text-[12.5px] text-mir-text3">
                {quandoRoda}
            </p>
            {children}
        </div>
    )
}

/* ------------------------------------------------------------------ *
 * A página
 * ------------------------------------------------------------------ */

export default function PainelDoDono({ dados }: { dados: DadosDoPainel }) {
    const { contas, achados, fichas, observatorio: obs, social } = dados

    // 36 h de folga: o Observatório roda uma vez por noite, então "não mediu
    // nas últimas 24 h" pode ser só um atraso de fuso. Mais que isso é parada.
    const msObs = msDesde(obs.ultima_medicao)
    const obsVivo = msObs !== null && msObs < 36 * 3600_000
    const msSnap = msDesde(fichas.ultima_medicao)
    const snapVivo = msSnap !== null && msSnap < 36 * 3600_000

    return (
        <div className="pb-24">
            <div className={FAIXA}>
                {/* ---- cabeçalho ----
                    Duas frases, e as duas são medidas. Um painel de dono
                    responde primeiro "está tudo rodando?" e só depois entrega
                    tabela: por isso o topo é texto e não um mostrador. */}
                <header className="pt-7">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                        <h1 className="text-[clamp(28px,2.8vw,36px)] font-extrabold leading-none tracking-[-0.04em] text-mir-text">
                            Painel
                        </h1>
                        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mir-text3">
                            medido {quando(dados.gerado_em, dataHora)}
                        </span>
                    </div>

                    <p className="mt-4 max-w-[64ch] text-[17px] leading-[1.45] text-mir-text2">
                        {obsVivo ? (
                            <>
                                O Observatório mediu{' '}
                                <b className="font-bold text-mir-text">
                                    {nf.format(obs.medidas_24h)} faixas
                                </b>{' '}
                                nas últimas 24 h.
                            </>
                        ) : (
                            <>
                                O Observatório não mede nada{' '}
                                <b className="font-bold text-mir-text">
                                    {haQuanto(obs.ultima_medicao)}
                                </b>
                                .
                            </>
                        )}{' '}
                        {achados.ultimo ? (
                            <>
                                O último salvamento de alguém foi{' '}
                                <b className="font-bold text-mir-text">
                                    {haQuanto(achados.ultimo)}
                                </b>
                                . Das {contas.total} contas criadas,{' '}
                                {achados.pessoas} já salvaram alguma coisa.
                            </>
                        ) : (
                            <>Ninguém salvou nada ainda.</>
                        )}
                    </p>
                </header>

                {/* ---- os números ---- */}
                <section className="mt-8 grid grid-cols-2 border-l border-t border-mir-line sm:grid-cols-3 lg:grid-cols-6">
                    <Numero
                        valor={contas.total}
                        rotulo="contas"
                        nota={`${contas.confirmadas} confirmadas, ${contas.nunca_entraram} nunca entraram`}
                        acento
                    />
                    <Numero
                        valor={achados.total}
                        rotulo="achados"
                        nota={`salvos por ${achados.pessoas} ${achados.pessoas === 1 ? 'pessoa' : 'pessoas'}`}
                    />
                    <Numero
                        valor={achados.faixas}
                        rotulo="no acervo"
                        nota="faixas diferentes, contadas por track_uri"
                    />
                    <Numero
                        valor={fichas.ativas}
                        rotulo="fichas na mesa"
                        nota={`${nf.format(fichas.pontos_na_mesa)} pontos em jogo, ${fichas.coletas} recolhidos`}
                    />
                    <Numero
                        valor={obs.faixas}
                        rotulo="faixas medidas"
                        nota={`${obs.generos} gêneros no catálogo do Observatório`}
                    />
                    <Numero
                        valor={obs.historico}
                        rotulo="medições"
                        nota={`${nf.format(obs.historico_24h)} nas últimas 24 h`}
                    />
                </section>

                {/* ---- os meses ---- */}
                <Secao
                    titulo="Mês a mês"
                    nota="desde o primeiro registro que existe no banco"
                >
                    <Meses meses={dados.meses} />
                </Secao>

                {/* ---- a mesa ---- */}
                <Secao
                    titulo="A mesa"
                    nota={`${fichas.ativas} ${fichas.ativas === 1 ? 'ficha ativa' : 'fichas ativas'} de ${fichas.pessoas} ${fichas.pessoas === 1 ? 'pessoa' : 'pessoas'}`}
                >
                    {dados.mesa.length > 0 ? (
                        <ul className="border-t border-mir-line">
                            {dados.mesa.map((f) => (
                                <LinhaDaMesa key={f.id} ficha={f} />
                            ))}
                        </ul>
                    ) : (
                        <Vazio>Nenhuma ficha na mesa.</Vazio>
                    )}
                </Secao>

                {/* ---- quem entrou ---- */}
                <Secao
                    titulo="Quem entrou"
                    nota={`${contas.total} contas, da mais nova para a mais velha`}
                >
                    <ul className="border-t border-mir-line">
                        {dados.pessoas.map((p) => (
                            <LinhaDaPessoa key={p.id} pessoa={p} />
                        ))}
                    </ul>
                </Secao>

                {/* ---- o que salvaram ---- */}
                <Secao
                    titulo="O que mais salvaram"
                    nota="contando por faixa, não por linha"
                >
                    {dados.maisSalvas.length > 0 ? (
                        <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
                            {dados.maisSalvas.map((f) => (
                                <Capa key={f.uri} faixa={f} />
                            ))}
                        </div>
                    ) : (
                        <Vazio>Ninguém salvou nada ainda.</Vazio>
                    )}
                </Secao>

                {/* ---- últimos registros ---- */}
                <Secao
                    titulo="Últimos registros"
                    nota="contas, achados, fichas, recados, comentários e quem seguiu quem"
                >
                    {dados.registros.length > 0 ? (
                        <ol className="border-t border-mir-line">
                            {dados.registros.map((r, i) => (
                                <li
                                    key={`${r.tipo}-${r.quando}-${i}`}
                                    className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 border-b border-mir-line py-2.5"
                                >
                                    <span className="w-[124px] shrink-0 font-mono text-[11.5px] tabular-nums text-mir-text3">
                                        {quando(r.quando, dataHoraAno)}
                                    </span>
                                    {/* Some no telefone: lá a frase fica com uns
                                        100px e quebra em cinco linhas por causa
                                        desta coluna. E ela é redundante — o verbo
                                        da frase ("criou conta", "botou ficha em")
                                        já diz o tipo. No desktop ela volta, porque
                                        é o que deixa varrer 24 linhas de olho. */}
                                    <span className="hidden w-[76px] shrink-0 font-mono text-[10.5px] uppercase tracking-[0.1em] text-mir-text3 sm:block">
                                        {TIPO[r.tipo]}
                                    </span>
                                    <span className="min-w-0 flex-1 text-[13.5px] leading-snug text-mir-text2">
                                        {frase(r)}
                                    </span>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <Vazio>Nada aconteceu ainda.</Vazio>
                    )}
                </Secao>

                {/* ---- as rotinas ---- */}
                <Secao
                    titulo="As rotinas"
                    nota="o que roda sozinho, e quando rodou pela última vez"
                >
                    <div className="grid gap-x-10 gap-y-8 md:grid-cols-3">
                        <Rotina
                            titulo="Observatório"
                            quandoRoda={
                                obsVivo
                                    ? 'mede o catálogo toda noite'
                                    : 'devia medir toda noite, e não está medindo'
                            }
                        >
                            <Linha
                                rotulo="última medição"
                                valor={`${haQuanto(obs.ultima_medicao)}, ${quando(obs.ultima_medicao, dataHora)}`}
                                acento={obsVivo}
                            />
                            <Linha
                                rotulo="faixas em 24 h"
                                valor={`${nf.format(obs.medidas_24h)} de ${nf.format(obs.faixas)}`}
                            />
                            <Linha
                                rotulo="ponte para o spotify"
                                valor={`${nf.format(obs.com_spotify)} (${pct(obs.com_spotify, obs.faixas)})`}
                            />
                            <Linha
                                rotulo="isrc resolvido"
                                valor={`${nf.format(obs.com_isrc)} (${pct(obs.com_isrc, obs.faixas)})`}
                            />
                        </Rotina>

                        <Rotina
                            titulo="Snapshot das fichas"
                            quandoRoda={
                                snapVivo
                                    ? 'mede as fichas ativas todo dia'
                                    : 'devia medir todo dia, e não está medindo'
                            }
                        >
                            <Linha
                                rotulo="última medição"
                                valor={`${haQuanto(fichas.ultima_medicao)}, ${quando(fichas.ultima_medicao, dataHora)}`}
                                acento={snapVivo}
                            />
                            <Linha
                                rotulo="medições no total"
                                valor={nf.format(fichas.medicoes)}
                            />
                            <Linha
                                rotulo="fichas recolhidas"
                                valor={`${fichas.coletas} (${nf.format(fichas.pontos_coletados)} pontos)`}
                            />
                            <Linha
                                rotulo="fichas retiradas"
                                valor={nf.format(fichas.removidas)}
                            />
                        </Rotina>

                        <Rotina
                            titulo="O resto"
                            quandoRoda="sem rotina própria: sobe conforme as pessoas usam"
                        >
                            <Linha
                                rotulo="quem segue quem"
                                valor={nf.format(social.seguidas)}
                            />
                            <Linha
                                rotulo="recados em perfil"
                                valor={nf.format(social.recados)}
                            />
                            <Linha
                                rotulo="comentários em faixa"
                                valor={nf.format(social.comentarios)}
                            />
                            <Linha
                                rotulo="favoritas fixadas"
                                valor={nf.format(social.favoritas)}
                            />
                            <Linha
                                rotulo="cache do youtube"
                                valor={nf.format(social.youtube_cache)}
                            />
                        </Rotina>
                    </div>
                </Secao>
            </div>
        </div>
    )
}
