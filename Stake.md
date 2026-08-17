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

## Pontos por dia: contra o RECORDE, não contra ontem

A cada medição diária (snapshot):

```
ganho_pop   = max(0, popScore_hoje - peak_popularity)
points_gain = round(ganho_pop * multiplicador_travado)
peak_popularity = max(peak_popularity, popScore_hoje)
accumulated_points += points_gain
```

- **Nunca negativo**: cair não tira ponto. `accumulated_points` é catraca.
- **A régua é o pico**, não a medição anterior. Recuperar terreno já andado
  **não paga de novo** — só bater o próprio recorde paga. Logo o acumulado é
  exatamente `(pico - baseline) * multiplicador`.
- O **"+30"** no card é o `last_day_gain` — pontos ganhos **na última medição**.

### Por que não é contra a medição anterior (migration 028)

Era, até 16/08/2026. Comparando com ontem, o acumulado não é "o quanto a faixa
subiu": é a **soma de todas as subidas**, ou seja a variação total pra cima. Uma
faixa que oscila paga a mesma subida a cada ciclo — o jogo premiava tremor de
rank, não descoberta.

Medido nas três fichas reais (42 dias, 126 snapshots):

| faixa | base | pico | agora | pts pela regra velha | pelo pico |
| --- | --- | --- | --- | --- | --- |
| Ginseng Strip 2002 (x1,78) | 70 | 70 | 70 | 5 | 0 |
| eyes (x2,92) | 36 | 36 | 17 | 44 | 0 |
| Leviathan (x2,72) | 19 | 26 | 7 | 54 | 19 |

"eyes" nunca passou do ponto onde a ficha foi botada e tinha 44 pontos. Dos 103
pontos existentes, **84 eram ruído** — e a ficha mais bem paga era a que mais
caiu. Os saldos antigos **não foram mexidos** (confisco retroativo é pior que a
regra errada); o que a migration fez foi fixar `peak_popularity` no pico real já
observado, pra ninguém reganhar de graça o caminho que já pagou.

### O que a métrica se move (medido)

Nos mesmos 42 dias, das 123 medições consecutivas: **81% não mudaram nada**,
6,5% subiram, 12% caíram. O movimento médio é 0,87 ponto de popScore por dia.
Bate com o número da migration 021 (91,9% das medições do acervo repetem o rank
do dia anterior).

Não adianta aumentar a resolução (guardar `popScore` com decimal) pra "acender" o
card: o que apareceria é jitter sub-10k, exatamente o ruído que a marca d'água
existe pra não pagar. **Este é um jogo de semanas, não de dias** — e a UI ainda
não fala isso (ver "O que ficou de fora", no fim).

## Regra dos 7 dias = trava de COLETA, não de remoção

- O usuário pode **remover** um stake **quando quiser**.
- Mas só **coleta os pontos acumulados** se a faixa ficou com stake **≥ 7 dias**
  **e tem saldo > 0**.
- Remover antes de 7 dias (ou sem saldo): a vaga é liberada e os pontos são
  **descartados** (`DELETE` da linha).
- Coletar: registra os pontos em `stake_collections` (ledger), marca o stake como
  `coletada` e libera a vaga.
- Quem faz as duas coisas é a função `collect_stake()` no banco (`SECURITY
  DEFINER`), não o Node: é uma transação só, com `for update` na linha do stake,
  então dois "recolher" simultâneos não geram dois lançamentos do mesmo saldo.

O `can_collect` do `GET /stakes` **espelha essa condição inteira**, inclusive o
`accumulated_points > 0`. Faltava, e o efeito era feio: ficha parada há 7 dias
vinha com `can_collect: true`, o card acendia verde com **"Recolher · 0 pts"**, e
o clique caía no `else` do SQL — que **apaga a linha**. O usuário achava que
estava colhendo e jogava a posição fora.

## Faixa que o Deezer parou de resolver

- Se o job diário recebe erro **code 800** (DataNotFound) ao medir, o stake vira
  `status = 'removida'` e **para de acumular**.
