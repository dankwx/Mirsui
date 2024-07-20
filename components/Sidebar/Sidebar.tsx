'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <aside
            className={`fixed z-50 flex min-h-screen border-r-2 border-solid border-gray-200 bg-gray-50 pt-16 transition-all duration-300 ease-in-out ${
                isExpanded ? 'w-56' : 'w-20'
            }`}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <div className="flex w-fit flex-col overflow-hidden whitespace-nowrap text-black min-h-screen">
                <Link href="/getchannel" className="p-2 hover:bg-gray-200">
                    {isExpanded ? '📺 Claim Channel' : '📺'}
                </Link>
                <Link href="/claimvideo" className="p-2 hover:bg-gray-200">
                    {isExpanded ? '🎥 Claim Video' : '🎥'}
                </Link>
                <Link href="/claimtrack" className="p-2 hover:bg-gray-200">
                    {isExpanded ? '🎵 Claim Track' : '🎵'}
                </Link>
            </div>
        </aside>
    )
}
