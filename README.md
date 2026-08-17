<br/>
<div align="center">
  <img src="https://github.com/user-attachments/assets/0e672797-24cc-4cf5-a1c5-c11bd98ec109" alt="Mirsui">
</div>

<br/>
Discover before the world does.

## O que é

Frontend do Mirsui, em Next.js 14 (App Router). O backend fica em um repositório
separado, `mirsui-backend`, e é ele quem fala com o Postgres na maior parte dos
casos — o frontend só usa o Supabase direto para sessão e para leituras públicas
da landing.

## Rodar

```bash
npm install
npm run dev     # sobe em :3001
```

## Variáveis de ambiente

```bash
# Supabase (sessão e leituras públicas)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Backend
BACKEND_URL=
NEXT_PUBLIC_BACKEND_URL=

# Site (canonical, OG)
NEXT_PUBLIC_SITE_URL=

# Quem abre /admin — lista de e-mails separada por vírgula. É uma cópia
# deliberada da lista do backend, não um import: ver lib/admin.ts.
ADMIN_EMAILS=

# Analytics (ambos opcionais; sem chave, cada um desliga sozinho)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
NEXT_PUBLIC_POSTHOG_UI_HOST=

# APIs externas (reserva; a fonte principal de catálogo é o Deezer, que não
# pede credencial)
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
YOUTUBE_API_KEY=
```

## Analytics

Duas ferramentas, com papéis diferentes:

- **Google Analytics** — só pageview, em `lib/gtag.ts` + `hooks/use-analytics.tsx`.
- **PostHog** — eventos de produto, via `capture()` de `lib/posthog.ts`. É onde
  moram os eventos de salvar, botar ficha, compartilhar e login.

## Documentos

- `docs/plano-de-urls-e-seo.md` — a forma das URLs e por que a indexação está
  segurada.
- `docs/analise-entidade-da-faixa.md` — página derivada ou registro.
- `Stake.md` — as regras das fichas.

## To-do

-   [ ] Send Suggestion page
-   [ ] Página de configurações do perfil (o item saiu do menu do avatar até
        existir — apontava para `/settings`, que nunca foi criada)
-   [ ] Index page on Google Search (ver `docs/plano-de-urls-e-seo.md` §10)
-   [ ] Tema claro por preferência do sistema
-   [ ] Terminar a página do artista
-   [ ] Documentação do projeto
