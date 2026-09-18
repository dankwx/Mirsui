# Perfil (`/user/[username]`) · instrução de reestilização

Aplicar a identidade aprovada em [DESIGN.md](../../DESIGN.md) à página de perfil. Este documento é a especificação para o agente que vai executar: o que muda, o que entra, o que sai e por quê. Leia-o inteiro antes de tocar em código.

**Referências de direção:** Record Club (respiro, tipografia, capas como objetos, seções editoriais) e SoundCloud (bloco de identidade com avatar à esquerda, fileira de números com rótulo, abas sublinhadas para filtrar o conteúdo, ações de seguir/compartilhar logo abaixo do nome). A home aprovada (`design-club-v1`) já traduziu essas referências para o Mirsui; **use a home como fonte visual, não os sites externos.**

Data desta instrução: 17/09/2026. Estado do repositório: `main` em `81e9015`.

---

## 0. Resumo executivo

| | |
|---|---|
| **Objetivo** | O perfil passa a usar tokens, fontes, formas e voz do sistema `club`. Mesma rota, mesmos dados, mesmas funções. |
| **Escopo** | `app/(dashboard)/user/[username]/page.tsx` e tudo em `components/Profile/*`, mais a infraestrutura mínima para a página existir dentro da identidade nova: shell com tokens compartilhados, um header na identidade `club`, rodapé compacto, tema claro/escuro, diálogos e menus portados para o tema. |
| **Fora de escopo** | Feed, pilha, fichas, faixa, artista, admin, páginas legais. Nada de funcionalidade nova (sem "seguir" para anônimo, sem conquistas, sem score). Não mexer em `tailwind.config.ts` (`mir-*` continua servindo as telas não migradas). |
| **Restrição principal** | A home aprovada não pode regredir. Toda alteração em arquivo compartilhado (`Club.module.css`, `RecordCover`, `ThemeToggle`, `PublicShell`, `ui/dialog`) exige comparar a home antes/depois nos dois temas. |
| **Onde trabalhar** | Checkout separado de `~/mirsui-web` (produção via pm2 na porta 3002), com `node_modules` e `.next` próprios. Ver [AGENTS.md](../../AGENTS.md). |

---

## 1. Leitura obrigatória antes de começar

1. [DESIGN.md](../../DESIGN.md) inteiro — em especial "Leitura rápida", "Cores", "Tipografia", "Formas e componentes", "Como expandir" (a linha **Perfil** da tabela) e o checklist.
2. Capturas da home: [desktop](desktop.webp), [mobile](mobile.webp), [tema escuro](dark.webp).
3. Código-fonte da identidade: [Club.module.css](../../components/Landing/Club.module.css) (tokens, `.button`, `.textLink`, `.filters`, `.cover`, `.sleeve`, `.avatar`, `.receiptResult`), [Hero.tsx](../../components/Landing/Hero.tsx) (a nav), [Acervo.tsx](../../components/Landing/Acervo.tsx) (filtros + grid), [Cena.tsx](../../components/Landing/Cena.tsx) (avatares e atividade).
4. O perfil atual, rodando: `http://127.0.0.1:3002/user/danlu` (20 faixas, favoritas, 3 artistas, vitrine completa) e `http://127.0.0.1:3002/user/stickyfingerkie9` (2 faixas: sem seção de artistas, sem favoritas). Capture os dois antes de começar, para comparar no fim:

```bash
B=~/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux-arm64/chrome-headless-shell
$B --headless --no-sandbox --disable-gpu --hide-scrollbars --window-size=1440,3000 --screenshot=/caminho/antes-desktop.png http://127.0.0.1:3002/user/danlu
$B --headless --no-sandbox --disable-gpu --hide-scrollbars --window-size=390,4200  --screenshot=/caminho/antes-mobile.png  http://127.0.0.1:3002/user/danlu
```

---

## 2. Auditoria do perfil atual

### 2.1 O que a página faz hoje (preservar tudo)

Fonte: `app/(dashboard)/user/[username]/page.tsx` e `components/Profile/*`.

| Bloco | Componente | Dados / comportamento que **não mudam** |
|---|---|---|
| Cabeçalho | `ProfileHeader.tsx` | Avatar (troca de foto se dono), nome, `@username`, bio; números: total no acervo, destaque (`buildBadge`: vezes em 1º → top 10 → melhor colocação), artistas, seguidores, seguindo (os dois últimos abrem diálogos); ações: "Editar perfil" (dono) ou `FollowButton` (visitante logado), "Copiar link" (todos), "salvando desde …"; favoritas 2×2 (até 4, `is_favorited`); diálogo de edição (nome + bio, server actions `updateDisplayName`/`updateDescription`); `ModalChangeAvatar`. |
| Chegou cedo | `ChegouCedo.tsx` | 1 destaque + 4 (`rankVitrine`), com "Nª a salvar · N já salvaram" ou "· mês ano". Oculto quando não há faixas com posição. |
| Artistas | `ArtistasDoAcervo.tsx` | Até 6, mínimo 3 para aparecer, mínimo 2 faixas por artista. Retrato = capa de uma faixa em círculo. Não são links (não há id de artista no dado). |
| Acervo | `SongsList.tsx` | Filtros Tudo / Cheguei em 1º / Favoritas (só quando têm o que filtrar); ordenações (recentes, antigas, melhor posição, título, artista); marcador de mês em linha quando a ordem é cronológica; posição por faixa; coração nas favoritas; menu do dono (favoritar, gerar discovery card, remover) com `confirm()`/`alert()`; estados vazio e "nenhuma neste filtro"; CTA "Revirar a pilha" → `/pilha`. |
| Recados | `Recados/Recados.tsx` | Formulário (logado), aviso (anônimo), lista com fixados primeiro, fixar/desafixar (dono), remover (autor ou dono), "Ver mais" paginado, erro inline. |
| Seguidores / Seguindo | `UserFollowers.tsx` | Dois `Dialog` com lista de perfis e `FollowButton` condicional. `SHOW_SCORE = false` — continua desligado. |
| Metadata | `page.tsx` | `generateMetadata` (título, descrição). Inalterado. |

Analytics (`capture('user_followed'|'user_unfollowed')` em `FollowButton`), server actions em `actions.ts`, `trackHref`, `fetchSongs`, RPCs, `countSaversByUri`: inalterados.

### 2.2 O que é da identidade antiga (sai)

Todos os itens abaixo aparecem em `components/Profile/*` e são o motivo desta migração:

