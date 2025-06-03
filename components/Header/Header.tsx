import GetAuth from '../GetAuth/GetAuth'
import Logo from './Logo'
import SearchWithResults from '../SearchWithResults/SearchWithResults'

export default function Header() {
    return (
        <header className="flex h-16 w-full shrink-0 items-center justify-start border-b-2 border-solid border-gray-200 bg-white font-sans font-medium">
            <div className="flex w-full items-center">
                <div className="flex w-full items-center">
                    <div className="flex w-full text-xl">
                        <SearchWithResults />
                        <div className="flex items-center">
                            {/* <GetAuth /> */}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
