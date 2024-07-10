import Header from './components/Header/Header'
import GetLatestClaims from '@/app/components/GetLatestClaims/GetLatestClaims'

export default async function Home() {
    return (
        <main className="flex min-h-screen flex-col">
            <Header />
            <div className="flex min-h-full w-full flex-1 flex-col justify-between pt-8 font-mono text-sm">
                <div className="flex h-full w-full flex-col items-center">
                    <div className="flex w-1/2 flex-col items-center align-middle">
                        <div className="my-6 flex h-fit flex-col items-center justify-center">
                            <p className="py-6 font-sans text-9xl font-bold">
                            <span className="relative inline-block">
                                    <span className="subtle-wave-text">eternize all.</span>
                                    <span className="animate-underline absolute -bottom-2 left-0 h-1 w-full bg-black"></span>
                                </span>
                            </p>
                            <p className="break-words text-center font-sans text-lg font-normal text-neutral-800">
                                Why not have a simple way to showoff that you
                                hear that music way before it gets viral on the
                                web? And also have a score &apos;cause you discovered
                                before everyone
                            </p>
                        </div>
                    </div>
                    <div className="h-fit w-full bg-gray-100 px-6">
                        <div className="h-96">
                            <div className="h-full w-1/3 border-2 border-solid border-black"></div>
                        </div>
                    </div>
                    <GetLatestClaims />
                    <div className="flex flex-col">
                        <p className="m-6">aa</p>
                        <p className="m-6">aa</p>
                        <p className="m-6">aa</p>
                        <p className="m-6">aa</p>
                        <p className="m-6">aa</p>
                    </div>
                </div>
            </div>
        </main>
    )
}
