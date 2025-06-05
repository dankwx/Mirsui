import React, { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { getAuth } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import Header from '@/components/Header/Header'
import Sidebar from '@/components/Sidebar/Sidebar'
import ClaimChannel from '@/components/ClaimChannel/ClaimChannel'

export default function GetChannelInfo() {
    return (
        <main className="flex min-h-screen flex-col">
            <ClaimChannel />
        </main>
    )
}
