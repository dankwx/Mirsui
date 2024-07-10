import Link from 'next/link'
import GetAuth from '../GetAuth/GetAuth'

export default function () {
    return (
        <main className="flex h-12 w-full flex-col">
            <div className="flex flex-grow items-center justify-center border-b-2 border-solid border-gray-200 font-sans font-medium">
                <div className="flex w-3/4 items-center">
                    <div className="flex w-full justify-between text-xl items-center">
                        <div className="flex align-middle justify-center items-center">
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
                        </div>

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
