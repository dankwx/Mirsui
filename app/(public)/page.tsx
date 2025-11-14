import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { pillButtonClass } from '@/components/ui/pill-button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Headphones, Award, Play, ArrowRight } from 'lucide-react'
import { Music, Clock, Target } from 'lucide-react'
import GetAuth from '@/components/GetAuth/GetAuth'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getTrendingTracks, getFeaturedTrack } from '@/utils/homepageService'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Mirsui - Você ouviu primeiro',
    description: 'Salve suas músicas favoritas antes delas bombarem. Mostre que você tem ouvido pra música boa.',
}

export default async function HomePage() {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()
    if (data.user) {
        redirect('/feed')
    }

    // Buscar dados reais
    const trendingTracks = await getTrendingTracks(3)
    const featuredTrack = await getFeaturedTrack()

    const valueProps = [
        {
            title: 'Você ouviu primeiro',
            description: 'Descubra sons novos antes de virarem hype. Seu gosto, registrado.',
            icon: Clock,
            accent: 'from-purple-500/30 via-purple-400/10 to-transparent',
        },
        {
            title: 'Mostre seu ouvido',
            description: 'Quanto mais suas músicas bombam, mais você prova que sabe escolher',
            icon: Target,
            accent: 'from-indigo-400/30 via-indigo-300/10 to-transparent',
        },
        {
            title: 'Música de verdade',
            description: 'Sons que você não vai achar em qualquer playlist. Todos os gêneros.',
            icon: Music,
            accent: 'from-pink-400/30 via-pink-300/10 to-transparent',
        },
    ]

    const howItWorksSteps = [
        {
            title: '1. Escuta',
            description: 'Explora as músicas. Acha aquela que você sente que vai bombar. Confia no seu ouvido.',
            icon: Headphones,
            glow: 'from-purple-500/25',
        },
        {
            title: '2. Salva',
            description: 'Clica em claim. Simples assim. Agora ficou registrado que você tava aqui primeiro.',
            icon: Award,
            glow: 'from-blue-500/25',
        },
        {
            title: '3. Comprova',
            description: 'Quando a música explodir, todo mundo vai saber: você ouviu primeiro.',
            icon: TrendingUp,
            glow: 'from-rose-500/25',
        },
    ]

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#05030f] text-slate-100">
            <div className="pointer-events-none absolute -left-36 top-10 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(133,92,255,0.18),_transparent_70%)] blur-3xl" />
            <div className="pointer-events-none absolute -right-52 bottom-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(255,123,187,0.18),_transparent_75%)] blur-3xl" />

            <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#05030f]/75 backdrop-blur-2xl">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
                    <Link href="/" className="flex items-center gap-4">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-indigo-500 text-white shadow-[0_18px_40px_rgba(132,94,255,0.45)]">
                            <Music className="h-5 w-5" />
                        </span>
                        <span className="flex flex-col leading-tight">
                            <span className="text-xl font-semibold tracking-tight text-white">mirsui</span>
                            <span className="text-[11px] uppercase tracking-[0.4em] text-white/45">Music Discovery</span>
                        </span>
                    </Link>

                    <div className="hidden items-center gap-6 text-sm font-semibold uppercase tracking-[0.35em] text-white/50 md:flex">
                        <Link href="/how-it-works" className="transition hover:text-white">
                            Como funciona
                        </Link>
                        <Link href="#discover" className="transition hover:text-white">
                            Explorar
                        </Link>
                        <Link href="#about" className="transition hover:text-white">
                            Sobre
                        </Link>
                    </div>

                    <div className="flex items-center">
                        <GetAuth />
                    </div>
                </div>
            </nav>

            <main className="relative mx-auto flex max-w-6xl flex-col gap-24 px-6 pb-24 pt-20 lg:px-10">
                <section className="relative overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.03] px-8 py-16 text-center shadow-[0_35px_80px_rgba(8,4,20,0.45)] sm:px-14">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(157,124,255,0.22),_transparent_70%)]" />
                    <div className="relative space-y-10">
                        <h1 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">
                            Você ouviu primeiro.
                            <span className="block text-purple-200">E tem como provar.</span>
                        </h1>
                        <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
                            Salve suas músicas favoritas antes delas bombarem. Quando todo mundo descobrir, você já vai ter seu registro.
                        </p>
                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Button asChild className={pillButtonClass('primary')}>
                                <Link href="/feed">
                                    <span>Explorar músicas</span>
                                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                                </Link>
                            </Button>
                            <Button asChild className={pillButtonClass('ghost')}>
                                <Link href="/how-it-works">Como funciona</Link>
                            </Button>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 md:grid-cols-3">
                    {valueProps.map(({ title, description, icon: Icon, accent }) => (
                        <article
                            key={title}
                            className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_20px_55px_rgba(8,4,20,0.4)] transition hover:border-white/25 hover:bg-white/[0.08]"
                        >
                            <div className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${accent} to-transparent blur-2xl`} />
                            <div className="relative flex flex-col gap-4 text-left">
                                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] text-white/80">
                                    <Icon className="h-6 w-6" />
                                </span>
                                <h3 className="text-lg font-semibold text-white">{title}</h3>
                                <p className="text-sm leading-relaxed text-white/65">{description}</p>
                            </div>
                        </article>
                    ))}
                </section>

                <section id="discover" className="space-y-12">
                    <header className="text-center">
                        <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                            Músicas pra você salvar agora
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-sm text-white/65 md:text-base">
                            Essas estão começando a crescer. Salva antes que fique mainstream.
                        </p>
                    </header>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {trendingTracks.length > 0 ? (
                            trendingTracks.map((track, index) => (
                                <article
                                    key={track.id}
                                    className="group relative flex flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] shadow-[0_20px_55px_rgba(8,4,20,0.45)] transition hover:border-white/25 hover:bg-white/[0.08]"
                                >
                                    <div className="relative aspect-square overflow-hidden">
                                        <Image
                                            src={track.track_thumbnail || '/placeholder.svg?height=300&width=300'}
                                            alt={`Capa de ${track.track_title}`}
                                            width={320}
                                            height={320}
                                            className="h-full w-full object-cover"
                                        />
                                        <Badge className={`absolute left-5 top-5 rounded-full border border-white/20 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-800 ${
                                            index === 0
                                                ? 'shadow-[0_10px_30px_rgba(245,196,94,0.4)]'
                                                : index === 1
                                                    ? 'shadow-[0_10px_30px_rgba(74,222,128,0.35)]'
                                                    : 'shadow-[0_10px_30px_rgba(192,132,252,0.4)]'
                                        }`}>
                                            {index === 0 ? 'Em Alta' : index === 1 ? 'Crescendo' : 'Popular'}
                                        </Badge>
                                    </div>
                                    <div className="flex flex-1 flex-col gap-6 p-6">
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-semibold tracking-tight text-white">
                                                {track.track_title}
                                            </h3>
                                            <p className="text-sm text-white/60">{track.artist_name}</p>
                                            <p className="text-xs uppercase tracking-[0.35em] text-white/40">
                                                {track.genre} • {track.year}
                                            </p>
                                        </div>
                                        <div className="mt-auto flex items-center justify-between text-sm text-white/65">
                                            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1">
                                                <TrendingUp className="h-4 w-4 text-purple-300" />
                                                {track.total_claims} claims
                                            </span>
                                            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1">
                                                <Award className="h-4 w-4 text-pink-300" />
                                                #{track.position}
                                            </span>
                                        </div>
                                        <Button
                                            asChild
                                            className={pillButtonClass('ghost', 'sm')}
                                        >
                                            <Link href={`/track/${track.track_url?.split('/').pop() || track.track_title}`}>
                                                Ver track
                                            </Link>
                                        </Button>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <>
                                {[
                                    {
                                        title: 'Sonhos da Meia-Noite',
                                        artist: 'Luna Nova',
                                        sub: 'Indie Pop • 2024',
                                        badge: 'Em Alta',
                                    },
                                    {
                                        title: 'Alma Elétrica',
                                        artist: 'Neon Pulse',
                                        sub: 'Eletrônica • 2024',
                                        badge: 'Crescendo',
                                    },
                                    {
                                        title: 'Boulevard do Pôr do Sol',
                                        artist: 'Coastal Waves',
                                        sub: 'Alternativo • 2024',
                                        badge: 'Popular',
                                    },
                                ].map((fallback) => (
                                    <article
                                        key={fallback.title}
                                        className="relative flex flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] p-6 text-white/70 shadow-[0_20px_55px_rgba(8,4,20,0.45)]"
                                    >
                                        <div className="mb-6 flex h-40 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] text-white/30">
                                            <Play className="h-8 w-8" />
                                        </div>
                                        <Badge className="mb-4 w-fit rounded-full border border-white/20 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-800">
                                            {fallback.badge}
                                        </Badge>
                                        <h3 className="text-xl font-semibold text-white">{fallback.title}</h3>
                                        <p className="text-sm text-white/60">{fallback.artist}</p>
                                        <p className="text-xs uppercase tracking-[0.35em] text-white/40">{fallback.sub}</p>
                                        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/60">
                                            <TrendingUp className="h-4 w-4 text-purple-200" />
                                            Disponível
                                        </div>
                                    </article>
                                ))}
                            </>
                        )}
                    </div>

                    <div className="text-center">
                        <Button asChild className={pillButtonClass('secondary')}>
                            <Link href="/feed">
                                <span>Ver mais</span>
                                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </div>
                </section>

                <section className="relative overflow-hidden rounded-[38px] border border-white/10 bg-white/[0.03] p-8 shadow-[0_28px_70px_rgba(8,4,20,0.5)] lg:p-12">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_left,_rgba(56,189,248,0.18),_transparent_65%)]" />
                    <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
                        <div className="space-y-5">
                            <Badge className="rounded-full border border-white/15 bg-white/85 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-800">
                                Track em Destaque
                            </Badge>
                            {featuredTrack ? (
                                <>
                                    <h2 className="text-3xl font-semibold text-white md:text-4xl">
                                        {featuredTrack.track_title}
                                    </h2>
                                    <h3 className="text-lg text-white/70">
                                        {featuredTrack.artist_name}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-white/65">
                                        A galera tá começando a pegar essa. Tem aquela vibe que pode viralizar do nada. Vale a pena salvar antes que todo mundo descubra.
                                    </p>
                                    <Button
                                        asChild
                                        className={pillButtonClass('contrast', 'sm')}
                                    >
                                        <Link href={`/track/${featuredTrack.track_url?.split('/').pop() || featuredTrack.track_title}`}>
                                            <Award className="h-3.5 w-3.5 text-purple-600" />
                                            Ver detalhes
                                        </Link>
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-3xl font-semibold text-white md:text-4xl">
                                        Ondas Cósmicas
                                    </h2>
                                    <h3 className="text-lg text-white/70">
                                        por Stellar Dreams
                                    </h3>
                                    <p className="text-sm leading-relaxed text-white/65">
                                        Esta track etérea combina sintetizadores sonhadores com vocais cativantes, criando uma experiência auditiva de outro mundo. Com seu som único e buzz crescente, tem todos os elementos para se tornar a próxima sensação viral.
                                    </p>
                                    <span className={pillButtonClass('contrast', 'sm')}>
                                        <Award className="h-3.5 w-3.5 text-purple-600" />
                                        Reivindicar track
                                    </span>
                                </>
                            )}
                        </div>
                        <div className="order-first overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_18px_55px_rgba(8,4,20,0.45)] lg:order-last">
                            <Image
                                src={featuredTrack?.track_thumbnail || '/placeholder.svg?height=500&width=500'}
                                alt={featuredTrack ? `Capa de ${featuredTrack.track_title}` : 'Featured track artwork'}
                                width={500}
                                height={500}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>
                </section>

                <section id="how-it-works" className="space-y-12">
                    <header className="text-center">
                        <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                            Como funciona
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-sm text-white/65 md:text-base">
                            É simples. Você descobre, salva e comprova.
                        </p>
                    </header>
                    <div className="grid gap-6 md:grid-cols-3">
                        {howItWorksSteps.map(({ title, description, icon: Icon, glow }) => (
                            <article
                                key={title}
                                className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center shadow-[0_24px_60px_rgba(8,4,20,0.45)]"
                            >
                                <div className={`pointer-events-none absolute -top-12 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-gradient-to-br ${glow} to-transparent blur-2xl`} />
                                <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/80">
                                    <Icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">{title}</h3>
                                <p className="mt-3 text-sm text-white/65">{description}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section id="about" className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.04] px-8 py-16 text-center shadow-[0_30px_70px_rgba(8,4,20,0.5)]">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(192,132,252,0.18),_transparent_70%)]" />
                    <div className="relative space-y-6">
                        <h2 className="text-3xl font-semibold text-white md:text-4xl">
                            Pra quem tem ouvido
                        </h2>
                        <p className="text-base leading-relaxed text-white/70 md:text-lg">
                            Mirsui é pra quem realmente ouve música. Não é playlist do Spotify, não é algoritmo. É você explorando, descobrindo e salvando o que ninguém ainda prestou atenção.
                        </p>
                        <p className="text-sm leading-relaxed text-white/70 md:text-base">
                            Indie, eletrônica, rap, whatever. Se você sente que uma música vai bombar, você salva. E quando ela explodir, você tem a prova que tava lá desde o início.
                        </p>
                        <Button asChild className={pillButtonClass('primary')}>
                            <Link href="/feed">
                                <span>Começar</span>
                                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </div>
                </section>

                <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.04] px-8 py-16 text-center shadow-[0_32px_75px_rgba(8,4,20,0.55)]">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(125,211,252,0.18),_transparent_70%)]" />
                    <div className="relative space-y-8">
                        <h2 className="text-3xl font-semibold text-white md:text-4xl">
                            Bora descobrir música?
                        </h2>
                        <p className="text-base leading-relaxed text-white/70 md:text-lg">
                            Entre, explore e salve suas descobertas. Mostre que você tem ouvido pra música boa.
                        </p>
                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Button asChild className={pillButtonClass('primary')}>
                                <Link href="/register">
                                    <span>Entrar grátis</span>
                                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                                </Link>
                            </Button>
                            <Button type="button" className={pillButtonClass('ghost')}>
                                Saber mais
                            </Button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}
