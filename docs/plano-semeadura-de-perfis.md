# Semeadura de perfis — criador automático + painel de troca de foto

## Contexto

O Mirsui tem 15 contas, uma ativa. O objetivo é povoar o site com perfis
semeados (username real coletado, foto do acervo de 400 JPEGs em
`/home/ubuntu/imagens`, 1–3 faixas escolhidas por IA via OpenRouter, bio curta,
alguns seguindo outros semeados) — **todos marcados no banco** para que a
limpeza futura seja um `DELETE` só.

Decisões já tomadas com o dono:
- Usernames: handles reais do **Last.fm** (páginas públicas de ouvintes por
  artista, sem chave, 30/página — testado hoje), **levemente alterados**; o
  original fica guardado na tabela de controle.
- Datas **espalhadas no passado** (contas e fichas), nunca antes de jun/2024.
- Criação por **script CLI** no backend; o painel web só lista e troca foto.
- Extras: **bio pela IA** (~60% dos perfis) e **seguir 0–4 outros semeados**.

Fatos do código que o plano se apoia:
- Perfil nasce pelo trigger `on_auth_user_created` → `public.handle_new_user()`
  (lê `raw_user_meta_data.username/display_name/avatar_url`). `auth.users →
  profiles → tracks/followers/stakes/…` é tudo `ON DELETE CASCADE`.
- `supabaseAdmin` (service role) já existe em `src/lib/supabase.ts`; upload de
  avatar é `supabaseAdmin.storage.from('user-profile-images').upload('<uuid>/profile-picture')`
  + `?v=<ts>` (ver `src/routes/profiles.ts`). Backend roda no pm2 como `ubuntu`,
  dono de `/home/ubuntu/imagens` — lê e apaga sem sudo.
- Ficha = linha em `tracks` com `position = count(mesma gravação)+1` e
  `discover_rating = 100 - popularity + 100/position` (`src/routes/claims.ts`).
- Username: `^[a-zA-Z0-9_]{3,30}$`, UNIQUE em `profiles.username`.
- Admin: `isAdmin(email)` em `src/lib/admins.ts` (backend) e `lib/admin.ts`
  (front); rota responde 404 para não-dono. Página `/admin` já existe.

---

## 1. Banco — `migrations/033_perfis_semeados.sql`

Três marcas, nenhuma numa coluna pública de `profiles` (um `select('*')` futuro
não pode vazar "este perfil é fake"):

1. `auth.users.raw_app_meta_data = {"seeded": true, "seed_batch": "<data>"}` —
   `app_metadata` não é editável pelo usuário nem exposto em perfil público.
   **É a chave da limpeza:** `delete from auth.users where raw_app_meta_data->>'seeded' = 'true'`.
2. E-mail `<username>@seed.mirsui.invalid` — reconhecível a olho no painel `/admin`.
3. Tabela de controle (RLS ligado, **zero policies** → só service role lê):

```sql
create table public.seeded_profiles (
  profile_id      uuid primary key references public.profiles(id) on delete cascade,
  image_file      text not null,          -- nome do JPEG em imagens/usadas/
  source          text not null,          -- 'lastfm'
  source_username text not null,          -- handle original, antes da alteração
  batch           text not null,
  created_at      timestamptz not null default now()
);
alter table public.seeded_profiles enable row level security;
```

Sem coluna nova em `profiles`, sem mudança em RLS existente.

## 2. Coleta de usernames — `src/seed/lastfm.ts` + `src/scripts/coletarUsernames.ts`

- `npm run seed:usernames -- --paginas 5` percorre uma lista de ~40 artistas
  (mistura BR/gringo, indie e pop) em `https://www.last.fm/music/<artista>/+listeners?page=N`,
  extrai `href="/user/<handle>"`, 1 req/s com `User-Agent` de navegador.
  Resultado dedupado em `seed/usernames.json` (gitignored). 40×5×30 ≈ 6 mil handles.
- Alteração leve (`src/seed/username.ts`): normaliza (`-`→`_`, corta a 30),
  depois **uma** mutação sorteada: trocar uma letra por vizinha de teclado /
  duplicar uma letra / adicionar ou trocar 1–2 dígitos no fim / inserir `_`.
  Reaplica se colidir com `profiles.username` (checa por `.eq()`, e trata o
  23505 como "tenta outro"). Handle que não passa em `^[a-zA-Z0-9_]{3,30}$` após
  normalizar é descartado.
