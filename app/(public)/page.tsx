import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    TrendingUp,
    Headphones,
    Award,
    Play,
    Share2,
    ArrowRight,
} from 'lucide-react'
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
    const supabase = createClient()
    const { data, error } = await supabase.auth.getUser()
    if (data.user) {
        redirect('/feed')
    }

    // Buscar dados reais
    const trendingTracks = await getTrendingTracks(3)
    const featuredTrack = await getFeaturedTrack()

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 border-b border-white/20 bg-white/70 px-4 py-4 backdrop-blur-xl shadow-lg shadow-black/5">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
                            <Music className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">
                                mirsui
                            </h1>
                            <p className="text-xs text-slate-600">
                                Music Discovery
                            </p>
                        </div>
                    </div>

                    <div className="mx-auto max-w-7xl flex gap-6">
                        <Link
                            href="/how-it-works"
                            className="font-medium text-slate-700 hover:text-slate-900 transition-colors"
                        >
                            Como funciona
                        </Link>
                        <Link
                            href="#discover"
                            className="font-medium text-slate-700 hover:text-slate-900 transition-colors"
                        >
                            Explorar
                        </Link>
                        <Link
                            href="#about"
                            className="font-medium text-slate-700 hover:text-slate-900 transition-colors"
                        >
                            Sobre
                        </Link>
                    </div>

                    <div className="flex items-center gap-3">
                        <GetAuth />
                        <Link href="/feed">
                            <Button className="bg-gradient-to-r from-sage-600 to-sage-700 hover:from-sage-700 hover:to-sage-800 text-white shadow-lg shadow-sage-600/30">
                                Entrar
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden px-4 py-20">
                <div className="relative z-10 mx-auto max-w-7xl">
                    <div className="mx-auto max-w-4xl text-center">
                        <h1 className="mb-6 text-5xl font-bold leading-tight text-slate-800 md:text-7xl">
                            Você ouviu primeiro.
                            <span className="text-sage-600 block">
                                E tem como provar.
                            </span>
                        </h1>
                        <p className="mx-auto mb-10 max-w-3xl text-xl leading-relaxed text-slate-600 md:text-2xl">
                            Salve suas músicas favoritas antes delas bombarem.
                            Quando todo mundo descobrir, você já vai ter seu registro.
                        </p>
                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                            <Link href="/feed">
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-sage-600 to-sage-700 hover:from-sage-700 hover:to-sage-800 px-8 py-4 text-lg text-white shadow-2xl shadow-sage-600/40 hover:shadow-3xl hover:shadow-sage-600/60 transition-all duration-300"
                                >
                                    Explorar músicas
                                    <ArrowRight className="ml-2" size={20} />
                                </Button>
                            </Link>
                            <Link href="/how-it-works">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-white/40 bg-white/30 backdrop-blur-xl px-8 py-4 text-lg text-slate-800 hover:bg-white/50 shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    Como funciona
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Background Elements */}
                <div className="absolute inset-0 overflow-hidden opacity-40">
                    <div className="from-sage-200 absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br to-blue-200 blur-3xl"></div>
                    <div className="absolute -left-32 top-1/2 h-96 w-96 rounded-full bg-gradient-to-br from-rose-200 to-orange-200 blur-3xl"></div>
                    <div className="to-sage-200 absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-violet-200 blur-3xl"></div>
                </div>
            </section>

            {/* Value Proposition Section */}
            <section className="px-4 py-16">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        <Card className="border-white/40 bg-gradient-to-br from-sage-500/10 via-white/60 to-sage-400/10 backdrop-blur-xl shadow-xl shadow-sage-500/10 hover:shadow-2xl hover:shadow-sage-500/20 transition-all duration-300">
                            <CardContent className="pt-8 text-center">
                                <div className="bg-gradient-to-br from-sage-500/20 to-sage-600/20 backdrop-blur-md mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-sage-400/30 shadow-lg">
                                    <Clock
                                        className="text-sage-700"
                                        size={32}
                                    />
                                </div>
                                <h3 className="text-sage-900 mb-3 text-xl font-semibold">
                                    Você ouviu primeiro
                                </h3>
                                <p className="text-slate-700 leading-relaxed">
                                    Descubra sons novos antes de virarem hype.
                                    Seu gosto, registrado.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-white/40 bg-gradient-to-br from-blue-500/10 via-white/60 to-blue-400/10 backdrop-blur-xl shadow-xl shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
                            <CardContent className="pt-8 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md border border-blue-400/30 shadow-lg">
                                    <Target
                                        className="text-blue-700"
                                        size={32}
                                    />
                                </div>
                                <h3 className="mb-3 text-xl font-semibold text-blue-900">
                                    Mostre seu ouvido
                                </h3>
                                <p className="leading-relaxed text-slate-700">
                                    Quanto mais suas músicas bombam,
                                    mais você prova que sabe escolher
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-white/40 bg-gradient-to-br from-rose-500/10 via-white/60 to-rose-400/10 backdrop-blur-xl shadow-xl shadow-rose-500/10 hover:shadow-2xl hover:shadow-rose-500/20 transition-all duration-300">
                            <CardContent className="pt-8 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-600/20 backdrop-blur-md border border-rose-400/30 shadow-lg">
                                    <Music
                                        className="text-rose-700"
                                        size={32}
                                    />
                                </div>
                                <h3 className="mb-3 text-xl font-semibold text-rose-900">
                                    Música de verdade
                                </h3>
                                <p className="leading-relaxed text-slate-700">
                                    Sons que você não vai achar em qualquer playlist.
                                    Todos os gêneros.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Trending Section */}
            <section
                id="discover"
                className="relative overflow-hidden bg-gradient-to-b from-slate-50/50 to-white px-4 py-16"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-sage-100/30 via-transparent to-blue-100/30"></div>
                <div className="mx-auto max-w-7xl relative z-10">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
                            Músicas pra você salvar agora
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-slate-700">
                            Essas estão começando a crescer. Salva antes que fique mainstream.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {trendingTracks.length > 0 ? (
                            trendingTracks.map((track, index) => (
                                <Card key={track.id} className="group border-white/60 bg-white/50 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:bg-white/70 hover:scale-[1.02]">
                                    <CardHeader className="relative aspect-square bg-gradient-to-br from-sage-100 to-sage-200 p-0">
                                        <Image
                                            src={track.track_thumbnail || "/placeholder.svg?height=300&width=300"}
                                            alt={`Capa de ${track.track_title}`}
                                            width={300}
                                            height={300}
                                            className="h-full w-full rounded-t-lg object-cover"
                                        />
                                        <Button
                                            size="icon"
                                            className="text-sage-700 absolute bottom-4 right-4 rounded-full bg-white/95 backdrop-blur-md opacity-0 shadow-xl transition-all duration-300 hover:bg-white hover:scale-110 group-hover:opacity-100"
                                        >
                                            <Play size={20} className="ml-0.5" />
                                        </Button>
                                        <Badge className={`absolute right-4 top-4 backdrop-blur-md shadow-lg ${
                                            index === 0 ? 'border-amber-300/50 bg-amber-200/80 text-amber-800' :
                                            index === 1 ? 'border-emerald-300/50 bg-emerald-200/80 text-emerald-800' :
                                            'border-violet-300/50 bg-violet-200/80 text-violet-800'
                                        }`}>
                                            {index === 0 ? 'Em Alta' : index === 1 ? 'Crescendo' : 'Popular'}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="pt-6 bg-gradient-to-b from-white/80 to-white/60 backdrop-blur-sm">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-900">
                                                    {track.track_title}
                                                </h3>
                                                <p className="text-slate-600">
                                                    {track.artist_name}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {track.genre} • {track.year}
                                                </p>
                                            </div>
                                            <Link href={`/track/${track.track_url?.split('/').pop() || track.track_title}`}>
                                                <Button
                                                    size="sm"
                                                    className="bg-gradient-to-r from-sage-600 to-sage-700 hover:from-sage-700 hover:to-sage-800 text-white shadow-lg shadow-sage-600/30"
                                                >
                                                    Ver Track
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between border-t border-white/50 bg-white/40 backdrop-blur-sm pt-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <TrendingUp size={16} />
                                            <span>{track.total_claims} claims</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Award size={16} />
                                            <span>#{track.position}</span>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))
                        ) : (
                            // Fallback com dados fictícios caso não haja tracks reais
                            <>
                                {/* Track Card 1 */}
                                <Card className="group border-white/60 bg-white/50 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:bg-white/70 hover:scale-[1.02]">
                                    <CardHeader className="from-sage-100 to-sage-200 relative aspect-square bg-gradient-to-br p-0">
                                        <Image
                                            src="/placeholder.svg?height=300&width=300"
                                            alt="Track artwork"
                                            width={300}
                                            height={300}
                                            className="h-full w-full rounded-t-lg object-cover"
                                        />
                                        <Button
                                            size="icon"
                                            className="text-sage-700 absolute bottom-4 right-4 rounded-full bg-white/95 backdrop-blur-md opacity-0 shadow-xl transition-all duration-300 hover:bg-white hover:scale-110 group-hover:opacity-100"
                                        >
                                            <Play size={20} className="ml-0.5" />
                                        </Button>
                                        <Badge className="absolute right-4 top-4 border-amber-300/50 bg-amber-200/80 backdrop-blur-md text-amber-800 shadow-lg">
                                            Em Alta
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="pt-6 bg-gradient-to-b from-white/80 to-white/60 backdrop-blur-sm">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-900">
                                                    Sonhos da Meia-Noite
                                                </h3>
                                                <p className="text-slate-600">
                                                    Luna Nova
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Indie Pop • 2024
                                                </p>
                                            </div>
                                            <Button
                                                size="sm"
                                                className="bg-gradient-to-r from-sage-600 to-sage-700 hover:from-sage-700 hover:to-sage-800 text-white shadow-lg shadow-sage-600/30"
                                            >
                                                Reivindicar
                                            </Button>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between border-t border-white/50 bg-white/40 backdrop-blur-sm pt-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <TrendingUp size={16} />
                                            <span>Disponível</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Award size={16} />
                                            <span>Disponível</span>
                                        </div>
                                    </CardFooter>
                                </Card>

                                {/* Track Card 2 */}
                                <Card className="group border-white/60 bg-white/50 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:bg-white/70 hover:scale-[1.02]">
                                    <CardHeader className="relative aspect-square bg-gradient-to-br from-blue-100 to-blue-200 p-0">
                                        <Image
                                            src="/placeholder.svg?height=300&width=300"
                                            alt="Track artwork"
                                            width={300}
                                            height={300}
                                            className="h-full w-full rounded-t-lg object-cover"
                                        />
                                        <Button
                                            size="icon"
                                            className="absolute bottom-4 right-4 rounded-full bg-white/95 backdrop-blur-md text-blue-700 opacity-0 shadow-xl transition-all duration-300 hover:bg-white hover:scale-110 group-hover:opacity-100"
                                        >
                                            <Play size={20} className="ml-0.5" />
                                        </Button>
                                        <Badge className="absolute right-4 top-4 border-emerald-300/50 bg-emerald-200/80 backdrop-blur-md text-emerald-800 shadow-lg">
                                            Crescendo
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="pt-6 bg-gradient-to-b from-white/80 to-white/60 backdrop-blur-sm">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-900">
                                                    Alma Elétrica
                                                </h3>
                                                <p className="text-slate-600">
                                                    Neon Pulse
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Eletrônica • 2024
                                                </p>
                                            </div>
                                            <Button
                                                size="sm"
                                                className="bg-gradient-to-r from-sage-600 to-sage-700 hover:from-sage-700 hover:to-sage-800 text-white shadow-lg shadow-sage-600/30"
                                            >
                                                Reivindicar
                                            </Button>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between border-t border-white/50 bg-white/40 backdrop-blur-sm pt-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <TrendingUp size={16} />
                                            <span>Disponível</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Award size={16} />
                                            <span>Disponível</span>
                                        </div>
                                    </CardFooter>
                                </Card>

                                {/* Track Card 3 */}
                                <Card className="group border-white/60 bg-white/50 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:bg-white/70 hover:scale-[1.02]">
                                    <CardHeader className="relative aspect-square bg-gradient-to-br from-rose-100 to-rose-200 p-0">
                                        <Image
                                            src="/placeholder.svg?height=300&width=300"
                                            alt="Track artwork"
                                            width={300}
                                            height={300}
                                            className="h-full w-full rounded-t-lg object-cover"
                                        />
                                        <Button
                                            size="icon"
                                            className="absolute bottom-4 right-4 rounded-full bg-white/95 backdrop-blur-md text-rose-700 opacity-0 shadow-xl transition-all duration-300 hover:bg-white hover:scale-110 group-hover:opacity-100"
                                        >
                                            <Play size={20} className="ml-0.5" />
                                        </Button>
                                        <Badge className="absolute right-4 top-4 border-violet-300/50 bg-violet-200/80 backdrop-blur-md text-violet-800 shadow-lg">
                                            Popular
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="pt-6 bg-gradient-to-b from-white/80 to-white/60 backdrop-blur-sm">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-900">
                                                    Boulevard do Pôr do Sol
                                                </h3>
                                                <p className="text-slate-600">
                                                    Coastal Waves
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Alternativo • 2024
                                                </p>
                                            </div>
                                            <Button
                                                size="sm"
                                                className="bg-gradient-to-r from-sage-600 to-sage-700 hover:from-sage-700 hover:to-sage-800 text-white shadow-lg shadow-sage-600/30"
                                            >
                                                Reivindicar
                                            </Button>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between border-t border-white/50 bg-white/40 backdrop-blur-sm pt-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <TrendingUp size={16} />
                                            <span>Disponível</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Award size={16} />
                                            <span>Disponível</span>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </>
                        )}
                    </div>

                    <div className="mt-12 text-center">
                        <Link href="/feed">
                            <Button
                                variant="outline"
                                className="border-white/50 bg-white/40 backdrop-blur-xl px-8 text-slate-800 hover:bg-white/60 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                Ver mais
                                <ArrowRight className="ml-2" size={16} />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Track Section */}
            <section className="bg-gradient-to-br from-slate-800 to-slate-900 px-4 py-16 text-white">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col items-center gap-12 lg:flex-row">
                        <div className="w-full lg:w-1/2">
                            <Badge className="bg-sage-100 text-sage-700 mb-4">
                                Track em Destaque
                            </Badge>
                            {featuredTrack ? (
                                <>
                                    <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                                        {featuredTrack.track_title}
                                    </h2>
                                    <h3 className="mb-2 text-xl font-semibold text-slate-300">
                                        {featuredTrack.artist_name}
                                    </h3>
                                    <p className="mb-6 leading-relaxed text-slate-300">
                                        A galera tá começando a pegar essa. Tem aquela vibe que pode viralizar
                                        do nada. Vale a pena salvar antes que todo mundo descubra.
                                    </p>
                                    <div className="flex flex-col gap-4 sm:flex-row">
                                        <Link href={`/track/${featuredTrack.track_url?.split('/').pop() || featuredTrack.track_title}`}>
                                            <Button className="bg-white text-slate-800 hover:bg-slate-100 shadow-lg">
                                                <Award size={16} className="mr-2" />
                                                Ver Detalhes
                                            </Button>
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                                        Ondas Cósmicas
                                    </h2>
                                    <h3 className="mb-2 text-xl font-semibold text-slate-300">
                                        por Stellar Dreams
                                    </h3>
                                    <p className="mb-6 leading-relaxed text-slate-300">
                                        Esta track etérea combina sintetizadores sonhadores com vocais cativantes, criando uma experiência auditiva de outro mundo. Com seu som único e buzz crescente, tem todos os elementos para se tornar a próxima sensação viral.
                                    </p>
                                    <div className="flex flex-col gap-4 sm:flex-row">
                                        <Button className="bg-white text-slate-800 hover:bg-slate-100 shadow-lg">
                                            <Award size={16} className="mr-2" />
                                            Reivindicar Track
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="w-full lg:w-1/2">
                            <div className="relative aspect-square overflow-hidden rounded-2xl shadow-2xl">
                                <Image
                                    src={featuredTrack?.track_thumbnail || "/placeholder.svg?height=500&width=500"}
                                    alt={featuredTrack ? `Capa de ${featuredTrack.track_title}` : "Featured track artwork"}
                                    width={500}
                                    height={500}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section
                id="how-it-works"
                className="bg-gradient-to-b from-slate-50/50 to-white px-4 py-20"
            >
                <div className="mx-auto max-w-7xl">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-slate-800 md:text-4xl">
                            Como funciona
                        </h2>
                        <p className="mx-auto max-w-3xl text-xl leading-relaxed text-slate-600">
                            É simples. Você descobre, salva e comprova.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                        <Card className="border-white/40 bg-white/40 backdrop-blur-2xl text-center transition-all duration-300 hover:shadow-2xl hover:shadow-sage-500/20 hover:bg-white/60">
                            <CardContent className="pt-10">
                                <div className="from-sage-500/30 to-sage-600/30 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br backdrop-blur-md border border-sage-400/40 shadow-xl">
                                    <Headphones
                                        className="text-sage-700"
                                        size={40}
                                    />
                                </div>
                                <h3 className="mb-4 text-xl font-semibold text-slate-900">
                                    1. Escuta
                                </h3>
                                <p className="leading-relaxed text-slate-700">
                                    Explora as músicas. Acha aquela que você sente
                                    que vai bombar. Confia no seu ouvido.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-white/40 bg-white/40 backdrop-blur-2xl text-center transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:bg-white/60">
                            <CardContent className="pt-10">
                                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/30 to-blue-600/30 backdrop-blur-md border border-blue-400/40 shadow-xl">
                                    <Award
                                        className="text-blue-700"
                                        size={40}
                                    />
                                </div>
                                <h3 className="mb-4 text-xl font-semibold text-slate-900">
                                    2. Salva
                                </h3>
                                <p className="leading-relaxed text-slate-700">
                                    Clica em claim. Simples assim.
                                    Agora ficou registrado que você tava aqui primeiro.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-white/40 bg-white/40 backdrop-blur-2xl text-center transition-all duration-300 hover:shadow-2xl hover:shadow-rose-500/20 hover:bg-white/60">
                            <CardContent className="pt-10">
                                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-500/30 to-rose-600/30 backdrop-blur-md border border-rose-400/40 shadow-xl">
                                    <TrendingUp
                                        className="text-rose-700"
                                        size={40}
                                    />
                                </div>
                                <h3 className="mb-4 text-xl font-semibold text-slate-900">
                                    3. Comprova
                                </h3>
                                <p className="leading-relaxed text-slate-700">
                                    Quando a música explodir, todo mundo vai saber:
                                    você ouviu primeiro.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="relative overflow-hidden px-4 py-16">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100/40 via-transparent to-pink-100/40"></div>
                <div className="mx-auto max-w-4xl text-center relative z-10">
                    <div className="bg-white/60 backdrop-blur-2xl rounded-3xl p-12 border border-white/60 shadow-2xl">
                        <h2 className="mb-6 text-3xl font-bold text-slate-900 md:text-4xl">
                            Pra quem tem ouvido
                        </h2>
                        <p className="mb-8 text-xl leading-relaxed text-slate-700">
                            Mirsui é pra quem realmente ouve música. Não é playlist do Spotify,
                            não é algoritmo. É você explorando, descobrindo e salvando
                            o que ninguém ainda prestou atenção.
                        </p>
                        <p className="mb-10 text-lg leading-relaxed text-slate-700">
                            Indie, eletrônica, rap, whatever. Se você sente que uma música vai bombar,
                            você salva. E quando ela explodir, você tem a prova que tava lá desde o início.
                        </p>
                        <Link href="/feed">
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-sage-600 to-sage-700 hover:from-sage-700 hover:to-sage-800 px-10 py-4 text-lg text-white shadow-2xl shadow-sage-600/40 hover:shadow-3xl hover:shadow-sage-600/60 transition-all duration-300"
                            >
                                Começar
                                <ArrowRight className="ml-2" size={20} />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="from-sage-500/20 via-blue-500/20 to-purple-500/20 bg-gradient-to-br px-4 py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/60 backdrop-blur-3xl"></div>
                <div className="mx-auto max-w-4xl text-center relative z-10">
                    <h2 className="mb-6 text-3xl font-bold text-slate-900 md:text-4xl">
                        Bora descobrir música?
                    </h2>
                    <p className="mb-10 text-xl leading-relaxed text-slate-700">
                        Entre, explore e salve suas descobertas.
                        Mostre que você tem ouvido pra música boa.
                    </p>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Link href="/register">
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-sage-600 to-sage-700 hover:from-sage-700 hover:to-sage-800 px-10 py-4 text-lg text-white shadow-2xl shadow-sage-600/40 hover:shadow-3xl hover:shadow-sage-600/60 transition-all duration-300"
                            >
                                Entrar grátis
                                <ArrowRight className="ml-2" size={20} />
                            </Button>
                        </Link>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-white/50 bg-white/40 backdrop-blur-xl px-10 py-4 text-lg text-slate-800 hover:bg-white/60 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            Saber mais
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    )
}
