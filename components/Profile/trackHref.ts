// Link para a ficha da faixa. Mesma regra usada no /feed: o id do Spotify é o
// último segmento da track_url. Sem url, cai no título para não gerar href vazio.
export const trackHref = (song: { track_url: string; track_title: string }) =>
    `/track/${song.track_url?.split('/').pop() || song.track_title}`
