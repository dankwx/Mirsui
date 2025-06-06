import type React from 'react'

import { Search, Music, Clock, Play, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import RecentActivity from '@/components/RecentActivity/RecentActivity'
import SearchWithResults from '@/components/SearchWithResults/SearchWithResults'
import TrendingPage from '@/components/TrendingTracks/TrendingTracks'

export default function ClaimTracksPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="max-w-7xl p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">
                        Claim Tracks
                    </h1>
                    <p className="text-gray-600">
                        Discover new music and claim tracks before they go viral
                    </p>
                </div>

                {/* Search */}
                <SearchWithResults />
                <div className="flex max-w-full">
                    <RecentActivity />
                    <TrendingPage />
                </div>
            </div>
        </div>
    )
}
