# Plano de URLs — o endereço legível

**Status:** implementado em 16 de agosto de 2026
**Escopo:** `/track/[id]` e `/artist/[id]`
**Decisão adjacente:** as rotas ficam em inglês (`/track`, `/artist`). Mesmo com
duas línguas no site mais adiante, o padrão universal de rota é o inglês — então
`/faixa/` está descartado, e a questão do §9 está fechada.
**Bloqueia:** a indexação no Google. Ver §10.

---

## 1. O que este documento decide

Uma coisa só: **qual é a forma do endereço de uma faixa e de um artista.**

A decisão é urgente não porque a URL de hoje esteja quebrada — ela funciona — mas
porque mudar endereço depois de indexado custa caro, e o projeto ainda não foi
indexado. Essa janela fecha uma vez.

Tudo que este documento *não* decide está no §9.

---

## 2. O estado de hoje

O endereço canônico de uma faixa é o ISRC, decidido na migration 023 e
implementado em `utils/trackIdentity.ts`:

```
/track/USUM72409273
/artist/4050205
```

A arquitetura por trás disso está certa e este plano não mexe nela. O ISRC é o
código da gravação, emitido pela indústria, que não pertence a plataforma
nenhuma — foi exatamente por isso que ele foi escolhido, e continua sendo a
razão de ele ser a chave. O `resolver()` já aceita três formatos (ISRC, id do
Spotify, id do Deezer) e converte os antigos com 308. Isso tudo fica.

O que está errado é só o que o usuário e o Google **leem**.

### Números medidos no banco de produção em 16/08/2026

| medida | valor |
|---|---|
| gravações com ISRC em `observed_tracks` | 7.128 |
| ISRCs únicos | 7.099 |
| artistas únicos | 2.423 |
| slugs `artista + título` que colidem | **41** |
| gravações afetadas por colisão | 86 (pior caso: 5 na mesma) |
| títulos com marcador de versão (remaster, ao vivo, remix, edit) | **1.208 — 17%** |
| títulos com participação (feat., ft., with) | 210 |
| títulos que viram slug vazio (sem ASCII) | 3 |
| nomes de artista que viram slug vazio | 1 |
| maior `artista + título` bruto | 236 caracteres |

---

## 3. Os problemas

### 3.1 A URL não diz nada

`USUM72409273` tem valor de palavra-chave zero. A URL é um dos poucos sinais que
o site controla por inteiro, e hoje ele está gasto com um número que ninguém
pesquisa e ninguém reconhece.

O efeito não é só de busca. Um link colado no WhatsApp é uma promessa: quem
recebe decide clicar pelo que a URL mostra. `mirsui.com/track/USUM72409273` não
mostra nada.

### 3.2 Um link interno gera 404 sempre

`components/RecentActivity/RecentActivity.tsx:129` monta `/artist/${track.artist_name}`.
A rota de artista aceita id numérico do Deezer ou id de 22 caracteres do
Spotify — um nome não casa nenhum dos dois e cai em `notFound()`. Todo clique ali
é um 404, e link interno para 404 é desperdício de rastreamento.

### 3.3 A janela

Enquanto nada foi indexado, mudar a forma da URL custa uma tarde. Depois de
indexado, custa uma migração com redirecionamento permanente, perda temporária
de posição e meses de reprocessamento. É a diferença entre decidir e remediar.

---

## 4. Os benefícios de resolver

- **Palavra-chave na URL.** Fator pequeno de rankeamento, mas é de graça e é
  totalmente sob controle.
- **Taxa de clique.** Tanto no resultado da busca quanto em link compartilhado,
  a URL legível é lida antes do clique.
- **Texto âncora automático.** Quando alguém cola a URL crua num fórum ou num
  post, a própria URL vira o texto do link. `rodrigo-amarante-tuyo` é
  infinitamente melhor que `USUM72409273` como sinal.
- **Diagnóstico.** No Search Console, no PostHog e no log, ler o relatório passa
  a ser possível sem consultar o banco para saber que faixa é cada linha.

---

## 5. As variações, comparadas

Cinco formas em consideração, avaliadas contra o que importa: SEO, e não
quebrar quando um título mudar.

