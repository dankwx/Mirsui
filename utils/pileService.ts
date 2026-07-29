// utils/pileService.ts
//
// Dados da Pilha. HOJE É MOCK.
//
// O que é real: capa, artista e faixa. A lista é um snapshot da API pública do
// Deezer — o hash na terceira coluna é o `md5_image` do álbum, que monta a URL
// da capa no CDN deles. É snapshot e não fetch em runtime porque o Deezer corta
// em ~50 requisições a cada 5s: buscar 74 capas ao vivo derrubava um quarto
// delas e ainda punha 8s de latência na página.
//
// O que é mock: "carimbos" e "há quantos dias foi a primeira" saem de um hash
// do nome da faixa — determinístico, então a mesma faixa mostra sempre os
// mesmos números, e a temperatura (topo/meio/subsolo) define a faixa de valores.
//
// Para virar real: troque getPileTracks() pela consulta de tudo que foi
// carimbado no site, devolvendo o mesmo PileTrack. O componente não muda.
//
// Para regerar o snapshot: buscar cada par artista/faixa em
// https://api.deezer.com/search?q=artist:"X" track:"Y"&limit=1 e pegar
// `md5_image`, em lotes de 5 com ~600ms de intervalo.

import 'server-only'
import type { PileHeat, PileTrack } from './pileTypes'

type Seed = [
    artist: string,
    title: string,
    md5: string,
    genre: string,
    heat: PileHeat,
]

