<br/>
<div align="center">
  <img src="https://github.com/user-attachments/assets/0e672797-24cc-4cf5-a1c5-c11bd98ec109" alt="Mirsui">
</div>

<br/>
Discover before the world does.

## Setup

### Google Analytics Setup

1. Crie uma conta no [Google Analytics](https://analytics.google.com/)
2. Crie uma nova propriedade para seu site
3. Copie o ID de rastreamento (formato: G-XXXXXXXXXX)
4. Adicione o ID no arquivo `.env.local`:

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

5. O Google Analytics já está configurado automaticamente no projeto!

### Eventos personalizados disponíveis:

- `trackMusicPlay(trackName, artistName)` - Rastreia reprodução de música
- `trackClaimTrack(trackName, artistName)` - Rastreia claims de tracks
- `trackSearch(searchTerm, resultsCount)` - Rastreia pesquisas
- `trackExternalLink(url, platform)` - Rastreia cliques em links externos

Veja exemplos de uso em `examples/analytics-usage.tsx`

## To-do

-   [x] User Description section for profile
-   [ ] Admin page
-   [ ] Send Suggestion page
-   [x] Add followers system
-   [ ] Complete home page
-   [ ] Add Privacy Policies page
-   [ ] Add Profile User Configuration page
-   [ ] Index page on Google Search
-   [x] Add following and followers listing on profile
-   [ ] Add responsive website theme based on system color preference white/dark
-   [x] Add user profile custom avatar image
-   [x] **NEW: Personal Music Library page (/library)** - **Focused on Playlists Management** with modern Spotify-like interface
-   [ ] implement daisy ui
-   [ ] finish artist page
-   [ ] finish artist page
-   [ ] create documentation for the project
-   [ ] migrate project from supabase to docker