| | A — hoje | B — slug puro | C — ISRC primeiro | **D — slug + ISRC** | E — artista como pasta |
|---|---|---|---|---|---|
| forma | `/track/USUM72409273` | `/track/rodrigo-amarante-tuyo` | `/track/USUM72409273/rodrigo-amarante-tuyo` | `/track/rodrigo-amarante-tuyo-usum72409273` | `/track/rodrigo-amarante/tuyo-usum72409273` |
| palavra-chave na URL | ✗ nenhuma | ✓ máxima | ~ enterrada no 3º segmento | ✓ na frente | ✓ na frente |
| sobrevive a mudança de título | ✓ | ✗ **quebra** | ✓ | ✓ | ✓ |
| imune a colisão | ✓ | ✗ **86 casos hoje** | ✓ | ✓ | ✓ |
| links já circulando continuam | ✓ | ✗ | ✓ | ✓ | ~ exige regra extra |
| migração de banco | — | coluna `slug` + índice único + política de desempate | — | — | — |
| complexidade do parse | trivial | média | trivial | baixa | média |

### Por que B (slug puro) está fora

Esta era a pergunta em aberto, e o banco responde sozinho.

**Colisão.** 41 slugs mapeiam para mais de um ISRC hoje. Os casos não são
acidentes de formatação, são o núcleo do produto:

| slug | gravações | o que são |
|---|---|---|
| `shakira - dai dai` | 5 | cinco gravações, mesmo álbum |
| `b.b. king - the thrill is gone` | 3 | *Completely Well* (1969), *Deuces Wild*, *B.B. King & Friends 80* |
| `antônio carlos jobim - wave` | 2 | o álbum *Wave* e o disco com Sinatra |

São **gravações diferentes, com curvas de audiência diferentes** — que é
exatamente o que o Observatório mede e o único dado original que o site tem.
Colapsar as três versões de "The Thrill Is Gone" num endereço só é jogar fora o
ativo.

E 0,58% é o número de hoje, com 7 mil faixas. **17% do catálogo já carrega
marcador de versão** (remaster, ao vivo, remix, edit): a colisão é estrutural,
não é cauda. Em 200 mil faixas não são 41 casos, são milhares.

A saída padrão seria sufixo `-2`, `-3`. Isso é *pior* que o ISRC: continua
opaco e ainda é instável, porque depende da ordem em que a linha entrou no
banco. Duas execuções do job em ordens diferentes produzem URLs diferentes para
a mesma gravação.

**Mutabilidade.** Título e nome de artista vêm do Deezer e mudam — acento
corrigido, `feat.` normalizado, gravadora reenviando o release. Se o slug é a
chave, a URL muda sozinha depois de indexada. O ISRC nunca muda; é literalmente
a função dele existir.

### Por que C (ISRC primeiro) perde para D

C funciona e é seguro — é a forma do Stack Overflow. Perde só na leitura: joga a
parte legível para o terceiro segmento, atrás de doze caracteres de ruído. Como
o benefício inteiro desta mudança é legibilidade, entregar metade dele não faz
sentido.

### Por que E (artista como pasta) está fora

Hierarquia no caminho é um sinal real, mas aqui ela mente. 210 faixas têm
participação, e em faixa com dois artistas a escolha de qual vira pasta é
arbitrária — e muda se o Deezer reordenar os créditos. Além disso
`/track/rodrigo-amarante/` não resolve para página nenhuma, e segmento que não
existe como página é caminho morto.

A hierarquia de artista já existe e tem endereço próprio: `/artist/`. Não
precisa ser duplicada dentro de `/track/`.

---

## 6. A decisão

**Forma D.** Slug na frente, identificador como sufixo, um segmento só.

```
/track/rodrigo-amarante-tuyo-usum72409273
/artist/rodrigo-amarante-4050205
```

A regra em uma frase: **o identificador é a chave, o slug é decoração.**

Consequências diretas dessa regra:

- O slug pode ser reescrito a qualquer momento, sem migração e sem tocar no
  banco. Se o Deezer corrigir um título amanhã, o slug novo passa a ser o
  canônico e o antigo ganha 308. Nenhuma linha muda.
- Não existe colisão possível, porque o slug nunca é consultado.
- **`/track/usum72409273` continua casando**, porque a string inteira é o ISRC e
  o slug é vazio. Todo link que já circulou continua abrindo, com 308 para a
  forma completa — o mesmo mecanismo que o `resolver()` já aplica hoje aos ids
  do Spotify e do Deezer.

### O parse

Pega os últimos 12 caracteres e testa contra o `ISRC_RE` que já existe em
`utils/trackIdentity.ts`. Não há ambiguidade: slug é minúscula-com-hífen e o
ISRC tem forma fixa (`^[A-Z]{2}[A-Z0-9]{3}\d{7}$`, com sete dígitos no fim).

O ISRC aparece em minúscula na URL, e é normalizado para maiúscula ao entrar no
código — a normalização de caixa já existe hoje e continua valendo.

