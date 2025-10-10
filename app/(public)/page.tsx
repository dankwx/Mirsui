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
    Heart,
    MessageSquare,
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
    title: 'SoundSage - Descubra música antes que ela exploda',
    description: 'Reivindique suas músicas favoritas e prove que você ouviu antes que ficassem populares. Descubra novos talentos e construa sua credibilidade musical.',
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
            <nav className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 px-4 py-4 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                            <Music className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">
                                Sound Sage
                            </h1>
                            <p className="text-xs text-slate-500">
                                Music Discovery
                            </p>
                        </div>
                    </div>

                    <div className="hidden items-center gap-6 md:flex">
                        <Link
                            href="#how-it-works"
                            className="font-medium text-slate-600 hover:text-slate-800"
                        >
                            Como Funciona
                        </Link>
                        <Link
                            href="#discover"
                            className="font-medium text-slate-600 hover:text-slate-800"
                        >
                            Descobrir
                        </Link>
                        <Link
                            href="#about"
                            className="font-medium text-slate-600 hover:text-slate-800"
                        >
                            Sobre
                        </Link>
                    </div>

                    <div className="flex items-center gap-3">
                        <GetAuth />
                        <Link href="/feed">
                            <Button className="bg-sage-600 hover:bg-sage-700 text-white shadow-sm">
                                Começar
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
                            Descubra Música
                            <span className="text-sage-600 block">
                                Antes de Todos
                            </span>
                        </h1>
                        <p className="mx-auto mb-10 max-w-3xl text-xl leading-relaxed text-slate-600 md:text-2xl">
                            Reivindique tracks antes delas viralizarem e construa sua
                            reputação como um verdadeiro descobridor de talentos musicais. 
                            Encontre os hits de amanhã antes deles explodirem no TikTok
                            e redes sociais.
                        </p>
                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                            <Link href="/feed">
                                <Button
                                    size="lg"
                                    className="bg-sage-600 hover:bg-sage-700 px-8 py-4 text-lg text-white shadow-lg"
                                >
                                    Começar a Descobrir
                                    <ArrowRight className="ml-2" size={20} />
                                </Button>
                            </Link>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-slate-400 px-8 py-4 text-lg text-slate-800 hover:bg-slate-100 hover:border-slate-500"
                            >
                                Como Funciona
                            </Button>
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
                        <Card className="from-sage-50 to-sage-100 border-sage-200/50 bg-gradient-to-br shadow-sm">
                            <CardContent className="pt-8 text-center">
                                <div className="bg-sage-200 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
                                    <Clock
                                        className="text-sage-600"
                                        size={32}
                                    />
                                </div>
                                <h3 className="text-sage-700 mb-3 text-xl font-semibold">
                                    Descoberta Precoce
                                </h3>
                                <p className="text-sage-600 leading-relaxed">
                                    Encontre tracks antes delas se tornarem mainstream
                                    e prove seu gosto musical
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm">
                            <CardContent className="pt-8 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-200">
                                    <Target
                                        className="text-blue-600"
                                        size={32}
                                    />
                                </div>
                                <h3 className="mb-3 text-xl font-semibold text-blue-700">
                                    Construa Reputação
                                </h3>
                                <p className="leading-relaxed text-blue-600">
                                    Ganhe reconhecimento conforme suas tracks reivindicadas
                                    ganham popularidade e viralizam
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-rose-200/50 bg-gradient-to-br from-rose-50 to-rose-100 shadow-sm">
                            <CardContent className="pt-8 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-200">
                                    <Music
                                        className="text-rose-600"
                                        size={32}
                                    />
                                </div>
                                <h3 className="mb-3 text-xl font-semibold text-rose-700">
                                    Seleção Curada
                                </h3>
                                <p className="leading-relaxed text-rose-600">
                                    Explore tracks emergentes cuidadosamente selecionadas
                                    de todos os gêneros
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Trending Section */}
            <section
                id="discover"
                className="bg-gradient-to-b from-slate-50/50 to-white px-4 py-16"
            >
                <div className="mx-auto max-w-7xl">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-slate-800 md:text-4xl">
                            Tracks em Destaque para Reivindicar
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-slate-600">
                            Essas tracks estão ganhando momentum. Reivindique-as agora
                            antes delas explodirem nas redes sociais.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {trendingTracks.length > 0 ? (
                            trendingTracks.map((track, index) => (
                                <Card key={track.id} className="group border-slate-200/60 transition-all duration-300 hover:shadow-lg">
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
                                            className="text-sage-600 absolute bottom-4 right-4 rounded-full bg-white/90 opacity-0 shadow-lg transition-opacity hover:bg-white group-hover:opacity-100"
                                        >
                                            <Play size={20} className="ml-0.5" />
                                        </Button>
                                        <Badge className={`absolute right-4 top-4 ${
                                            index === 0 ? 'border-amber-200 bg-amber-100 text-amber-700' :
                                            index === 1 ? 'border-emerald-200 bg-emerald-100 text-emerald-700' :
                                            'border-violet-200 bg-violet-100 text-violet-700'
                                        }`}>
                                            {index === 0 ? 'Em Alta' : index === 1 ? 'Crescendo' : 'Popular'}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-800">
                                                    {track.track_title}
                                                </h3>
                                                <p className="text-slate-500">
                                                    {track.artist_name}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400">
                                                    {track.genre} • {track.year}
                                                </p>
                                            </div>
                                            <Link href={`/track/${track.track_url?.split('/').pop() || track.track_title}`}>
                                                <Button
                                                    size="sm"
                                                    className="bg-sage-600 hover:bg-sage-700 text-white"
                                                >
                                                    Ver Track
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between border-t border-slate-100 pt-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Heart size={16} />
                                            <span>{track.likes_count}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
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
                                <Card className="group border-slate-200/60 transition-all duration-300 hover:shadow-lg">
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
                                            className="text-sage-600 absolute bottom-4 right-4 rounded-full bg-white/90 opacity-0 shadow-lg transition-opacity hover:bg-white group-hover:opacity-100"
                                        >
                                            <Play size={20} className="ml-0.5" />
                                        </Button>
                                        <Badge className="absolute right-4 top-4 border-amber-200 bg-amber-100 text-amber-700">
                                            Em Alta
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-800">
                                                    Sonhos da Meia-Noite
                                                </h3>
                                                <p className="text-slate-500">
                                                    Luna Nova
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400">
                                                    Indie Pop • 2024
                                                </p>
                                            </div>
                                            <Button
                                                size="sm"
                                                className="bg-sage-600 hover:bg-sage-700 text-white"
                                            >
                                                Reivindicar
                                            </Button>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between border-t border-slate-100 pt-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Heart size={16} />
                                            <span>Nova</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Award size={16} />
                                            <span>Disponível</span>
                                        </div>
                                    </CardFooter>
                                </Card>

                                {/* Track Card 2 */}
                                <Card className="group border-slate-200/60 transition-all duration-300 hover:shadow-lg">
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
                                            className="absolute bottom-4 right-4 rounded-full bg-white/90 text-blue-600 opacity-0 shadow-lg transition-opacity hover:bg-white group-hover:opacity-100"
                                        >
                                            <Play size={20} className="ml-0.5" />
                                        </Button>
                                        <Badge className="absolute right-4 top-4 border-emerald-200 bg-emerald-100 text-emerald-700">
                                            Crescendo
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-800">
                                                    Alma Elétrica
                                                </h3>
                                                <p className="text-slate-500">
                                                    Neon Pulse
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400">
                                                    Eletrônica • 2024
                                                </p>
                                            </div>
                                            <Button
                                                size="sm"
                                                className="bg-sage-600 hover:bg-sage-700 text-white"
                                            >
                                                Reivindicar
                                            </Button>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between border-t border-slate-100 pt-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Heart size={16} />
                                            <span>Fresca</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Award size={16} />
                                            <span>Disponível</span>
                                        </div>
                                    </CardFooter>
                                </Card>

                                {/* Track Card 3 */}
                                <Card className="group border-slate-200/60 transition-all duration-300 hover:shadow-lg">
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
                                            className="absolute bottom-4 right-4 rounded-full bg-white/90 text-rose-600 opacity-0 shadow-lg transition-opacity hover:bg-white group-hover:opacity-100"
                                        >
                                            <Play size={20} className="ml-0.5" />
                                        </Button>
                                        <Badge className="absolute right-4 top-4 border-violet-200 bg-violet-100 text-violet-700">
                                            Popular
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-800">
                                                    Boulevard do Pôr do Sol
                                                </h3>
                                                <p className="text-slate-500">
                                                    Coastal Waves
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400">
                                                    Alternativo • 2024
                                                </p>
                                            </div>
                                            <Button
                                                size="sm"
                                                className="bg-sage-600 hover:bg-sage-700 text-white"
                                            >
                                                Reivindicar
                                            </Button>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between border-t border-slate-100 pt-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Heart size={16} />
                                            <span>Nova</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
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
                                className="border-slate-400 px-8 text-slate-800 hover:bg-slate-100 hover:border-slate-500"
                            >
                                Explorar Mais Tracks
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
                                        por {featuredTrack.artist_name}
                                    </h3>
                                    <p className="mb-6 leading-relaxed text-slate-300">
                                        {featuredTrack.claim_message || 
                                        `Esta track está ganhando destaque na nossa comunidade, com um score de descoberta de ${featuredTrack.discover_rating || 8}/10. Reivindicada como #{featuredTrack.position} por ${featuredTrack.display_name || featuredTrack.username}, esta música tem potencial para se tornar viral.`}
                                    </p>
                                    <div className="flex flex-col gap-4 sm:flex-row">
                                        <Link href={featuredTrack.track_url} target="_blank">
                                            <Button className="bg-white text-slate-800 hover:bg-slate-100">
                                                <Play size={16} className="mr-2" />
                                                Ouvir Agora
                                            </Button>
                                        </Link>
                                        <Link href={`/track/${featuredTrack.track_url?.split('/').pop() || featuredTrack.track_title}`}>
                                            <Button
                                                variant="outline"
                                                className="border-white text-white hover:bg-white/10"
                                            >
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
                                        <Button className="bg-white text-slate-800 hover:bg-slate-100">
                                            <Play size={16} className="mr-2" />
                                            Ouvir Agora
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="border-white text-white hover:bg-white/10"
                                        >
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
                                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-8">
                                    <div className="flex items-center gap-4">
                                        <Button
                                            size="icon"
                                            className="rounded-full bg-white/90 text-slate-800 shadow-lg hover:bg-white"
                                        >
                                            <Play
                                                size={24}
                                                className="ml-0.5"
                                            />
                                        </Button>
                                        <div className="flex gap-3">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="rounded-full text-white hover:bg-white/20"
                                            >
                                                <Heart size={20} />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="rounded-full text-white hover:bg-white/20"
                                            >
                                                <MessageSquare size={20} />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="rounded-full text-white hover:bg-white/20"
                                            >
                                                <Share2 size={20} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
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
                            Como o Sound Sage Funciona
                        </h2>
                        <p className="mx-auto max-w-3xl text-xl leading-relaxed text-slate-600">
                            Construa sua reputação como um descobridor de talentos musicais em três
                            passos simples. Descubra os hits de amanhã antes
                            deles explodirem nas redes sociais.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                        <Card className="border-slate-200/60 text-center transition-shadow hover:shadow-md">
                            <CardContent className="pt-10">
                                <div className="from-sage-100 to-sage-200 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br">
                                    <Headphones
                                        className="text-sage-600"
                                        size={40}
                                    />
                                </div>
                                <h3 className="mb-4 text-xl font-semibold text-slate-800">
                                    1. Descubra
                                </h3>
                                <p className="leading-relaxed text-slate-600">
                                    Navegue por nossa seleção curada de
                                    tracks emergentes de vários gêneros e
                                    descubra joias escondidas antes de qualquer outra pessoa
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200/60 text-center transition-shadow hover:shadow-md">
                            <CardContent className="pt-10">
                                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200">
                                    <Award
                                        className="text-blue-600"
                                        size={40}
                                    />
                                </div>
                                <h3 className="mb-4 text-xl font-semibold text-slate-800">
                                    2. Reivindique
                                </h3>
                                <p className="leading-relaxed text-slate-600">
                                    Reivindique tracks que você acredita que se tornarão populares
                                    antes delas viralizarem no TikTok, Instagram,
                                    ou outras plataformas sociais
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200/60 text-center transition-shadow hover:shadow-md">
                            <CardContent className="pt-10">
                                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-100 to-rose-200">
                                    <TrendingUp
                                        className="text-rose-600"
                                        size={40}
                                    />
                                </div>
                                <h3 className="mb-4 text-xl font-semibold text-slate-800">
                                    3. Ganhe Reconhecimento
                                </h3>
                                <p className="leading-relaxed text-slate-600">
                                    Construa sua reputação conforme as tracks que você reivindicou
                                    se tornam populares e ganhe emblemas por suas
                                    habilidades excepcionais de descoberta musical
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="px-4 py-16">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="mb-6 text-3xl font-bold text-slate-800 md:text-4xl">
                        O Futuro da Descoberta Musical
                    </h2>
                    <p className="mb-8 text-xl leading-relaxed text-slate-600">
                        O Sound Sage é mais do que apenas uma plataforma musical—é
                        uma comunidade para verdadeiros entusiastas da música que têm ouvido
                        apurado para o que vem por aí. Seja você fã de indie
                        pop, eletrônica, hip-hop ou alternativo, nossa plataforma
                        ajuda você a descobrir e reivindicar tracks antes delas se tornarem
                        hits mainstream.
                    </p>
                    <p className="mb-10 text-lg leading-relaxed text-slate-600">
                        Junte-se a uma comunidade de amantes da música que entendem que uma boa música merece ser descoberta cedo. Construa sua reputação, conecte-se com ouvintes que compartilham seus gostos, e prove que você tem o que é preciso para identificar a próxima grande novidade.
                    </p>
                    <Link href="/feed">
                        <Button
                            size="lg"
                            className="bg-sage-600 hover:bg-sage-700 px-10 py-4 text-lg text-white shadow-lg"
                        >
                            Começar Sua Jornada
                            <ArrowRight className="ml-2" size={20} />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* CTA Section */}
            <section className="from-sage-50 bg-gradient-to-br to-blue-50 px-4 py-20">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="mb-6 text-3xl font-bold text-slate-800 md:text-4xl">
                        Pronto para Descobrir os Hits de Amanhã Hoje?
                    </h2>
                    <p className="mb-10 text-xl leading-relaxed text-slate-600">
                        Junte-se à revolução da descoberta musical. Comece a construir sua
                        reputação como um descobridor de talentos e prove que você consegue identificar hits
                        antes deles viralizarem.
                    </p>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Link href="/register">
                            <Button
                                size="lg"
                                className="bg-sage-600 hover:bg-sage-700 px-10 py-4 text-lg text-white shadow-lg"
                            >
                                Registrar Agora — É Grátis
                                <ArrowRight className="ml-2" size={20} />
                            </Button>
                        </Link>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-slate-400 px-10 py-4 text-lg text-slate-800 hover:bg-slate-100 hover:border-slate-500"
                        >
                            Saiba Mais
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    )
}
