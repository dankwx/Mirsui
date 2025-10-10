import React, { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Target } from 'lucide-react'
import DiscoveryStatsWithLoading from '@/components/DiscoveryStats/DiscoveryStatsWithLoading'

function SidebarSkeleton() {
    return (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-6 w-32" />
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* User Profile Skeleton */}
                <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-6 w-8" />
                </div>

                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-2 gap-3">
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
                <div className="space-y-3">
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
            </CardContent>
        </Card>
    )
}

export default function FeedSidebar() {
    return (
        <Suspense fallback={<SidebarSkeleton />}>
            <DiscoveryStatsWithLoading />
        </Suspense>
    )
}