Para o artista, o sufixo é o id numérico do Deezer, delimitado pelo último
hífen.

---

## 7. Implementação

Quatro fases. A terceira é o grosso do trabalho e a única com risco real.

### Fase 1 — as funções puras (`utils/trackIdentity.ts`)

- `slugify(texto)` com as regras do §8.
- `enderecoDaFaixa(isrc, artista, titulo)` → a URL canônica completa.
- `parseEnderecoDaFaixa(bruto)` → `{ isrc, slugRecebido }`, tolerante a slug
  vazio, errado ou desatualizado.
- `formatoDoId` ganha o caso `'slug'`. Os três formatos existentes continuam.

Sem efeito colateral, testável isoladamente, não quebra nada.

### Fase 2 — as rotas

- `app/(dashboard)/track/[id]/page.tsx`: o `resolver()` passa a aceitar a forma
  D. Quando o slug recebido difere do canônico — vazio, antigo ou errado — 308
  para o canônico. É o padrão que a função já aplica.
- `app/(dashboard)/artist/[id]/page.tsx`: o mesmo, com id do Deezer.
- Acrescentar `alternates: { canonical }` no `generateMetadata` das duas, que
  hoje não têm.

### Fase 3 — os 11 pontos que montam link

`utils/trackHref.ts` é o lugar único que monta o link, e é chamado em 11 pontos:
`FeedContent` (4), `Profile/ChegouCedo` (2), `Profile/ProfileHeader`,
`Profile/SongsList`, `Landing/Cena` (2), `RecentClaims`. Fora dele, montam URL à
mão: `Landing/Acervo.tsx:62`, `Pile.tsx:143` e `:409`, `Admin/Painel.tsx:457`,
`SearchWithResults.tsx:177` e `:183`.

`trackHref` passa a precisar de título e artista, que hoje não estão na sua
interface `OrigemDoLink`. **A mitigação é o desenho da própria função:** quando
título ou artista não vierem, ela devolve `/track/<isrc>` como faz hoje, e a
rota corrige com 308. Ou seja, nenhum ponto de chamada quebra — os que ainda não
passarem os campos apenas geram um redirecionamento a mais até serem
atualizados. A mudança é incremental por construção.

**Corrigir junto:** `RecentActivity.tsx:129`, o `/artist/${artist_name}` do §3.2.

### Fase 4 — verificação

Rodada contra o servidor de desenvolvimento, com dados de produção. Resultado:

| caso | esperado | obtido |
|---|---|---|
| `/track/GBKPL2205058` (ISRC, forma que circulou) | 308, 1 salto | ✓ `→ /track/djo-end-of-beginning-gbkpl2205058` |
| `/track/uswb16500012` (minúsculo) | 308 | ✓ |
| `/track/1899060227` (id do Deezer) | 308, **1 salto** | ✓ direto na forma final |
| `/track/3qhlB30KknSejmIvZZLjOD` (id do Spotify) | 308, **1 salto** | ✓ direto na forma final |
| `/track/slug-errado-de-proposito-<isrc>` | 308, não 404 | ✓ |
| `/artist/12246`, `/artist/errado-70227002` | 308 | ✓ |
| `/track/ZZZZ99999999`, `/artist/99999999999`, `/track/lixo-total` | 404 | ✓ |
| título de 236 caracteres | trunca na palavra | ✓ `...clavier-book-1-bwv-846-den962202900`, 200 |
| acento no nome | removido | ✓ `Antônio` → `antonio`, `Raphaël` → `raphael` |
| `<link rel="canonical">` na ficha e no artista | presente | ✓ |
| 40 links internos da home e da Pilha | 200 direto, sem 308 | ✓ 40/40 |

A última linha é a que mais importa, e é a que pegou os dois defeitos do §7.5.

---

### 7.5 — o que a verificação achou, e que o plano não previa

Duas divergências entre o slug montado no **cliente** (o link) e o montado no
**servidor** (o canônico). Nenhuma quebrava página — as duas só faziam o clique
pagar um 308 desnecessário —, mas as duas apontavam para a mesma falha de
desenho: o slug estava sendo derivado de fontes diferentes nas duas pontas.

**1. O canônico seguia o Deezer, os links seguiam o acervo.**
`carregarFaixaPorIsrc` monta o título como `doDeezer.title ?? local.title`, ou
seja, o dado ao vivo ganha. Mas todo link interno do site é montado a partir de
`observed_tracks`. Quando os dois textos diferem — medido: `Oitavo Anjo` no
acervo contra `Oitavo Anjo (Porque É Proibido Pisar Na Grama)` no Deezer — o
link ia para um endereço e o canônico apontava para outro.

