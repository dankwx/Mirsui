import Link from 'next/link'

export default function Sidebar() {
    return (
        <main className="flex max-w-72 flex-grow border-r-2 border-solid border-gray-200 bg-gray-50">
            <div className="flex flex-col">
                <Link href="/getchannel">Claim Channel</Link>
                <Link href="/newclaimedvideos">View New Claimed</Link>
                <Link href="/claimedprofile/126c6d8e-fa47-4677-9599-708174aaa3fe">Ver meu perfil</Link>
            </div>
        </main>
    )
}