- `display_name`: o handle original com capitalização/espaços leves
  (`GlassEyesLover` → `Glass Eyes Lover` em 50% dos casos, senão igual ao username).

## 3. Fotos — `src/seed/imagens.ts`

- Pool = arquivos em `/home/ubuntu/imagens/*.jpg`. Ao usar, `rename` para
  `/home/ubuntu/imagens/usadas/<arquivo>` → **não repete por construção**, e
  `seeded_profiles.image_file` diz qual é de quem.
- Upload igual à rota real: bucket `user-profile-images`, path
  `<uuid>/profile-picture`, `contentType image/jpeg`, `upsert: true`,
  `avatar_url = publicUrl?v=<ts>`.
- `trocarFoto(profileId)`: sorteia outra do pool, faz o upload (upsert
  sobrescreve o objeto), atualiza `avatar_url` e `image_file`, e **apaga** o
  arquivo antigo de `usadas/`. Se o pool estiver vazio, responde 409 "acabaram as fotos".
- Caminhos vêm de `SEED_IMAGENS_DIR` (padrão `/home/ubuntu/imagens`).

## 4. IA — `src/seed/openrouter.ts`

- `OPENROUTER_API_KEY` e `OPENROUTER_MODEL` (padrão `google/gemini-2.5-flash`)
  no `.env` do backend. Uma chamada por perfil, `response_format: json_object`,
  `temperature 1.0`.
- Para evitar que 50 perfis escolham "Blinding Lights": o prompt recebe um
  **brief sorteado** (2 gêneros de uma lista de ~30, uma década, idioma
  pt/en/es/outro) e a lista das últimas ~60 faixas já escolhidas neste lote
  ("não repita"). Pede `{ tracks: [{artist, title}] (1–3), bio: string|null }`.
- Bio: até 160 chars, sem hashtag, sem emoji em excesso; o script zera a bio
  em ~40% dos perfis antes de gravar.
- Resolução no Deezer com `searchTracks(\`${artist} ${title}\`, 1)` de
  `src/lib/deezer.ts` — devolve `uri`, `isrc`, `thumbnail`, `albumName`, `rank`.
  Sem resultado → pula a faixa; perfil sem nenhuma faixa resolvida ainda é
  criado (gente sem ficha existe).

## 5. Ficha — `src/seed/ficha.ts`

Replica a conta de `claims.ts` com `supabaseAdmin` (a rota real exige token do
usuário; não vale a pena logar como cada fake):
- `filtro = isrc ? or(isrc.eq, track_uri.eq) : track_uri.eq`; `position = count+1`;
  `popularity = popScore(rank)` (`src/lib/stakePoints.ts`); `discover_rating`
  pela mesma fórmula; `track_url = https://www.deezer.com/track/<id>`.
- `claimedat` sorteado **depois** do `created_at` da conta e antes de agora.
  Consequência aceita: a posição é pela ordem de inserção, não pela data
  sorteada — igual ao que a rota faz hoje.

## 6. Script de criação — `src/scripts/semearPerfis.ts` (`npm run seed:perfis -- --n 20`)

Por perfil, em sequência, com pausa de 1–2 s:
1. Pega um handle não usado de `seed/usernames.json` → username alterado.
2. `supabaseAdmin.auth.admin.createUser({ email, password: aleatória, email_confirm: true, user_metadata: { username, display_name }, app_metadata: { seeded: true, seed_batch } })`
   → trigger cria o `profiles`.
3. Sorteia `created_at` entre `max(jun/2024, hoje-180d)` e ontem, e aplica em
   `auth.users.created_at` + `last_sign_in_at` via RPC `seed_backdate_user(uuid, timestamptz)`
   (`security definer`, `revoke all from public/anon/authenticated`, criada na 033).
4. Foto (§3) → `avatar_url`.
5. IA (§4) → fichas (§5) + `description`.
6. Insere em `seeded_profiles`.
7. Falha em qualquer passo depois do 2 → apaga o `auth.users` recém-criado
   (cascade) e devolve a foto para o pool; loga e segue para o próximo.

Ao fim do lote: para cada semeado do lote, sorteia 0–4 outros semeados
(qualquer lote) e insere em `followers` (ignora 23505).

Saída: uma linha por perfil (`@username  foto=…  fichas=2  bio=sim`) e um
resumo. Script idempotente por handle: handle já usado nunca é reaproveitado.

