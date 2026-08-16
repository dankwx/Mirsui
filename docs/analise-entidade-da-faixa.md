# A entidade da faixa — página derivada ou registro?

**Status:** análise e proposta. A correção do §5.2 foi verificada e **implementada**
em 16/08/2026 (backend `5831d5b`, migration 027) — ver a seção, que foi reescrita
com o que a verificação achou. **O resto continua não implementado** e aguarda
decisão.
**Data:** 16 de agosto de 2026
**Escopo:** o que existe no banco no momento em que uma faixa tem página.
**Relacionado:** `docs/plano-de-urls-e-seo.md` (a *forma* do endereço — este
documento trata do *registro* por trás dele), backend migrations 023 e 025.

---

## 1. A pergunta

Nenhuma faixa do Mirsui tem página no sentido de "uma linha que existe em algum
lugar". `/track/[id]` é uma rota dinâmica que monta a tela na hora, a partir do
Deezer e do que o Observatório mediu. Se ninguém abrir o endereço, ele não
existe em lugar nenhum; se alguém abrir, ele existe pelo tempo do cache.

Este documento pergunta se isso está certo, mostra o que quebra por causa disso,
e propõe uma correção.

**Não é uma pergunta de performance.** O cache resolve latência. É uma pergunta
sobre de quem é o dado e sobre o que sobra quando alguém descobre uma faixa.

---

## 2. Como a página nasce hoje

Um único caminho, para as três origens (busca, faixa salva, faixa do
Observatório): `carregarFaixaPorIsrc` em `utils/trackPageService.ts:87`.

```
Deezer (ao vivo)  ─┐
                   ├─→ merge → a página
observed_tracks   ─┘
```

```js
if (!doDeezer && !local) return null   // só aqui vira 404
```

Qualquer gravação que o Deezer conheça abre. O que muda de uma faixa para outra
não é o mecanismo, é quanto das duas fontes está preenchido:

| origem | Deezer | `observed_tracks` | `tracks` | o que falta na tela |
|---|---|---|---|---|
| busca, faixa inédita | ✓ | — | — | curva do Observatório, "A prova" |
| Observatório (chart/rádio/álbum) | ✓ | ✓ | — | "A prova" |
| salva por alguém | ✓ | ✓ | ✓ | nada |

Há cache — `next: { revalidate: 900 }` na faixa do Deezer (15 min, curto porque
a URL do MP3 da prévia é assinada e expira) e `unstable_cache` de 1 h na leitura
de `observed_tracks`. Então não é uma requisição por pageview. Mas o dado
continua derivado, nunca armazenado.

**Uma exceção:** `carregarFaixaLegada` (`trackPageService.ts:164`), o caminho do
id do Spotify sem ISRC, não chama o Deezer — renderiza só com o que ficou
gravado em `tracks` no momento do save. É a página mais pobre do site e existe
para que link antigo não vire 404.

### Nada é gravado ao abrir

Abrir a página de uma faixa inédita não escreve nada. Ela não vira linha em
`tracks` nem em `observed_tracks`. A única escrita no caminho de render é
`cache_youtube_video`, e só quando não veio prévia do Deezer e existe id do
Spotify.

O registro só nasce por dois caminhos:

1. **Save** → insere em `tracks`, e **só** em `tracks`. O Observatório não é
   tocado.
