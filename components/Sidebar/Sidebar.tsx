import Link from 'next/link'

export default function Sidebar() {
    return (
        <aside className="flex min-w-64 min-h-11 border-r-2 border-solid border-gray-200 bg-gray-50 pt-16">
            <div className="fixed flex w-fit flex-col text-black">
                <Link href="/getchannel">Claim Channel</Link>
                <Link href="/claimvideo">Claim Video</Link>
                <Link href="/claimtrack">Claim Track</Link>
            </div>
        </aside>
    )
}