- **Parar de medir não anula o que já foi medido** (migration 028): se já cumpriu
  os 7 dias e tem saldo, `collect_stake()` **coleta normalmente**. Antes o único
  botão apagava a linha com 0 ponto, mesmo com centenas acumuladas.
- Não diga "removida do Spotify" na UI. A métrica é do **Deezer**, e o que sumiu
  foi o `deezer_track_id` — re-upload, troca de distribuidora, licença por região.
  A faixa continua tocando no Spotify, e o usuário consegue verificar isso em dois
  segundos. A copy é "não dá mais pra medir".
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

## Quem pode escrever (migration 018)

As três tabelas são **somente leitura** para `anon` e `authenticated` — e a
leitura só enxerga as linhas do próprio usuário, pelas policies de SELECT. Antes
não era assim: com a anon key do bundle dava para `POST` um lançamento de
999999999 pontos no ledger, ou dar `PATCH` em `accumulated_points`, `multiplier`,
`status` e `staked_at`. Dono da linha não é o mesmo que autor do valor: o valor
vem do Deezer, medido pelo servidor.

Sobraram dois caminhos de escrita, os dois do lado do servidor:

| o quê | por onde |
| --- | --- |
| dar stake (`POST /stakes`) | service role, no backend — baseline e multiplicador são medidos no Deezer na hora |
| snapshot diário | service role, no job (`src/jobs/stakeSnapshot.ts`) |
| recolher | `collect_stake()`, com a regra dos 7 dias dentro do banco |

Consequência prática: **sem `SUPABASE_SERVICE_ROLE_KEY` o backend não consegue
mais criar stake** (responde 503). O job já dependia dessa env; agora a rota
também.

Um índice único parcial (`stakes_um_ativo_por_faixa`) garante no banco o "um
stake ativo por faixa". O limite de 3 vagas continua só no Node.

## O que ficou de fora (problemas conhecidos, 16/08/2026)

A 028 arrumou a **justiça** da pontuação. O que sobra é **ritmo e finalidade** —
nenhum deles se resolve com um commit, todos mudam o desenho do jogo.

Resumo abaixo; o argumento completo, com a medição que sustenta cada item e a
ordem sugerida, está em **`docs/analise-engajamento-dos-stakes.md`**.

1. **O primeiro dia é vazio.** O job roda 1×/dia às 09:00. Quem bota ficha às 14h
   passa ~19h com "Acumulando pontos…" e um botão desabilitado. O pico de
   empolgação é o segundo do stake, e é exatamente aí que não há nada pra ver.
   Uma medição na hora do stake (já temos o valor: o baseline vem do Deezer) não
   resolve — o baseline É essa medição. Precisaria de uma segunda medição algumas
   horas depois, ou de assumir o ritmo semanal na copy.
2. **3 vagas + 7 dias = usuário travado na semana 1.** Ele enche as três em cinco
   minutos e depois não pode fazer mais nada. A pergunta "vai querer tentar com
   mais músicas?" tem resposta estrutural: ele não pode.
3. **Os pontos não compram nada.** `SUM(stake_collections.points)` vira uma linha
   de 11px no hero. Sem ranking, sem histórico de coletas, sem tocar em
   `profiles.rating` (isolamento proposital — ver migration 018 — mas o preço é
   não haver motivo pra semana 2).
4. **Nunca compensa recolher.** Com catraca e sem decaimento, segurar domina
   estritamente; o único motivo pra recolher é liberar vaga. Ou seja, o momento
   de recompensa do jogo é o que o sistema desincentiva. Decisão em aberto: ou o
   jogo passa a ser sobre *achar antes dos outros* (aí o ranking e o contador
   social viram o produto), ou segurar precisa custar alguma coisa.
5. **Corrida nas 3 vagas.** O limite é contado no Node sem lock, então POSTs
   simultâneos abrem uma vaga a mais. O caso que dava ponto em dobro (dois stakes
   ativos na mesma faixa) já está fechado pelo índice único; este sobrou.