- **Paleta `mir-*`** (marrom `#16120c`, creme, lima `#cdef36`, laranja `warm`): ~100% das classes de cor. `grep -rn "mir-" components/Profile` precisa terminar em **zero**.
- **Orbe de gradiente lima/marrom sob o avatar** (`AVATAR_GRADIENT` em `ProfileHeader.tsx:47`). Sai. O fallback vira o círculo `accent-soft` com iniciais, como `.avatar` da `Cena`.
- **Rótulos em `font-mono` minúsculo com tracking** ("no acervo", "favoritas do perfil", "faça login para deixar um recado"). No sistema `club`, rótulo é Hanken em caixa normal; Space Grotesk é só para números pequenos.
- **Pílulas** (`rounded-full`) em botões e filtros. Botão é raio 7 px; filtro é aba sublinhada.
- **`ring-1 ring-mir-line` ao redor de toda capa**. "A imagem é a superfície; evite outra caixa ao redor."
- **Caixas tracejadas** de estado vazio (`border-dashed`).
- **`TONES`/`tone()`** em `Recados.tsx` (fundos marrons sorteados por nome) e avatares quadrados de 9 px de raio. Avatar é círculo.
- **Selo "Fixado" preenchido de laranja** e borda esquerda laranja no recado fixado.
- **Sombras pesadas** (`shadow-[0_30px_80px_rgba(0,0,0,0.55)]`) e botões `bg-black/55 backdrop-blur`.
- **Vermelhos Tailwind** (`text-red-400`) → token funcional `--club-danger`.
- **`ui/button`, `ui/input`, `ui/textarea`, `ui/avatar`** (shadcn com foco roxo `ring-ring`, `bg-primary` roxo). No perfil, use elementos nativos com classes do módulo CSS. `ui/dialog` e `ui/dropdown-menu` (Radix) ficam pelo comportamento; só a aparência muda (ver §6).
- **Comentários de código que explicam o lima/laranja antigo** ("Creme, não lima…", "Seguir é laranja, não lima…", "O lima desta página é o número de destaque…", "em lima ele ficava mais aceso…"). Reescreva-os para a regra nova ou remova; comentário que descreve uma paleta que não existe mais engana o próximo leitor.

### 2.3 Problemas de uso que a migração deve corrigir de passagem

- **Ações que só aparecem no hover**: menu `⋯` da capa (`SongsList`) e fixar/remover (`Recados`) têm `opacity-0` até o hover. Em toque não existem. Regra: visíveis em `:hover`, em `:focus-within` **e** sempre em `@media (hover: none)`.
- **Imagens de capa sem tratamento de erro** (`<img>` cru em `ChegouCedo`, `SongsList`, favoritas). Use `RecordCover`, que já tem `onError` e fallback.
- **Foco visível**: os botões do perfil herdam o `ring-ring` roxo do shadcn ou não têm foco definido. O shell `club` já dá `outline: 3px solid var(--club-accent)` a `a` e `button`; campos de formulário precisam da mesma regra.
- **Texto de estado em minúsculo sem pontuação** ("nenhum recado por aqui ainda"). A voz do `club` é frase normal: "Nenhum recado por aqui ainda."

---

## 3. Decisões de arquitetura (leia antes de codar)

### 3.1 Por que o perfil não pode ficar no `(dashboard)`

`app/(dashboard)/layout.tsx` renderiza o `Header` antigo (marrom, lima, busca com classes `mir-*`) e o overlay `mir-grain`. Uma página clara/esverdeada com acento laranja debaixo desse header não parece "parte da mesma marca" (checklist do DESIGN.md, item 1). Restilizar o `Header` para o `club` recoloriria feed, pilha, fichas, faixa e artista — exatamente o override global que o DESIGN.md proíbe.

**Decisão:** o perfil passa a um novo route group `app/(club)/` com layout próprio. A URL `/user/[username]` não muda (route group não entra na URL). O `(dashboard)` continua intacto para as outras telas. Quando feed/faixa/pilha migrarem, elas mudam de grupo do mesmo jeito; o header e o shell construídos aqui são reaproveitados.

### 3.2 Tokens compartilhados (extração obrigatória)

Hoje os tokens vivem em `Club.module.css` sob `.shell` (classe com hash) e `body:has(.shell)`. Um segundo shell não consegue reusá-los sem copiar os hex — o que o DESIGN.md pede para evitar.

**Criar `app/club.css`** (CSS global, importado em `app/layout.tsx` logo após `globals.css`) com:

1. Os três blocos de tokens **exatamente com os valores atuais** (claro, escuro explícito, `auto` + `prefers-color-scheme: dark`), mas ancorados no atributo, não na classe:
   ```css
   [data-club-theme], body:has([data-club-theme]) { /* claro */ }
   [data-club-theme='dark'], body:has([data-club-theme='dark']) { /* escuro */ }
   @media (prefers-color-scheme: dark) {
     [data-club-theme='auto'], body:has([data-club-theme='auto']) { /* escuro */ }
   }
   ```
2. Dois tokens funcionais novos, só para erro/remoção (DESIGN.md permite cor por função, com texto ou ícone junto):
   `--club-danger: #b3261e` (claro) / `#f28b82` (escuro); `--club-danger-soft: #f6e0dd` / `#4a2b28`.
3. As regras de base que hoje estão em `.shell *`, `.shell :where(h1,h2,h3,p)`, `.shell :where(a,button)`, `:focus-visible`, `::selection`, `section { scroll-margin-top }`, `color-scheme`, `background`, `color`, `font-family`, `-webkit-font-smoothing` — reescritas com `[data-club-theme]` como raiz. Acrescente a regra de foco para campos: `[data-club-theme] :where(input, select, textarea):focus-visible { outline: 2px solid var(--club-accent); outline-offset: 2px; }`.
4. As adaptações do modal de auth (`.au-scrim`, `.au-card`, `.au-submit`, `.au-input`, `.au-glow`) que hoje estão no fim de `Club.module.css`, reancoradas em `body:has([data-club-theme])`. O perfil abre o mesmo modal pelo header (visitante) e pelos recados, então elas precisam valer aqui também.

Em `Club.module.css`, **remova** os blocos que migraram (tokens, base, `.au-*`). `.shell` pode ficar vazia ou sumir; `PublicShell` passa a usar o `ClubShell` abaixo. Tudo o mais no módulo (`.container`, `.nav`, `.button`, `.hero`…) fica como está.

**Verificação obrigatória desta etapa, antes de qualquer outra coisa:** capturas da home a 1440 e 390 px, claro e escuro, idênticas às de `docs/redesign/`. Se houver diferença, a extração está errada; não siga adiante.

### 3.3 Componentes compartilhados novos em `components/Club/`