// Curadoria: mainstream e subsolo lado a lado, br e gringo, de 1971 a 2024.
const SEEDS: Seed[] = [
    ['Frank Ocean', 'Nikes', 'f798a866107715dd6dc1049e498ce21f', 'r&b', 'topo'],
    ['Tyler, The Creator', 'EARFQUAKE', '041ab5ceb6fb6ebf9512966835be9e1b', 'rap', 'topo'],
    ['Kendrick Lamar', 'Money Trees', 'b5be27644d505bad7bdb516fe4165475', 'rap', 'topo'],
    ['SZA', 'Kill Bill', 'a3c3b409f0d5bd781821ec0fd79d5b15', 'r&b', 'topo'],
    ['The Weeknd', 'Blinding Lights', 'fd00ebd6d30d7253f813dba3bb1c66a9', 'pop', 'topo'],
    ['ROSALÍA', 'MALAMENTE', '10440b4fc8b5b8f3392702a2ef213ab1', 'pop', 'topo'],
    ['Bad Bunny', 'Tití Me Preguntó', 'b29d1070377b784384c2456093f96a66', 'pop', 'topo'],
    ['Charli xcx', '360', 'de9e79511cda59914de9add50946e43c', 'pop', 'topo'],
    ['Arctic Monkeys', '505', 'd7a4f9f1af8736457de34f28d50ef496', 'rock', 'topo'],
    ['Radiohead', 'Weird Fishes / Arpeggi', 'a175af9b7d329bc678cb4d26fc13d6de', 'rock', 'topo'],
    ['Tame Impala', 'Let It Happen', 'de5b9b704cd4ec36f8bf49beb3e17ba2', 'rock', 'topo'],
    ['Gorillaz', 'Feel Good Inc.', '3dc29a565149240729afc08e1f251b46', 'rock', 'topo'],
    ['Beyoncé', "TEXAS HOLD 'EM", 'e50407841497a26457036110eab49f1b', 'pop', 'topo'],
    ['Travis Scott', 'SICKO MODE', '7df7ac6028591a5622f24cf32a555510', 'rap', 'topo'],
    ['Anitta', 'Envolver', 'd4057cde2b30078608ff0b71c63f23e6', 'pop', 'topo'],
    ['LUDMILLA', 'Cheguei', '13d7651eff65c4b6f1ff0c2529602e96', 'funk', 'topo'],
    ['Peggy Gou', '(It Goes Like) Nanana', 'da81d86b3bc191357af8f86da1ad2751', 'eletrônica', 'topo'],

    ['Djavan', 'Flor de Lis', '3727981375799a72183aa9c3f8cb62ce', 'mpb', 'meio'],
    ['Tim Maia', 'Eu Amo Você', '6fff1800943f08605efa4580b9006da3', 'soul', 'meio'],
    ['Jorge Ben Jor', 'Fio Maravilha', 'ac6d97b4489e325eca355a2f42ae5d57', 'mpb', 'meio'],
    ['Caetano Veloso', 'Sampa', 'a3969f69dd4d1be2c2526d085ba82f77', 'mpb', 'meio'],
    ['Gal Costa', 'Baby', '5bcfc7184144b1953390b9b51f2029a2', 'mpb', 'meio'],
    ['Milton Nascimento', 'Travessia', 'f7ba34c4e523c00ed2293c01a77f26b6', 'mpb', 'meio'],
    ["Racionais MC's", 'Diário de um Detento', '5a1b1d6bd196e77425df93f63c026ab9', 'rap', 'meio'],
    ['Emicida', 'AmarElo', 'a15282b72b322e55fb7b4409cb02ace6', 'rap', 'meio'],
    ['Criolo', 'Não Existe Amor em SP', '756d8d0262d22eb39099448293dfe323', 'rap', 'meio'],
    ['Djonga', 'Olho de Tigre', '026bbd3d54bed5fa76549440f4f32f14', 'rap', 'meio'],
    ['Rincon Sapiência', 'Ponta de Lança', '14cc6294fb06e9224cb6aef162ec2052', 'rap', 'meio'],
    ['Baco Exu do Blues', 'Girassóis de Van Gogh', '0421054a6a7d8cb4e52dd27ff4deef2c', 'rap', 'meio'],
    ['Little Simz', 'Venom', '5732947e09b91128f20bfd43de537a11', 'rap', 'meio'],
    ['MF DOOM', 'Doomsday', '29ceae43498c58159d5afe95fde8b395', 'rap', 'meio'],
    ['BaianaSystem', 'Playsom', '87cf1e77c389f8270267d4cf1e10147c', 'mpb', 'meio'],
    ['Chico Science & Nação Zumbi', 'A Cidade', '2ecda6abfddda8eb5e5d582e538c0a65', 'rock', 'meio'],
    ['Liniker', 'Baby 95', '6c13e45aade5095b8a2cbb1f7dca1014', 'soul', 'meio'],
    ['Marina Sena', 'Por Supuesto', 'db22d00260309efaf9c78193fd3c7e21', 'pop', 'meio'],
    ['Céu', 'Malemolência', 'a7570978b94a053a3ab59ff4985d6dd9', 'mpb', 'meio'],
    ['Men I Trust', 'Show Me How', '6f4f35fdc77ef818f0e0e29211cac77f', 'indie', 'meio'],
    ['King Krule', 'Easy Easy', '19b162314851dc4325d9de81663eb59a', 'indie', 'meio'],
    ['Khruangbin', 'August 10', '169722abe30c411316c42561f4d7450d', 'indie', 'meio'],
    ['FKA twigs', 'cellophane', '63593ab6be8e57a118b9b53784eda751', 'r&b', 'meio'],
    ['Sampha', 'Blood On Me', '60d3c764e8925c0eb855b605b09a7434', 'r&b', 'meio'],
    ['Solange', 'Cranes in the Sky', '36b361c2c916b333a0b7c6f949c32099', 'r&b', 'meio'],
    ['Nina Simone', 'Feeling Good', '03ff2061c4aa5cfd402c7c01bd06a48a', 'jazz', 'meio'],
    ['BADBADNOTGOOD', 'Time Moves Slow', 'be02219439c43bf65f7f1cc5a38454bc', 'jazz', 'meio'],
    ['Aphex Twin', 'Xtal', '61597432632bf90678b7132db0451f45', 'eletrônica', 'meio'],
    ['KAYTRANADA', '10%', '304868507796a90d6321fcdfbe3aa8b4', 'eletrônica', 'meio'],
    ['Jamie xx', 'Gosh', '0e24b8c4e5ace3a84fce519f36f8c9d4', 'eletrônica', 'meio'],
    ['Massive Attack', 'Teardrop', '85abbdc3ed4a7b94ace97f868fe70f63', 'eletrônica', 'meio'],
    ['Portishead', 'Glory Box', '5942b88996f33c82790023d5d99395d3', 'eletrônica', 'meio'],
    ['Grimes', 'Genesis', 'c85a9ca3e1bc10192a1f893910e1322a', 'pop', 'meio'],

    ['Boogarins', 'Lucifernandis', '870c2bfe78e3ff58678f8bcdba760937', 'indie', 'subsolo'],
    ['Ana Frango Elétrico', 'Nuvem Vermelha', '9535ef815b4880ba5f05089f4ae47703', 'indie', 'subsolo'],
    ['Bala Desejo', 'Baile de Máscaras', '38350b6613cb2f0dac45d3997eb4af47', 'mpb', 'subsolo'],
    ['Tim Bernardes', 'Nascer, Viver, Morrer', 'ca6c264f9f430641a470667ac0e24ab6', 'mpb', 'subsolo'],
    ['Xênia França', 'Pra Que Me Chamas?', '2c3e7d04d5691888efd4a12af8f27aac', 'soul', 'subsolo'],
    ['Jup do Bairro', 'Corpo Sem Juízo', 'a2e1b26dd4c295cd73c85edb75a0a261', 'funk', 'subsolo'],
    ['Deize Tigrona', 'Injeção', '1b0e4c56d2f5e9391503aeda1a9fd579', 'funk', 'subsolo'],
    ['Alex G', 'Runner', '1fd7c66e8574c25224b357bfaf056c57', 'indie', 'subsolo'],
    ['Black Country, New Road', 'Concorde', 'c2febbe882c2944b0701dd1ff077ab3d', 'rock', 'subsolo'],
    ['Yves Tumor', 'Gospel For A New Century', '574b5549909803d967b5069dc27e4426', 'rock', 'subsolo'],
    ['Slowdive', 'Alison', '4e045f8b3ff1cfc02bbd6211b87497d8', 'indie', 'subsolo'],
    ['Cocteau Twins', 'Cherry-coloured Funk', 'be62b1479e0baf17d8f9beca911ee8cd', 'indie', 'subsolo'],
    ['Jai Paul', 'Str8 Outta Mumbai', '37d2d702e8b11eb599ba364974353094', 'r&b', 'subsolo'],
    ['Sudan Archives', 'Selfish Soul', '18f8cbda3d68819f902c9edf36975005', 'r&b', 'subsolo'],
    ['Hiatus Kaiyote', 'Red Room', 'fb2755a584c02901aed2369e2d483b12', 'soul', 'subsolo'],
    ['Sault', 'Wildfires', '36c70fe5103486da0eede9a2c399cbf2', 'soul', 'subsolo'],
    ['Fela Kuti', 'Water No Get Enemy', 'd6227b6bb81aaf56421047976d9eda3e', 'soul', 'subsolo'],
    ['Alice Coltrane', 'Journey in Satchidananda', 'ad448d64f31f7f8cfbe63c1aeea0c3b6', 'jazz', 'subsolo'],
    ['Yussef Dayes', 'Love Is the Message', '22ebbac9f90e6cc0953cf26f8bd03aba', 'jazz', 'subsolo'],
    ['Nala Sinephro', 'Space 1', '5bc2a8a35d1f005355eb00c5f839d70a', 'jazz', 'subsolo'],
    ['Burial', 'Archangel', '5dddd046babf2400103929d94ffca87a', 'eletrônica', 'subsolo'],
    ['Floating Points', 'Birth', 'ce5c846ef4e3b73616feb21cc5243c35', 'eletrônica', 'subsolo'],
    ['Overmono', 'So U Kno', '45939a56cfc4fe2d81912eb54efd4f09', 'eletrônica', 'subsolo'],
    ['Arca', 'Nonbinary', '843026fce7d6ffb8adcf078d84105192', 'eletrônica', 'subsolo'],
]

/** FNV-1a. Só precisa ser estável entre execuções. */
function hash(s: string) {
    let h = 2166136261
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i)
        h = Math.imul(h, 16777619) >>> 0
    }
    return h
}

const HEAT_RANGE: Record<PileHeat, [number, number]> = {
    topo: [380, 1240],
    meio: [70, 380],
    subsolo: [6, 70],
}

function coverUrl(md5: string, px: 250 | 500) {
    return `https://cdn-images.dzcdn.net/images/cover/${md5}/${px}x${px}-000000-80-0-0.jpg`
}

export function getPileTracks(): PileTrack[] {
    return SEEDS.map(([artist, title, md5, genre, heat]) => {
        const h = hash(`${artist}::${title}`)
        const [lo, hi] = HEAT_RANGE[heat]
        const a = (h % 1013) / 1013
        const b = ((h >>> 11) % 1013) / 1013

        return {
            id: String(h),
            title,
            artist,
            cover: coverUrl(md5, 500),
            coverSmall: coverUrl(md5, 250),
            genre,
            heat,
            carimbos: Math.round(lo + a * (hi - lo)),
            dias: 1 + Math.round(b * 210),
        }
    })
}
