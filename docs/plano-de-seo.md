# Plano de SEO — abrir o Mirsui para a busca

**Aberto em:** 16 de novembro de 2026
**Continua:** `docs/plano-de-urls-e-seo.md` (o endereço legível, já feito) e o §10 dele (a régua de indexação).

## Leitura rápida

- O site já está aberto: as páginas públicas respondem 200 sem login e o `robots.txt` libera Google e Bing. O que falta é o Google **descobrir** as páginas e ter **motivo** para mostrá-las.
- Em 15/11/2026 o Googlebot fez 13 requisições no site inteiro; o Bing, 20.
- A alavanca não é quantidade. São 500 mil faixas ativas e 59 salvas. Publicar tudo de uma vez é o caminho para o domínio ser classificado como conteúdo automático.
- A ordem é: sitemap com régua (feito, §2) → páginas com algo próprio a dizer (§3) → ampliar a régua olhando o Search Console (§4) → páginas novas que respondem a buscas de verdade (§5).

---

## 1. O estado medido em 16/11/2026

| O quê | Medida |
|---|---|
| Faixas ativas no catálogo | 500.171 |
| Bandas de cadência | 88.990 quentes, 157.278 mornas, 253.903 frias |
| Faixas com popularidade ≥ 50 / ≥ 70 | 9.461 / 2.323 |
| Artistas com ficha no banco | 72.357 |
| Salvamentos | 84 (59 gravações, 24 pessoas) |
| Perfis com username | 36 |
| Resposta ao Googlebot | home 0,08 s, faixa 0,15 s, artista 0,11 s, pilha 3,1 s |

O que já estava certo antes deste plano: URL com slug, `canonical`, 308 das formas antigas, 404 de verdade, título/descrição/`h1` no HTML do servidor, `robots.txt` com os robôs de IA bloqueados.

---

## 2. Feito: o sitemap (branch `feat/sitemap`)

`app/sitemap.ts` + `utils/sitemapService.ts`, e a linha `Sitemap:` no `robots.txt`.

**O que entra (3.126 URLs em 16/11):**

| Grupo | Regra | Quantas |
|---|---|---|
| Fixas | `/`, `/pilha`, `/feed`, `/termos`, `/privacidade` | 5 |
| Faixas | toda faixa salva que está no catálogo + as 2.000 quentes mais populares | 2.042 |
| Artistas | o artista principal dessas faixas, se tem ficha | 1.055 |
| Perfis | quem tem pelo menos um salvamento | 24 |

**As duas regras que não são de gosto:**

1. **Só entra o que está no banco.** Faixa fora do catálogo e artista sem ficha chamam o Deezer na visita; foi robô nessas páginas que estourou o gateway em outubro.
2. **O endereço do sitemap é o canônico.** Ele é montado com as mesmas funções e os mesmos campos que as rotas usam. Conferido numa amostra de 611 URLs (todos os perfis, 300 faixas, 300 artistas): 611 respostas 200, nenhum 308.

**Como funciona:** rota dinâmica, com os dados em `unstable_cache` de 24 h (~20 idas ao banco por dia; a primeira montagem leva ~2,4 s, as seguintes ~40 ms). Se o banco falhar, saem só as fixas e a resposta não é guardada. `lastmod` existe só onde o banco tem data real: `last_change_at` na faixa, o último salvamento no perfil.

**Para publicar:** juntar a branch na main e rodar `./deploy.sh`. Depois, enviar `https://www.mirsui.com/sitemap.xml` no Search Console (§6).

---

## 3. Próximo: fazer cada página valer a visita

Por ordem de impacto. Tudo é código no site, sem API paga.

### 3.1 A pilha precisa de links de verdade
Os itens da pilha são `<button onClick>`: o robô baixa 420 KB em 3 s e não encontra nenhum `href` para faixa. É a página com mais faixas do site e não passa autoridade para nenhuma.
- Trocar o botão por `<a href>` (o clique continua abrindo a folha; o `href` serve ao robô e ao "abrir em nova aba").
- Atacar os 3 s: cache da RPC `get_pile_tracks` ou menos itens no primeiro HTML.