| Arquivo | O que é |
|---|---|
| `ClubShell.tsx` | `<div className={styles.shell} data-club-theme="auto">{children}</div>`. Sem verificação de rota. `PublicShell` passa a usá-lo para `/`. |
| `ClubShell.module.css` | `.shell { min-height: 100vh; display: flex; flex-direction: column; }` e `.container { width: min(1280px, calc(100% - 112px)); margin-inline: auto; }` com os mesmos breakpoints do landing (`≤1100px: calc(100% - 64px)`, `≤767px: calc(100% - 40px)`). |
| `ThemeToggle.tsx` | **Movido** de `components/Landing/`. Ganha prop `className`; `Hero` passa `styles.themeToggle`, o `ClubHeader` passa a sua. Mantém a chave `mirsui-landing-theme` no `localStorage` (preserva a preferência de quem já escolheu) e o `querySelector('[data-club-theme]')` — com route groups, há sempre um único shell por página. |
| `RecordCover.tsx` + `RecordCover.module.css` | **Movido** de `components/Landing/`. Leva `.cover`, `.cover img`, `.coverFallback` para o próprio módulo e adiciona `data-record-cover` no `<span>` raiz. Em `Club.module.css`, troque `.album:hover .cover img` por `.album:hover [data-record-cover] img` e `.activityTrack .cover` por `.activityTrack [data-record-cover]`. `Acervo` e `Cena` só atualizam o import. |
| `ClubHeader.tsx` + `ClubHeader.module.css` | Ver §3.4. |
| `ClubFooter` | Fica em `Landing/` mas ganha prop `compact` (ver §3.5). |

### 3.4 `ClubHeader` — a nav do produto na identidade nova

Substitui o `Header` antigo **apenas** no layout `(club)`. Reutiliza a lógica, não o visual:

- **Extraia** `navLinks` e `navLinksVisitante` de `components/Header/Header.tsx` para `components/Header/navLinks.ts` (com o comentário de vocabulário do produto). `Header` e `ClubHeader` importam do mesmo lugar — as duas navs nunca podem divergir.
- **Extraia** a leitura de sessão de `app/(dashboard)/layout.tsx` (perfil da tabela `profiles` + `isAdmin`) para `lib/sessionProfile.ts` → `getSessionProfile(): Promise<{ userProfile, dono }>`. Os dois layouts chamam a mesma função.
- `homeUrl` (logado → `/feed`, anônimo → `/`), menu do avatar (Perfil, Painel se `dono`, Sair via `signOut`), fechamento por clique fora: mesmo comportamento do `Header`.

Especificação visual (desktop / ≤767):

| Elemento | Receita |
|---|---|
| Barra | `position: sticky; top: 0; z-index: 40`; altura 72 / 64 px; fundo `color-mix(in srgb, var(--club-bg) 90%, transparent)` + `backdrop-filter: blur(12px)`; `border-bottom: 1px solid var(--club-line)`. Conteúdo dentro de `.container`. |
| Marca | `MirsuiLogo size={24} ink="currentColor" acc="var(--club-accent)"` + "mirsui" em Archivo 800, 26 / 22 px, tracking −1.5 px. Link para `homeUrl`. |
| Links | Mesma lista do `Header`. Hanken 14 px 600, `--club-muted`; hover `--club-text`; ativo = `--club-text` + sublinhado 2 px em `--club-text` (estado de UI não usa laranja, como `.filterActive`). Ocultos < 768 px (paridade com o header atual — não crie hambúrguer nesta tarefa). |
| Busca | `SearchWithResults`, ver nota abaixo. Oculta < 1024 px (paridade). |
| Tema | `ThemeToggle` (36 px, círculo, hover `--club-surface`). |
| Logado | Avatar 32 px círculo (`FotoDePerfil` com fallback iniciais em `accent-soft`/`accent-text`). Menu: painel `--club-paper`, borda `--club-line`, raio 9 px, sombra `0 20px 40px -20px rgba(20,20,18,.35)`, largura 220 px; cabeçalho com nome 14 px 700 e `@user` 12 px muted; itens 14 px com ícone 16 px muted, hover fundo `--club-surface`. "Sair" é neutro (sem vermelho). |
| Anônimo | "Entrar" (`AuthModalTrigger mode="login"`, 14 px 600) + "Fazer parte ↗" (`mode="signup"`, receita `.button` em tamanho `.navSignup`: 13 px, padding 11×16). ≤ 380 px esconde "Fazer parte". |

**Nota sobre `SearchWithResults`:** ela tem 44 `className` com `mir-*`. Não duplique o componente. Troque as classes de cor por variáveis de componente com os valores antigos como padrão no elemento raiz (`[--search-bg:#221b12] [--search-fg:#ece3d2] …` via arbitrary properties do Tailwind) e use `bg-[var(--search-bg)]` etc. no lugar de `bg-mir-*`. O `ClubHeader` envolve a busca num wrapper que redefine `--search-bg: var(--club-paper)`, `--search-fg: var(--club-text)`, `--search-muted: var(--club-muted)`, `--search-line: var(--club-line)`, `--search-panel: var(--club-paper)`, `--search-hover: var(--club-surface)`, `--search-accent: var(--club-accent-text)`. O header antigo no `/feed` deve ficar pixel-idêntico (compare).

### 3.5 Rodapé compacto

O `ClubFooter` com "mirsui" gigante é assinatura da landing; DESIGN.md pede presença compacta em telas de uso frequente. Adicione a prop `compact` ao `ClubFooter`: renderiza `border-top` hairline, padding 28 px 0 (20 no mobile), à esquerda "mirsui" em Archivo 800 18 px + `MirsuiLogo size={16}`, à direita a mesma nav (A cena ↗, Termos, Privacidade) em 12 px muted. Sem o wordmark de 350 px e sem `footerBottom`.

### 3.6 Layout do grupo

`app/(club)/layout.tsx` (server):

```tsx
const { userProfile, dono } = await getSessionProfile()
return (
  <AuthProvider>
    <ClubShell>
      <ClubHeader userProfile={userProfile} isDono={dono} />
      <main style={{ flex: 1 }}>{children}</main>
      <ClubFooter compact />
    </ClubShell>
  </AuthProvider>
)
```

Sem `mir-grain`, sem `bg-mir-bg`. **Mova** (`git mv`) `app/(dashboard)/user/[username]/page.tsx` → `app/(club)/user/[username]/page.tsx`; o Next não aceita a mesma rota em dois grupos. No `page.tsx`, remova `className="w-full bg-mir-bg"` do wrapper e o `<section>` com `max-w-[1200px] px-5` que envolve `Recados`: cada seção passa a usar `.container` do módulo.

### 3.7 Estilo: CSS Modules, não Tailwind

O perfil migrado usa **um módulo por componente** (`ProfileHeader.module.css`, `ChegouCedo.module.css`, `ArtistasDoAcervo.module.css`, `SongsList.module.css`, `Recados.module.css`, `UserFollowers.module.css`, `ModalChangeAvatar.module.css`) com classes semânticas, lendo `var(--club-*)`. Motivos: é como a identidade está escrita (`Club.module.css`), evita `bg-[var(--club-x)]` espalhado, e mantém o Tailwind `mir-*` fora destes arquivos. Radix (`Dialog`, `DropdownMenu`) recebe as classes do módulo pela prop `className`.

