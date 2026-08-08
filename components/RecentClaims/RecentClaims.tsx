// components/RecentClaims/RecentClaims.tsx
import Link from 'next/link'
import Image from 'next/image'
import { RecentClaim } from '@/utils/recentClaimsService'
import { formatTimestamp } from '@/utils/feedHelpers'

interface RecentClaimsProps {
    claims: RecentClaim[]
    /** a busca falhou — diferente de "ninguém salvou nada" */
    loadFailed?: boolean
}

const TONES = [
    '#241f1a', '#1c2320', '#27201f', '#1b2026', '#231d27', '#202420',
    '#2a201b', '#1a2326', '#25211c', '#1d2126', '#26211f', '#1f231d',
]
function tone(seed: string) {
    let h = 0
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
    return TONES[h % TONES.length]
}
function initials(name: string) {
    return (name || '')
        .split(' ')
        .map((n) => n[0])
        .filter(Boolean)
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

export default function RecentClaims({ claims, loadFailed = false }: RecentClaimsProps) {
    return (
        <section className="rounded-[14px] border border-mir-line bg-mir-surface p-5">
            <div className="mb-1 flex items-baseline justify-between gap-2.5">
                <span className="text-[12.5px] font-bold uppercase tracking-[0.08em] text-mir-text2">
                    Subindo na cena
                </span>
                <span className="flex-none font-mono text-[10px] uppercase tracking-[0.1em] text-mir-text3">
                    semana
                </span>
            </div>
            <p className="mb-3.5 mt-1.5 text-[12.5px] leading-[1.5] text-mir-text3">
                Ainda dá tempo de salvar antes de virar tendência.
            </p>

            {claims.length === 0 ? (
                <p className="py-6 text-center font-mono text-[12px] text-mir-text3">
                    {loadFailed ? 'Não deu pra carregar agora.' : 'Nada salvo ainda.'}
                </p>
            ) : (
                <ol className="flex flex-col">
                    {claims.map((claim, index) => (
                        <li key={claim.id}>
                            <Link
                                href={`/track/${claim.track_url?.split('/').pop() || claim.track_title}`}
                                className="group grid grid-cols-[18px_40px_1fr_auto] items-center gap-3 border-b border-mir-line py-[9px] first:pt-0 last:border-b-0 last:pb-0"
                            >
                                <span className="font-mono text-[12px] tabular-nums text-mir-text3">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <div
                                    className="mir-cover h-10 w-10 rounded-md"
                                    style={{ ['--tone' as string]: tone(claim.artist_name) }}
                                >
                                    <span
                                        aria-hidden="true"
                                        className="absolute inset-0 grid select-none place-items-center text-[15px] font-extrabold leading-none tracking-[-0.05em] text-mir-text/15"
                                    >
                                        {initials(claim.artist_name)}
                                    </span>
                                    {claim.track_thumbnail && (
                                        <Image
                                            src={claim.track_thumbnail}
                                            alt=""
                                            width={40}
                                            height={40}
                                            className="absolute inset-0 h-full w-full object-cover"
                                        />
                                    )}
                                </div>
                                <div className="flex min-w-0 flex-col leading-[1.3]">
                                    <span className="truncate text-[13px] font-semibold text-mir-text transition-colors group-hover:text-mir-acc">
                                        {claim.track_title}
                                    </span>
                                    <span className="truncate text-[11.5px] text-mir-text3">
                                        {claim.artist_name}
                                    </span>
                                </div>
                                <span className="font-mono text-[11px] text-mir-text3">
                                    {formatTimestamp(claim.claimedat)}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    )
}
