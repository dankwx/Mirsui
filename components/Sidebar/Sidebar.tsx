import Link from 'next/link'

export default function Sidebar() {
    return (
        <main className="flex min-w-fit max-w-72 flex-grow border-r-2 border-solid border-gray-200 bg-gray-50">
            <div className="flex w-fit flex-col">
                <Link href="/getchannel">Claim Channel</Link>
                <Link href="/claimvideo">Claim Video</Link>
            </div>
        </main>
    )
}
