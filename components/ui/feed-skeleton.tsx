import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function FeedPostSkeleton() {
    return (
        <Card className="border-0 shadow-md">
            <CardContent className="p-6">
                {/* Header do Post Skeleton */}
                <div className="flex items-start gap-3 mb-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-3 w-3 rounded-full" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="flex items-center gap-1">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                </div>

                {/* Conteúdo da música Skeleton */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-lg" />
                        <div className="flex-1">
                            <Skeleton className="h-5 w-48 mb-2" />
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-3 w-24 mb-2" />
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-4 w-12" />
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tags Skeleton */}
                <div className="flex gap-2 mb-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>

                {/* Interações Skeleton */}
                <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-16" />
                </div>
            </CardContent>
        </Card>
    )
}

export function FeedSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="container mx-auto px-4 py-8">
                <div className="grid gap-8 lg:grid-cols-4">
                    {/* Left Sidebar Skeleton */}
                    <div className="lg:col-span-1">
                        <div className="space-y-6">
                            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 shadow-lg">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Skeleton className="h-5 w-5" />
                                        <Skeleton className="h-6 w-32" />
                                    </div>
                                    
                                    {/* User Profile Skeleton */}
                                    <div className="flex items-center gap-3 mb-6">
                                        <Skeleton className="h-12 w-12 rounded-full" />
                                        <div className="flex-1">
                                            <Skeleton className="h-4 w-24 mb-1" />
                                            <Skeleton className="h-3 w-16" />
                                        </div>
                                        <Skeleton className="h-6 w-8" />
                                    </div>

                                    {/* Stats Grid Skeleton */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        {Array.from({ length: 4 }).map((_, index) => (
                                            <Card key={index} className="bg-white/60 border-purple-100">
                                                <CardContent className="p-3 text-center">
                                                    <Skeleton className="h-6 w-8 mx-auto mb-1" />
                                                    <Skeleton className="h-3 w-12 mx-auto" />
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                    {/* Progress Bars Skeleton */}
                                    <div className="space-y-3 mb-6">
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <Skeleton className="h-3 w-20" />
                                                <Skeleton className="h-3 w-8" />
                                            </div>
                                            <Skeleton className="h-2 w-full rounded-full" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <Skeleton className="h-3 w-24" />
                                                <Skeleton className="h-3 w-8" />
                                            </div>
                                            <Skeleton className="h-2 w-full rounded-full" />
                                        </div>
                                    </div>

                                    {/* Badges Skeleton */}
                                    <div className="flex flex-wrap gap-2">
                                        {Array.from({ length: 3 }).map((_, index) => (
                                            <Skeleton key={index} className="h-6 w-16 rounded-full" />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Main Feed Skeleton */}
                    <div className="lg:col-span-2">
                        <div className="space-y-6">
                            {/* Header Skeleton */}
                            <div className="text-center py-6">
                                <Skeleton className="h-8 w-48 mx-auto mb-2" />
                                <Skeleton className="h-4 w-64 mx-auto" />
                            </div>

                            {/* Posts Skeleton */}
                            <div className="space-y-6">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <FeedPostSkeleton key={index} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar Skeleton */}
                    <div className="lg:col-span-1">
                        <div className="space-y-6">
                            <Card className="border-0 shadow-md">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Skeleton className="h-2 w-2 rounded-full" />
                                        <Skeleton className="h-5 w-28" />
                                    </div>
                                    <div className="space-y-4">
                                        {Array.from({ length: 5 }).map((_, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 rounded-lg">
                                                <div className="relative">
                                                    <Skeleton className="h-10 w-10 rounded-full" />
                                                    <Skeleton className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Skeleton className="h-3 w-16" />
                                                        <Skeleton className="h-2 w-2 rounded-full" />
                                                        <Skeleton className="h-3 w-8" />
                                                    </div>
                                                    <Skeleton className="h-3 w-24 mb-1" />
                                                    <div className="flex items-center gap-2">
                                                        <Skeleton className="h-3 w-12" />
                                                        <Skeleton className="h-3 w-8" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}