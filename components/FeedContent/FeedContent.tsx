'use client'

import React, { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowUpRight, Check, Loader2, Plus, RotateCw } from 'lucide-react'
import { FeedPostWithInteractions } from '@/utils/feedService.backend'
import { RecentClaim } from '@/utils/feedService.backend'
import { formatTimestamp } from '@/utils/feedHelpers'
import RecentClaims from '@/components/RecentClaims/RecentClaims'
import { createClient } from '@/utils/supabase/client'
import { saveTrack } from '@/utils/trackActions'

interface FeedContentProps {
    initialPosts: FeedPostWithInteractions[]
    recentClaims: RecentClaim[]
    currentUserId: string | null
    /** a busca no servidor falhou — diferente de "não veio nada" */
    loadFailed?: boolean
    /** idem, para a lista do "subindo na cena" (chamada separada) */
    recentClaimsFailed?: boolean
}

type FeedPost = FeedPostWithInteractions

/** o que cada card precisa saber sobre salvar, resolvido lá em cima por faixa */
interface SaveState {
    saved: boolean
    savers: number
    busy: boolean
    error: string | null
    canSave: boolean
    onSave: () => void
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'

/* ---------- helpers de apresentação (direção Acervo) ---------- */
const TONES = [
    '#241f1a', '#1c2320', '#27201f', '#1b2026', '#231d27', '#202420',
    '#2a201b', '#1a2326', '#25211c', '#1d2126', '#26211f', '#1f231d',
]
function tone(seed: string) {
    let h = 0
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
    return TONES[h % TONES.length]
}
function initials(name: string) {
    return (name || '')
        .split(' ')
        .map((n) => n[0])
        .filter(Boolean)
        .join('')
        .toUpperCase()
        .slice(0, 2)
}
function ordLabel(n: number | null | undefined) {
    if (!n || n < 1) return null
    return `${n}ª`
}
/**
 * `formatTimestamp` devolve tempo relativo até 7 dias ("3d") e data absoluta
 * depois ("14/11"). O "há" entrava nos dois casos, então o feed inteiro dizia
 * "salvou há 14/11". Data absoluta pede "em".
 */
function timeAgo(ts: string | null) {
    if (!ts) return ''
    const v = formatTimestamp(ts)
    if (v === 'agora mesmo') return v
    return /^\d{2}\/\d{2}$/.test(v) ? `em ${v}` : `há ${v}`
}
function trackHref(post: { track_url?: string | null; track_title: string }) {
    return `/track/${post.track_url?.split('/').pop() || post.track_title}`
}
function whoOf(post: FeedPost, isOwn: boolean) {
    return isOwn ? 'Você' : post.display_name || post.username
}
/**
 * Só o primeiro leva acento, igual ao perfil e ao acervo.
 *
 * Antes era `position <= 10`, e vestia um selo "cedo" em lima. Com o app novo
 * quase toda faixa está no top 10, então o selo aparecia em toda linha do feed
 * — e vinha ao lado de "1ª a salvar", que já diz a mesma coisa com mais
 * precisão. Dois selos em lima por linha, dizendo o mesmo, é o que fez o
 * acento parar de significar alguma coisa.
 */
const chegouPrimeiro = (post: FeedPost) => post.position === 1

/* ---------- Botão de salvar ----------
   Salvar é mão única: não existe "dessalvar", porque tirar um salvamento
   abriria buraco na numeração de quem veio depois. Então o estado salvo não é
   um botão desabilitado (que parece quebrado) e sim um selo — a ação acabou.

   Faixa sem track_uri (dado antigo) não tem como ser salva: o backend precisa
   dela para calcular a posição. Nesse caso não mostramos botão nenhum, em vez
   de oferecer uma ação que vai falhar. */
function SaveButton({ state, size }: { state: SaveState; size: 'drop' | 'item' }) {
    const drop = size === 'drop'
    const base = drop
        ? 'inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14.5px] font-bold'
        : 'inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-[7px] text-[12.5px] font-semibold'
    const icon = drop ? 'h-4 w-4' : 'h-3.5 w-3.5'

    if (!state.canSave && !state.saved) return null

    // O selo recua de propósito: só o check leva o acento. Em lima cheia ele
    // competiria com o badge "cedo" na mesma linha, e o feed inteiro viraria
    // destaque conforme o acervo cresce.
    //
    // A ação "Salvar" é creme, e o check de já-salva é lima: a ação se repete
    // em toda linha do feed, a confirmação só aparece no que é seu. O que se
    // repete não pode ser o que brilha.
    if (state.saved) {
        return (
            <span
                className={`${base} ${drop ? '' : 'ml-auto'} border border-mir-line2 text-mir-text2`}
            >
                <Check className={`${icon} text-mir-acc`} />
                {drop ? 'Salva no seu acervo' : 'Salva'}
            </span>
        )
    }

    return (
        <span className={drop ? 'inline-flex flex-col gap-1.5' : 'ml-auto inline-flex flex-col items-end gap-1'}>
            <button
                onClick={state.onSave}
                disabled={state.busy}
                className={`${base} bg-mir-text text-mir-bg transition hover:brightness-110 active:translate-y-px disabled:opacity-60`}
            >
                {state.busy ? (
                    <Loader2 className={`${icon} animate-spin`} />
                ) : (
                    <Plus className={icon} />
                )}
                {state.busy ? 'Salvando…' : 'Salvar'}
            </button>
            {state.error && (
                <span className="font-mono text-[11px] text-mir-text3">{state.error}</span>
            )}
        </span>
    )
}

/* ---------- Capa (as iniciais ficam por baixo, como fallback) ---------- */
function Cover({
    seed,
    thumbnail,
    size,
    className,
    iniClassName,
    priority,
}: {
    seed: string
    thumbnail?: string | null
    size: number
    className: string
    iniClassName: string
    priority?: boolean
}) {
    return (
        <div
            className={`mir-cover ${className} flex-none`}
            style={{ ['--tone' as string]: tone(seed) }}
        >
            <span
                aria-hidden="true"
                className={`absolute inset-0 grid select-none place-items-center font-extrabold leading-none tracking-[-0.05em] text-mir-text/15 ${iniClassName}`}
            >
                {initials(seed)}
            </span>
            {thumbnail && (
                <Image
                    src={thumbnail}
                    alt=""
                    width={size}
                    height={size}
                    priority={priority}
                    className="absolute inset-0 h-full w-full object-cover"
                />
            )}
        </div>
    )
}

/* ---------- Ticker ao vivo ---------- */
function Ticker({ posts, loadFailed = false }: { posts: FeedPost[]; loadFailed?: boolean }) {
    const segments = useMemo(() => {
        const items = posts
            .slice(0, 8)
            // sempre o nome, mesmo sendo você: o ticker é o mural da cena, não
            // uma frase dirigida a quem está lendo
            .map((p) => `${whoOf(p, false).toUpperCase()} SALVOU ${p.track_title.toUpperCase()}`)
        if (items.length > 0) return items
        // sem dados por falha, a cena pode estar cheia — dizer que está em
        // silêncio seria afirmar o que a gente não sabe
        return loadFailed
            ? ['SEM SINAL DA CENA AGORA']
            : ['A CENA ESTÁ EM SILÊNCIO. SEJA O PRIMEIRO A SALVAR']
    }, [posts, loadFailed])

    // Barra escura, não lima cheia. Uma faixa lima de ponta a ponta no topo era
    // o elemento mais alto da página inteira, e o que ela carrega é fofoca da
    // cena — não é a conquista de ninguém. Só o "AO VIVO" fica aceso.
    const line = (
        <span className="inline-flex shrink-0 items-center font-mono text-[11px] font-bold uppercase tracking-[0.14em]">
            <span className="px-4 text-mir-acc">● AO VIVO</span>
            {segments.map((s, i) => (
                <span key={i} className="inline-flex items-center">
                    <span className="px-3 text-mir-text3">✦</span>
                    <span className="whitespace-nowrap">{s}</span>
                </span>
            ))}
            <span className="px-3 text-mir-text3">✦</span>
        </span>
    )

    return (
        <div className="overflow-hidden border-b border-mir-line bg-mir-surface text-mir-text2">
            <div className="flex w-max animate-[mir-ticker_38s_linear_infinite] py-[7px] will-change-transform hover:[animation-play-state:paused] motion-reduce:animate-none">
                {line}
                {line}
            </div>
        </div>
    )
}

/* ---------- Nota que a pessoa escreveu ao salvar ---------- */
function ClaimNote({ text, className = '' }: { text: string; className?: string }) {
    return (
        // Laranja: alguém escreveu isso com a própria mão. É a camada humana,
        // igual a recado e a seguir.
        <p
            className={`border-l-2 border-mir-warm/50 pl-3 text-[14px] italic leading-[1.5] ${className}`}
        >
            {text}
        </p>
    )
}

/* ---------- O drop de hoje (faixa em destaque) ---------- */
function DropCard({ post, isOwn, save }: { post: FeedPost; isOwn: boolean; save: SaveState }) {
    const who = whoOf(post, isOwn)
    const ord = ordLabel(post.position)

    return (
        <section className="relative overflow-hidden rounded-[18px] border border-mir-line2 bg-mir-surface p-6 sm:p-8">
            <span
                aria-hidden="true"
                className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-mir-acc/[0.07] blur-3xl"
            />

            <div className="relative flex flex-wrap items-start gap-6 sm:gap-8">
                <Link href={trackHref(post)} className="block flex-none">
                    <Cover
                        seed={post.artist_name}
                        thumbnail={post.track_thumbnail}
                        size={200}
                        priority
                        className="h-[148px] w-[148px] rounded-xl shadow-[0_20px_44px_-20px_rgba(0,0,0,0.7)] transition-transform hover:-translate-y-1 sm:h-[180px] sm:w-[180px]"
                        iniClassName="text-[54px]"
                    />
                </Link>

                <div className="min-w-[260px] flex-1">
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-mir-text3">
                        O drop de hoje
                    </span>

                    <Link href={trackHref(post)} className="mt-3 block w-max max-w-full">
                        <h2 className="text-[clamp(26px,3.2vw,38px)] font-extrabold leading-[1.02] tracking-[-0.035em] text-mir-text underline-offset-[6px] transition hover:underline hover:decoration-mir-line2 hover:decoration-2">
                            {post.track_title}
                        </h2>
                    </Link>
                    <div className="mt-1 font-mono text-[13px] tracking-[0.04em] text-mir-text2">
                        {post.artist_name}
                    </div>

                    {post.claim_message ? (
                        <ClaimNote
                            text={post.claim_message}
                            className="mt-4 max-w-[52ch] text-mir-text2"
                        />
                    ) : (
                        <p className="mt-4 max-w-[52ch] text-[15px] leading-[1.5] text-mir-text2">
                            <b className="font-semibold text-mir-text">{who}</b> achou
                            cedo e salvou {timeAgo(post.claimedat) || 'recentemente'}.
                        </p>
                    )}

                    <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
                        <SaveButton state={save} size="drop" />
                        <span className="font-mono text-[12px] text-mir-text3">
                            {ord ? `${isOwn ? 'Você' : who} foi ${ord} a salvar` : ''}
                            {ord && save.savers > 1 ? ' · ' : ''}
                            {save.savers > 1 ? `${save.savers} já salvaram` : ''}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    )
}

/* ---------- Item do feed ---------- */
function FeedItem({ post, isOwn, save }: { post: FeedPost; isOwn: boolean; save: SaveState }) {
    const primeiro = chegouPrimeiro(post)
    const who = whoOf(post, isOwn)
    const ord = ordLabel(post.position)

    // Espaçamento apertado de propósito: com py-[22px] e capa de 88px cabiam
    // três itens numa tela de 1400px, e vinte achados viravam sete telas de
    // rolagem. Letterboxd e Last.fm põem de oito a doze.
    return (
        <article className="grid grid-cols-[64px_1fr] gap-3.5 border-t border-mir-line py-[15px] sm:grid-cols-[76px_1fr] sm:gap-4">
            <Link href={trackHref(post)} className="block">
                <Cover
                    seed={post.artist_name}
                    thumbnail={post.track_thumbnail}
                    size={96}
                    className="h-16 w-16 rounded-lg sm:h-[76px] sm:w-[76px]"
                    iniClassName="text-[22px] sm:text-[26px]"
                />
            </Link>

            <div className="flex min-w-0 flex-col">
                <div className="flex flex-wrap items-center gap-2.5 text-[13px] text-mir-text2">
                    <Link
                        href={`/user/${post.username}`}
                        className="flex items-center gap-2 transition-colors hover:text-mir-text"
                    >
                        <span className="flex h-6 w-6 flex-none items-center justify-center overflow-hidden rounded-full bg-[radial-gradient(120%_120%_at_30%_22%,#322c22,#1b1813)] text-[10px] font-extrabold tracking-[-0.03em] text-mir-text">
                            {post.avatar_url ? (
                                // <img> cru de propósito: avatar de OAuth vem de
                                // domínios variados (googleusercontent etc.) que não
                                // estão liberados em next.config, e o otimizador
                                // quebraria em runtime. São 24px, não vale o risco.
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={post.avatar_url}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                (who || 'U').charAt(0).toUpperCase()
                            )}
                        </span>
                        <span>
                            <b className="font-semibold text-mir-text">{who}</b> salvou
                        </span>
                    </Link>
                    <span className="text-mir-text3">·</span>
                    <span className="font-mono text-[11px] text-mir-text3">
                        {timeAgo(post.claimedat)}
                    </span>
                </div>

                <Link href={trackHref(post)} className="mt-1.5 block w-max max-w-full">
                    <h3 className="truncate text-[18px] font-bold leading-[1.15] tracking-[-0.015em] text-mir-text underline-offset-4 transition hover:underline hover:decoration-mir-line2 hover:decoration-2">
                        {post.track_title}
                    </h3>
                </Link>
                <div className="mt-0.5 truncate text-[13.5px] text-mir-text2">
                    {post.artist_name}
                </div>

                {post.claim_message && (
                    <ClaimNote text={post.claim_message} className="mt-2 text-mir-text2" />
                )}

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span className="font-mono text-[11px] tracking-[0.03em] text-mir-text3">
                        {ord && (
                            <span
                                className={
                                    primeiro
                                        ? 'font-semibold tabular-nums text-mir-acc'
                                        : 'font-semibold tabular-nums text-mir-text2'
                                }
                            >
                                {ord}{' '}
                            </span>
                        )}
                        {ord ? 'a salvar' : ''}
                        {ord && save.savers > 1 ? ' · ' : ''}
                        {save.savers > 1 ? `${save.savers} já salvaram` : ''}
                    </span>

                    <SaveButton state={save} size="item" />
                </div>
            </div>
        </article>
    )
}

/* ---------- Entrada da Pilha ----------
   Faixa larga, uma só, entre o cabeçalho e o feed. É a porta da superfície
   de descoberta, então ganha tratamento de destaque: prévia das capas
   inclinadas à esquerda, que se abrem no hover, e um CTA pulsando. */
const TEASER_ROT = ['-9deg', '6deg', '-4deg', '10deg', '-6deg']

function PileBanner({ claims }: { claims: RecentClaim[] }) {
    const teasers = claims.slice(0, 5)
    const slots = teasers.length > 0 ? teasers : Array.from({ length: 4 })

    return (
        <Link
            href="/pilha"
            className="pile-band group relative mb-9 block overflow-hidden rounded-[18px] border border-mir-line2 bg-mir-bg transition-colors hover:border-mir-text3"
        >
            <span
                aria-hidden="true"
                className="pointer-events-none absolute -left-16 top-1/2 h-56 w-72 -translate-y-1/2 rounded-full bg-mir-acc/[0.09] blur-3xl"
            />

            <div className="relative flex flex-wrap items-center gap-x-7 gap-y-5 px-6 py-5 sm:px-8">
                <div className="relative hidden h-[84px] w-[214px] flex-none sm:block">
                    {slots.map((c: any, i) => (
                        <span
                            key={i}
                            // sem .mir-cover aqui de propósito: aquela classe força
                            // position:relative e tiraria as capas do posicionamento
                            // absoluto que monta o leque
                            className="pile-teaser absolute top-[5px] block h-[74px] w-[74px] overflow-hidden rounded-[3px] shadow-[0_10px_24px_-10px_rgba(0,0,0,0.9)]"
                            style={{
                                left: i * 35,
                                zIndex: i,
                                ['--tr' as string]: TEASER_ROT[i % 5],
                                background: tone(c?.artist_name || `p${i}`),
                            }}
                        >
                            <span className="absolute inset-0 grid select-none place-items-center text-[19px] font-extrabold tracking-[-0.05em] text-mir-text/15">
                                {initials(c?.artist_name || 'Mirsui')}
                            </span>
                            {c?.track_thumbnail && (
                                <Image
                                    src={c.track_thumbnail}
                                    alt=""
                                    width={96}
                                    height={96}
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            )}
                        </span>
                    ))}
                </div>

                <div className="min-w-[220px] flex-1">
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-mir-text3">
                        A pilha
                    </span>
                    <p className="mt-2 text-[clamp(19px,2.2vw,25px)] font-extrabold leading-[1.05] tracking-[-0.035em] text-mir-text">
                        Tudo que a cena já salvou, despejado num lugar só.
                    </p>
                    <p className="mt-1.5 font-mono text-[11.5px] leading-[1.5] tracking-[0.03em] text-mir-text3">
                        Capa grande, muita gente. Capa pequena, quase ninguém — ainda.
                    </p>
                </div>

                {/* Sem o pulso infinito que estava aqui: a faixa já tem a
                    animação das capas se abrindo no hover, e duas fontes de
                    movimento no mesmo alvo brigam entre si. */}
                <span className="inline-flex flex-none items-center gap-2 rounded-full bg-mir-text px-6 py-3 text-[14px] font-bold text-mir-bg transition group-hover:brightness-110">
                    Revirar a pilha
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
            </div>
        </Link>
    )
}

/* ---------- Cartão Faro (rail, destaque lima) ----------
   O único bloco de lima cheia da página, e é de propósito. O ticker, a chamada
   da pilha e a aba ativa saíram do lima justamente para que sobrasse um lugar
   onde ele significasse alguma coisa. A mensagem aqui é literalmente a promessa
   do produto ("salve o que você achou primeiro"), que é o assunto do lima. */
function FaroCard() {
    return (
        <Link
            href="/claimtrack"
            className="group block rounded-[14px] bg-mir-acc p-[22px] text-mir-on-acc transition hover:brightness-[1.04]"
        >
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em]">
                Seu turno
            </span>
            <p className="mt-3 text-[22px] font-extrabold leading-[1.04] tracking-[-0.03em]">
                Salve o que você achou primeiro.
            </p>
            <p className="mt-2 font-mono text-[11.5px] leading-[1.5] text-mir-on-acc/70">
                Seu nome fica no histórico da faixa. Ouça cedo, prove o faro.
            </p>
            <span className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-mir-bg text-[13px] font-bold text-mir-acc">
                Salvar agora
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
        </Link>
    )
}

