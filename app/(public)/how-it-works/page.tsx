import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Music,
    Headphones,
    Award,
    TrendingUp,
    Clock,
    Users,
    Target,
    CheckCircle2,
    ArrowRight,
    Zap,
    Heart,
    Star,
    Trophy,
    Share2,
    BarChart3,
} from 'lucide-react'
import type { Metadata } from 'next'
import GetAuth from '@/components/GetAuth/GetAuth'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
    title: 'Como Funciona - Mirsui',
    description:
        'Entenda como funciona a Mirsui: descubra músicas antes de bombarem, salve suas descobertas e prove que você tem ouvido pra música boa.',
}

export default async function HowItWorksPage() {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()
    
    // Se o usuário estiver logado, redireciona para o feed
    if (data.user) {
        redirect('/feed')
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 border-b border-white/20 bg-white/70 px-4 py-4 backdrop-blur-xl shadow-lg shadow-black/5">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
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
                    </Link>

                    <div className="mx-auto max-w-7xl flex gap-6">
                        <Link
                            href="/how-it-works"
                            className="font-medium text-slate-700 hover:text-slate-900 transition-colors"
                        >
                            Como funciona
                        </Link>
                        <Link
                            href="/#discover"
                            className="font-medium text-slate-700 hover:text-slate-900 transition-colors"
                        >
                            Explorar
                        </Link>
                        <Link
                            href="/#about"
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
            <section className="relative overflow-hidden px-4 py-20 md:py-28">
                <div className="absolute inset-0 bg-gradient-to-br from-sage-100/40 via-transparent to-blue-100/40"></div>
                <div className="relative z-10 mx-auto max-w-5xl text-center">
                    <Badge className="mb-6 bg-sage-100 text-sage-700 px-4 py-1.5 text-sm">
                        Como Funciona
                    </Badge>
                    <h1 className="mb-6 text-4xl font-bold leading-tight text-slate-900 md:text-6xl">
                        Descubra. Salve.
                        <span className="text-sage-600 block">Comprove.</span>
                    </h1>
                    <p className="mx-auto mb-10 max-w-3xl text-xl leading-relaxed text-slate-600 md:text-2xl">
                        É simples: você encontra músicas que ninguém tá ouvindo
                        ainda, salva no seu perfil, e quando bombar, você tem a
                        prova que descobriu primeiro.
                    </p>
                </div>

                {/* Background Elements */}
                <div className="absolute inset-0 overflow-hidden opacity-30">
                    <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-sage-200 to-blue-200 blur-3xl"></div>
                    <div className="absolute -left-32 top-1/2 h-96 w-96 rounded-full bg-gradient-to-br from-rose-200 to-orange-200 blur-3xl"></div>
                </div>
            </section>

            {/* Main Process Steps */}
            <section className="px-4 py-16">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
                            O processo é simples
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-slate-600">
                            Três passos para provar que você tem ouvido pra
                            música boa
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Step 1 */}
                        <Card className="group relative overflow-hidden border-white/60 bg-gradient-to-br from-sage-500/10 via-white/80 to-white/60 backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-sage-500/20">
                            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-sage-300/30 to-transparent blur-2xl transition-all duration-500 group-hover:scale-150"></div>
                            <CardContent className="relative pt-10 pb-8">
                                <div className="mb-8 flex items-center justify-between">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sage-500/30 to-sage-600/30 shadow-lg backdrop-blur-md border border-sage-400/40">
                                        <Headphones
                                            className="text-sage-700"
                                            size={32}
                                        />
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-100 text-2xl font-bold text-sage-700">
                                        1
                                    </div>
                                </div>
                                <h3 className="mb-4 text-2xl font-bold text-slate-900">
                                    Descubra Músicas
                                </h3>
                                <p className="mb-6 leading-relaxed text-slate-700">
                                    Explore nossa biblioteca de músicas
                                    emergentes. Use os filtros por gênero, ano,
                                    ou veja o que tá começando a crescer no
                                    ranking.
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <CheckCircle2
                                            size={16}
                                            className="text-sage-600"
                                        />
                                        <span>Músicas de todos os gêneros</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <CheckCircle2
                                            size={16}
                                            className="text-sage-600"
                                        />
                                        <span>Atualizado constantemente</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <CheckCircle2
                                            size={16}
                                            className="text-sage-600"
                                        />
                                        <span>Rankings em tempo real</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Step 2 */}
                        <Card className="group relative overflow-hidden border-white/60 bg-gradient-to-br from-blue-500/10 via-white/80 to-white/60 backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
                            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-blue-300/30 to-transparent blur-2xl transition-all duration-500 group-hover:scale-150"></div>
                            <CardContent className="relative pt-10 pb-8">
                                <div className="mb-8 flex items-center justify-between">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/30 to-blue-600/30 shadow-lg backdrop-blur-md border border-blue-400/40">
                                        <Award
                                            className="text-blue-700"
                                            size={32}
                                        />
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
                                        2
                                    </div>
                                </div>
                                <h3 className="mb-4 text-2xl font-bold text-slate-900">
                                    Salve
                                </h3>
                                <p className="mb-6 leading-relaxed text-slate-700">
                                    Achou uma música que você sente que vai
                                    bombar? Clica em &quot;Salvar&quot; e ela vai
                                    pro seu perfil. Simples assim. Agora tá
                                    registrado.
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <CheckCircle2
                                            size={16}
                                            className="text-blue-600"
                                        />
                                        <span>Achados ilimitados</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <CheckCircle2
                                            size={16}
                                            className="text-blue-600"
                                        />
                                        <span>Data e hora registradas</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <CheckCircle2
                                            size={16}
                                            className="text-blue-600"
                                        />
                                        <span>Certificado digital</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Step 3 */}
                        <Card className="group relative overflow-hidden border-white/60 bg-gradient-to-br from-rose-500/10 via-white/80 to-white/60 backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-rose-500/20">
                            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-rose-300/30 to-transparent blur-2xl transition-all duration-500 group-hover:scale-150"></div>
                            <CardContent className="relative pt-10 pb-8">
                                <div className="mb-8 flex items-center justify-between">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/30 to-rose-600/30 shadow-lg backdrop-blur-md border border-rose-400/40">
                                        <TrendingUp
                                            className="text-rose-700"
                                            size={32}
                                        />
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-2xl font-bold text-rose-700">
                                        3
                                    </div>
                                </div>
                                <h3 className="mb-4 text-2xl font-bold text-slate-900">
                                    Comprove seu Gosto
                                </h3>
                                <p className="mb-6 leading-relaxed text-slate-700">
                                    Quando a música bombar, você tem seu
                                    certificado provando que ouviu primeiro.
                                    Compartilhe nas redes e mostre seu ouvido.
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <CheckCircle2
                                            size={16}
                                            className="text-rose-600"
                                        />
                                        <span>Certificados compartilháveis</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <CheckCircle2
                                            size={16}
                                            className="text-rose-600"
                                        />
                                        <span>Score de descobridor</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <CheckCircle2
                                            size={16}
                                            className="text-rose-600"
                                        />
                                        <span>Ranking de tastemakers</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-gradient-to-b from-white to-slate-50 px-4 py-20">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
                            Recursos da Plataforma
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-slate-600">
                            Tudo que você precisa pra descobrir e provar seu
                            gosto musical
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* Feature 1 */}
                        <Card className="border-white/60 bg-white/60 backdrop-blur-xl transition-all hover:scale-105 hover:shadow-xl">
                            <CardContent className="pt-6">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sage-500/20 to-sage-600/20">
                                    <Clock
                                        className="text-sage-700"
                                        size={24}
                                    />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                                    Timeline de Descoberta
                                </h3>
                                <p className="text-sm leading-relaxed text-slate-600">
                                    Veja quando você descobriu cada música e
                                    como ela cresceu desde então
                                </p>
                            </CardContent>
                        </Card>

                        {/* Feature 2 */}
                        <Card className="border-white/60 bg-white/60 backdrop-blur-xl transition-all hover:scale-105 hover:shadow-xl">
                            <CardContent className="pt-6">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20">
                                    <BarChart3
                                        className="text-blue-700"
                                        size={24}
                                    />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                                    Estatísticas Detalhadas
                                </h3>
                                <p className="text-sm leading-relaxed text-slate-600">
                                    Acompanhe o crescimento das suas músicas e
                                    seu score como descobridor
                                </p>
                            </CardContent>
                        </Card>

                        {/* Feature 3 */}
                        <Card className="border-white/60 bg-white/60 backdrop-blur-xl transition-all hover:scale-105 hover:shadow-xl">
                            <CardContent className="pt-6">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/20 to-rose-600/20">
                                    <Trophy
                                        className="text-rose-700"
                                        size={24}
                                    />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                                    Certificados Digitais
                                </h3>
                                <p className="text-sm leading-relaxed text-slate-600">
                                    Receba certificados bonitos e
                                    compartilháveis das suas descobertas
                                </p>
                            </CardContent>
                        </Card>

                        {/* Feature 4 */}
                        <Card className="border-white/60 bg-white/60 backdrop-blur-xl transition-all hover:scale-105 hover:shadow-xl">
                            <CardContent className="pt-6">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/20">
                                    <Users
                                        className="text-violet-700"
                                        size={24}
                                    />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                                    Comunidade Ativa
                                </h3>
                                <p className="text-sm leading-relaxed text-slate-600">
                                    Conecte-se com outros descobridores e veja
                                    o que eles estão ouvindo
                                </p>
                            </CardContent>
                        </Card>

                        {/* Feature 5 */}
                        <Card className="border-white/60 bg-white/60 backdrop-blur-xl transition-all hover:scale-105 hover:shadow-xl">
                            <CardContent className="pt-6">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/20">
                                    <Target
                                        className="text-amber-700"
                                        size={24}
                                    />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                                    Rankings & Leaderboards
                                </h3>
                                <p className="text-sm leading-relaxed text-slate-600">
                                    Compete com outros usuários e suba no
                                    ranking dos melhores descobridores
                                </p>
                            </CardContent>
                        </Card>

                        {/* Feature 6 */}
                        <Card className="border-white/60 bg-white/60 backdrop-blur-xl transition-all hover:scale-105 hover:shadow-xl">
                            <CardContent className="pt-6">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20">
                                    <Share2
                                        className="text-emerald-700"
                                        size={24}
                                    />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                                    Compartilhamento Social
                                </h3>
                                <p className="text-sm leading-relaxed text-slate-600">
                                    Compartilhe suas descobertas e certificados
                                    no Instagram, Twitter e mais
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* How Scoring Works */}
            <section className="px-4 py-20">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
                            Como funciona o Score
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-slate-600">
                            Seu score aumenta baseado em quão cedo você
                            descobriu músicas que depois bombaram
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {/* Scoring Rules */}
                        <Card className="border-white/60 bg-gradient-to-br from-white/80 to-sage-50/50 backdrop-blur-xl shadow-xl">
                            <CardContent className="p-8">
                                <div className="mb-6 flex items-center gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sage-500 to-sage-600 shadow-lg">
                                        <Star
                                            className="text-white"
                                            size={28}
                                        />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900">
                                        Sistema de Pontos
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-100">
                                            <Zap
                                                size={14}
                                                className="text-sage-700"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">
                                                Timing é Tudo
                                            </p>
                                            <p className="text-sm text-slate-600">
                                                Quanto mais cedo você salva,
                                                mais pontos ganha quando a
                                                música cresce
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100">
                                            <TrendingUp
                                                size={14}
                                                className="text-blue-700"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">
                                                Crescimento Importa
                                            </p>
                                            <p className="text-sm text-slate-600">
                                                Músicas que explodem dão mais
                                                pontos que as que crescem
                                                devagar
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100">
                                            <Heart
                                                size={14}
                                                className="text-rose-700"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">
                                                Consistência Conta
                                            </p>
                                            <p className="text-sm text-slate-600">
                                                Salvar faixas regularmente e
                                                acertar várias vezes aumenta seu
                                                multiplicador
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Example Timeline */}
                        <Card className="border-white/60 bg-gradient-to-br from-white/80 to-blue-50/50 backdrop-blur-xl shadow-xl">
                            <CardContent className="p-8">
                                <div className="mb-6 flex items-center gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                                        <Trophy
                                            className="text-white"
                                            size={28}
                                        />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900">
                                        Exemplo Real
                                    </h3>
                                </div>
                                <div className="space-y-6">
                                    <div className="relative pl-8">
                                        <div className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-sage-200 text-xs font-bold text-sage-700">
                                            1
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">
                                                Dia 1 - Você salva
                                            </p>
                                            <p className="text-xs text-slate-600">
                                                Música com 5k plays no Spotify
                                            </p>
                                        </div>
                                    </div>
                                    <div className="relative pl-8">
                                        <div className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-700">
                                            2
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">
                                                Dia 30 - Começa a crescer
                                            </p>
                                            <p className="text-xs text-slate-600">
                                                Música chega a 50k plays
                                            </p>
                                        </div>
                                    </div>
                                    <div className="relative pl-8">
                                        <div className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-700">
                                            3
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">
                                                Dia 90 - Viraliza
                                            </p>
                                            <p className="text-xs text-slate-600">
                                                Música passa de 1M plays
                                            </p>
                                        </div>
                                    </div>
                                    <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 p-4 border border-emerald-500/20">
                                        <p className="text-sm font-semibold text-emerald-800">
                                            🎉 Você ganhou 150 pontos!
                                        </p>
                                        <p className="text-xs text-emerald-700">
                                            Descobridor super cedo de um hit
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="bg-gradient-to-b from-slate-50 to-white px-4 py-20">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
                            Perguntas Frequentes
                        </h2>
                        <p className="text-lg text-slate-600">
                            Tudo que você precisa saber sobre a Mirsui
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Card className="border-white/60 bg-white/60 backdrop-blur-xl">
                            <CardContent className="p-6">
                                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                                    Quantas faixas posso salvar?
                                </h3>
                                <p className="leading-relaxed text-slate-600">
                                    Quantas você quiser, não tem limite. Salve
                                    todas as músicas que você acha que vão
                                    bombar.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-white/60 bg-white/60 backdrop-blur-xl">
                            <CardContent className="p-6">
                                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                                    Posso perder pontos?
                                </h3>
                                <p className="leading-relaxed text-slate-600">
                                    Não! Se uma música que você salvou não
                                    bombar, você simplesmente não ganha pontos.
                                    Mas não perde nada.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-white/60 bg-white/60 backdrop-blur-xl">
                            <CardContent className="p-6">
                                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                                    Como vocês medem se uma música bombou?
                                </h3>
                                <p className="leading-relaxed text-slate-600">
                                    Usamos dados do Spotify, YouTube e outras
                                    plataformas pra acompanhar o crescimento das
                                    músicas em tempo real.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-white/60 bg-white/60 backdrop-blur-xl">
                            <CardContent className="p-6">
                                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                                    Posso adicionar músicas que não estão na
                                    plataforma?
                                </h3>
                                <p className="leading-relaxed text-slate-600">
                                    Em breve! Estamos trabalhando num sistema
                                    pra você sugerir músicas e artistas novos
                                    pra gente adicionar.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-white/60 bg-white/60 backdrop-blur-xl">
                            <CardContent className="p-6">
                                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                                    É gratuito?
                                </h3>
                                <p className="leading-relaxed text-slate-600">
                                    Sim! A plataforma é totalmente gratuita pra
                                    usar. Achados ilimitados, selos,
                                    estatísticas, tudo de graça.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-white/60 bg-white/60 backdrop-blur-xl">
                            <CardContent className="p-6">
                                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                                    Como compartilho meus certificados?
                                </h3>
                                <p className="leading-relaxed text-slate-600">
                                    Cada certificado tem um botão de
                                    compartilhar que gera uma imagem linda
                                    otimizada pra Instagram Stories, Twitter e
                                    outras redes sociais.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative overflow-hidden px-4 py-20">
                <div className="absolute inset-0 bg-gradient-to-br from-sage-500/20 via-blue-500/20 to-purple-500/20"></div>
                <div className="absolute inset-0 bg-white/70 backdrop-blur-3xl"></div>
                <div className="relative z-10 mx-auto max-w-4xl text-center">
                    <h2 className="mb-6 text-3xl font-bold text-slate-900 md:text-5xl">
                        Pronto pra provar seu gosto musical?
                    </h2>
                    <p className="mb-10 text-xl leading-relaxed text-slate-700">
                        Entre agora e comece a descobrir músicas antes de todo
                        mundo. É grátis e leva menos de um minuto.
                    </p>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Link href="/feed">
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-sage-600 to-sage-700 hover:from-sage-700 hover:to-sage-800 px-10 py-6 text-lg text-white shadow-2xl shadow-sage-600/40 hover:shadow-3xl hover:shadow-sage-600/60 transition-all duration-300"
                            >
                                Começar agora
                                <ArrowRight className="ml-2" size={20} />
                            </Button>
                        </Link>
                        <Link href="/">
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-white/50 bg-white/40 backdrop-blur-xl px-10 py-6 text-lg text-slate-800 hover:bg-white/60 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                Voltar ao início
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Background Elements */}
                <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
                    <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-gradient-to-br from-sage-200 to-blue-200 blur-3xl"></div>
                    <div className="absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-gradient-to-br from-rose-200 to-purple-200 blur-3xl"></div>
                </div>
            </section>
        </div>
    )
}
