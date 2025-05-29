import GetAuth from '../GetAuth/GetAuth'
import Logo from './Logo'
import SearchWithResults from '../SearchWithResults/SearchWithResults'

export default function Header() {
    return (
        <main className="fixed sticky top-0 z-10 z-50 flex h-16 w-full flex-col border-b bg-white bg-white/80 backdrop-blur-sm">
            <div className="flex flex-grow items-center justify-center border-b-2 border-solid border-gray-200 font-sans font-medium">
                <div className="flex w-3/4 items-center">
                    <div className="flex w-full items-center justify-between text-xl">
                        <Logo />
                        <SearchWithResults />
                        <div className="flex items-center justify-center">
                            <GetAuth />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