2. **Job noturno**, etapa 2 do `catalogSnapshot` ("Acervo do site →
   Observatório", `catalogSnapshot.ts:312`) → lê o acervo inteiro, desduplica
   por artista+título, busca no Deezer e grava em `observed_tracks` com
   `source_list='acervo'`. É aqui que a faixa passa a ser medida e ganha curva.

---

## 3. Números medidos no banco de produção, 16/08/2026

| medida | valor |
|---|---|
| linhas em `tracks` (uma por pessoa por faixa) | 46 |
| gravações distintas salvas | 36 |
| linhas em `tracks` com `isrc` preenchido | 28 |
| `observed_tracks` ativas | 7.131 |
| ativas com ISRC | 7.128 |
| por origem | 3.485 chart · 3.069 rádio · 541 álbum · **36 acervo** |
| gravações salvas que casam com o Observatório **por ISRC** | 20 de 36 |
| gravações salvas que casam **por artista+título** | 25 de 36 |
| gravações salvas que **não casam de jeito nenhum** (nem por ISRC, nem por texto) | **3 de 36 (8,3%)** |

Cuidado com a última linha: "não casa" é uma medida da LIGAÇÃO entre o acervo e o
Observatório, não da medição. Uma das três está medida há meses — ver §5.2.

Dois fatos que o resto do documento usa:

- **Todos os 46 `track_uri` são `spotify:track:…`**, e o save mais recente é de
  **12/06/2026** — anterior à virada para o Deezer. O caminho `isrc:<ISRC>` que
  a busca monta hoje (`app/api/search/route.ts:70`) nunca rodou em produção.
- As 28 linhas com ISRC ganharam esse valor pelo *backfill* da migration 023,
  que casa `tracks.track_uri` com `observed_tracks.spotify_track_id`. Ou seja,
  elas já eram do Observatório antes. **O casamento nunca foi exercitado no
  sentido inverso** — faixa salva que o Observatório não conhecia.

---

## 4. Como os outros fazem

Ressalva: isto é inferência a partir do comportamento observável desses produtos
(slugs próprios, páginas que existem sem atividade nenhuma, o lixo de grafia
persistente do Last.fm). Não tenho o código deles.

**Letterboxd — import em massa.** Puxam o catálogo do TMDB para o próprio banco.
Cada filme é uma linha deles, com slug próprio (`/film/parasite/`), que existe
mesmo que ninguém jamais tenha aberto. Sincronizam por job, não por pageview. Se
o TMDB cair, o Letterboxd continua inteiro de pé — só para de receber filme novo.

**Last.fm — materialização sob demanda.** O catálogo é construído pelos
scrobbles: quando chega um de uma faixa que eles nunca viram, **a linha nasce
ali**. É por isso que existem "The Beatles" e "Beatles" como artistas diferentes
e páginas com grafia errada — é a dívida de um catálogo que cresce por escrita de
usuário. Enriquecem depois com MusicBrainz. Mas a entidade é gravada no primeiro
toque, não re-derivada a cada visita.

**A conclusão que importa:** os dois persistem. O que varia é *quando* a linha
nasce, não *se* nasce. "Render on-demand de terceiro" não é um dos modelos em
uso — e vale entender por quê antes de decidir mantê-lo.

---

## 5. Os problemas

### 5.1 A URL canônica é refém do Deezer justamente onde o §7.5 quis blindar

Este é o problema mais grave, porque contradiz uma decisão já tomada.

O `plano-de-urls-e-seo.md` §7.5 identificou que o slug canônico não podia sair do
título ao vivo do Deezer, e corrigiu: o `enderecoCanonico` passou a ser montado
dentro de `carregarFaixaPorIsrc`, a partir do que o acervo guardou. O princípio
ficou escrito no código: *o endereço não pode se mexer porque um terceiro
reescreveu uma string.*

Mas a implementação é:

```js
enderecoCanonico: enderecoDaFaixa(
    isrc,
    local?.artistName ?? artists[0]?.name,
    local?.title    ?? doDeezer?.title
)
```

`local` é a linha de `observed_tracks`. Quando ela **não existe** — toda faixa
inédita aberta pela busca — os dois `??` caem para o lado do Deezer, e o endereço
canônico passa a ser derivado 100% do título ao vivo.

**A blindagem do §7.5 vale para 7.131 gravações. Para todas as outras, a URL
canônica do site é propriedade do Deezer.** O caso real que motivou a correção
("Oitavo Anjo" no acervo contra "Oitavo Anjo (Porque É Proibido Pisar Na Grama)"
no Deezer) volta a acontecer inteiro fora do catálogo observado. Não é um bug de
implementação — é o limite natural de uma entidade que não é persistida.

### 5.2 A ponte acervo → Observatório era textual, e errava dos dois lados *(corrigido)*

A etapa 2 do `catalogSnapshot` fazia `select('track_title, artist_name')` e
buscava no Deezer por `"<artista> <título>"`. Desde a migration 023 o save grava
`tracks.isrc`, e `fetchDeezerTrackByISRC` seria exato — mas o job não usava.

Conferindo uma a uma no Deezer, o que parecia um defeito só era **dois**, e o
segundo é pior que o primeiro.

**Não casar.** Como o Deezer normaliza o crédito na gravação, o par de texto para
de bater assim que a faixa entra: `akiaura, LONOWN, DJ Pointless` salvo vira
`Akiaura` observado, e a comparação nunca mais casa. Medido hoje: **11 gravações
eram re-buscadas no Deezer toda noite, e 8 delas já estavam no Observatório sob o
ISRC salvo.** O comentário do job se preocupa com o teto ("um teto aqui esconderia
justamente o salvamento antigo que nunca entrou no Observatório") — mas o que
escondia não era o teto, era o casamento.

**Casar errado.** A busca é `/search?limit=1` e o primeiro resultado é aceito sem
conferência nenhuma. Isso não é risco teórico: estava em produção. A linha
`Ronald Figo — INSONAMIA (Slowed)` (deezer `3938495701`), marcada `acervo`, ativa,
medida em 16/08/2026 às 08:00, entrou como primeiro resultado da busca pelo texto
do save `maxy4wyn — INSONAMIA - Slowed`. É de outro artista. O estrago é duplo — a
faixa salva continua sem medição **e** o catálogo paga cadência eterna por uma
gravação que ninguém pediu — e é invisível, porque para o job um palpite errado é
indistinguível de um acerto.

As 3 que não casam de jeito nenhum são, na verdade, três estados diferentes:

| artista | título | estado real |
|---|---|---|
| Bladee | `FUN FACT (feat. Yung Lean)` | **já está medida** — `QM6MZ2475254`, `acervo`, ativa. A ponte resolveu esta certo; o que nunca existiu foi a ligação com o save. O Spotify põe a participação no título, o Deezer põe em `contributors`, então `fun fact (feat. yung lean)` nunca bateu com `fun fact` |
| 物語シリーズ | `白金ディスコ` | essa sim nunca entrou. É `JPE301201661`, "Platinum Disco" da MONOGATARI Series, no **mesmo álbum** do save — o Deezer guarda a faixa romanizada |
| maxy4wyn | `INSONAMIA - Slowed` | nunca entrou, e entrou um impostor no lugar (acima). O Deezer não tem a gravação: as 25 faixas creditadas ao artista foram listadas e não há INSONAMIA |

As categorias continuam sendo as que o `plano-de-urls-e-seo.md` §2 já mediu no
catálogo — **1.208 títulos (17%) com marcador de versão**, **210 com
participação**, **3 sem nenhum caractere ASCII**. A ponte falhava justamente onde
o próprio projeto já documentou que o volume está.

A tese original desta seção era que a quebra apareceria "na primeira faixa salva
pelo caminho novo". Errado por otimismo: **já tinha acontecido**, e ninguém notou
— exatamente como previsto que aconteceria.

**Corrigido em 16/08/2026** (backend `5831d5b`): `buscarPorIsrc()` resolve por
`/track/isrc:` e vira o caminho principal; o texto fica como reserva para o save
anterior à 023 e só aceita o resultado se o artista bater (interseção de conjuntos
de créditos — aceita as 8 divergências reais do acervo, rejeita a errada); e "já
está no Observatório" virou duas perguntas, por ISRC contra o catálogo inteiro e
por texto só contra o acervo. A migration 027 deu ISRC aos dois saves resolvíveis,
cada um conferido pelo álbum que o acervo guardou — o dado que a busca por texto
ignora. O do maxy4wyn ficou sem, de propósito. Fila de pendentes: 11 por noite → 2.

### 5.3 Não existe registro de descoberta que não seja um save

O produto afirma "quem achou antes". Isso é uma afirmação sobre o tempo. Mas o
site não guarda registro de nada ter sido achado, a menos que a pessoa clique em
salvar. Uma faixa aberta pela busca é uma folha morta: não indexa, não mede, não
acumula, e desaparece quando o cache de 15 min expira.

Não estou propondo "primeiro a *ver*" como mecânica de produto — é uma decisão
sua e provavelmente ruim (fácil de fraudar). O ponto é que hoje a informação nem
sequer existe para ser considerada.

### 5.4 O sitemap não é só uma tarefa pendente — ele é impossível por construção

O §10 do plano de URLs já registra a ausência de `robots.txt` e `sitemap.xml`, e
decide corretamente adiar por régua de qualidade. Mas há um limite mais duro que
a régua: **o conjunto de URLs válidas do site é "tudo que o Deezer conhece"**, e
isso não é enumerável. As 7.131 do Observatório dão um sitemap; as faixas que só
a busca abre não existem em lugar nenhum para serem listadas.

Nenhum link interno aponta para elas. São páginas que o Google não tem como
encontrar, nem quando a régua do §10 for atingida.

### 5.5 O caminho de render depende do Deezer para existir

`if (!doDeezer && !local) return null` — para faixa não observada, o Deezer fora
do ar não degrada a página, **remove** a página (404). O plano de independência
do Spotify foi escrito inteiro em cima da tese "nada de terceiro pode apagar dado
que já é nosso". Ela vale hoje para as 7.131 gravações que têm linha local. Para
as demais, a dependência é total — só trocou de dono.

---

## 6. A causa raiz

`observed_tracks` faz duas coisas diferentes na mesma tabela:

| identidade — barata, pode crescer livre | medição — cara, tem teto |
|---|---|
| `isrc`, `title`, `artist_name`, `album_name`, `cover_md5`, `deezer_track_id`, `deezer_artist_id`, `genre` | `first_rank`, `last_rank`, `prev_rank`, `last_checked_at`, `cadence_band`, `cadence_days`, `cadence_priority`, `active` |

É por isso que "ter registro" e "ser medida" estão amarradas. Cada linha nova em
`observed_tracks` custa uma requisição recorrente ao Deezer **para sempre**,
contra o `OBS_MAX_CATALOGO` de 10.000 e o orçamento noturno.

Consequência: **não dá para simplesmente gravar em `observed_tracks` toda página
aberta.** Um rastreador varrendo ISRCs estouraria o Observatório, e uma faixa
vista uma vez por um curioso não merece uma medição diária até o fim dos tempos.

A separação é o que destrava tudo o resto.

---

## 7. A correção proposta

### 7.1 Uma tabela de catálogo, separada da medição

`known_tracks` — a identidade da gravação, sem cadência, sem teto, sem `active`:

```
isrc (pk) · deezer_track_id · deezer_artist_id · title · artist_name
album_name · cover_md5 · first_seen_at · last_refreshed_at · source
```

Barata: ~200 bytes por linha. 100 mil gravações ≈ 20 MB. (Estimativa, não
medição — mas a ordem de grandeza não é o gargalo de nada aqui.)

`observed_tracks` continua exatamente como está e passa a ser o que o nome já
diz: **a fila de medição**, não o catálogo. Promover de `known_tracks` para
`observed_tracks` continua sendo decisão com critério — salvou, tem stake, ou o
job de descoberta escolheu —, que é a lógica que a migration 025 já tem.

### 7.2 O gatilho: materializar no primeiro toque humano

Modelo Last.fm, não Letterboxd. Quando `carregarFaixaPorIsrc` resolve um ISRC que
não tem linha em lugar nenhum, grava em `known_tracks`.

**Não é ideia nova para este projeto: o padrão já existe.** A migration 017 criou
`cache_youtube_video` como `security definer` com `grant execute … to anon`, e ela
é chamada no caminho de render de `track/[id]/page.tsx:339`. O frontend não tem
service role (`utils/supabase/public.ts` é anon, e a migration 016 fechou a
escrita direta de propósito) — então a escrita seria uma RPC no mesmo molde, com
a validação dentro da função.

### 7.3 O que isso resolve, item por item

| problema | como fica |
|---|---|
| 5.1 URL refém do Deezer | `local` deixa de ser null: o slug canônico passa a sair do que gravamos no primeiro toque. A blindagem do §7.5 passa a valer para todas as faixas. |
| 5.2 ponte textual | ~~O job passa a casar por ISRC~~ — **feito em 16/08/2026**, contra `observed_tracks.isrc`, sem precisar de `known_tracks`. Era independente do resto, como suposto aqui. Ver §5.2. |
| 5.3 sem registro de descoberta | `first_seen_at` existe. O que fazer com ele fica em aberto. |
| 5.4 sitemap impossível | Vira `select isrc, title, artist_name from known_tracks`, com a régua do §10 aplicada por cima. |
| 5.5 dependência do Deezer | Toda página passa a ter fallback local. O Deezer fora do ar degrada em vez de 404. |

### 7.4 Um detalhe que morde

`buscarFaixaObservada` (`utils/trackIdentity.ts:143`) filtra `.eq('active', true)`.
Se a opção for reusar `observed_tracks` com `active=false` em vez de criar tabela
nova, **essa query precisa mudar junto** — senão a linha grava e a página não lê.
Vale para todas as leituras que assumem `active=true` como "existe".

---

## 8. Pontos negativos e riscos

Honestamente, e sem os quais a proposta não deve ser aceita.

**8.1 Poluição por rastreador.** Se qualquer request cria linha, um bot varrendo
ISRCs enche a tabela. Mitigações possíveis, nenhuma gratuita: gravar só quando o
Deezer confirmou a faixa (já é o caso — sem `doDeezer` não há o que gravar);
limitar por IP; ou gravar só em request com sessão. Nenhuma é à prova de tudo, e
a tabela vai ter lixo. **O Last.fm tem esse lixo e conviveu com ele por vinte
anos** — mas eles têm escala para justificar, e o Mirsui não tem.

**8.2 Escrita no caminho de render.** Hoje o render de faixa é leitura pura
(exceto o cache do YouTube). Escrever adiciona latência, uma superfície de erro
nova e uma RPC exposta ao papel `anon`. Se falhar, tem que falhar em silêncio —
a página nunca pode quebrar por causa disso.

**8.3 Duas verdades para sincronizar.** É o custo que o Letterboxd paga
eternamente. Título mudou no Deezer e a nossa cópia não sabe. Precisa de política
de `last_refreshed_at` — que é trabalho novo e recorrente. Hoje esse problema
simplesmente não existe, porque não há cópia.

**8.4 Contradiz a regra 5 do §8 do plano de URLs?** Não, mas é perto o
bastante para merecer a nota: aquela regra diz que **o slug** não entra no banco,
e ela continua valendo — o slug segue derivado em tempo de render. O que passa a
ser persistido é o *insumo* do slug (título e artista), que é exatamente o que a
correção do §7.5 já determinou que deve vir do banco e não do Deezer.

**8.5 Complexidade nova sem usuário para justificar.** 46 saves, 15 perfis. Uma
tabela nova, uma RPC nova e uma política de refresh são peso real para um produto
que ainda não tem tráfego. O argumento a favor é o mesmo do §3.3 do plano de
URLs — janela: adiar custa mais caro depois —, mas ele é mais fraco aqui, porque
isto **não** é irreversível como a forma da URL. Dá para fazer depois.

**8.6 O que a proposta não resolve.** Não melhora a qualidade das páginas, que é
o que o §10 do plano de URLs diz ser o gargalo real da indexação. Uma página de
faixa persistida e sem curva continua sendo uma página fraca. Isto é encanamento,
não conteúdo.

---

## 9. Alternativas descartadas

**Importar o catálogo do Deezer (modelo Letterboxd).** Inviável e contra a tese.
O produto não é catálogo, é medição de obscuridade. E o custo de sincronização
seria eterno.

**Não fazer nada.** Defensável para o grosso da proposta, e é a opção certa se a
resposta ao §8.5 for "ainda não" — foi a escolhida em 16/08/2026 para tudo que
depende de `known_tracks`. Mas 5.1 e 5.2 eram defeitos reais e independentes do
resto, e o 5.2 saiu por isso. A previsão de que ele "vai produzir faixa salva e
nunca medida, e ninguém vai notar" estava certa no mecanismo e errada no tempo
verbal: já tinha produzido, com o agravante de uma gravação errada medida no
lugar. Fica como nota sobre o custo de adiar defeito silencioso — o de 5.1
continua adiado, e conscientemente.

---

## 10. O que decidir antes de implementar

1. Tabela nova (`known_tracks`) ou reuso de `observed_tracks` com flag? A tabela
   nova é mais limpa; o reuso evita mexer em `buscarFaixaObservada`, `get_pile_tracks`,
   `get_landing_observatory` e na cadência. **Recomendo tabela nova**, justamente
   porque o §6 é sobre separar as duas coisas.
2. O gatilho é toda visita, ou só visita com sessão? Ver 8.1.
3. `first_seen_at` vira mecânica de produto ou fica só como dado? Ver 5.3.
4. ~~A correção do §5.2 (casar por ISRC) sai **agora**, separada do resto?~~
   **Decidido e feito em 16/08/2026.** Era pequena e isolada, como suposto — e
   não precisou de `known_tracks`: casa contra `observed_tracks.isrc`, que já
   existe. A verificação achou mais do que a análise previa (ver §5.2), incluindo
   uma linha inventada que já estava em produção.
