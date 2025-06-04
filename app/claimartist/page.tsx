import React, { useEffect, useState } from 'react'
import Header from '@/components/Header/Header'
import Sidebar from '@/components/Sidebar/Sidebar'
import ClaimArtist from '@/components/ClaimArtist/ClaimArtist'

export default function ClaimVideoPage() {
    return (
        <main className="flex min-h-screen flex-col">
            <ClaimArtist />
        </main>
    )
}