Receitas que se repetem (`.button`, `.textLink`, `.filters`, `.sleeve`) podem viver em `components/Club/club-recipes.module.css` e ser compostas com `composes:` ou concatenação de classes. Não importe `Landing/Club.module.css` no perfil.

---

## 4. Especificação por seção

Medidas em px. "Desktop" ≥ 1024, "mobile" ≤ 767. Container e margens: §3.3. **Ritmo vertical do perfil:** seções separadas por `border-top: 1px solid var(--club-line)`; padding vertical 56 (desktop) / 40 (mobile) — menor que os 77–90 da landing, porque é tela de uso. Título de seção com margin-bottom 24 / 18.

### 4.1 Cabeçalho (`ProfileHeader.tsx`)

**Composição.** Desktop: grid `minmax(0,1fr) 296px`, gap 64, `align-items: start`; esquerda = identidade, números, ações; direita = favoritas. Padding 40 em cima e embaixo (28 no mobile). Mobile: uma coluna; favoritas viram fileira de 4 abaixo das ações. Sem favoritas: a coluna some (grid de uma coluna) — como hoje.

**Identidade** (flex, gap 24 / 18, `align-items: flex-start`):

| Elemento | Receita |
|---|---|
| Avatar | 96 / 72 px, círculo, `box-shadow: 0 0 0 1px var(--club-line)`. `FotoDePerfil` com fallback: fundo `--club-accent-soft`, iniciais (até 2 letras do nome) em `--club-accent-text`, Archivo 800, 32 / 24 px. Dono: é `<button aria-label="Trocar foto">`; hover/foco → `box-shadow: 0 0 0 2px var(--club-accent)`; cursor pointer. Visitante: `<div>`. |
| Nome | `h1`, Archivo 700, `clamp(34px, 4.4vw, 56px)`, line-height 1.05, tracking −0.05em, `overflow-wrap: anywhere`. Menor que a manchete da home (91 px), maior que o título de página interna sugerido (40 px): o nome **é** a página. |
| `@username` | Space Grotesk 500, 13 px, `--club-muted`, margin-top 6. |
| Bio | Hanken 16 px, line-height 1.55, `--club-muted`, `max-width: 56ch`, margin-top 12. Ausente → sem espaço reservado. |

**Números** (margin-top 28, padding-top 22, `border-top: 1px solid var(--club-line)`, flex wrap, gap 40 × 20 / 28 × 18):

- Valor: Archivo 700, 30 px, line-height 1, tracking −0.04em, `font-variant-numeric: tabular-nums`, `--club-text`.
- Rótulo: Hanken 500, 12 px, `--club-muted`, margin-top 6, **caixa normal** ("no acervo", "vezes em primeiro", "artistas", "seguidores", "seguindo").
- O número de destaque (`badge`) usa `--club-accent-text` no valor. É o único laranja desta fileira.
- Seguidores/Seguindo são `<button>` (abrem os diálogos): sem borda, mesmo visual; hover/foco sublinha o valor (`text-decoration: underline; text-underline-offset: 6px`). `UserFollowers.statTrigger` passa a usar as mesmas classes de `Numero` — hoje as duas receitas já são espelhadas em Tailwind; no módulo, exporte uma classe só.

**Ações** (margin-top 24, flex wrap, gap 16, `align-items: center`):

| Situação | Botão principal | Secundário | Apoio |
|---|---|---|---|
| Dono | "Editar perfil" com `Pencil` 15 px — receita `.button` (fundo `--club-text`, texto `--club-on-button`, raio 7, 14 px 700, padding 12×18, hover sobe 2 px com sombra `0 5px 0 var(--club-accent)`). | "Copiar link" | "salvando desde dez 2024" |
| Visitante logado | `FollowButton` — **não seguindo:** receita `.button` com `UserPlus`; **seguindo:** contorno (`border: 1px solid var(--club-line)`, fundo transparente, `--club-text`, hover borda `--club-text`) com `UserMinus`, rótulos atuais "Seguir" / "Deixar de seguir". `Loader2` no carregando. | "Copiar link" | idem |
| Anônimo | — | "Copiar link" | idem |

- "Copiar link" é `.textLink`: Hanken 14 px 700, `Link2` 15 px, sublinhado no hover, sem preenchimento. Ao copiar vira "Link copiado" com `Check` por 2 s; envolva em `aria-live="polite"`.
- "salvando desde …" é Hanken 12 px `--club-muted`; no desktop `margin-left: auto`.
- `FollowButton` deixa de usar `ui/button`. O tipo `icon` (não usado hoje) pode ser mantido com a mesma tradução (36 px círculo) ou removido — verifique com `grep`.

**Favoritas** (coluna direita):

- Rótulo: Hanken 600, 12 px, `--club-muted`, "Favoritas do perfil", margin-bottom 12. Sem caixa alta, sem mono.
- Grid 2×2, gap 12 (mobile: 4 colunas, gap 10).
- Cada capa: `Link` para `trackHref(song)`, `aria-label="{título}, {artista}"`; `RecordCover` com a receita **`.sleeve`** da home (raio 3, `box-shadow: 0 12px 18px -12px #20201e60, 1px 1px 2px #20201e25`, `::after` com o brilho de lombada). É a única prateleira "física" do cabeçalho: são as quatro que a pessoa escolheu. **Sem rotação.** Hover: imagem `scale(1.035)`.

**Diálogo "Editar perfil"** → §6.

### 4.2 Chegou cedo (`ChegouCedo.tsx`)

- `h2` "Chegou cedo": Archivo 700, `clamp(26px, 2.8vw, 36px)`, line-height 1.1, tracking −0.045em.
- Linha de apoio (nova, `p` logo abaixo, margin-top 8): Hanken 15 px `--club-muted`: **"As faixas em que chegou mais cedo."**
- Grid: `minmax(0, 320px) minmax(0, 1fr)`, gap 48 (mobile: uma coluna, gap 32). Mantém `align-items: end` no grupo dos quatro para as legendas alinharem com a do destaque (o motivo está no comentário atual; preserve-o).

**Destaque** (o registro da pessoa):

| Elemento | Receita |
|---|---|
| Capa | `RecordCover` com `.sleeve` (sombra um pouco maior: `0 18px 28px -16px #20201e70`). Reserve `aspect-ratio: 1`. |
| Título | Archivo 700, 24 px, tracking −0.03em, margin-top 16; até 2 linhas (`-webkit-line-clamp: 2`). |
| Artista | Hanken 14 px `--club-muted`, margin-top 2. |
| Registro | Bloco com `border-top: 1px dashed var(--club-line)`, margin-top 14, padding-top 14, flex, gap 14, `align-items: center` — a divisória pontilhada do comprovante da home. Ordinal (`{n}ª`) em Archivo 700, 40 px, line-height 1, tracking −0.05em, `--club-accent-text` (é a precedência: pode ser laranja). Ao lado: `<strong>` Hanken 13 px 700 "a salvar" e `<p>` 12 px muted com "N já salvaram" ou "mês ano" (mesma lógica de `Chamada` hoje). |

