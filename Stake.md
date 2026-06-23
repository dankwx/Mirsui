# Stakes — como a feature funciona

O jogo: o usuário **dá stake** (aposta) numa faixa que acha que vai subir. No momento
do stake, congela-se um **multiplicador** baseado em quão desconhecido é o
artista/faixa. Todo dia medimos a popularidade da faixa; se ela **sobe**, o usuário
ganha pontos. Quem caça faixa obscura no momento certo ganha mais.

Este documento registra só o que **não é óbvio** olhando o código.

## Fonte da métrica: Deezer (NÃO Spotify)

- A busca/seleção de faixa usa o **Spotify** (capa, metadados, ISRC) — é a busca
  bonita que já existia no app.
- Mas a **métrica de popularidade vem do Deezer**, porque **o app do Spotify não
  retorna mais o campo `popularity`** (restrição "Extended Quota" do Spotify desde
  fim de 2024; afeta também `followers`/`genres`). Qualquer coisa baseada em
  `track.popularity` do Spotify está silenciosamente quebrada neste projeto.
- A API do Deezer é **pública, sem chave**. Casamos a faixa do Spotify com a do
  Deezer pelo **ISRC** (exato); na falta dele, por busca textual "artista título".
  - `track.rank` (Deezer) = popularidade da faixa (sobe quando toca mais).
  - `artist.nb_fan` (Deezer) = nº de fãs → fama do artista (multiplicador).

## Normalização para 0–100

O `rank` do Deezer vai de ~100k (obscuro) a ~985k (hit). Normalizamos para 0–100
(preserva a escala/visual do design e o "+30"):

```
popScore(rank)  = clamp(round(rank / 10000), 0, 100)   // 107.970->11, 984.833->98
fameScore(nbFan)= clamp(round(log10(max(nbFan,1))/7 * 100), 0, 100) // log: 1.195->44, 14,5M->100
```

`baseline_popularity`, `last_popularity` e os snapshots guardam o **popScore (0–100)**.

## Multiplicador (TRAVADO no momento do stake)

Quanto **menos famoso** (artista + faixa), **maior** o multiplicador.

```
fama = 0,6 * fameScore(artista) + 0,4 * popScore(faixa)   (cada um 0–100)
mult = 1 + (100 - fama)/100 * 2,5                          -> ~x1,0 (famoso) a ~x3,5 (obscuro)
```

- Congelado na coluna `stakes.multiplier`, **nunca recalculado** depois.
- Exemplos reais medidos: The Weeknd "Blinding Lights" → **x1,02**; Yung Buda "Lab"
  → **x2,17**; meat computer "stray" → **x2,73**.
- A tela mostra uma **prévia** (endpoint `GET /stakes/preview`, que resolve no
  Deezer na hora); o valor **oficial** é o que o `POST /stakes` calcula e trava.

## Pontos por dia

A cada medição diária (snapshot):

```
ganho_pop   = max(0, popScore_hoje - popScore_da_última_medição)
points_gain = round(ganho_pop * multiplicador_travado)
accumulated_points += points_gain
```

- **Nunca negativo**: se a popularidade cair ou ficar igual, o ganho do dia é **0**.
- O **"+30"** no card é o `last_day_gain` — pontos ganhos **na última medição**
  (ontem→hoje), não o total acumulado.

## Regra dos 7 dias = trava de COLETA, não de remoção

- O usuário pode **remover** um stake **quando quiser**.
- Mas só **coleta os pontos acumulados** se a faixa ficou com stake **≥ 7 dias**.
- Remover antes de 7 dias: a vaga é liberada e os pontos são **descartados**
  (`DELETE` da linha).
- Coletar após 7 dias: registra os pontos em `stake_collections` (ledger), marca o
  stake como `coletada` e libera a vaga.

## Faixa removida do Deezer

- Se o job diário recebe erro **code 800** (DataNotFound) ao medir, o stake vira
  `status = 'removida'` e **para de acumular**.
- No card ele aparece **cinza/apagado** com "não vale mais"; o único botão é
  **"Esvaziar vaga"** (remove a linha, **0 pontos**, mesmo que já tivesse acumulado).
- Falha **transitória** (rede / quota Deezer, sem ser 800) **não** marca como
  removida — o job só pula e tenta no próximo dia.

## Job diário (snapshot)

- Roda no backend (`mirsui-backend`) via **node-cron**, **1× por dia** às 09:00
  (America/Sao_Paulo). Arquivo: `src/jobs/stakeSnapshot.ts`, agendado em
  `src/server.ts`. Mede pelo **`deezer_track_id`** salvo no stake.
- Usa o cliente **service role** (`supabaseAdmin`, env `SUPABASE_SERVICE_ROLE_KEY`)
  porque precisa ler os stakes de **todos** os usuários (ignora RLS). **Sem essa
  env o job não roda** (loga aviso e retorna).
- **Idempotente por data**: se já existe snapshot do stake hoje, ele pula — rodar
  duas vezes no mesmo dia **não duplica** pontos.

## Limites e sistema de pontos

- **3 vagas** (stakes ativos) por usuário, validado no backend.
- Não dá pra dar stake na **mesma faixa** duas vezes ao mesmo tempo (um ativo por
  `track_uri`).
- Sistema de pontos **isolado**: tabelas próprias (`stakes`, `stake_snapshots`,
  `stake_collections`). **Não** toca em `profiles.rating` nem em nada existente. O
  total do usuário é `SUM(stake_collections.points)`.
- "X pessoas deram stake" (contador social) usa a função `count_stakes_by_track_uri`
  (`SECURITY DEFINER`), que expõe só o agregado — nunca linhas de outros usuários.
