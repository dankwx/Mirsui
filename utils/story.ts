// utils/story.ts
//
// O story da faixa: a imagem 1080x1920 que a pessoa posta no Instagram.
//
// O formato é o do compartilhamento de filme: a capa, o nome, o artista e o
// ano, e embaixo a linha de quem compartilha (quem é, quando salvou e a nota
// que escreveu ao salvar). No lugar das estrelas fica a subida de audiência
// desde o save, quando houve uma de verdade. Ninguém escreve "eu cheguei
// antes": a data e a curva dizem isso sozinhas, e é isso que deixa o story
// postável sem parecer gabação.
//
// Este módulo é puro e roda nos três lados: as páginas montam os dados (no
// servidor), o botão transforma em endereço (no cliente) e a rota da imagem lê
// de volta (no edge).

import type { CurvaDaFaixa, PontoDaCurva } from '@/utils/observatoryService'
import { popScore } from '@/utils/popScore'

export interface PessoaDoStory {
    /** "@username" quando existe; senão o nome de exibição */
    nome: string
    avatar: string | null
    /** dia do save, YYYY-MM-DD */
    salvouEm: string
    nota: string | null
}

export interface SubidaDoStory {
    de: number
    para: number
    /** desde o save, ou só nos últimos 7 dias (a régua do aviso de salto) */
    janela: 'save' | 'semana'
    /** a audiência 0-100 amostrada do começo da janela até hoje */
    pontos: number[]
    /** índice em `pontos` do marco: o save, ou o dia de 7 dias atrás */
    marco: number
}

export interface DadosDoStory {
    titulo: string
    artista: string
    capa: string | null
    ano: number | null
    /** null quando quem olha não salvou: o story vira só a faixa */
    pessoa: PessoaDoStory | null
    /** null quando não houve subida que passe na régua */
    subida: SubidaDoStory | null
}

/** Tamanhos-limite. A nota cabe em ~4 linhas da imagem. */
export const LIMITE_DA_NOTA = 140
const LIMITE_DO_TITULO = 80
const LIMITE_DO_ARTISTA = 80
const MAX_PONTOS = 30

/**
 * A régua do aviso de salto (migration 050) e do Faro (051): pelo menos 5
 * pontos E 20% a mais. Os 5 pontos tiram o ruído de quem está no chão; os 20%
 * tiram o hit que oscila.
 */
export function subiuDeVerdade(de: number, para: number): boolean {
    return para - de >= 5 && para >= de * 1.2
}

/** Corta com reticências, sem deixar espaço antes delas. */
export function cortar(texto: string, limite: number): string {
    const t = texto.trim().replace(/\s+/g, ' ')
    if (t.length <= limite) return t
    return `${t.slice(0, limite - 1).trimEnd()}…`
}

/* ------------------------------------------------------------ a subida */

function dia(ms: number): string {
    return new Date(ms).toISOString().slice(0, 10)
}

function emMs(d: string): number {
    return Date.parse(`${d}T00:00:00Z`)
}

/**
 * A audiência num dia. O histórico guarda só mudança (migration 021), então o
 * valor de um dia é o do último ponto gravado até ele. Antes do primeiro
 * ponto não há valor.
 */
function valorEm(serie: PontoDaCurva[], d: string): number | null {
    let valor: number | null = null
    for (const p of serie) {
        if (p.d > d) break
        valor = popScore(p.r)
    }
    return valor
}

/** `quantos` dias igualmente espaçados de `inicio` a `fim`, os dois inclusos. */
function amostrar(
    serie: PontoDaCurva[],
    inicio: string,
    fim: string,
    quantos: number
): number[] {
    const a = emMs(inicio)
    const b = emMs(fim)
    const primeiro = popScore(serie[0].r)
    return Array.from({ length: quantos }, (_, i) => {
        const d = dia(a + ((b - a) * i) / (quantos - 1))
        return valorEm(serie, d) ?? primeiro
    })
}

/**
 * A subida que o story mostra, ou null.
 *
 * Primeiro tenta desde o save, que é o feito da pessoa. Save anterior à
 * primeira medição conta da primeira medição, a mesma escolha do Faro: o erro
 * só deixa a subida menor, nunca inventa uma.
 *
 * Se desde o save não passou na régua, tenta a semana, que é o que o aviso de
 * salto do feed anuncia; sem isso, o botão do aviso geraria um story sem a
 * subida que o próprio aviso acabou de mostrar. Só vale quando o save é de
 * antes da semana: subida anterior ao save não é da pessoa.
 */
