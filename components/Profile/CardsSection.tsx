import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const CardsSection: React.FC = () => {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-muted p-4">
                <CardHeader>
                    <CardTitle>Total Saved Songs</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">142</div>
                </CardContent>
            </Card>
            <Card className="bg-muted p-4">
                <CardHeader>
                    <CardTitle>Total Saved YouTube Channels</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">24</div>
                </CardContent>
            </Card>
            <Card className="bg-muted p-4">
                <CardHeader>
                    <CardTitle>Total Saved Spotify Artists</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">18</div>
                </CardContent>
            </Card>
        </div>
    )
}

export default CardsSection