## 7. Backend — rotas em `src/routes/admin.ts`

Mesmo gate das existentes (`requireAuth` + `isAdmin` → 404; `supabaseAdmin` ausente → 503):
- `GET /admin/seed/profiles?page=1&limit=50` → `{ profiles: [{id, username, display_name, avatar_url, image_file, batch, created_at, fichas}], total, pool: <fotos restantes> }`
  (join `seeded_profiles` + `profiles` + contagem em `tracks`).
- `POST /admin/seed/profiles/:id/trocar-foto` → `{ avatar_url, image_file }` (§3).
  Como `GET /profiles/:id/avatar` reusa o Storage, nenhuma outra rota muda.
- `DELETE /admin/seed/profiles/:id` (apaga o `auth.users`; foto sai de `usadas/`) —
  pequeno, útil pra tirar um perfil que saiu estranho.

## 8. Front — `app/(dashboard)/admin/perfis/page.tsx` + `components/Admin/PerfisSemeados.tsx`

- Gate idêntico a `app/(dashboard)/admin/page.tsx` (`isAdmin` → `notFound()`,
  `robots noindex`, `force-dynamic`). Link discreto a partir do painel `/admin`.
- Lista paginada (50/página, `?page=`): foto 40px, `@username`, nome, lote,
  nº de fichas, data, botão **Trocar foto** → `POST /api/admin/seed/[id]/trocar-foto`
  (route handler Next que repassa ao backend com o token, no padrão de
  `app/api/profiles/[id]/avatar/route.ts`). Ao responder, troca o `src` da
  imagem na linha, sem recarregar. Cabeçalho mostra "fotos no pool: N".
- Sem framework de tabela: `<table>` com as classes `text-mir-text` etc. já
  usadas em `components/Admin/Painel.tsx`.

## 9. Config e arquivos

- Backend `.env`: `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `SEED_IMAGENS_DIR`.
  README ganha as três na tabela de envs + seção "Semeadura".
- `package.json` (backend): `seed:usernames`, `seed:perfis`.
- `.gitignore` (backend): `seed/usernames.json`.
- Doc curto `docs/semeadura.md` no backend: como criar, como trocar foto, e
  **o comando de limpeza** (o `DELETE` do §1 + `rm -rf imagens/usadas`).

## Verificação

1. Aplicar a 033 no `supabase-db` (psql como `supabase_admin`, como o backup faz).
2. `npm run seed:usernames -- --paginas 2` → `seed/usernames.json` com >1.000 handles.
3. `npm run seed:perfis -- --n 3` com a chave do OpenRouter → 3 linhas no log;
   conferir em `www.mirsui.com/user/<username>`: foto carrega, 1–3 faixas no
   acervo, bio, data de entrada no passado; `/admin` conta 18 contas.
4. `/admin/perfis`: lista os 3, "Trocar foto" muda a imagem na hora, o arquivo
   antigo sumiu de `imagens/usadas/`, o novo saiu de `imagens/`.
5. Teste de limpeza numa das 3: `DELETE /admin/seed/profiles/:id` → perfil
   some, fichas somem (cascade), foto sai de `usadas/`.
6. `npm run typecheck` nos dois repos; nenhuma rota pública alterada.

---

## Notas para quando for executar

- **Onde mora o código:** quase tudo é no `~/mirsui-backend` (migration, scripts,
  rotas). No `~/mirsui-web` entram só a página `/admin/perfis`, o componente e o
  route handler. Abrir a sessão com permissão de escrita nos dois repositórios.
- **Datar contas no passado** exige uma função `security definer` que faz
  `update auth.users set created_at = ...` só em linhas com
  `raw_app_meta_data->>'seeded' = 'true'`. É a única parte que toca `auth.users`
  por SQL; se preferir não mexer ali, o resto do plano funciona igual — as
  fichas (`tracks.claimedat`) continuam espalhadas no passado, só a data de
  entrada da conta fica como "hoje".
- **Fontes testadas em 12/09/2026:** Last.fm `/music/<artista>/+listeners?page=N`
  responde sem chave (30 handles/página). Mastodon exige auth na timeline
  pública, Twitter exige login, Deezer só dá nome completo do criador da
  playlist (descartado por ser nome real).
- **Chave do OpenRouter:** entra em `~/mirsui-backend/.env` como
  `OPENROUTER_API_KEY` antes de rodar `seed:perfis`.
