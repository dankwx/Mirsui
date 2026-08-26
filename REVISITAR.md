# IMPORTANTE — revisitar antes de crescer

**Aberto em:** 24 de agosto de 2026
**Última medição:** 25 de agosto de 2026
**Motivo:** as três cotas do plano gratuito (Supabase e Vercel) estouraram no
mesmo dia. A causa principal foi corrigida. O que sobrou está aqui.
**Prazo real:** o Supabase **encurtou o prazo** no e-mail de 25/08 — de 23 de
setembro para **28 de agosto de 2026**, com o egress em 11,9 GB de 5,5 GB.

> **O contador não anda para trás.** Egress é cumulativo do ciclo de
> faturamento, e os 11,9 GB são quase todos dos dias de 8 GB/dia anteriores aos
> consertos. Em 28/08 o número vai continuar lá mesmo com o site consumindo
> zero. As saídas são upgrade, esperar o ciclo virar, ou escrever para o
> suporte — a causa está corrigida e a queda é demonstrável nos logs deles.

> Este arquivo não é lista de desejo. É a lista do que quebra **no dia em que o
> Mirsui der certo** — e o dia em que um link seu pega é exatamente o dia em que
> o site sai do ar, se nada mudar. Ver §3.

---

## 1. O que aconteceu

Numa medição de 24h o Supabase recebeu **1.206.890 requisições**. Dessas, 37 eram
de autenticação. O resto era máquina: a distribuição era plana nas 24 horas — três
da manhã igual ao pico, que é assinatura de robô, não de gente.

96% de tudo eram quatro queries, todas da home. Ela renderizava do zero a cada
visita, 20 queries e 241 KB de egress por render, ~36.700 renders por dia. Deu
8 GB/dia numa cota de 5 GB/mês.

**Os crons do backend estavam inocentes** — 12 chamadas no dia inteiro. Vale
registrar porque foi a primeira suspeita e custou tempo.

## 1.1 A descoberta que muda qual é a alavanca

Na medição de 25/08, com a home já resolvida, o egress restante **não era
dado**. Era cabeçalho.

O PostgREST responde com **1.012 bytes de cabeçalho em toda requisição**,
independente do que vier no corpo. Só o `set-cookie: __cf_bm` do Cloudflare são
~330 deles. A página de faixa fazia 5,4 requisições REST por render para
trafegar isto:

```
observed_tracks?isrc=eq.X      252 bytes de corpo
rpc/get_track_curve            224 bytes
tracks (quem salvou, limit 8)   28 bytes
tracks HEAD (count exact)        0 bytes
                             -------
                               504 bytes de dado   contra ~5.500 de cabeçalho
```

**89% do egress do projeto era protocolo, não conteúdo.**

A consequência é uma regra, e ela vale para tudo que ainda for otimizado aqui:
**enxugar `select` não adianta neste projeto — o que precisa cair é a CONTAGEM
de idas ao banco.** Antes de propor menos colunas ou paginação, contar quantas
requisições a página faz. Foi isso que a medição de 24/08 não olhou: ela parou
na contagem de requisições e não perguntou quanto custava cada uma.

Verificação, quando a dúvida voltar:

```bash
curl -s -o /dev/null -w "%{size_header}\n" \
  -H "apikey: $ANON" -H "Authorization: Bearer $ANON" \
  "$URL/rest/v1/observed_tracks?select=isrc&limit=1"
```

## 2. O que já foi feito

| commit | o quê |
|---|---|
| `7307d90` | `/ingest` sai do middleware. Todo evento do PostHog de visitante deslogado virava um render inteiro da landing. Era bug de analytics, não a causa do volume. |
| `a9689dd` | `robots.txt` — não existia nenhum, e `/robots.txt` caía no 404 do Next. |
| `63e5556` | A home vira estática (`revalidate = 600`). O `getUser()` que a prendia no modo dinâmico foi para o middleware, que só valida quando existe cookie. |
| `a7345bc` + `4a8c039` (backend) | A página de faixa cabe numa consulta. As 4 requisições REST viram a RPC `get_track_page` — ver §1.1 para o porquê de o número de requisições ser o que importa. |

