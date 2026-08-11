// components/Profile/ArtistasDoAcervo.tsx
import type { TopArtist } from '@/utils/profileStats'

/**
 * Quem mais aparece no acervo. É o módulo que o Last.fm coloca no topo do
 * perfil e que aqui não existia: dava para ver 20 capas sem saber de quem a
 * pessoa gosta.
 *
 * O retrato é a capa de uma faixa do artista, recortada em círculo. Não temos
 * foto de artista no banco, e capa quadrada em grade viraria eco do acervo
 * logo abaixo.
 */
export default function ArtistasDoAcervo({ artists }: { artists: TopArtist[] }) {
    if (artists.length < 3) return null

    return (
        <section className="w-full border-b border-mir-line bg-mir-bg">
            <div className="mx-auto w-full max-w-[1200px] px-5 py-11 sm:px-8">
                <h2 className="m-0 mb-6 text-[clamp(22px,2.8vw,28px)] font-extrabold tracking-[-0.04em] text-mir-text">
                    Artistas
                </h2>

                {/* flex em vez de grade de 6: quem tem três artistas não pode
                    ficar com metade da fileira em branco. */}
                <ul className="flex list-none flex-wrap gap-x-8 gap-y-7 p-0 sm:gap-x-10">
                    {artists.map((artist) => (
                        <li
                            key={artist.name}
                            className="w-[88px] min-w-0 text-center sm:w-[112px]"
                        >
                            {artist.thumbnail ? (
                                <img
                                    src={artist.thumbnail}
                                    alt={artist.name}
                                    className="aspect-square w-full rounded-full object-cover ring-1 ring-mir-line"
                                />
                            ) : (
                                <div className="grid aspect-square w-full place-items-center rounded-full bg-mir-card font-mono text-[22px] font-bold uppercase text-mir-text3 ring-1 ring-mir-line">
                                    {artist.name.slice(0, 1)}
                                </div>
                            )}
                            <div className="mt-3 truncate text-[14px] font-bold tracking-[-0.01em] text-mir-text">
                                {artist.name}
                            </div>
                            {/* só a contagem: a colocação tem a seção dela em
                                cima, e repetir "chegou em 1ª" nos seis cartões
                                transformava o dado em papel de parede. */}
                            <div className="mt-1 font-mono text-[11.5px] text-mir-text3">
                                {artist.count}{' '}
                                {artist.count === 1 ? 'faixa' : 'faixas'}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}
