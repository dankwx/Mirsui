# Mirsui: clube de descobertas

**Para continuar o design, leia [DESIGN.md](../../DESIGN.md).** Este arquivo é o registro histórico da implementação e da geração de assets. O design foi aprovado, integrado à `main` e publicado; a referência está preservada na tag `design-club-v1`, commit `f4b122b`.

Branch: `redesign/landing-record-club`.

## Direção

Rebrand completo da landing, autorizado em 16/09/2026. Referência: [Record Club](https://record.club/). O acesso direto apresentou um desafio do Cloudflare; a referência visual foi conferida em uma [captura pública](https://cdn.trendhunterstatic.com/thumbs/614/record-club.jpeg). Não havia sessão do Brave conectada às ferramentas desta execução.

A inspiração é o espaço em branco, a clareza tipográfica e a personalidade de um clube de música. A composição, as cores, o texto, a curadoria e a ilustração são próprios desta proposta.

- Base clara, tinta escura e laranja; versão escura e preferência persistida.
- Archivo em títulos, Hanken Grotesk no texto, Space Grotesk nos pequenos números. Fontes já presentes no projeto, servidas por `next/font`.
- Capas com presença de objetos físicos, acervo filtrável, registro interativo e atividade real da comunidade.
- `DESIGN_VARIANCE: 8`, `MOTION_INTENSITY: 5`, `VISUAL_DENSITY: 4`.
- CSS Modules e componentes existentes; nenhuma dependência adicionada.

## Auditoria anterior

A home anterior usava fundo marrom `#16120c`, lima `#cdef36`, tipografia Archivo/Hanken, botões em pílula, mosaico sob um véu escuro, atividade recente e oito longas fileiras por gênero. A informação do catálogo era útil, mas as imagens e os títulos disputavam atenção sem uma sequência clara. Densidade visual aproximada: 7/10; movimento: 1/10.

A proposta mantém o conteúdo real que sustenta o produto, com uma hierarquia diferente: descoberta, demonstração do registro, comunidade, convite.

## Dados e comportamento

- Capas da abertura e da seleção da casa: curadoria fixa de seis faixas reais; seus links usam ISRC canônico. Não são rankings ou lançamentos fictícios.
- Gêneros, faixas por gênero, perfis e atividade: serviços existentes do Supabase, com o mesmo cache de servidor.
- Apenas o cartão de demonstração tem um registro fictício. Ele é identificado como demonstração e não faz gravações no banco.
- Cadastro/login continuam usando o modal e as ações existentes; a aparência acompanha a landing.
- Home mantém `revalidate = 600`, renderização estática, canonical e metadados. Sessões continuam tratadas pelo middleware.
- O card Open Graph acompanha a nova identidade.
- `PublicShell` limita a identidade nova à rota `/`; páginas legais mantêm seu conteúdo e moldura anteriores.
- Movimento respeita `prefers-reduced-motion`; capas no celular podem ser percorridas horizontalmente.

## Imagens

Assets finais em `public/assets/landing/`:

- `record-1.webp` a `record-6.webp`: capas reais do catálogo Deezer, com variantes `-small.webp` de 250 px. Mapeamento de título, artista e ISRC em `components/Landing/editorialRecords.ts`.
- `digging-records.webp`: ilustração original gerada pela ferramenta integrada `image_gen`, depois codificada para WebP de 960 × 640. O PNG original permanece na pasta de imagens geradas, fora do repositório.

Prompt da ilustração:

> Create an original editorial illustration for Mirsui, a Brazilian music discovery club landing page. Asset: a standalone horizontal spot illustration for a website section, 1536x1024. An expressive oversized orange-red hand with black ink contour lovingly pulling one black vinyl record halfway out of a simple stack of record sleeves, with a tiny four-point black sparkle to suggest finding a treasure. Contemporary independent record shop visual identity, sophisticated playful screenprinted flat graphic, bold imperfect ink outlines, minimal two-color linocut feel, subtle paper ink texture. NOT a cartoon face, NO anthropomorphic musical instruments, NO eyes, NO mascots. Palette ONLY near-black #20201e and vermilion #e85b36 on a solid uniform warm off-white #f7f7f2 background. Center composition fills about 75% of frame with clean generous margin. Record sleeve in orange-red with simple abstract black sun graphic. No text, no letters, no logos, no watermark, no shadows, no 3D. Needs to feel art-directed and memorable, not clip art.

Os assets estáticos da landing são pré-otimizados para não depender do `sharp`, ausente na configuração standalone atual.

## Verificação

Build de produção executado em cópia isolada em `/tmp/mirsui-redesign/build`, com dependências próprias. A prévia final usa a porta 3011. TypeScript e lint passaram; o lint mantém cinco avisos anteriores de `<img>` em componentes do produto. O build também conserva os avisos existentes de Supabase e de rotas dinâmicas.

Checagens no Chromium: filtros, demonstração salvar/reiniciar, abrir cadastro/login, fechar por Escape, âncoras, persistência do tema, movimento reduzido e páginas legais. Sem erros de execução e sem overflow entre 320 e 1440 px. Axe: nenhuma violação WCAG A/AA encontrada na home clara e escura. Isso é uma checagem automatizada, não uma auditoria completa com leitor de tela. Nenhum cadastro foi enviado.

A animação de entrada do título foi removida após medição: ela atrasava o LCP no celular simulado. O movimento permanece nas capas e nas interações. A simulação ainda identifica custo de JavaScript, principalmente o gravador de sessões do PostHog já presente no aplicativo. A configuração de analytics foi preservada.

Nota de execução: a primeira prévia local compartilhou `.next` com a instância anterior e removeu seus artefatos. Esses arquivos foram recompostos a partir do commit original `e2206a2`, e a instância antiga foi reiniciada. Foram verificados HTTP 200 para a home original e todos os 21 arquivos de CSS, JavaScript e fontes referenciados. O redesign não foi aplicado à instância antiga. As verificações finais e a prévia passaram a usar uma pasta de build independente.

Lighthouse em build de produção, simulação mobile local: desempenho **79**, acessibilidade **100**, boas práticas **100**. FCP 1,1 s, LCP 3,4 s, bloqueio total 490 ms, CLS 0. As notas de acessibilidade/boas práticas foram verificadas antes do último ajuste de animação; a medição de desempenho foi repetida sem a animação do título. São medições de laboratório, não dados reais de visitantes; o LCP simulado ainda supera a meta de 2,5 s.

Capturas finais: [desktop](desktop.webp), [mobile](mobile.webp), [tema escuro](dark.webp). Para executar novamente, use outro checkout com `npm ci` e as variáveis de ambiente descritas no README principal. Não execute `next dev` na mesma pasta `.next` usada por uma instância de produção.
