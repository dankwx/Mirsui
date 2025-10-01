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

export default async function HomePage() {
    const supabase = createClient()
    const { data, error } = await supabase.auth.getUser()
    if (data.user) {
        redirect('/feed')
    }
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
                            How It Works
                        </Link>
                        <Link
                            href="#discover"
                            className="font-medium text-slate-600 hover:text-slate-800"
                        >
                            Discover
                        </Link>
                        <Link
                            href="#about"
                            className="font-medium text-slate-600 hover:text-slate-800"
                        >
                            About
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
                            reputation as a true music tastemaker. Spot
                            tomorrow&apos;s hits before they explode on TikTok
                            and social media.
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
                                    Early Discovery
                                </h3>
                                <p className="text-sage-600 leading-relaxed">
                                    Find tracks before they become mainstream
                                    and prove your music taste
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
                                    Build Reputation
                                </h3>
                                <p className="leading-relaxed text-blue-600">
                                    Earn recognition as your claimed tracks gain
                                    popularity and go viral
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
                                    Curated Selection
                                </h3>
                                <p className="leading-relaxed text-rose-600">
                                    Explore carefully selected emerging tracks
                                    across all genres
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
                                    <span>New</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Award size={16} />
                                    <span>Available</span>
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
                                    <span>Fresh</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Award size={16} />
                                    <span>Available</span>
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
                                    <span>New</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Award size={16} />
                                    <span>Available</span>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>

                    <div className="mt-12 text-center">
                        <Button
                            variant="outline"
                            className="border-slate-300 px-8 text-slate-700 hover:bg-slate-50"
                        >
                            Explore More Tracks
                            <ArrowRight className="ml-2" size={16} />
                        </Button>
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
                                This ethereal track combines dreamy synths with
                                captivating vocals, creating an otherworldly
                                listening experience. With its unique sound and
                                growing buzz, it has all the elements to become
                                the next viral sensation.
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
                            Build your reputation as a music tastemaker in three
                            simple steps. Discover tomorrow&apos;s hits before
                            they explode on social media.
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
                                    discover hidden gems before anyone else
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
                                    or other social platforms
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
                                    exceptional music discovery skills
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
                        The Future of Music Discovery
                    </h2>
                    <p className="mb-8 text-xl leading-relaxed text-slate-600">
                        Sound Sage is more than just a music platform—it&apos;s
                        a community for true music enthusiasts who have an ear
                        for what&apos;s next. Whether you&apos;re into indie
                        pop, electronic, hip-hop, or alternative, our platform
                        helps you discover and claim tracks before they become
                        mainstream hits.
                    </p>
                    <p className="mb-10 text-lg leading-relaxed text-slate-600">
                        Join a community of music lovers who understand that
                        great music deserves to be discovered early. Build your
                        reputation, connect with like-minded listeners, and
                        prove that you have what it takes to spot the next big
                        thing.
                    </p>
                    <Button
                        size="lg"
                        className="bg-sage-600 hover:bg-sage-700 px-10 py-4 text-lg text-white shadow-lg"
                    >
                        Start Your Journey
                        <ArrowRight className="ml-2" size={20} />
                    </Button>
                </div>
            </section>

            {/* CTA Section */}
            <section className="from-sage-50 bg-gradient-to-br to-blue-50 px-4 py-20">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="mb-6 text-3xl font-bold text-slate-800 md:text-4xl">
                        Ready to Discover Tomorrow&apos;s Hits Today?
                    </h2>
                    <p className="mb-10 text-xl leading-relaxed text-slate-600">
                        Join the music discovery revolution. Start building your
                        reputation as a tastemaker and prove you can spot hits
                        before they go viral.
                    </p>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Button
                            size="lg"
                            className="bg-sage-600 hover:bg-sage-700 px-10 py-4 text-lg text-white shadow-lg"
                        >
                            Sign Up Now — It&apos;s Free
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
        </div>
    )
}
