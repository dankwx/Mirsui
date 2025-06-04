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
import GetAuth from '@/components/GetAuth/GetAuth'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
    const supabase = createClient()
    const { data, error } = await supabase.auth.getUser()
    if (data.user) {
        redirect('/now')
    }
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 px-4 py-4 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="from-sage-500 to-sage-600 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br font-bold text-white shadow-sm">
                            SS
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
                            How It Works
                        </Link>
                        <Link
                            href="#discover"
                            className="font-medium text-slate-600 hover:text-slate-800"
                        >
                            Discover
                        </Link>
                        <Link
                            href="#community"
                            className="font-medium text-slate-600 hover:text-slate-800"
                        >
                            Community
                        </Link>
                    </div>

                    <div className="flex items-center gap-3">
                        <GetAuth />
                        <Button className="bg-sage-600 hover:bg-sage-700 text-white shadow-sm">
                            Get Started
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden px-4 py-20">
                <div className="relative z-10 mx-auto max-w-7xl">
                    <div className="mx-auto max-w-4xl text-center">
                        <h1 className="mb-6 text-5xl font-bold leading-tight text-slate-800 md:text-7xl">
                            Discover Music
                            <span className="text-sage-600 block">
                                Before Everyone Else
                            </span>
                        </h1>
                        <p className="mx-auto mb-10 max-w-3xl text-xl leading-relaxed text-slate-600 md:text-2xl">
                            Claim tracks before they go viral and build your
                            reputation as a true music tastemaker. Join the
                            community that spots tomorrow&lsquo;s hits today.
                        </p>
                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                            <Button
                                size="lg"
                                className="bg-sage-600 hover:bg-sage-700 px-8 py-4 text-lg text-white shadow-lg"
                            >
                                Start Discovering
                                <ArrowRight className="ml-2" size={20} />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-slate-300 px-8 py-4 text-lg text-slate-700 hover:bg-slate-50"
                            >
                                Watch Demo
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

            {/* Stats Section */}
            <section className="px-4 py-16">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        <Card className="from-sage-50 to-sage-100 border-sage-200/50 bg-gradient-to-br shadow-sm">
                            <CardContent className="pt-8 text-center">
                                <h3 className="text-sage-700 mb-3 text-5xl font-bold">
                                    10K+
                                </h3>
                                <p className="text-sage-600 text-lg font-medium">
                                    Tracks Claimed
                                </p>
                                <p className="mt-2 text-sm text-slate-500">
                                    Before they went viral
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm">
                            <CardContent className="pt-8 text-center">
                                <h3 className="mb-3 text-5xl font-bold text-blue-700">
                                    5K+
                                </h3>
                                <p className="text-lg font-medium text-blue-600">
                                    Viral Predictions
                                </p>
                                <p className="mt-2 text-sm text-slate-500">
                                    Accurate forecasts
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-rose-200/50 bg-gradient-to-br from-rose-50 to-rose-100 shadow-sm">
                            <CardContent className="pt-8 text-center">
                                <h3 className="mb-3 text-5xl font-bold text-rose-700">
                                    50K+
                                </h3>
                                <p className="text-lg font-medium text-rose-600">
                                    Music Lovers
                                </p>
                                <p className="mt-2 text-sm text-slate-500">
                                    Active community
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
                            Trending Tracks to Claim
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-slate-600">
                            These tracks are gaining momentum. Claim them now
                            before they explode on social media.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
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
                                    Trending
                                </Badge>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-800">
                                            Midnight Dreams
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
                                        Claim
                                    </Button>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between border-t border-slate-100 pt-4">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Heart size={16} />
                                    <span>243</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Award size={16} />
                                    <span>18 claims</span>
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
                                    Rising
                                </Badge>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-800">
                                            Electric Soul
                                        </h3>
                                        <p className="text-slate-500">
                                            Neon Pulse
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            Electronic • 2024
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="bg-sage-600 hover:bg-sage-700 text-white"
                                    >
                                        Claim
                                    </Button>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between border-t border-slate-100 pt-4">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Heart size={16} />
                                    <span>187</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Award size={16} />
                                    <span>12 claims</span>
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
                                    Hot
                                </Badge>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-800">
                                            Sunset Boulevard
                                        </h3>
                                        <p className="text-slate-500">
                                            Coastal Waves
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            Alternative • 2024
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="bg-sage-600 hover:bg-sage-700 text-white"
                                    >
                                        Claim
                                    </Button>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between border-t border-slate-100 pt-4">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Heart size={16} />
                                    <span>156</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Award size={16} />
                                    <span>8 claims</span>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>

                    <div className="mt-12 text-center">
                        <Button
                            variant="outline"
                            className="border-slate-300 px-8 text-slate-700 hover:bg-slate-50"
                        >
                            View All Trending Tracks
                            <ArrowRight className="ml-2" size={16} />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Top Tastemakers Section */}
            <section id="community" className="px-4 py-16">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-slate-800 md:text-4xl">
                            Top Tastemakers
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-slate-600">
                            Meet the community members who consistently spot
                            hits before they go viral.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                        {/* Tastemaker 1 */}
                        <Card className="border-slate-200/60 text-center transition-shadow hover:shadow-md">
                            <CardContent className="pt-8">
                                <Avatar className="border-sage-100 mx-auto mb-4 h-20 w-20 border-4">
                                    <AvatarImage
                                        src="/placeholder.svg?height=80&width=80"
                                        alt="User"
                                    />
                                    <AvatarFallback className="bg-sage-100 text-sage-700 font-semibold">
                                        MH
                                    </AvatarFallback>
                                </Avatar>
                                <h3 className="font-semibold text-slate-800">
                                    musichead
                                </h3>
                                <Badge className="bg-sage-100 text-sage-700 hover:bg-sage-200 mt-2">
                                    Audiophile
                                </Badge>
                                <p className="mt-3 text-sm text-slate-500">
                                    42 Claimed Tracks
                                </p>
                                <p className="text-xs text-slate-400">
                                    89% accuracy rate
                                </p>
                            </CardContent>
                            <CardFooter className="justify-center">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                                >
                                    Follow
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Tastemaker 2 */}
                        <Card className="border-slate-200/60 text-center transition-shadow hover:shadow-md">
                            <CardContent className="pt-8">
                                <Avatar className="mx-auto mb-4 h-20 w-20 border-4 border-emerald-100">
                                    <AvatarImage
                                        src="/placeholder.svg?height=80&width=80"
                                        alt="User"
                                    />
                                    <AvatarFallback className="bg-emerald-100 font-semibold text-emerald-700">
                                        TS
                                    </AvatarFallback>
                                </Avatar>
                                <h3 className="font-semibold text-slate-800">
                                    trendspotter
                                </h3>
                                <Badge className="mt-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                                    Trending Spotter
                                </Badge>
                                <p className="mt-3 text-sm text-slate-500">
                                    38 Claimed Tracks
                                </p>
                                <p className="text-xs text-slate-400">
                                    92% accuracy rate
                                </p>
                            </CardContent>
                            <CardFooter className="justify-center">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                                >
                                    Follow
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Tastemaker 3 */}
                        <Card className="border-slate-200/60 text-center transition-shadow hover:shadow-md">
                            <CardContent className="pt-8">
                                <Avatar className="mx-auto mb-4 h-20 w-20 border-4 border-blue-100">
                                    <AvatarImage
                                        src="/placeholder.svg?height=80&width=80"
                                        alt="User"
                                    />
                                    <AvatarFallback className="bg-blue-100 font-semibold text-blue-700">
                                        CB
                                    </AvatarFallback>
                                </Avatar>
                                <h3 className="font-semibold text-slate-800">
                                    beatfinder
                                </h3>
                                <Badge className="mt-2 bg-blue-100 text-blue-700 hover:bg-blue-200">
                                    Community Builder
                                </Badge>
                                <p className="mt-3 text-sm text-slate-500">
                                    31 Claimed Tracks
                                </p>
                                <p className="text-xs text-slate-400">
                                    85% accuracy rate
                                </p>
                            </CardContent>
                            <CardFooter className="justify-center">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                                >
                                    Follow
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Tastemaker 4 */}
                        <Card className="border-slate-200/60 text-center transition-shadow hover:shadow-md">
                            <CardContent className="pt-8">
                                <Avatar className="mx-auto mb-4 h-20 w-20 border-4 border-amber-100">
                                    <AvatarImage
                                        src="/placeholder.svg?height=80&width=80"
                                        alt="User"
                                    />
                                    <AvatarFallback className="bg-amber-100 font-semibold text-amber-700">
                                        MF
                                    </AvatarFallback>
                                </Avatar>
                                <h3 className="font-semibold text-slate-800">
                                    futurehits
                                </h3>
                                <Badge className="mt-2 bg-amber-100 text-amber-700 hover:bg-amber-200">
                                    Hit Predictor
                                </Badge>
                                <p className="mt-3 text-sm text-slate-500">
                                    27 Claimed Tracks
                                </p>
                                <p className="text-xs text-slate-400">
                                    94% accuracy rate
                                </p>
                            </CardContent>
                            <CardFooter className="justify-center">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                                >
                                    Follow
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Featured Track Section */}
            <section className="bg-gradient-to-br from-slate-800 to-slate-900 px-4 py-16 text-white">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col items-center gap-12 lg:flex-row">
                        <div className="w-full lg:w-1/2">
                            <Badge className="bg-sage-100 text-sage-700 mb-4">
                                Featured Track
                            </Badge>
                            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                                Cosmic Waves
                            </h2>
                            <h3 className="mb-2 text-xl font-semibold text-slate-300">
                                by Stellar Dreams
                            </h3>
                            <p className="mb-6 leading-relaxed text-slate-300">
                                This ethereal track is predicted to go viral in
                                the next 30 days. With its dreamy synths and
                                captivating vocals, only 24 users have claimed
                                it so far. Don&lsquo;t miss your chance to be
                                ahead of the curve.
                            </p>
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <Button className="bg-white text-slate-800 hover:bg-slate-100">
                                    <Play size={16} className="mr-2" />
                                    Listen Now
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-white text-white hover:bg-white/10"
                                >
                                    <Award size={16} className="mr-2" />
                                    Claim Track
                                </Button>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2">
                            <div className="relative aspect-square overflow-hidden rounded-2xl shadow-2xl">
                                <Image
                                    src="/placeholder.svg?height=500&width=500"
                                    alt="Featured track artwork"
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
                            How Sound Sage Works
                        </h2>
                        <p className="mx-auto max-w-3xl text-xl leading-relaxed text-slate-600">
                            Join the community that discovers tomorrow&lsquo;s
                            hits today. Build your reputation as a music
                            tastemaker in three simple steps.
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
                                    1. Discover
                                </h3>
                                <p className="leading-relaxed text-slate-600">
                                    Browse through our curated selection of
                                    emerging tracks from various genres and
                                    discover hidden gems
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
                                    2. Claim
                                </h3>
                                <p className="leading-relaxed text-slate-600">
                                    Claim tracks you believe will become popular
                                    before they go viral on TikTok, Instagram,
                                    or other platforms
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
                                    3. Earn Recognition
                                </h3>
                                <p className="leading-relaxed text-slate-600">
                                    Build your reputation as tracks you claimed
                                    become popular and earn badges for your
                                    music discovery skills
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="from-sage-50 bg-gradient-to-br to-blue-50 px-4 py-20">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="mb-6 text-3xl font-bold text-slate-800 md:text-4xl">
                        Ready to Discover Tomorrow&lsquo;s Hits Today?
                    </h2>
                    <p className="mb-10 text-xl leading-relaxed text-slate-600">
                        Join thousands of music enthusiasts who are shaping the
                        future of music discovery. Start building your
                        reputation as a tastemaker.
                    </p>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Button
                            size="lg"
                            className="bg-sage-600 hover:bg-sage-700 px-10 py-4 text-lg text-white shadow-lg"
                        >
                            Sign Up Now — It&lsquo;s Free
                            <ArrowRight className="ml-2" size={20} />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-slate-300 px-10 py-4 text-lg text-slate-700 hover:bg-white"
                        >
                            Learn More
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white px-4 py-12">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
                        <div className="md:col-span-2">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="from-sage-500 to-sage-600 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br font-bold text-white">
                                    SS
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-slate-800">
                                        Sound Sage
                                    </h1>
                                    <p className="text-sm text-slate-500">
                                        Music Discovery Platform
                                    </p>
                                </div>
                            </div>
                            <p className="max-w-md leading-relaxed text-slate-600">
                                Discover music before everyone else and build
                                your reputation as a true tastemaker. Join the
                                community that spots tomorrow&lsquo;s hits
                                today.
                            </p>
                        </div>

                        <div>
                            <h3 className="mb-4 font-semibold text-slate-800">
                                Platform
                            </h3>
                            <div className="space-y-2">
                                <Link
                                    href="#"
                                    className="block text-slate-600 hover:text-slate-800"
                                >
                                    How It Works
                                </Link>
                                <Link
                                    href="#"
                                    className="block text-slate-600 hover:text-slate-800"
                                >
                                    Discover
                                </Link>
                                <Link
                                    href="#"
                                    className="block text-slate-600 hover:text-slate-800"
                                >
                                    Community
                                </Link>
                                <Link
                                    href="#"
                                    className="block text-slate-600 hover:text-slate-800"
                                >
                                    Leaderboard
                                </Link>
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-4 font-semibold text-slate-800">
                                Company
                            </h3>
                            <div className="space-y-2">
                                <Link
                                    href="#"
                                    className="block text-slate-600 hover:text-slate-800"
                                >
                                    About
                                </Link>
                                <Link
                                    href="#"
                                    className="block text-slate-600 hover:text-slate-800"
                                >
                                    Privacy
                                </Link>
                                <Link
                                    href="#"
                                    className="block text-slate-600 hover:text-slate-800"
                                >
                                    Terms
                                </Link>
                                <Link
                                    href="#"
                                    className="block text-slate-600 hover:text-slate-800"
                                >
                                    Contact
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-between border-t border-slate-200 pt-8 md:flex-row">
                        <p className="text-sm text-slate-500">
                            © 2025 Sound Sage. All rights reserved.
                        </p>
                        <div className="mt-4 flex gap-6 md:mt-0">
                            <Link
                                href="#"
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <span className="sr-only">Twitter</span>
                                <svg
                                    className="h-5 w-5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                                </svg>
                            </Link>
                            <Link
                                href="#"
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <span className="sr-only">Instagram</span>
                                <svg
                                    className="h-5 w-5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
