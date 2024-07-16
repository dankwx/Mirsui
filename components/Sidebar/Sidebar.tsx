"use client"

import Link from 'next/link'
import { useState } from 'react'

export default function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <aside 
            className={`flex min-h-11 border-r-2 border-solid border-gray-200 bg-gray-50 pt-16 transition-all duration-300 ease-in-out ${isExpanded ? 'min-w-64' : 'min-w-16'}`}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <div className="fixed flex w-fit flex-col text-black overflow-hidden whitespace-nowrap">
                <Link href="/getchannel" className="p-2 hover:bg-gray-200">
                    {isExpanded ? 'Claim Channel' : '📺'}
                </Link>
                <Link href="/claimvideo" className="p-2 hover:bg-gray-200">
                    {isExpanded ? 'Claim Video' : '🎥'}
                </Link>
                <Link href="/claimtrack" className="p-2 hover:bg-gray-200">
                    {isExpanded ? 'Claim Track' : '🎵'}
                </Link>
            </div>
        </aside>
    )
}