export function subidaParaStory(
    curva: CurvaDaFaixa | null,
    salvouEm: string,
    hoje: Date = new Date()
): SubidaDoStory | null {
    const serie = (curva?.series ?? [])
        .filter((p) => p && typeof p.d === 'string' && Number.isFinite(p.r))
        .slice()
        .sort((x, y) => (x.d < y.d ? -1 : x.d > y.d ? 1 : 0))
    if (serie.length === 0) return null

    const ultimo = serie[serie.length - 1]
    const diaDeHoje = dia(hoje.getTime())
    const fim = ultimo.d > diaDeHoje ? ultimo.d : diaDeHoje
    const para = popScore(ultimo.r)
    const diaDoSave = salvouEm.slice(0, 10)

    // desde o save
    const inicio = diaDoSave < serie[0].d ? serie[0].d : diaDoSave
    const de = valorEm(serie, inicio)
    if (de != null && inicio < fim && subiuDeVerdade(de, para)) {
        const dias = Math.round((emMs(fim) - emMs(inicio)) / 86_400_000)
        const quantos = Math.max(2, Math.min(MAX_PONTOS, dias + 1))
        return {
            de,
            para,
            janela: 'save',
            pontos: amostrar(serie, inicio, fim, quantos),
            marco: 0,
        }
    }

    // na semana: 28 dias de curva, um ponto por dia, marco 7 dias atrás
    const seteDiasAtras = dia(emMs(fim) - 7 * 86_400_000)
    if (diaDoSave > seteDiasAtras) return null
    const deNaSemana = valorEm(serie, seteDiasAtras)
    if (deNaSemana == null || !subiuDeVerdade(deNaSemana, para)) return null

    const inicioDaJanela = dia(emMs(fim) - 28 * 86_400_000)
    return {
        de: deNaSemana,
        para,
        janela: 'semana',
        pontos: amostrar(serie, inicioDaJanela, fim, 29),
        marco: 21,
    }
}

/* ------------------------------------------------- endereço e leitura */

const ROTA = '/api/og/selo'

/** Os dados viram o endereço da imagem. A rota não lê banco: desenha o que vem. */
export function enderecoDoStory(d: DadosDoStory): string {
    const p = new URLSearchParams()
    p.set('t', cortar(d.titulo, LIMITE_DO_TITULO))
    p.set('a', cortar(d.artista, LIMITE_DO_ARTISTA))
    if (d.capa) p.set('c', d.capa)
    if (d.ano) p.set('y', String(d.ano))

    if (d.pessoa) {
        p.set('u', d.pessoa.nome)
        if (d.pessoa.avatar) p.set('av', d.pessoa.avatar)
        p.set('s', d.pessoa.salvouEm)
        if (d.pessoa.nota) p.set('n', cortar(d.pessoa.nota, LIMITE_DA_NOTA))

        // a subida é da pessoa: sem ela, não vai
        if (d.subida) {
            p.set('de', String(d.subida.de))
            p.set('para', String(d.subida.para))
            p.set('j', d.subida.janela)
            p.set('p', d.subida.pontos.join(','))
            p.set('m', String(d.subida.marco))
        }
    }

    return `${ROTA}?${p.toString()}`
}

function inteiro(v: string | null, min: number, max: number): number | null {
    if (v == null || v === '') return null
    const n = Number(v)
    if (!Number.isInteger(n) || n < min || n > max) return null
    return n
}

function urlDeImagem(v: string | null): string | null {
    return v && /^https:\/\//i.test(v) ? v : null
}

/** O caminho de volta, na rota. Campo torto vira ausente, nunca erro. */
export function lerStory(sp: URLSearchParams): DadosDoStory {
    const titulo = cortar(sp.get('t') || sp.get('title') || 'Faixa', LIMITE_DO_TITULO)
    const artista = cortar(sp.get('a') || sp.get('artist') || '', LIMITE_DO_ARTISTA)
    const capa = urlDeImagem(sp.get('c') || sp.get('cover'))
    const ano = inteiro(sp.get('y') || sp.get('year'), 1000, 3000)

    const nome = cortar(sp.get('u') || '', 40)
    const salvouEm = sp.get('s') || ''
    const pessoa: PessoaDoStory | null =
        nome && /^\d{4}-\d{2}-\d{2}$/.test(salvouEm)
            ? {
                  nome,
                  avatar: urlDeImagem(sp.get('av')),
                  salvouEm,
                  nota: sp.get('n') ? cortar(sp.get('n') as string, LIMITE_DA_NOTA) : null,
              }
            : null

    let subida: SubidaDoStory | null = null
    const de = inteiro(sp.get('de'), 0, 100)
    const para = inteiro(sp.get('para'), 0, 100)
    const pontos = (sp.get('p') || '')
        .split(',')
        .map((x) => inteiro(x, 0, 100))
        .filter((x): x is number => x != null)
        .slice(0, 40)
    const marco = inteiro(sp.get('m'), 0, 39)
    if (pessoa && de != null && para != null && pontos.length >= 2) {
        subida = {
            de,
            para,
            janela: sp.get('j') === 'semana' ? 'semana' : 'save',
            pontos,
            marco: marco != null && marco < pontos.length ? marco : 0,
        }
    }

    return { titulo, artista, capa, ano, pessoa, subida }
}
