# IMPORTANTE — revisitar antes de crescer

**Aberto em:** 24 de agosto de 2026
**Motivo:** as três cotas do plano gratuito (Supabase e Vercel) estouraram no
mesmo dia. A causa principal foi corrigida. O que sobrou está aqui.
**Prazo real:** a Fair Use Policy do Supabase começa a valer em **23 de setembro
de 2026**. Até lá o excedente é tolerado.

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

## 2. O que já foi feito

| commit | o quê |
|---|---|
| `7307d90` | `/ingest` sai do middleware. Todo evento do PostHog de visitante deslogado virava um render inteiro da landing. Era bug de analytics, não a causa do volume. |
| `a9689dd` | `robots.txt` — não existia nenhum, e `/robots.txt` caía no 404 do Next. |
| `63e5556` | A home vira estática (`revalidate = 600`). O `getUser()` que a prendia no modo dinâmico foi para o middleware, que só valida quando existe cookie. |

Confirmado em produção depois do deploy: a home responde `X-Vercel-Cache: HIT`
(era `MISS` em toda requisição) e 15 ms na segunda visita sem cookie, contra
~600 ms antes.

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
mais ~3 KB de Supabase.

Ela é 6× mais leve que a home era, e por isso não foi o gargalo até agora. O
problema não é o custo por visita — é que ele **escala 1:1 com o seu sucesso.**

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

`utils/homeService.ts:159` — cinco páginas de mil linhas (106 KB) por render, só
para fazer `Map.set(g, +1)` em memória. É um `count group by` numa RPC, e viraria
~200 bytes.

Ficou menos urgente porque a home agora roda isso no máximo 144 vezes por dia em
vez de 36.700. Mas é o que dá folga para baixar o `revalidate` de volta para 60s
se um dia os achados recentes precisarem ser mais frescos.

### 5.2 `pessoasCacheadas` sem `.limit()`

`utils/homeService.ts:251` — varre a tabela de claims inteira para mostrar 5
pessoas. Hoje são 13 KB. Cresce sozinho, sem teto.

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

---

## 7. Quando agir

Não é "quando sobrar tempo". Os gatilhos:

- **Antes de divulgar o Mirsui em qualquer lugar com audiência.** É o cenário do
  §3, e é o pior momento possível para descobrir o teto.
- **Se as Edge Requests não caírem em 48h** depois do `robots.txt` (24/08). Robô
  honesto obedece em horas ou dias; robô mal-educado ignora. Se não cair, o
  próximo passo é firewall na Vercel, não código.
- **Se o egress do Supabase ficar acima de ~170 MB/dia** depois que tudo
  assentar. É o orçamento diário de uma cota de 5 GB/mês.

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
