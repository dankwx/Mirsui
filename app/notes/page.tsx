import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
export const revalidate = 0
export default async function Notes() {
    
    const supabase = createClientComponentClient()
    const { data: notes, error } = await supabase.from('notes').select()

    if (!notes) {
        console.error('Erro ao buscar notas:', error.message)
        return <div>Erro ao carregar notas</div>
    }

    return <pre>{JSON.stringify(notes, null, 2)}</pre>
}
