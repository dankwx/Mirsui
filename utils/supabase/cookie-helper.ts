// Utilitário para gerenciar o nome do cookie do Supabase
export function getSupabaseCookieName(): string {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    // Extrair o projeto ID da URL (ex: tqprioqqitimssshcrcr)
    const projectId = supabaseUrl.split('//')[1]?.split('.')[0] || 'unknown'
    return `sb-${projectId}-auth-token`
}
