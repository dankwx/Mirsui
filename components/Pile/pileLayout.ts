// components/Pile/pileLayout.ts
//
// Empacotamento por "gravidade". Cada peça cai de cima e para na primeira
// altura em que não atravessa nenhuma peça já colocada — o mesmo princípio de
// um heightmap de Tetris, mas com a peça testando vários x e ficando com o que
// a deixa mais baixa. O resultado é uma pilha densa, encostada, assimétrica,
// sem nenhuma linha nem coluna alinhada.
//
// É tudo geometria pura, sem engine de física: a queda é uma animação CSS que
// leva a peça da posição -Y até o repouso já calculado aqui. Isso mantém a
// animação no compositor (transform/opacity) e sem loop de rAF.

import type { PileHeat, PileTrack } from '@/utils/pileTypes'

export interface PilePiece {
    track: PileTrack
    x: number
    y: number
    size: number
    /** graus */
    rot: number
    /** ms — a peça mais alta pousa primeiro */
    delay: number
    /** de que lado o tooltip abre, para não sair da tela nas bordas */
    align: 'left' | 'center' | 'right'
    /** ordem de empilhamento: quem chegou depois fica por cima */
    z: number
}

export interface PileLayout {
    pieces: PilePiece[]
    height: number
}

/** mulberry32 — determinístico, para a mesma semente dar sempre a mesma pilha */
function makeRng(seed: number) {
    let a = seed >>> 0
    return () => {
        a = (a + 0x6d2b79f5) >>> 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

// tamanho base por "temperatura": quanto mais gente carimbou, maior a capa.
// A variação de tamanho é o dado, não enfeite.
const HEAT_SIZE: Record<PileHeat, [number, number]> = {
    topo: [186, 252],
    meio: [126, 178],
    subsolo: [92, 128],
}

const CELL = 10

/**
 * Perfil inicial do chão. Sem isto a primeira fileira encosta toda em y=0 e a
 * pilha vira um retângulo. O ruído suave + a queda nas bordas dão o contorno
 * de monte, que é o que faz parecer coisa despejada e não grade.
 */
function makeFloor(cols: number, rand: () => number) {
    const knots = 9
    const values = Array.from({ length: knots }, () => rand())
    const floor = new Array<number>(cols)

    for (let i = 0; i < cols; i++) {
        const t = (i / Math.max(1, cols - 1)) * (knots - 1)
        const k = Math.min(knots - 2, Math.floor(t))
        const f = t - k
        // interpolação suave (smoothstep) entre os nós do ruído
        const s = f * f * (3 - 2 * f)
        const noise = values[k] * (1 - s) + values[k + 1] * s

        const fromCenter = Math.abs((i / Math.max(1, cols - 1)) * 2 - 1)
        const edge = Math.pow(fromCenter, 2.4) * 230

        floor[i] = edge + noise * 82
    }

    const min = Math.min(...floor)
    for (let i = 0; i < cols; i++) floor[i] -= min
    return floor
}

export function packPile(
    tracks: PileTrack[],
    width: number,
    seed: number
): PileLayout {
    if (width <= 0 || tracks.length === 0) return { pieces: [], height: 0 }

    const rand = makeRng(seed * 2654435761)
    // no celular a peça de 250px ocuparia a largura toda; a pilha inteira
    // encolhe junto para manter a mesma leitura de mosaico
    const scale = Math.min(1, Math.max(0.46, width / 1180))
    const cols = Math.max(1, Math.ceil(width / CELL))
    const heights = makeFloor(cols, rand)

    // ordem de queda embaralhada: se caísse na ordem da lista, os tamanhos
    // (que seguem a temperatura) se agrupariam em faixas
    const order = tracks
        .map((t) => ({ t, k: rand() }))
        .sort((a, b) => a.k - b.k)
        .map((o) => o.t)

    const placed: Omit<PilePiece, 'delay'>[] = []

    order.forEach((track, i) => {
        const [lo, hi] = HEAT_SIZE[track.heat]
        const size = Math.round((lo + rand() * (hi - lo)) * scale)
        const span = Math.max(1, Math.ceil(size / CELL))
        const maxCol = Math.max(0, cols - span)

        // testa alguns pontos de queda e fica com o que afunda mais, com um
        // empurrãozinho para o centro — é isso que forma o monte em vez de
        // uma faixa de largura uniforme
        let best = { col: 0, y: Infinity, score: Infinity }
        const tries = 16
        for (let a = 0; a < tries; a++) {
            const col = Math.round(rand() * maxCol)
            let y = 0
            for (let c = col; c < col + span; c++) y = Math.max(y, heights[c])

            const center = (col + span / 2) / Math.max(1, cols)
            const pull = Math.abs(center - 0.5) * width * 0.22
            const score = y + pull
            if (score < best.score) best = { col, y, score }
        }

        // as peças se tocam e se sobrepõem um fio: pilha real não tem sarjeta
        const bite = 3 + rand() * 9
        const y = Math.max(0, best.y - bite)
        const top = y + size - (2 + rand() * 7)
        for (let c = best.col; c < best.col + span; c++) heights[c] = top

        const x = best.col * CELL
        const rot = (rand() - 0.5) * (size > 170 * scale ? 5 : 8)

        placed.push({
            track,
            x: Math.min(x, Math.max(0, width - size)),
            y,
            size,
            rot: Math.round(rot * 10) / 10,
            align:
                x < 150 ? 'left' : x + size > width - 150 ? 'right' : 'center',
            z: i,
        })
    })

    // quem está mais em cima pousa primeiro — sem isso a queda parece aleatória
    // em vez de gravidade
    const byY = [...placed].sort((a, b) => a.y - b.y)
    const delays = new Map<string, number>()
    byY.forEach((p, i) => delays.set(p.track.id, i * 17))

    const pieces: PilePiece[] = placed.map((p) => ({
        ...p,
        delay: delays.get(p.track.id) ?? 0,
    }))

    const height = Math.max(...pieces.map((p) => p.y + p.size)) + 10

    return { pieces, height }
}
