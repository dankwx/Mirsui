// components/Profile/ChegouCedo.tsx
import Link from 'next/link'
import { trackHref } from './trackHref'
import type { Song } from '@/types/profile'

/**
 * A vitrine do perfil: as faixas em que a pessoa chegou mais cedo.
 *
 * É o único lugar do app onde `position` aparece grande. O perfil antigo
 * abria com "FARO TOP 14%" (hash do username) e nunca mostrava a posição real,
 * que é o dado que só o Mirsui tem.
 */

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

const mesAno = (iso: string | null) => {
    if (!iso) return null
    const d = new Date(iso)
    if (isNaN(d.getTime())) return null
    return `${MESES[d.getMonth()]} ${d.getFullYear()}`
}

function Capa({ song, className = '' }: { song: Song; className?: string }) {
    if (song.track_thumbnail) {
        return (
            <img
                src={song.track_thumbnail}
                alt={song.track_title}
                className={`aspect-square w-full object-cover transition duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${className}`}
            />
        )
    }
    return (
        <div
            className={`flex aspect-square w-full flex-col justify-end bg-mir-card p-4 ${className}`}
        >
            <div className="truncate font-mono text-[10px] lowercase text-mir-text3">
                {song.artist_name}
            </div>
            <div className="mt-1 line-clamp-3 text-[17px] font-extrabold leading-[1.05] tracking-[-0.02em] text-mir-text2">
                {song.track_title}
            </div>
        </div>
    )
}

/**
 * "1ª a salvar · 47 já salvaram", na régua do /feed.
 *
 * A colocação ganha cor, não tamanho: numa vitrine de cinco faixas em que a
 * pessoa chegou cedo, cinco números gigantes competem entre si e o nome da
 * música, que é o que ela quer mostrar, some.
 */
function Chamada({
    song,
    savers,
    big = false,
}: {
    song: Song
    savers?: number
    big?: boolean
}) {
    // "1 já salvou" seria o próprio dono. Nesse caso a frase vira a data, que
    // ainda diz algo: ninguém veio depois, desde tal mês.
    const depois = savers && savers > 1 ? `${savers} já salvaram` : mesAno(song.claimedat)
    const n = song.position

    return (
        <div className={`font-mono ${big ? 'text-[13px]' : 'text-[11.5px]'}`}>
            {n !== null && (
                <>
                    <span
                        className={`font-bold tabular-nums ${
                            n === 1 ? 'text-mir-acc' : 'text-mir-text'
                        }`}
                    >
                        {n}ª
                    </span>
                    <span className="text-mir-text3"> a salvar</span>
                </>
            )}
            {n !== null && depois && <span className="text-mir-text3"> · </span>}
            {depois && <span className="text-mir-text3">{depois}</span>}
        </div>
    )
}

export default function ChegouCedo({
    songs,
    savers,
}: {
    songs: Song[]
    savers: Record<string, number>
}) {
    if (songs.length === 0) return null

    const [destaque, ...resto] = songs
    const saversDe = (song: Song) => (song.track_uri ? savers[song.track_uri] : undefined)

    return (
        <section className="w-full border-b border-mir-line bg-mir-bg">
            <div className="mx-auto w-full max-w-[1200px] px-5 py-14 sm:px-8">
                <h2 className="m-0 mb-8 text-[clamp(26px,3.6vw,34px)] font-extrabold tracking-[-0.04em] text-mir-text">
                    Chegou cedo
                </h2>

                <div className="grid gap-8 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-12">
                    {/* o melhor achado, em tamanho de capa de disco */}
                    <Link
                        href={trackHref(destaque)}
                        className="group block max-w-[300px]"
                    >
                        <div className="overflow-hidden rounded-[4px] bg-mir-card ring-1 ring-mir-line transition group-hover:ring-mir-text3">
                            <Capa song={destaque} />
                        </div>
                        <div className="mt-4 text-[22px] font-extrabold leading-tight tracking-[-0.03em] text-mir-text">
                            {destaque.track_title}
                        </div>
                        <div className="mt-1 text-[14px] text-mir-text2">
                            {destaque.artist_name}
                        </div>
                        <div className="mt-2.5">
                            <Chamada song={destaque} savers={saversDe(destaque)} big />
                        </div>
                    </Link>

                    {/* As seguintes, alinhadas por baixo com a legenda do
                        destaque: com alinhamento pelo topo sobrava um vão de
                        150px sob as quatro, e o vão parecia bug em vez de
                        composição. */}
                    {resto.length > 0 && (
                        <div className="grid grid-cols-2 gap-x-5 gap-y-8 self-start sm:grid-cols-4 lg:gap-x-6 lg:self-end">
                            {resto.map((song) => (
                                <Link
                                    key={song.id}
                                    href={trackHref(song)}
                                    className="group block min-w-0"
                                >
                                    <div className="overflow-hidden rounded-[4px] bg-mir-card ring-1 ring-mir-line transition group-hover:ring-mir-text3">
                                        <Capa song={song} />
                                    </div>
                                    <div className="mt-3 truncate text-[14.5px] font-bold tracking-[-0.01em] text-mir-text">
                                        {song.track_title}
                                    </div>
                                    <div className="mt-0.5 truncate text-[12.5px] text-mir-text2">
                                        {song.artist_name}
                                    </div>
                                    <div className="mt-1.5 truncate">
                                        <Chamada song={song} savers={saversDe(song)} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
