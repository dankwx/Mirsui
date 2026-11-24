// utils/storyService.ts
//
// Monta os dados do story (utils/story.ts) no servidor: a faixa já vem da
// página; aqui entram o perfil de quem compartilha e a subida desde o save.

import 'server-only'
import type { CurvaDaFaixa } from '@/utils/observatoryService'
import { createClient } from '@/utils/supabase/server'
import {
    carregarDadosDaFaixa,
    carregarFaixaPorIsrc,
} from '@/utils/trackPageService'
import { salvamentoDoUsuario } from '@/utils/trackClaims'
import { subidaParaStory, type DadosDoStory, type PessoaDoStory } from '@/utils/story'

interface FaixaDoStory {
    title: string
    artistNames: string
    coverUrl: string | null
    releaseDate: string | null
}

interface SalvamentoDoStory {
    claimedat: string | null
    nota: string | null
}

/**
 * Quem compartilha. Só colunas públicas: `profiles` tem grant por coluna e
 * `select('*')` dá permission denied (migration 047 do backend). Sem nome
 * nenhum, a linha da pessoa sai e o story vira só a faixa.
 */
async function pessoaDoStory(
    userId: string,
    salvamento: SalvamentoDoStory
): Promise<PessoaDoStory | null> {
    if (!salvamento.claimedat) return null

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('profiles')
        .select('username, display_name, avatar_url')
        .eq('id', userId)
        .maybeSingle()

    if (error) {
        console.error('[story] falha ao ler o perfil:', error.message)
        return null
    }

    const perfil = data as {
        username: string | null
        display_name: string | null
        avatar_url: string | null
    } | null
    const nome = perfil?.username
        ? `@${perfil.username}`
        : perfil?.display_name?.trim() || null
    if (!nome) return null

    return {
        nome,
        avatar: perfil?.avatar_url || null,
        salvouEm: salvamento.claimedat.slice(0, 10),
        nota: salvamento.nota,
    }
}

/**
 * O story de uma faixa para quem está olhando. Sem save (ou sem sessão), é só
 * a faixa: capa, nome, artista e ano.
 */
export async function storyDaFaixa({
    faixa,
    curva,
    userId,
    salvamento,
}: {
    faixa: FaixaDoStory
    curva: CurvaDaFaixa | null
    userId: string | null
    salvamento: SalvamentoDoStory | null
}): Promise<DadosDoStory> {
    const ano = faixa.releaseDate
        ? new Date(faixa.releaseDate).getFullYear()
        : null

    const pessoa =
        userId && salvamento ? await pessoaDoStory(userId, salvamento) : null

    return {
        titulo: faixa.title,
        artista: faixa.artistNames,
        capa: faixa.coverUrl,
        ano: ano && Number.isFinite(ano) ? ano : null,
        pessoa,
        subida: pessoa ? subidaParaStory(curva, pessoa.salvouEm) : null,
    }
}

/**
 * O story da faixa do aviso de salto, no feed. Vem só pelo ISRC: o aviso
 * (get_my_track_jump) não traz capa, ano, nota nem a curva. É chamado só
 * quando há salto, o que é raro, e as duas leituras da faixa são a mesma RPC
 * (`cache()` do React).
 */
export async function storyPorIsrc(
    isrc: string,
    userId: string
): Promise<DadosDoStory | null> {
    const [faixa, dados, salvamento] = await Promise.all([
        carregarFaixaPorIsrc(isrc),
        carregarDadosDaFaixa(isrc),
        salvamentoDoUsuario(userId, null, isrc),
    ])
    if (!faixa) return null

    return storyDaFaixa({
        faixa,
        curva: dados.curva,
        userId,
        salvamento,
    })
}
