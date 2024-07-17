import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

interface ArtistClaim {
    artist_id: string
    claim_date: string
    popularity_at_claim: number
    artists: {
        id: string
        artist_name: string
        artist_image_url: string
    }
}

interface FormattedArtist {
    id: string
    artist_name: string
    artist_image_url: string
    popularity_at_claim: number
    claim_date: string
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
        return NextResponse.json(
            { error: 'User ID is required' },
            { status: 400 }
        )
    }

    const supabase = createClient()

    try {
        const { data, error } = await supabase
            .from('userartistclaims')
            .select(
                `
        artist_id,
        claim_date,
        popularity_at_claim,
        artists:artists(id, artist_name, artist_image_url)
      `
            )
            .eq('user_id', userId)
            .order('claim_date', { ascending: false })

        if (error) throw error

        console.log('Raw data:', JSON.stringify(data, null, 2))

        if (!data || data.length === 0) {
            return NextResponse.json([])
        }

        const formattedData: FormattedArtist[] = data.map((item: any) => {
            console.log('Processing item:', JSON.stringify(item, null, 2))
            return {
                id: item.artist_id,
                artist_name: item.artists?.artist_name || 'Unknown Artist',
                artist_image_url: item.artists?.artist_image_url || '',
                popularity_at_claim: item.popularity_at_claim,
                claim_date: item.claim_date,
            }
        })

        return NextResponse.json(formattedData)
    } catch (error) {
        console.error('API route error:', error)
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        )
    }
}