import supabase from '../../../supabase'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
    const { data: posts } = await supabase.from('posts').select('id')

    return posts?.map(({ id }) => ({
        id,
    }))
}

export const revalidate = 0

export default async function ClaimedProfile({
    params: { id },
}: {
    params: { id: string }
}) {
    const { data: post, error } = await supabase
        .from('posts')
        .select()
        .match({ id })
        .single()

    if (error) {
        console.log(error)
    }

    return <pre>{JSON.stringify(post, null, 2)}</pre>
}
