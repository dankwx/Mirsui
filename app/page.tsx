import Header from '../components/Header/Header'
import Sidebar from '../components/Sidebar/Sidebar'
import GetLatestClaims from '@/components/GetLatestClaims/GetLatestClaims'
import ClaimArtist from '@/components/ClaimArtist/ClaimArtist'

export default async function Home() {
    return (
        <main className="flex min-h-screen flex-col">
            <Header />
            <div className="flex min-h-full w-full flex-1 flex-col justify-between font-mono text-sm">
                <div className="flex h-full w-full flex-col items-center">
                    {/* <Sidebar /> */}
                    <div className="flex w-1/2 flex-col items-center align-middle">
                        {/* <ClaimArtist /> */}
                        <div className="my-6 flex h-fit flex-col items-center justify-center">
                            <p className="py-6 font-sans text-9xl font-bold">
                                eternize all.
                            </p>
                            <p className="break-words text-center font-sans font-normal text-lg text-neutral-800">
                                Why not have a simple way to showoff that you
                                hear that music way before it gets viral on the
                                web? And also have a score 'cause you discovered
                                before everyone
                            </p>
                        </div>
                    </div>
                    <div className="h-fit w-full bg-gray-100">
                        <GetLatestClaims />
                    </div>
                </div>
            </div>
        </main>
    )
}