### 3.2 Open Graph e Twitter card em faixa, artista e perfil
Hoje só a home tem. Link de faixa no WhatsApp sai sem capa, e esse é o canal que o `robots.ts` e o middleware existem para proteger.
- Faixa: `og:type=music.song`, capa de 1000 px (já está em `coverUrl`), `music:musician`, `music:duration`, `music:release_date`.
- Artista: `og:type=profile`, foto da ficha.
- Perfil: `og:type=profile`, avatar.
- Avaliar uma `/api/og/faixa` com capa + posição + curva, no molde da `/api/og/selo`.

### 3.3 Dados estruturados (JSON-LD)
- Faixa: `MusicRecording` (`name`, `byArtist`, `inAlbum`, `duration`, `isrcCode`, `datePublished`, `image`, `genre`) + `BreadcrumbList` (Mirsui › artista › faixa).
- Artista: `MusicGroup` com `track` das principais e `sameAs` para o Deezer.
- Perfil: `ProfilePage` + `Person`.
- Home: `WebSite` e `Organization` (nome, logo, `sameAs` das redes).

### 3.4 Título e descrição que só o Mirsui pode escrever
"Sina - Djavan | Mirsui" disputa com Spotify, Deezer, Genius e letras.mus.br, e perde. O que ninguém mais tem é a posição, o movimento e quem chegou primeiro.
- Faixa com curva: `Sina, de Djavan: posição #1.234 e subindo | Mirsui`; descrição com posição atual, variação e número de salvamentos.
- Faixa sem movimento: título simples, descrição com gênero, ano e álbum.
- Artista: quantas faixas no catálogo, a mais alta, quantas pessoas salvaram.
- Home: `Mirsui — salve a música antes dela estourar` no lugar de `mirsui`.

### 3.5 Texto no HTML da faixa
A página é quase toda capa e gráfico. Um parágrafo gerado dos dados ("Lançada em 1982 no álbum Luz, Sina está na posição X do Deezer; subiu Y posições nos últimos 30 dias; Z pessoas salvaram no Mirsui, a primeira em …") dá ao Google algo para ler e é verdade por faixa, não texto repetido.

### 3.6 Acertos pequenos
- `canonical` em `/feed` e `/pilha`.
- `noindex` em perfil sem salvamento e em perfil de teste (`/user/teste` aparece na home; `abcabc`, `asdased` e parecidos existem no banco).
- `noindex` em faixa fora do catálogo e artista sem ficha, enquanto elas chamarem o Deezer na visita: tira o motivo de o robô voltar nelas.
- `alt` das capas com "Capa de {álbum}, de {artista}".
- Conferir `og:image` da home: `/api/og/landing` responde em quanto tempo e com que `cache-control`.

---

## 4. A régua do sitemap e como ela cresce

A constante é `FAIXAS_QUENTES` em `utils/sitemapService.ts`. Aumentar é uma linha; a decisão de aumentar é que precisa de dado.

| Etapa | Entra | Total aprox. | Condição para passar à próxima |
|---|---|---|---|
| 1 (feita) | salvas + 2.000 quentes | 3 mil | — |
| 2 | 10.000 quentes | 15 mil | ≥ 60% da etapa 1 indexada no Search Console e §3.2–3.5 no ar |
| 3 | todas as quentes (89 mil) | 120 mil | ≥ 50% da etapa 2 indexada; rodada do Observatório sem atraso |
| 4 | mornas | 300 mil | só se a etapa 3 trouxer clique, não só indexação |

Notas:
- Acima de 50 mil URLs o sitemap tem que virar índice (`generateSitemaps`), um arquivo por fatia. É obrigatório a partir da etapa 3.
- "Rastreada, mas não indexada" em massa no Search Console é o sinal de parar de ampliar e voltar ao §3.
- As frias (254 mil) não entram enquanto a página delas não tiver nada além da ficha.
- A cada ampliação, repetir a conferência de amostra: toda URL do sitemap responde 200, sem 308.