Correção: o endereço canônico passou a ser montado **dentro de
`carregarFaixaPorIsrc`**, no campo `enderecoCanonico`, e a partir do que o
acervo guardou — não do título ao vivo. A rota só lê esse campo.

Isto não é um remendo, é o princípio do documento aplicado onde faltava: *o
endereço não pode se mexer porque um terceiro reescreveu uma string.* Se o slug
seguisse o Deezer, uma correção de título lá viraria uma URL nova aqui.

**2. Faixa com participação saía com dois nomes.**
`observed_tracks.artist_name` guarda um nome só (`Daft Punk`); `tracks.artist_name`
guarda a lista (`Daft Punk, Julian Casablancas`). O mesmo endereço saía diferente
conforme a seção que montou o link.

Correção: o corte na primeira vírgula passou a acontecer **dentro de
`slugDaFaixa`**, não em quem chama. Regra centralizada é regra que os dois lados
não conseguem divergir — confiar em onze pontos de chamada para passar o artista
certo seria confiar em onze chances de errar.

**A lição para a régua do §10:** as duas só apareceram porque a verificação
comparou link interno com canônico em volume, e não caso a caso. Vale repetir
esse teste sempre que uma fonte nova de link entrar no site.

## 8. Regras do slug

Derivadas dos casos medidos, não hipotéticas.

1. `artista-titulo`, nessa ordem: o artista é o termo mais buscado dos dois. Só
   o artista **principal** — o que vem antes da primeira vírgula. Ver §7.5.
2. Minúscula, acento removido (`NFD` + remoção de diacríticos), tudo que não é
   `[a-z0-9]` vira hífen, hífens repetidos colapsam, hífen de ponta cai.
3. **Truncar em 60 caracteres**, cortando na fronteira de palavra. O maior
   `artista + título` do banco tem 236 caracteres, e URL longa demais é cortada
   na exibição do resultado de busca — o que anula o benefício.
4. **Slug vazio é permitido.** 3 títulos e 1 nome de artista não têm nenhum
   caractere ASCII (alfabetos não-latinos). Nesses casos o endereço canônico é
   `/track/<isrc>` puro, e está tudo bem: o slug é decoração, e decoração pode
   faltar.
5. O slug **não** entra no banco. É derivado em tempo de render, sempre. Guardar
   slug é o que reintroduziria o problema de sincronização que a forma D existe
   para evitar.

---

## 9. O que este documento não decide

Ficam em aberto, deliberadamente:

- ~~**`/track/` ou `/faixa/`?**~~ **Decidido: inglês.** As rotas ficam como
  estão. O ganho de SEO em traduzir o segmento é perto de zero — ninguém
  pesquisa a palavra "track" — e o inglês é o padrão universal de rota, o que
  importa mais quando o site tiver duas línguas. Fica então uma dívida de
  coerência conhecida: `/pilha`, `/termos` e `/privacidade` são as exceções em
  português, e se um dia forem unificadas, é para o inglês que vão.
- **`/how-it-works`, `/claimtrack` e `/library`** são de outra fase do produto e
  precisam ser refeitas. Fora do escopo daqui.
- **A régua de indexação** (§10) é o assunto do plano de SEO, não deste.

---

## 10. Por que isso bloqueia a indexação

Contexto, para o documento se sustentar sozinho daqui a seis meses.

O site ainda não tem `robots.txt`, nem `sitemap.xml`, nem nada enviado ao Search
Console. Isso é um problema conhecido e barato de resolver. O que **não** é
barato é o que aconteceria se fosse resolvido hoje: seriam ~9.500 URLs
publicadas de uma vez, sustentadas por 46 salvamentos, 15 perfis e uma curva do
Observatório que hoje tem **1 ponto por faixa em 76% dos casos**.

O Google rastrearia, indexaria pouco, e classificaria o domínio como de baixo
valor — o que depois penaliza também as páginas boas. É algorítmico, não tem
recurso, e reverte em meses.

O Observatório começou a medir de verdade em 10/08/2026 e roda diariamente desde
então, ~1.300 faixas por dia na cadência adaptativa da migration 025. Nesse
ritmo cada gravação ganha um ponto a cada ~5 dias, e em 90 dias tem uma curva de
verdade.

Então a ordem é: **URL agora** (custa uma tarde e é irreversível depois),
encanamento de SEO em paralelo, e sitemap só quando houver o que indexar — com
régua, não com tudo.
