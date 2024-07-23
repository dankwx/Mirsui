import React, { useEffect, useState } from 'react'
import Header from '@/components/Header/Header'
import Sidebar from '@/components/Sidebar/Sidebar'
import ClaimArtist from '@/components/ClaimArtist/ClaimArtist'

export default function ClaimVideoPage() {
    return (
        <main className="flex min-h-screen flex-col">
            <Header />
            <div className="flex min-h-full w-full flex-1 flex-col justify-between font-mono text-sm">
                <div className="flex h-full flex-1">
                    <Sidebar />
                    <ClaimArtist />
                </div>
            </div>
        </main>
    )
}
