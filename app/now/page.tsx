import Header from '../../components/Header/Header'
import Sidebar from '../../components/Sidebar/Sidebar'
import GetLatestClaims from '@/components/GetLatestClaims/GetLatestClaims'

export default function faq() {
    return (
        <main className="flex min-h-screen flex-col">
            <p>faq</p>
            <GetLatestClaims />
        </main>
    )
}