**Os quatro seguintes**: grid 4 colunas, gap 22 (mobile: 2 colunas, gap 20 × 24). Capa `RecordCover` simples (raio 3, fundo `--club-surface`, sem sombra, hover `scale(1.035)`). Título Hanken 14 px 700, truncado, margin-top 12. Artista 13 px muted. Chamada 12 px: ordinal em Space Grotesk 600 (`--club-accent-text` quando 1, `--club-text` senão), " a salvar" e o resto em Hanken `--club-muted`.

### 4.3 Artistas (`ArtistasDoAcervo.tsx`)

- Seção menor: padding 48 / 36. `h2` "Artistas" em `clamp(22px, 2.2vw, 28px)`; apoio 14 px muted: **"Quem mais aparece no acervo."**
- Lista `flex-wrap`, gap 40 × 28 (mobile 24 × 24); item 104 / 84 px, centrado.
- Retrato: círculo, `box-shadow: 0 0 0 1px var(--club-line)` (círculo recortado de capa precisa do fio no fundo claro). Fallback: `--club-accent-soft` com inicial em `--club-accent-text`, Archivo 800, 28 px. Trate `onError` (use `FotoDePerfil` com a inicial como `children`).
- Nome: Hanken 14 px 700, truncado, margin-top 12. Contagem: Space Grotesk 500, 12 px, muted ("5 faixas").
- Continua sem link e sem posição por artista (motivos nos comentários atuais; mantenha-os).

### 4.4 Acervo (`SongsList.tsx`)

**Cabeçalho da seção** (flex, `justify-content: space-between`, `align-items: end`, gap 24, margin-bottom 20):
- Esquerda: `h2` "Acervo" (`clamp(26px, 2.8vw, 36px)`) + contagem Space Grotesk 13 px muted ("20 faixas"), margin-top 6.
- Direita: ordenação. `<select>` nativo (mantém acessibilidade e o comportamento atual): sem fundo, `border: 1px solid var(--club-line)`, raio 7, padding 9px 32px 9px 12px, Hanken 13 px 600 `--club-text`, `ChevronDown` 14 px muted posicionado à direita; hover borda `--club-text`. `aria-label="Ordenar acervo"`. Mobile: vai para baixo da linha de abas, alinhado à direita.

**Filtros** → receita `.filters` da home: linha com `border-bottom: 1px solid var(--club-line)`, gap 27 (mobile 24), `overflow-x: auto`; cada aba `<button aria-pressed>` Hanken 13 px 600, padding 12px 0 14px, `border-bottom: 2px solid transparent`, `--club-muted`; ativa = `--club-text` + `border-bottom-color: var(--club-text)`. Rótulos: "Tudo", "Cheguei em 1º", "Favoritas", cada um seguido da contagem em Space Grotesk 12 px muted (`Cheguei em 1º · 15`). A regra "só mostra o filtro que tem o que filtrar" continua. Margin-bottom da linha: 24.

**Grid**: `repeat(auto-fill, minmax(150px, 1fr))`, gap 28 × 22; ≤ 1100: `minmax(136px, 1fr)`; ≤ 767: `repeat(3, minmax(0,1fr))`, gap 22 × 14. (320 px → capas de ~84 px; aceitável.)

**Marcador de mês**: mantém a mecânica (faixa de altura fixa acima de cada célula, preenchida só na primeira do mês, só nas ordens cronológicas). Visual: altura 16, Space Grotesk 500, 11 px, `--club-muted`, seguido de `span` hairline `--club-line` que preenche a linha. Margin-bottom 8.

**Célula** (`Tile`, `Link` para `trackHref`):

| Elemento | Receita |
|---|---|
| Capa | `RecordCover` (raio 3, fundo `--club-surface`, hover `scale(1.035)`); wrapper `position: relative` para o menu. Sem ring, sem sombra, sem seta de hover (o menu do dono já ocupa a capa; não sobreponha dois controles). |
| Título | Hanken 14 px 700, truncado, margin-top 10; hover do `Link` sublinha o título (`text-underline-offset: 3px`). |
| Artista | Hanken 13 px `--club-muted`, margin-top 2. |
| Linha de dado | margin-top 6, flex, gap 8, Space Grotesk 12 px. Ordinal com `title="Nª a salvar"`: 1 → 700 `--club-accent-text`; outro → 500 `--club-muted`. Fora da ordem cronológica, mês em muted ao lado. Favorita: `Heart` 12 px preenchido em `--club-muted`, `margin-left: auto`, `aria-label="Favorita"`. **Não** use laranja no coração: na fileira ele competiria com o ordinal, que é o dado que distingue a pessoa. |

**Menu do dono** (`canRemove`):
- Gatilho: 28 px, círculo, fundo `--club-paper`, `MoreHorizontal` 15 px `--club-text`, sombra `0 1px 2px #20201e25`, canto superior direito a 8 px; `aria-label="Opções da faixa"`. `opacity: 0` → `1` em `.tile:hover`, `.tile:focus-within` e `@media (hover: none)`. Continua prevenindo a navegação do `Link` (`onClick e.preventDefault()`).
- Conteúdo (`DropdownMenuContent className=…`): fundo `--club-paper`, `border: 1px solid var(--club-line)`, raio 8, sombra `0 18px 40px -18px #20201e55`, `min-width: 220px`, padding 6. Itens: Hanken 13 px 600, padding 9px 12px, raio 5, ícone 15 px muted; foco/hover fundo `--club-surface`. Separadores `--club-line`. "Remover do acervo": texto `--club-danger`, foco fundo `--club-danger-soft`. Spinners: 12 px, borda `--club-muted`.
- Rótulos e ações inalterados ("Botar nas favoritas"/"Tirar das favoritas", "Gerar discovery card", "Remover do acervo"). `confirm()`/`alert()` continuam (trocar por `useToast` é permitido, mas é tarefa separada; não misture).

**Estados**:
- Acervo vazio: bloco `--club-surface`, raio 7, padding 48 × 24, centrado. `p` Hanken 15 px `--club-text`: **"Nenhuma faixa salva ainda."** CTA `.button` "Revirar a pilha ↗" (`ArrowUpRight` 16) → `/pilha`. Sem tracejado.
- Filtro sem resultado: mesmo bloco, sem CTA, 14 px muted: **"Nenhuma faixa neste filtro."**