/* ---------- Estado vazio ---------- */
function EmptyState({ title, body }: { title: string; body: string }) {
    return (
        <div className="mt-6 rounded-[13px] border border-dashed border-mir-line2 px-8 py-14 text-center">
            <p className="text-[17px] font-bold tracking-[-0.02em] text-mir-text">
                {title}
            </p>
            <p className="mx-auto mt-2 max-w-[42ch] text-[14px] leading-[1.55] text-mir-text2">
                {body}
            </p>
        </div>
    )
}

/* ---------- Estado de erro ----------
   Separado do EmptyState de propósito: antes, falha de rede ou 429 do backend
   caía no vazio e a tela dizia que a cena estava parada. */
function ErrorState({ onRetry, retrying }: { onRetry: () => void; retrying: boolean }) {
    return (
        <div className="mt-6 rounded-[13px] border border-dashed border-mir-line2 px-8 py-14 text-center">
            <p className="text-[17px] font-bold tracking-[-0.02em] text-mir-text">
                Não conseguimos carregar a cena
            </p>
            <p className="mx-auto mt-2 max-w-[42ch] text-[14px] leading-[1.55] text-mir-text2">
                O problema é do nosso lado, não seu. Nada foi perdido: os achados
                continuam salvos.
            </p>
            <button
                onClick={onRetry}
                disabled={retrying}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-mir-line2 px-6 py-2.5 font-mono text-[12px] uppercase tracking-[0.1em] text-mir-text2 transition hover:border-mir-text3 hover:bg-mir-fill1 hover:text-mir-text disabled:opacity-50"
            >
                {retrying ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                    <RotateCw className="h-3.5 w-3.5" />
                )}
                {retrying ? 'Tentando…' : 'Tentar de novo'}
            </button>
        </div>
    )
}

