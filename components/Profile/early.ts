// mesma régua usada em libraryService: rating alto = descoberta antecipada
export const isEarly = (song: { discover_rating: number | null }) =>
    (song.discover_rating ?? 0) > 7