### 4.5 Recados (`Recados/Recados.tsx`)

- Seção: padding 56 / 40 em cima, 72 / 48 embaixo (última da página). `h2` "Recados" + contagem (Space Grotesk 13 px muted, "3 recados"). Margin-bottom 20.
- **Formulário (logado)**: flex, gap 12, `align-items: center`. Avatar do autor: 36 px círculo `--club-accent-soft` com "vc" em `--club-accent-text` 12 px 800 (o componente não recebe o avatar do usuário logado; não crie busca nova só para isso). Campo: `flex: 1`, fundo `--club-paper`, `border: 1px solid var(--club-line)`, raio 7, padding 11×14, Hanken 15 px, placeholder muted **"Deixe um recado…"**; hover borda `--club-muted`. Botão "Enviar": `.button` pequeno (13 px 700, padding 11×16); `disabled` → opacidade .5, sem hover. `maxLength={500}` mantido.
- **Anônimo**: faixa `--club-surface`, raio 7, padding 14×16, Hanken 14 px muted: **"Entre para deixar um recado."** com `AuthModalTrigger mode="login"` em `.textLink` ("Entrar ↗") na mesma linha. É o mesmo modal de sempre, só um atalho a mais para ele.
- **Erro**: `p role="alert"`, Hanken 13 px `--club-danger`, margin-top 8.
- **Lista**: `ul` margin-top 8; `li` flex, gap 14, padding 18 × 0, `border-bottom: 1px solid var(--club-line)`. Avatar 36 px círculo (`FotoDePerfil`; fallback `accent-soft` + iniciais `accent-text` 12 px 800). Cabeçalho da linha: nome Hanken 14 px 700; `@user` 12 px muted; data à direita (`margin-left: auto`) 12 px muted. Conteúdo: Hanken 15 px, line-height 1.55, `--club-text` (é o conteúdo principal, não é secundário), margin-top 6, `overflow-wrap: anywhere`.
- **Fixado**: `li` com fundo `--club-surface`, padding 18 × 14, raio 7, sem borda esquerda. Depois do nome: `Pin` 11 px + "Fixado" em Hanken 800, 10 px, caixa alta, tracking .12em, `--club-accent-text` — texto, não selo preenchido.
- **Ações** (fixar/remover): 28 px círculos, fundo `--club-paper`, `border: 1px solid var(--club-line)`, ícone 13 px muted; hover `--club-text`; remover hover → `--club-danger` com borda `--club-danger`. Visíveis em hover, `:focus-within` e `(hover: none)`. `title` mantido; acrescente `aria-label` igual ao `title`.
- **Vazio**: `p` Hanken 14 px muted, padding 32 × 0: **"Nenhum recado por aqui ainda."** Sem caixa.
- **Ver mais**: `.textLink` "Ver mais recados" com `ArrowDown` 15 px, centralizado, margin-top 24; carregando → "Carregando…" com `aria-busy`.

### 4.6 Seguidores / Seguindo (`UserFollowers.tsx`)

- Diálogos: receita de §6. Título "Seguidores" / "Seguindo".
- Lista: `max-height: 60vh`, `overflow-y: auto`. Linha: flex, gap 12, padding 12 × 0, `border-bottom: 1px solid var(--club-line)` (não cartões). Avatar 36 px círculo (`FotoDePerfil`, fallback iniciais). Nome `display_name || username` Hanken 14 px 700 como `Link` (use `next/link`, não `<a>`); `@username` 12 px muted abaixo. `FollowButton` à direita (`margin-left: auto`) na versão pequena (12 px, padding 8×12).
- Vazio: 14 px muted, padding 32 × 0: **"Nenhum seguidor ainda."** / **"Não segue ninguém ainda."**
- Remova `ui/avatar`; `SHOW_SCORE` e o bloco de score continuam como estão (desligados).

### 4.7 `ModalChangeAvatar.tsx`

Mantém a implementação (overlay próprio, upload por `/api/profiles/[id]/avatar`, validações, mensagens). Muda só a aparência, seguindo §6: overlay `rgba(30,32,29,.55)` + blur 4; cartão `--club-paper`, borda `--club-line`, raio 9, sombra, `width: min(100% - 32px, 440px)`, padding 28. **Remova** o eyebrow "FOTO DE PERFIL" lima. Título "Trocar foto" Archivo 700 22 px; `@user` 12 px muted. Preview 140 px círculo com fio `--club-line`. Seletor de arquivo: `label` com `border: 1px dashed var(--club-line)` sobre `--club-surface`, raio 7, padding 18, `Upload` 18 px muted, texto 14 px 600; hover borda `--club-text`. Texto de ajuda 12 px muted; erro 13 px `--club-danger`. Rodapé: "Cancelar" (contorno) e "Salvar foto" (`.button`), estados de envio/sucesso como hoje.

---

## 5. Tabelas de referência

### 5.1 Tipografia do perfil

| Papel | Fonte | Tamanho | Peso | Extras |
|---|---|---|---|---|
| Nome (h1) | Archivo | `clamp(34px, 4.4vw, 56px)` | 700 | lh 1.05, tracking −0.05em |
| Título de seção (h2) | Archivo | `clamp(26px, 2.8vw, 36px)` | 700 | lh 1.1, tracking −0.045em |
| Título de seção menor (Artistas) | Archivo | `clamp(22px, 2.2vw, 28px)` | 700 | idem |
| Título de diálogo | Archivo | 22 px | 700 | tracking −0.03em |
| Título do destaque | Archivo | 24 px | 700 | tracking −0.03em, 2 linhas |
| Ordinal do destaque | Archivo | 40 px | 700 | lh 1, tracking −0.05em, `--club-accent-text` |
| Valor de número | Archivo | 30 px | 700 | lh 1, tracking −0.04em, tabular |
| Apoio de seção / bio | Hanken | 15–16 px | 400 | lh 1.55, `--club-muted` |
| Corpo (recado) | Hanken | 15 px | 400 | lh 1.55, `--club-text` |
| Título de faixa | Hanken | 14 px | 700 | truncado |
| Artista / rótulo / apoio | Hanken | 12–13 px | 400–600 | `--club-muted`, caixa normal |
| Botão | Hanken | 13–14 px | 700 | |
| Números pequenos (ordinal, contagens, mês, `@user`) | Space Grotesk | 11–13 px | 500–600 | nunca `text-transform` |
| "Fixado" | Hanken | 10 px | 800 | caixa alta, tracking .12em, `--club-accent-text` — único rótulo editorial da página |

Tracking negativo só nos títulos Archivo. Nada de `uppercase`/`lowercase` fora do "Fixado".

### 5.2 Mapa de tokens antigo → novo