/* ---------- App ---------- */
export default function FeedContent({ initialPosts, recentClaims, currentUserId, loadFailed = false, recentClaimsFailed = false }: FeedContentProps) {
    const router = useRouter()
    const [retrying, startRetry] = useTransition()
    const retry = () => startRetry(() => router.refresh())
    const [posts, setPosts] = useState(initialPosts)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(initialPosts.length === 5)
    const [loadMoreFailed, setLoadMoreFailed] = useState(false)
    const [tab, setTab] = useState<'cena' | 'seguindo'>('cena')

    const isAuthenticated = !!currentUserId

    /* ---------- salvar ----------
       O estado mora aqui, e não em cada card, porque salvar é por MÚSICA
       (track_uri) e não por achado (id da linha). A mesma faixa pode aparecer
       duas vezes no feed, salva por pessoas diferentes; salvar numa tem que
       marcar a outra na hora, senão a tela volta a se contradizer.

       `savedNow` guarda só o que foi salvo nesta sessão — o que já estava
       salvo vem em `saved_by_me` de cada post. Assim não há estado inicial
       para sincronizar quando chegam posts novos do "carregar mais". */
    const [savedNow, setSavedNow] = useState<Set<string>>(() => new Set())
    const [savingUri, setSavingUri] = useState<string | null>(null)
    const [saveError, setSaveError] = useState<{ uri: string; message: string } | null>(null)

    const buildSaveState = (post: FeedPost): SaveState => {
        const uri = post.track_uri
        const savedInSession = !!uri && savedNow.has(uri)
        const saved = post.saved_by_me || savedInSession
        return {
            saved,
            // o contador do servidor não conhece o que acabei de salvar agora
            savers: post.savers_count + (savedInSession && !post.saved_by_me ? 1 : 0),
            busy: !!uri && savingUri === uri,
            error: saveError?.uri === uri ? saveError.message : null,
            canSave: isAuthenticated && !!uri,
            onSave: () => save(post),
        }
    }

    const save = async (post: FeedPost) => {
        const uri = post.track_uri
        if (!uri || !isAuthenticated || savingUri || post.saved_by_me || savedNow.has(uri)) return

        setSavingUri(uri)
        setSaveError(null)
        // otimista: o botão vira selo antes da ida ao servidor
        setSavedNow((current) => new Set(current).add(uri))

        const result = await saveTrack({
            trackUri: uri,
            trackName: post.track_title,
            artistName: post.artist_name,
            albumName: post.album_name,
            spotifyUrl: post.track_url,
            trackThumbnail: post.track_thumbnail || '',
            popularity: post.popularity,
        })

        if (!result.success) {
            setSavedNow((current) => {
                const next = new Set(current)
                next.delete(uri)
                return next
            })
            setSaveError({ uri, message: result.message })
        }
        setSavingUri(null)
    }

    // Sem dados de "quem você segue" nesta carga; a aba fica preparada
    // para quando essa relação for fornecida pelo backend.
    const onCena = tab === 'cena'
    const drop = onCena ? posts[0] : undefined
    const feed = useMemo(() => (onCena ? posts.slice(1) : []), [onCena, posts])

    const loadMorePosts = async () => {
        setLoading(true)
        setLoadMoreFailed(false)
        try {
            // O token vai junto porque é ele que faz o backend devolver
            // `saved_by_me`. Sem isso, as faixas carregadas aqui voltariam a
            // oferecer "Salvar" para quem já salvou — exatamente o que esta
            // tela deixou de fazer.
            const headers: HeadersInit = { 'Content-Type': 'application/json' }
            try {
                const supabase = createClient()
                const { data: { session } } = await supabase.auth.getSession()
                if (session?.access_token) {
                    headers['Authorization'] = `Bearer ${session.access_token}`
                }
            } catch (error) {
                console.error('Erro ao obter sessão:', error)
            }

            const response = await fetch(
                `${BACKEND_URL}/feed?limit=5&offset=${posts.length}`,
                { headers }
            )
            if (!response.ok) {
                // sem isto o clique não fazia nada visível e parecia botão quebrado
                console.error('Erro ao carregar mais achados:', response.status)
                setLoadMoreFailed(true)
                setLoading(false)
                return
            }
            const data = await response.json()
            const newPosts: FeedPost[] = data.posts || []
            if (newPosts.length === 0) {
                setHasMore(false)
                setLoading(false)
                return
            }

            // append puro: a lista só cresce para baixo, então o scroll do
            // usuário não se move e não há posição para restaurar
            setPosts((current) => [...current, ...newPosts])
            if (newPosts.length < 5) setHasMore(false)
        } catch (error) {
            console.error('Erro ao carregar mais achados:', error)
            setLoadMoreFailed(true)
        } finally {
            setLoading(false)
        }
    }

    const hasAny = posts.length > 0

    return (
        <div className="w-full">
            <Ticker posts={posts} loadFailed={loadFailed} />

            <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-10">
                {/* Cabeçalho: título e abas na mesma faixa, para o feed começar cedo */}
                <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5 pb-7 pt-10 sm:pt-12">
                    <div>
                        <span className="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-mir-acc">
                            <span className="inline-block h-2 w-2 rounded-full bg-mir-acc animate-[mir-pulse_2s_infinite] motion-reduce:animate-none" />
                            A cena, ao vivo
                        </span>
                        <h1 className="mt-3 text-[clamp(28px,3.4vw,40px)] font-extrabold leading-[1.02] tracking-[-0.04em] text-mir-text">
                            Quem ouviu primeiro o quê.
                        </h1>
                    </div>

                    <div className="flex w-max gap-1 rounded-full border border-mir-line bg-mir-fill1 p-[3px]">
                        {([
                            ['cena', 'Da cena'],
                            ['seguindo', 'De quem você segue'],
                        ] as const).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setTab(key)}
                                className={`whitespace-nowrap rounded-full px-[18px] py-2 text-[13px] font-semibold transition-colors ${
                                    tab === key
                                        ? 'bg-mir-text text-mir-bg'
                                        : 'text-mir-text2 hover:text-mir-text'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </header>

                <PileBanner claims={recentClaims} />

                <div className="grid grid-cols-1 items-start gap-[34px] pb-[70px] lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-[46px]">
                    <section className="flex flex-col">
                        {drop && (
                            <div className="mb-9">
                                <DropCard
                                    post={drop}
                                    isOwn={drop.user_id === currentUserId}
                                    save={buildSaveState(drop)}
                                />
                            </div>
                        )}

                        <div className="flex flex-wrap items-baseline justify-between gap-2 pb-1">
                            <h2 className="text-[22px] font-extrabold tracking-[-0.03em] text-mir-text">
                                Achados da cena
                            </h2>
                            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mir-text3">
                                {onCena ? 'A cena inteira' : 'Quem você segue'}
                            </span>
                        </div>

                        {loadFailed && posts.length === 0 ? (
                            <ErrorState onRetry={retry} retrying={retrying} />
                        ) : feed.length > 0 ? (
                            <>
                                {feed.map((post) => (
                                    <FeedItem
                                        key={post.id}
                                        post={post}
                                        isOwn={post.user_id === currentUserId}
                                        save={buildSaveState(post)}
                                    />
                                ))}

                                {onCena && hasMore && (
                                    <div className="flex flex-col items-center gap-2.5 pt-7">
                                        <button
                                            onClick={loadMorePosts}
                                            disabled={loading}
                                            className="inline-flex items-center gap-2 rounded-full border border-mir-line2 px-7 py-3 font-mono text-[12px] uppercase tracking-[0.1em] text-mir-text2 transition hover:border-mir-text3 hover:bg-mir-fill1 hover:text-mir-text disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Carregando...
                                                </>
                                            ) : loadMoreFailed ? (
                                                <>
                                                    <RotateCw className="h-3.5 w-3.5" />
                                                    Tentar de novo
                                                </>
                                            ) : (
                                                'Carregar mais achados'
                                            )}
                                        </button>
                                        {loadMoreFailed && !loading && (
                                            <p className="font-mono text-[11px] text-mir-text3">
                                                não deu pra buscar agora
                                            </p>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : !onCena ? (
                            <EmptyState
                                title="Você ainda não segue ninguém"
                                body="Quando você seguir outros ouvintes, o que eles salvarem aparece aqui, separado do barulho da cena inteira."
                            />
                        ) : (
                            <EmptyState
                                title={
                                    hasAny
                                        ? 'Por enquanto, só o drop de hoje'
                                        : 'O radar ainda está em silêncio'
                                }
                                body={
                                    hasAny
                                        ? 'A cena está quieta agora. Volte mais tarde para os próximos achados.'
                                        : 'Ninguém salvou nada ainda. Seja o primeiro e seu nome abre o histórico da faixa.'
                                }
                            />
                        )}
                    </section>

                    <aside className="flex flex-col gap-[22px] lg:sticky lg:top-[92px]">
                        <RecentClaims claims={recentClaims} loadFailed={recentClaimsFailed} />
                        <FaroCard />
                    </aside>
                </div>
            </div>
        </div>
    )
}