---

## 5. Páginas novas que respondem a buscas

Ninguém procura "Mirsui". As pessoas procuram música nova, o que está subindo, o que vai estourar. O Observatório mede isso todo dia e hoje não existe página para essa busca.

1. **`/em-alta`** — as faixas que mais subiram na semana, do banco, atualizada a cada rodada. É o conteúdo mais forte que o site pode ter: muda todo dia e só existe aqui.
2. **`/genero/{slug}`** — uma página por gênero da casa (os mesmos da home), com as que mais sobem naquele gênero. Mira "funk em alta", "indie brasileiro novo", "lançamentos de MPB".
3. **`/lancamentos`** — o que entrou no catálogo com data de lançamento recente, por semana.
4. **Página de álbum** — o catálogo já tem `deezer_album_id`, nome e capa; hoje o álbum é só um texto na faixa.
5. **Retrospectivas** — "as 50 que mais subiram em outubro de 2026". Página fixa, que acumula link com o tempo.

Cada uma delas é também um hub de links internos para faixa e artista, que é o que falta hoje (§3.1).

---

## 6. Fora do código (parte do Daniel)

1. **Google Search Console:** criar a propriedade de domínio `mirsui.com` (verificação por DNS, cobre `www` e sem `www`), enviar o sitemap, acompanhar "Páginas" e "Desempenho".
2. **Bing Webmaster Tools:** importar do Search Console. O Bing alimenta DuckDuckGo e o ChatGPT.
3. **IndexNow** (Bing/Yandex, gratuito): avisar URL nova na hora em que alguém salva uma faixa. É uma chamada HTTP no backend.
4. **Links de fora:** sem eles, nada acima rende muito. O que é barato: perfil do Mirsui nas redes com link, o selo de compartilhamento levando à faixa, e as páginas do §5 como algo que vale citar.
5. **Decidir o `www`:** hoje o canônico é `www.mirsui.com` e o domínio sem `www` responde 301. Está certo; só não mudar depois.

---

## 7. Riscos e capacidade

- **Conteúdo raso em escala.** É o risco principal e a razão da régua. A classificação é do domínio, não da página, e reverte em meses.
- **Gateway do Deezer.** Googlebot em página do catálogo custa zero chamada. O risco é ele seguir link para faixa fora do catálogo; os links `/track/{id do Deezer}` saem da página de artista quando a faixa não tem ISRC (`utils/artistPageService.ts`). Vigiar `interactive` × `crawler` no log do gateway depois de enviar o sitemap.
- **Banco.** Cada faixa renderizada são ~5 idas ao banco. 3 mil URLs rastreadas ao longo de dias não aparecem; 120 mil pedem cache da página de faixa para visitante sem cookie antes da etapa 3.
- **Robôs que não são o Google.** O sitemap é público, e raspador lê sitemap. O bloqueio do nginx de 28/10 continua valendo; se o tráfego `interactive` subir depois da publicação, olhar o user-agent antes de culpar o Google.

---

## 8. Como saber se funcionou

| Quando | O que olhar | Bom sinal |
|---|---|---|
| 1 semana | nginx: requisições do Googlebot por dia | de ~13 para centenas |
| 2–4 semanas | Search Console › Páginas | indexadas subindo, "rastreada, não indexada" abaixo de 40% |
| 1–3 meses | Search Console › Desempenho | impressões em buscas de `artista + faixa` e, depois do §5, em buscas de gênero |
| sempre | log do gateway, duração da rodada | rodada não atrasa |

---

## 9. O que não fazer

- Não colocar as 500 mil faixas no sitemap.
- Não gerar texto por IA para encher página: é exatamente o que a política de conteúdo em escala do Google mira, e custaria API paga.
- Não liberar os robôs de IA do `robots.ts` "para aparecer no ChatGPT" sem medir o gateway antes; foram eles que derrubaram a rodada em outubro.
- Não contratar ferramenta de SEO paga agora. O Search Console responde tudo que este plano pergunta.
