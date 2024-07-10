'use server'

import Link from 'next/link'
import GetAuth from '../GetAuth/GetAuth'
import { Input } from '../ui/input'
import { SearchIcon } from 'lucide-react'
import Logo from './Logo'

export default async function Header() {
    return (
        <main className="fixed z-10 flex h-16 w-full flex-col bg-white">
            <div className="flex flex-grow items-center justify-center border-b-2 border-solid border-gray-200 font-sans font-medium">
                <div className="flex w-3/4 items-center">
                    <div className="flex w-full items-center justify-between text-xl">
                        {/* <div className="flex items-center justify-center align-middle">
                            <svg
                                className="mr-2"
                                xmlns="http://www.w3.org/2000/svg"
                                width="44"
                                height="38"
                                viewBox="0 0 24 20"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z" />
                            </svg>
                            <Link className="text-center align-middle" href="/">
                                eternizing
                            </Link>
                        </div> */}
                        <Logo />
                        <div className="flex flex-grow items-center justify-center align-middle">
                            <div className="relative flex w-full max-w-md items-center">
                                <SearchIcon className="absolute left-3 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search a Artist or Channel..."
                                    className="w-full rounded-lg bg-background py-2 pl-10 pr-4 text-sm transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-center">
                            <GetAuth />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