Confirmado em produção depois do deploy: a home responde `X-Vercel-Cache: HIT`
(era `MISS` em toda requisição) e 15 ms na segunda visita sem cookie, contra
~600 ms antes.

E na medição de 25/08, com tudo isso no ar: **121.415 requisições/dia** contra
1.206.890 na véspera, a home renderizando **2 a 4 vezes por hora** em vez de
36.700 por dia, e a página de faixa saindo de ~6.100 para ~1.560 bytes por
render.

### A tabela que evita a próxima confusão

Cada cota tem uma alavanca diferente, e elas não se substituem:

| cota estourada | página estática resolve? | robots/firewall resolve? |
|---|---|---|
| Egress do Supabase | **sim, quase zera** | parcial |
| Fast Origin Transfer | **sim, quase zera** | parcial |
| Edge Requests (1M) | **não** | **sim, é o único jeito** |
| Edge Middleware | **não** | **sim** |

A Vercel conta toda requisição que passa pela borda, cache hit ou não. Cachear
página não reduz Edge Request nenhum.

---

## 3. O item que importa: a página de faixa

**Estado:** `X-Vercel-Cache: MISS` em toda visita. 40 KB de HTML por render,
mais ~1,5 KB de Supabase (era ~6 KB antes de `a7345bc`).

Ela é 6× mais leve que a home era, e por isso não foi o gargalo até agora. O
problema não é o custo por visita — é que ele **escala 1:1 com o seu sucesso.**

> **O que a RPC resolveu e o que ela não resolveu.** `a7345bc` cortou o lado
> Supabase em ~4× e tirou a página da lista de urgências do egress. Não encostou
> no lado Vercel: os 40 KB de HTML por render continuam idênticos, porque a
> página segue renderizando do zero a cada visita. **O teto medido logo abaixo é
> o da Vercel, e ele não se mexeu.** Esta seção continua valendo inteira.

### A ironia, que é o argumento inteiro

Do comentário do `middleware.ts`:

> *"um link de faixa mandado no WhatsApp precisa abrir para quem clica, e o único
> canal de crescimento que um site deste tamanho tem é o compartilhamento."*

A home, que agora é de graça e aguenta qualquer volume, é a página que **ninguém
compartilha**. A página de faixa, que ainda paga preço cheio por visitante, é a
que você aposta para crescer. O custo está todo do lado que cresce junto com o
resultado.

### O teto, medido

O limite que aperta primeiro **não é o Supabase** — é o Fast Origin Transfer da
Vercel:

```
10 GB/mês ÷ ~50 KB por visita ≈ 200.000 visitas de faixa/mês
                              ≈ 6.600 por dia
```

(50 KB = 40 KB da página + 10 KB do 308, porque o link compartilhado entra pela
forma só-ISRC. Ver §4.)

6.600 visitas/dia não é número grande para uma coisa que pega.

### O que fazer

Cachear a parte pública — curva, quem cravou, o recorde — e mandar só o estado
de usuário para o client.

**O custo disso é real e visível**, e é por isso que não foi feito junto com a
home: `app/(dashboard)/track/[id]/page.tsx:247` calcula `isLoggedIn`, e a página
mostra se **você** salvou aquela faixa. Virando client-side, aparece um instante
de "não salvo" antes de carregar. Não é de graça.

Do lado bom: os dados dela mudam **uma vez por dia**, quando o Observatório roda
às 05:00. Encaixa em revalidação diária com invalidação sob demanda quando
alguém salva — o padrão de `revalidateTag` que já existe no projeto.

---

## 4. O 308 carrega 10 KB de corpo

Medido: `/track/BRBMG0200124` responde 308 com **10.097 bytes** de corpo antes de
levar ao endereço legível.

**O 308 está certo e fica** — é a decisão do `docs/plano-de-urls-e-seo.md`, e é
ela que faz todo link que já circulou continuar abrindo.

O que se paga à toa é o corpo. Ele é o shell `__next_error__` do próprio Next,
que o framework emite quando um Server Component chama `redirect()`. Não é
código nosso.

**A saída óbvia não funciona:** mover o redirect para o middleware daria um 308
sem corpo, mas resolver ISRC → slug exige consultar o banco, e middleware
consultando banco a cada requisição troca 10 KB de transferência por uma query.
Provavelmente pior. **Se for mexer nisto, meça antes** — foi por não ter medido
que eu quase recomendei o caminho errado.

