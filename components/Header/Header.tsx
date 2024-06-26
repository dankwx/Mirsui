import Link from 'next/link'
import GetAuth from '../GetAuth/GetAuth'

export default function () {
    return (
        <main className="flex h-16 w-full flex-col">
            <div className="flex flex-grow items-center justify-center border-b-2 border-solid border-gray-200 font-sans font-medium">
                <div className="flex w-3/4">
                    <div className="flex w-full justify-between text-xl">
                        <Link href="/">eternizing</Link>
                        <div className="flex">
                            <Link href="/faq">FAQ</Link>
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