| Antes (`mir-*`) | Depois |
|---|---|
| `bg-mir-bg` | `var(--club-bg)` (herdado do shell; não repinte) |
| `bg-mir-surface`, `bg-mir-fill1`, `bg-mir-card` | `var(--club-surface)` |
| `bg-mir-raised` (menus) | `var(--club-paper)` |
| `text-mir-text` | `var(--club-text)` |
| `text-mir-text2`, `text-mir-text3` | `var(--club-muted)` (um só nível secundário; hierarquia por tamanho/peso) |
| `border-mir-line`, `border-mir-line2`, `ring-mir-line` | `var(--club-line)` |
| `text-mir-acc` (lima, precedência) | `var(--club-accent-text)` |
| `bg-mir-warm` / `text-mir-warm` (laranja "gente") | `.button` neutro para ações; `var(--club-muted)` para o coração; laranja **não** é mais "camada humana" |
| `bg-mir-warm-soft` (fixado) | `var(--club-surface)` |
| `text-red-400` | `var(--club-danger)` |
| `bg-mir-text text-mir-bg` (botão cheio) | receita `.button` (`--club-text` / `--club-on-button`) |
| `font-mono` | Space Grotesk só em números; rótulos vão para Hanken |
| `rounded-full` (botões/filtros) | raio 7 (botão) / aba sublinhada (filtro) |
| `rounded-[12px]`/`[18px]` (painéis) | raio 7–9 |

### 5.3 Formas

| Objeto | Raio | Sombra |
|---|---|---|
| Capa em grade | 3 px | nenhuma |
| Capa "física" (favoritas, destaque) | 3 px | `.sleeve` |
| Avatar | círculo | fio 1 px `--club-line` |
| Botão | 7 px | hover `0 5px 0 var(--club-accent)` |
| Campo | 6–7 px | nenhuma |
| Painel/menu/diálogo | 8–9 px | suave, `-18px` a `-30px` de spread negativo |
| Bloco de estado | 7 px | nenhuma |

---

## 6. Diálogos, menus e portais

`ui/dialog.tsx` é consumido **só** pelo perfil (`grep` confirma). `ui/dropdown-menu.tsx` também é usado por `Artist/ArtistAllTracksSimple.tsx` — não mude seus padrões; passe classes.

- Radix porta tudo para o `body`. Os tokens chegam por `body:has([data-club-theme])` (§3.2). Não use `body:has(.shell)` nem override global.
- **`DialogContent`**: adicione as props opcionais `overlayClassName` e `closeClassName` (padrões atuais preservados). No perfil: overlay `rgba(30,32,29,.55)` + `backdrop-filter: blur(4px)`; conteúdo `--club-paper`, `border: 1px solid var(--club-line)`, raio 9, sombra `0 30px 60px -30px rgba(20,20,18,.45)`, `width: min(100% - 32px, 440px)`, padding 28; fechar = 32 px círculo transparente, `X` 16 px muted, hover fundo `--club-surface`, sem `ring-purple`.
- **Formulário de edição**: `label` Hanken 13 px 600 `--club-text`, margin-bottom 6; `input`/`textarea` nativos: fundo `--club-bg`, `border: 1px solid var(--club-line)`, raio 6, padding 11×12, Hanken 15 px, placeholder muted; foco pela regra global de campos. Rodapé: "Salvar" (`.button`, `flex: 1`) + "Alterar foto" (contorno, `ImageIcon` 15). "Salvando…" no envio. Mantém `handleEditSubmit`.
- **Tema escuro**: as mesmas regras, via tokens. Verifique especialmente: gatilho `⋯` (`--club-paper` `#30332e` sobre capa), sombras (ok em ambos), `--club-danger` claro no escuro.

---

## 7. Estados que precisam existir e ser testados

| Estado | Como obter | O que ver |
|---|---|---|
| Perfil cheio | `/user/danlu` | Tudo. Favoritas 2×2, vitrine 1+4, 3 artistas, 3 meses no acervo. |
| Perfil pequeno | `/user/stickyfingerkie9` | Sem artistas, sem favoritas (cabeçalho em uma coluna), vitrine só com 1+1. |
| Acervo vazio | Perfil semeado sem faixas (ver `/admin/perfis` com sessão de admin) ou um cadastro novo | Bloco vazio + "Revirar a pilha"; `ChegouCedo` e `Artistas` ausentes; números "0". |
| Bio longa / nome longo | editar um perfil de teste | `overflow-wrap`, `max-width: 56ch`, sem overflow horizontal a 320 px. |
| Capa ausente / URL morta | qualquer faixa com `track_thumbnail` nulo ou 404 | `RecordCover` cai no `Disc3`; célula mantém altura. |
| Avatar morto | perfis com Storage antigo (14 no banco, ver `FotoDePerfil`) | Iniciais em `accent-soft`. |
| Dono | sessão do próprio usuário (peça um login de teste ao dono do produto) | Editar perfil, trocar foto, menu `⋯`, fixar/remover recados, favoritar. |
| Visitante logado | outra sessão | Seguir/Deixar de seguir, recado, remover o próprio recado. |
| Anônimo | janela anônima | Sem seguir; "Entre para deixar um recado."; header com Entrar/Fazer parte; modal de auth com tema. |
| Filtro vazio | `Favoritas` num perfil sem favoritas não aparece; force via ordenação + filtro | "Nenhuma faixa neste filtro." |
| Tema | alternar no header | Todos os blocos, diálogos, menus e o modal de auth. Preferência persiste no reload e é a mesma da home. |
| Movimento reduzido | `prefers-reduced-motion: reduce` | Sem transições; hover das capas não escala; botão não sobe. |

---

## 8. Acessibilidade e movimento

- Foco visível em tudo (regra global do shell + a de campos). Teste com Tab do topo ao fim: header → avatar/nome → números (dois deles são botões) → ações → favoritas → vitrine → abas → select → grade (cada célula e cada gatilho `⋯`) → formulário → ações dos recados → "Ver mais" → rodapé.
- `aria-pressed` nas abas; `aria-label` no select; `aria-live` no "Link copiado"; `role="alert"` nos erros; `aria-label` nos ícones sem texto.
- Nada depende só de hover: menu `⋯`, fixar/remover, gatilho de trocar foto têm caminho por teclado e aparecem em toque.
- Transições: 0.2 s em cor/transform; capas 0.35 s. Tudo dentro de `@media (prefers-reduced-motion: no-preference)` ou anulado pelo bloco `reduce` do shell (mantenha o padrão de `Club.module.css`: `animation: none !important; transition: none !important`).
- Sem animação de entrada no cabeçalho (o nome precisa aparecer no primeiro paint — mesma lição do LCP da home).

---

## 9. Arquivos

