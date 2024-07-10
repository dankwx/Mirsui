import React, { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import firebaseConfig from '../firebase-config'
import { getAuth } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import Header from '@/app/components/Header/Header'
import Sidebar from '@/app/components/Sidebar/Sidebar'
import ClaimChannel from '@/app/components/ClaimChannel/ClaimChannel'

export default function GetChannelInfo() {
    return (
        <main className="flex min-h-screen flex-col">
            <Header />
            <div className="flex min-h-full w-full flex-1 flex-col justify-between font-mono text-sm">
                <div className="flex h-full flex-1">
                    <Sidebar />
                    <ClaimChannel />
                </div>
            </div>
        </main>
    )
}
