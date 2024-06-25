import Header from './components/Header/Header'

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col">
            <div className="w-full items-center justify-between font-mono text-sm">
                <Header />
                <p>titulo</p>
            </div>
        </main>
    )
}
