import { createClient } from '@/utils/supabase/server'

export async function fetchChannels(userId: string) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('userchannelclaims')
        .select(
            `
            id,
            channel_id,
            claim_date,
            subscriber_count_at_claim,
            channels (
                id,
                channel_name,
                profile_image_url
            )
        `
        )
        .eq('user_id', userId)
        .order('claim_date', { ascending: false })

    if (error) {
        console.error('Error fetching channels:', error)
        return []
    }

    // Format the channels array
    const formattedData = data.map((item: any) => ({
        id: item.id,
        channel_id: item.channel_id,
        claim_date: item.claim_date,
        subscriber_count_at_claim: item.subscriber_count_at_claim,
        channel_name: item.channels.channel_name,
        channel_thumbnail: item.channels.profile_image_url,
    }))

    return formattedData
}
