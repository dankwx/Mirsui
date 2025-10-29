// examples/analytics-usage.tsx
// Exemplos de como usar o Google Analytics no Mirsui

import { 
  trackMusicPlay, 
  trackClaimTrack, 
  trackSearch, 
  trackExternalLink,
  event 
} from '@/lib/gtag'

// Exemplo 1: Rastrear reprodução de música
function handleMusicPlay(trackName: string, artistName: string) {
  trackMusicPlay(trackName, artistName)
}

// Exemplo 2: Rastrear claim de track
function handleClaimTrack(trackName: string, artistName: string) {
  trackClaimTrack(trackName, artistName)
}

// Exemplo 3: Rastrear pesquisas
function handleSearch(searchTerm: string, results: any[]) {
  trackSearch(searchTerm, results.length)
}

// Exemplo 4: Rastrear cliques em links externos (Spotify, YouTube, etc)
function handleExternalLinkClick(url: string, platform: string) {
  trackExternalLink(url, platform)
}

// Exemplo 5: Rastrear eventos customizados
function trackCustomEvent() {
  // Rastrear quando usuário segue um artista
  event({
    action: 'follow',
    category: 'social',
    label: 'artist_follow'
  })

  // Rastrear quando usuário compartilha um track
  event({
    action: 'share',
    category: 'social',
    label: 'track_share'
  })

  // Rastrear quando usuário acessa a biblioteca
  event({
    action: 'view',
    category: 'navigation',
    label: 'library_page'
  })

  // Rastrear tempo de escuta
  event({
    action: 'listen_duration',
    category: 'engagement',
    label: 'track_play',
    value: 30 // segundos
  })
}

// Como usar nos seus componentes:
/*

// Em um componente de player de música:
const handlePlay = () => {
  // Lógica do player
  trackMusicPlay(track.name, track.artist)
}

// Em um botão de claim:
const handleClaim = () => {
  // Lógica do claim
  trackClaimTrack(track.name, track.artist)
}

// Em um input de pesquisa:
const handleSearchSubmit = (searchTerm: string) => {
  // Lógica da pesquisa
  const results = await searchTracks(searchTerm)
  trackSearch(searchTerm, results.length)
}

// Em links para Spotify/YouTube:
<a 
  href={spotifyUrl} 
  onClick={() => trackExternalLink(spotifyUrl, 'Spotify')}
  target="_blank"
>
  Abrir no Spotify
</a>

*/