| Ação | Caminho | Nota |
|---|---|---|
| criar | `app/club.css` | tokens + base + `.au-*` (§3.2); importar em `app/layout.tsx` |
| editar | `components/Landing/Club.module.css` | remover tokens/base/`.au-*`; seletores `[data-record-cover]` |
| editar | `components/Landing/PublicShell.tsx` | usar `ClubShell` para `/`; resto igual |
| criar | `components/Club/ClubShell.tsx`, `ClubShell.module.css` | |
| mover | `components/Landing/ThemeToggle.tsx` → `components/Club/ThemeToggle.tsx` | prop `className`; atualizar `Hero` |
| mover | `components/Landing/RecordCover.tsx` → `components/Club/RecordCover.tsx` + `RecordCover.module.css` | `data-record-cover`; atualizar `Acervo`, `Cena` |
| criar | `components/Club/ClubHeader.tsx`, `ClubHeader.module.css` | §3.4 |
| criar | `components/Header/navLinks.ts` | extraído de `Header.tsx`; `Header` importa |
| criar | `lib/sessionProfile.ts` | extraído de `(dashboard)/layout.tsx`; ambos os layouts usam |
| editar | `components/SearchWithResults/SearchWithResults.tsx` | variáveis de componente com padrão antigo |
| editar | `components/Landing/ClubFooter.tsx` | prop `compact` |
| criar | `app/(club)/layout.tsx` | §3.6 |
| mover | `app/(dashboard)/user/[username]/page.tsx` → `app/(club)/user/[username]/page.tsx` | `git mv`; tirar classes `mir-*` do wrapper |
| reescrever visual | `components/Profile/ProfileHeader.tsx` + `.module.css` | §4.1, §6 |
| reescrever visual | `components/Profile/ChegouCedo.tsx` + `.module.css` | §4.2 |
| reescrever visual | `components/Profile/ArtistasDoAcervo.tsx` + `.module.css` | §4.3 |
| reescrever visual | `components/Profile/SongsList.tsx` + `.module.css` | §4.4 |
| reescrever visual | `components/Profile/Recados/Recados.tsx` + `.module.css` | §4.5 |
| reescrever visual | `components/Profile/UserFollowers.tsx` + `.module.css` | §4.6 |
| reescrever visual | `components/Profile/FollowButton.tsx` | §4.1; sem `ui/button` |
| reescrever visual | `components/ModalChangeAvatar/ModalChangeAvatar.tsx` + `.module.css` | §4.7 |
| editar | `components/ui/dialog.tsx` | props `overlayClassName`, `closeClassName` |
| não tocar | `components/Profile/actions.ts`, `Recados/actions.ts`, `utils/profileStats.ts`, `utils/fetchSongs.ts`, `hooks/use-certificate-generator-simple.tsx`, `tailwind.config.ts`, `app/globals.css`, `app/(dashboard)/layout.tsx` (além da extração), `components/Header/Header.tsx` (além da extração) | |
| editar no fim | `DESIGN.md` | em "Como expandir → Estado atual", registrar que `/user/[username]` está migrada, onde estão os tokens compartilhados (`app/club.css`) e o `ClubHeader`; a linha "PublicShell só a ativa em /" deixa de ser verdade |

---

## 10. Ordem de execução

1. **Extração dos tokens** (§3.2) + `ClubShell` + `PublicShell`. Build. Comparar a home nos dois temas a 1440 e 390 px com `docs/redesign/*.webp`. Só continue se estiver idêntica.
2. `RecordCover` e `ThemeToggle` para `components/Club/`. Home de novo (hover das capas, mobile do `Cena`, toggle).
3. `navLinks.ts`, `lib/sessionProfile.ts`, `ClubHeader`, `ClubFooter compact`, variáveis da busca. Conferir `/feed` (header antigo idêntico).
4. `app/(club)/layout.tsx` + mover a página. Neste ponto o perfil abre com o shell novo e o conteúdo antigo — é o estado esperado, siga.
5. Componentes do perfil na ordem da página: cabeçalho, vitrine, artistas, acervo, recados, diálogos, modal de avatar.
6. §7 e §8 inteiros. `npm run lint`, `npx tsc --noEmit`, `npm run build` no checkout separado.
7. Capturas "depois" (mesmo comando de §1) para o registro; atualizar `DESIGN.md`.

Um commit por etapa (1–4 são refatorações sem mudança visual e devem poder ser revertidas sozinhas).

---

## 11. Checklist de entrega (além do de DESIGN.md)

- [ ] `grep -rn "mir-" components/Profile components/Club components/ModalChangeAvatar app/\(club\)` → nenhuma ocorrência.
- [ ] `grep -rn "ui/button\|ui/input\|ui/textarea\|ui/avatar" components/Profile components/ModalChangeAvatar` → nenhuma.
- [ ] Home: capturas idênticas às de referência (claro/escuro, 1440/390). Nav, capas, filtros, demo, cena, rodapé.
- [ ] `/feed` com header antigo idêntico (a busca não mudou de cara lá).
- [ ] Perfil a 320, 390, 768, 1024, 1440: sem overflow horizontal; grid do acervo com 3 colunas no mobile; abas rolam horizontalmente.
- [ ] Tema claro e escuro: cabeçalho, vitrine, grade, menu `⋯`, recados, os três diálogos, modal de avatar, modal de auth.
- [ ] Dono, visitante logado, anônimo: ações certas em cada caso; nenhuma ação nova inventada.
- [ ] Teclado: sequência de §8 completa; nada preso; foco visível em cada parada.
- [ ] Toque (`hover: none` no DevTools): `⋯`, fixar/remover visíveis.
- [ ] `prefers-reduced-motion`: sem transições.
- [ ] Axe sem violações A/AA no perfil cheio (claro e escuro).
- [ ] Todas as funções da tabela de §2.1 exercitadas uma vez após a migração (favoritar, remover, discovery card, seguir, recado, fixar, ver mais, copiar link, editar, trocar foto).
- [ ] Textos: sem minúsculas forçadas, sem mono em rótulo, frases com ponto final onde são frases.

---

## 12. O que tirar (e o que não tirar) das referências

**Record Club →** ar entre os blocos; título forte e apoio curto por seção; capas com presença de objeto só onde a pessoa escolheu (favoritas, destaque); meta-informação discreta em muted; CTA neutro de alto contraste; nenhuma decoração para preencher.

**SoundCloud →** bloco de identidade com avatar à esquerda e nome grande; fileira de números com rótulo embaixo; ações (seguir/compartilhar) logo abaixo da identidade; abas sublinhadas para filtrar o conteúdo principal e ordenação ao lado; barra superior fixa com busca.

**Não trazer:** o laranja do SoundCloud como cor de botão (o laranja do Mirsui é de precedência e ênfase, não de ação), banner atrás do cabeçalho, waveforms, sidebars densas, cartões para tudo, rotação de capas em componentes de uso, o rodapé monumental da landing, manchetes de anúncio, eyebrows laranja em cada seção.