Vale pouco sozinho. Vale junto com §3, porque todo link do WhatsApp entra por aqui.

---

## 5. Pendências menores

### 5.1 A contagem de gênero puxa 5.000 linhas

`utils/homeService.ts:159` — cinco páginas de mil linhas (106 KB cruas, ~8 KB
comprimidas) por render, só para fazer `Map.set(g, +1)` em memória. É um
`count group by` numa RPC, e viraria ~200 bytes.

**Perdeu a urgência de vez.** Medido em 25/08: a home renderiza 2 a 4 vezes por
hora, não 144 por dia e muito menos 36.700 — as queries da landing só aparecem
concentradas na hora do deploy, aquecendo o ISR por região. O que sobra disto é
a folga para baixar o `revalidate` de volta para 60s se um dia os achados
recentes precisarem ser mais frescos.

### 5.2 `pessoasCacheadas` sem `.limit()`

`utils/homeService.ts:251` — varre a tabela de claims inteira para mostrar 5
pessoas. Hoje são 13 KB crus, 592 bytes comprimidos. Cresce sozinho, sem teto —
e é por isso que continua na lista mesmo custando pouco hoje.

### 5.3 O canonical aponta para um endereço que redireciona

A home emite `<link rel="canonical" href="https://mirsui.com"/>`, mas o site é
servido em `www.mirsui.com` e o apex faz 307 para o www. Todo canonical do site
aponta para uma URL que redireciona.

O Google costuma resolver, mas é sujeira, e cada requisição paga um salto a mais
de Edge Request. **É configuração, não código:** ou define o apex como domínio
primário na Vercel, ou seta `NEXT_PUBLIC_SITE_URL=https://www.mirsui.com`.

### 5.4 Não existe sitemap

Com ~3.000 páginas de faixa e nenhum sitemap, o Google descobre tudo por
rastejo — que é justamente o que custa caro. Um sitemap faria ele achar mais e
rastejar menos.

---

## 6. O mistério não resolvido

**O `unstable_cache` não estava cacheando nada.**

Medido: 40 GETs disparados na home fizeram ~35 execuções a mais de uma função
declarada com `revalidate: 1 hora`. Todas as cinco funções cacheadas da landing
executavam ~36.700 vezes por dia, quando o esperado eram 24.

A causa nunca foi encontrada. A hipótese era que os requisições chegavam como
POST (o 307 preserva o método) e o Next não serve Data Cache para não-GET, mas o
teste de tempo GET vs POST deu inconclusivo e o volume continuou depois que o
`/ingest` foi corrigido — então a hipótese está **errada ou incompleta**.

Tornar a página estática contornou o problema por cima: se ela não executa, não
importa por que o cache não pegava.

**Consequência prática, e é a razão desta seção existir:** não confie em
`unstable_cache` neste projeto como se ele funcionasse. Ele é usado em
`homeService`, `homepageService`, `observatoryService`, `pileService` e
`trackIdentity`. Se algum plano futuro depender dele para segurar custo, **meça
antes de confiar.**

**Confirmado de novo em 25/08, numa função diferente.** A `buscarFaixaObservada`
era `unstable_cache` com `revalidate: 3600` e foi chamada 24.599 vezes em 24h
para 19.738 renders de faixa — 1,25 por render. Se estivesse cacheando, seriam
~24 por dia. Ou seja: o que ela deduplicava era o par
`generateMetadata` + componente **dentro do mesmo request**, que é trabalho do
`cache()` do React, não dela. O `unstable_cache` não segurava nada.

Isso decidiu o desenho de `a7345bc`: a RPC nova usa **só `cache()` do React**, e
de propósito. Não é resignação — é que a página precisa mesmo ser fresca (quem
salva tem que ver o próprio nome ao recarregar), e fingir um cache que não
funciona seria pior que não ter nenhum.

---

## 7. Quando agir

Não é "quando sobrar tempo". Os gatilhos:

- **Antes de divulgar o Mirsui em qualquer lugar com audiência.** É o cenário do
  §3, e é o pior momento possível para descobrir o teto.
