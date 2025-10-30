import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function FeedPostSkeleton() {
    return (
        <Card className="border border-gray-200 bg-white">
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
                <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
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
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
                    {/* Main Feed Skeleton - 8 colunas */}
                    <div className="lg:col-span-8 space-y-6">
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

                    {/* Right Sidebar Skeleton - Reivindicações Recentes - 4 colunas */}
                    <div className="lg:col-span-4">
                        <Card className="border border-gray-200 bg-white">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Skeleton className="h-5 w-5" />
                                    <Skeleton className="h-5 w-40" />
                                </div>
                                <div className="space-y-3">
                                    {Array.from({ length: 4 }).map((_, index) => (
                                        <div key={index} className="flex items-center gap-3 p-2 rounded-lg">
                                            <Skeleton className="h-12 w-12 rounded-md" />
                                            <div className="flex-1 min-w-0">
                                                <Skeleton className="h-4 w-full mb-1" />
                                                <Skeleton className="h-3 w-3/4" />
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
    )
}