- **Se as Edge Requests não caírem em 48h** depois do `robots.txt` (24/08). Robô
  honesto obedece em horas ou dias; robô mal-educado ignora. Se não cair, o
  próximo passo é firewall na Vercel, não código.
- **Se o egress do Supabase ficar acima de ~170 MB/dia** depois que tudo
  assentar. É o orçamento diário de uma cota de 5 GB/mês. Estimativa em 25/08,
  já com `a7345bc`: **~31 MB/dia**, ou 18% do orçamento. Tem folga, e a folga é
  o que compra tempo para o §3.
- **Se as ~19.700 renders/dia de faixa não caírem.** É varredura: 19.933 ISRCs
  distintos em 24h, 1,2 acesso cada, plana nas 24 horas com pico às 03:00. O
  catálogo tem 13.469 ISRCs ativos, então ~6.500 dos endereços pedidos **nem
  existem no banco** e mesmo assim pagam render inteiro. Se isto persistir, é
  firewall e §5.4 (sitemap), não otimização de consulta — a consulta já está
  no osso.

---

## 8. Como medir

O que resolveu este caso não foi ler código — foi agrupar os logs por rota. A
leitura de código levou à suspeita errada (os crons) duas vezes.

Projeto `tqprioqqitimssshcrcr`, via MCP do Supabase ou o Logs Explorer:

```sql
-- Quem está batendo, e quanto
select log_attributes['request.path'] as path,
       log_attributes['request.method'] as method,
       count(*) as reqs
from logs
where source = 'edge_logs'
group by path, method
order by reqs desc
limit 30
```

```sql
-- A curva por hora. Distribuição plana = robô. Curva com noite = gente.
select toStartOfHour(timestamp) as hora, count(*) as reqs
from logs
where source = 'edge_logs'
group by hora
order by hora desc
```

Do lado da Vercel, o que confirma se uma página está sendo cacheada:

```bash
curl -s -o /dev/null -D - https://www.mirsui.com/ | grep -i "x-vercel-cache"
# HIT  = servida do CDN, não custa nada
# MISS = renderizada do zero, custa banco e transferência
```

### As três consultas que economizaram tempo em 25/08

**Quem está batendo: nós ou os crons?** Encerra a suspeita dos crons em uma
consulta, em vez de ler o código do backend de novo.

```sql
select log_attributes['request.sb.jwt.apikey.payload.role'] as papel,
       log_attributes['request.path'] as path, count(*) as reqs
from logs where source = 'edge_logs'
group by papel, path order by reqs desc limit 12
-- 25/08: anon 121.361, service_role 54. Os crons são inocentes, de novo.
```

**Quantas linhas cada consulta devolveu.** Os `edge_logs` não têm
`content_length` (a resposta é `chunked`), mas têm `content_range`, que dá a
contagem de linhas — e é ela que denuncia a consulta que puxa mil linhas para
contar um número.

```sql
select log_attributes['request.path'] as path,
       log_attributes['response.headers.content_range'] as faixa,
       count(*) as reqs
from logs where source = 'edge_logs'
group by path, faixa order by reqs desc limit 25
```

**É robô ou é gente?** Um ISRC visitado ~1 vez, milhares de ISRCs distintos e
distribuição plana = varredura.

```sql
select count(*) as reqs,
       uniq(log_attributes['request.search']) as distintos,
       round(count(*) / uniq(log_attributes['request.search']), 1) as por_faixa
from logs where source = 'edge_logs'
  and log_attributes['request.path'] = '/rest/v1/observed_tracks'
  and log_attributes['request.search'] like '%isrc=eq.%'
```

### Medir bytes de verdade

O `fetch` do Node manda `accept-encoding: gzip, deflate` (confere com
`node -e "..."` subindo um servidor local), então o que trafega é o tamanho
**comprimido** — medir com `--compressed`, senão o número sai 5 a 10× maior:

```bash
curl -s -o /dev/null -w "corpo=%{size_download} cabecalho=%{size_header}\n" \
  --compressed -H "apikey: $ANON" -H "Authorization: Bearer $ANON" "$URL/rest/v1/..."
```

E **somar o cabeçalho**. Foi não fazer isso que escondeu o problema do §1.1.
