# Mirsui · guia de design

Esta é a identidade aprovada pelo dono do produto e publicada na home em setembro de 2026. Use-a como referência ao levar o design para outras áreas. Não é um convite para reinterpretar a marca a cada tarefa.

**Referência preservada:** tag Git `design-club-v1`, commit `f4b122b`. Veja as capturas [desktop](docs/redesign/desktop.webp), [mobile](docs/redesign/mobile.webp) e [tema escuro](docs/redesign/dark.webp). Elas registram a composição; o código desse commit registra o comportamento.

## Leitura rápida para agentes

1. O Mirsui é um **clube de descobertas musicais**: pessoal, curioso, com gosto por garimpar e registrar quem chegou primeiro.
2. A personalidade vem de tipografia forte, espaço, capas reais e detalhes de loja de discos. Evite transformar tudo em cartões ou adicionar decoração para preencher vazios.
3. Base clara levemente esverdeada, tinta escura e um acento laranja. Há tema escuro equivalente. Use os tokens abaixo.
4. **Archivo** nos títulos; **Hanken Grotesk** no texto; **Space Grotesk** em pequenos números. Todas já estão carregadas.
5. O laranja marca descoberta, precedência e ênfase. O botão principal é neutro de alto contraste; ele não precisa ser laranja.
6. Capas quase quadradas nas quinas; botões com raio pequeno; círculos para avatares. A inclinação é um gesto para objetos musicais, não para todo componente.
7. Mostre o conteúdo real do produto. Demonstrações devem estar identificadas e nunca fingir atividade real.
8. Adapte a densidade à tarefa. Um feed ou formulário não precisa do título gigante, da pilha inclinada e do rodapé monumental da landing.
9. A home é a referência aprovada. Ao migrar outra tela, preserve seu visual e seu funcionamento.
10. O CSS antigo marrom/lima ainda existe no produto. Ele **não** é a fonte da identidade nova.

Para uma mudança pequena, leia esta seção, os tokens e o componente relevante. Para migrar uma tela inteira, leia também “Como expandir” e o checklist. Instruções explícitas futuras do usuário podem mudar esta direção.

## O que faz este design funcionar

**A música ocupa o espaço principal.** Capas carregam cor, memória e variedade. O entorno é calmo para que o catálogo apareça. As imagens não ficam escondidas sob um véu escuro.

**Há hierarquia, não volume de decoração.** A abertura faz uma promessa; o acervo permite explorar; o registro explica a diferença do produto; a comunidade mostra gente real; o fechamento convida a participar. Cada trecho tem um papel e uma composição própria.

**A interface sugere objetos físicos.** As capas têm quinas pequenas, uma sombra discreta e inclinações controladas. O registro lembra um comprovante. Esses detalhes conectam a experiência digital ao prazer de guardar música.

**O texto é direto e brasileiro.** “Saia do repeat”, “Bom gosto deixa rastro”, “O famoso ‘eu já ouvia’. Agora, com prova.” são exemplos da voz. Use esse vocabulário com medida. Formulários e erros precisam de instruções claras, não de trocadilhos.

A referência inicial foi o Record Club: respiro, tipografia e personalidade. O Mirsui ganhou composição, paleta, textos e ilustração próprios. Para continuar esta identidade, consulte primeiro a home aprovada; não volte a copiar a referência externa.

## Cores: use papéis, não hex espalhado

Fonte executável: [Club.module.css](components/Landing/Club.module.css), blocos `.shell` e temas.

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--club-bg` | `#f7f7f2` | `#1e201d` | Fundo principal |
| `--club-surface` | `#eeeee7` | `#282b26` | Agrupamentos, campos, seção de explicação |
| `--club-paper` | `#fdfdf9` | `#30332e` | Registro, modal, superfície elevada |
| `--club-text` | `#242522` | `#f0f0e7` | Texto principal e fundo do CTA |
| `--club-muted` | `#64665e` | `#b2b7aa` | Texto secundário |
| `--club-line` | `#d9dbd2` | `#42473d` | Divisores discretos |
| `--club-accent` | `#db4b27` | `#f57a53` | Marca, ênfase grande, detalhe de interação |
| `--club-accent-text` | `#b63a1b` | `#f9906f` | Texto pequeno que precisa de acento |
| `--club-accent-soft` | `#f5e1d7` | `#47332b` | Fundo discreto associado ao acento |
| `--club-on-button` | `#f7f7f2` | `#20221d` | Texto sobre CTA principal |

`accent` e `accent-text` são diferentes de propósito: o laranja da manchete não deve ser aplicado automaticamente a legendas pequenas. Não derive texto secundário só reduzindo opacidade; preserve o contraste com cada superfície.

Mantenha o mesmo tema durante a página. A seção “Como funciona” muda apenas o tom da superfície. Cores de capas são livres; cores da interface são controladas. Em telas do produto, cores de erro/sucesso podem existir por função, acompanhadas de texto ou ícone, sem virar novos acentos de marca.

## Tipografia e ritmo

As fontes vêm de [app/layout.tsx](app/layout.tsx), via `next/font`. Reuse as variáveis; não carregue outra família para a mesma função.

| Papel | Receita da referência |
|---|---|
| Manchete da home | Archivo 800; `clamp(44px, 6.3vw, 91px)`; entrelinha `1.045`; tracking `-0.066em` |
| Título de seção | Archivo 700; `clamp(34px, 3.4vw, 49px)`; entrelinha `1.07`; tracking `-0.055em` |
| Texto introdutório | Hanken Grotesk; 16–18 px; entrelinha 1.55–1.65 |
| Nome de faixa | Hanken Grotesk 700; 14 px no grid desktop |
| Artista / apoio | Hanken Grotesk; 12–14 px; `--club-muted` |
| Rótulo editorial | 11 px, peso 800, caixa alta, tracking `0.13em`; uso raro |
| Pequenos números | `var(--font-space-grotesk)`; não é uma fonte monoespaçada |

Tracking apertado pertence aos títulos grandes. Não o espalhe em parágrafos e campos. Destaque uma palavra com peso ou cor da mesma família; não injete uma serifada para parecer sofisticado.

Na landing, o container tem até 1280 px, com 56 px de margem mínima por lado. Até 1100 px, as margens são 32 px; até 767 px, 20 px. Seções usam aproximadamente 77–90 px de espaço vertical no desktop e 48–55 px no celular. Dentro dos grupos, intervalos de 12–24 px mantêm relação entre título, apoio e ação.

Em telas funcionais, reduza títulos e espaço entre seções conforme a tarefa. Preserve a hierarquia e o alinhamento, não as dimensões de um anúncio.

## Formas e componentes

- **CTA:** fundo `--club-text`, texto `--club-on-button`, raio 7 px, peso 700, 15 px, padding 17 × 24 px no desktop. Hover sobe 2 px e revela uma sombra sólida laranja de 5 px. Use uma ação principal clara por contexto.
- **Links secundários:** texto com seta pequena e sublinhado no hover. Não transforme cada link em mais um botão preenchido.
- **Capas:** proporção 1:1, raio 3 px, título e artista abaixo. A imagem é a superfície; evite outra caixa ao redor sem necessidade.
- **Filtros:** linha horizontal de opções; opção ativa com sublinhado e estado acessível. No celular, a faixa pode rolar horizontalmente.
- **Avatares:** círculos; fallback de iniciais quando a foto falhar. Nome e contexto ao lado.
- **Registro:** superfície de papel, divisão pontilhada, posição em destaque. A pequena rotação pertence à demonstração editorial; documentos e formulários de uso contínuo podem ficar retos.
- **Ícones:** `lucide-react`, já instalado. Reuse uma família, geralmente 16–21 px. A seta diagonal indica acesso/continuidade; não a coloque em toda linha por decoração.
- **Marca:** reuse [MirsuiLogo](components/MirsuiLogo/MirsuiLogo.tsx) com `ink="currentColor"` e `acc="var(--club-accent)"`. Os valores padrão do componente ainda pertencem ao tema antigo.

O rodapé com “mirsui” enorme é uma assinatura da landing. Em telas de uso frequente, prefira uma presença compacta da marca.

## Imagens e movimento

As capas da abertura são links de faixas reais, em [editorialRecords.ts](components/Landing/editorialRecords.ts). São uma seleção editorial, não uma lista de lançamentos ou um ranking. Preserve essa distinção ao criar vitrines novas.

A ilustração [digging-records.webp](public/assets/landing/digging-records.webp) mostra uma mão garimpando discos. A linguagem é de impressão em duas cores: preto, laranja, traço irregular e textura discreta. Para novas ilustrações, mantenha essa família visual. Evite render 3D, gradientes brilhantes e personagens copiados de outro site. O [registro do redesign](docs/redesign/README.md#imagens) guarda o prompt original e a origem dos assets.

As imagens da landing estão no repositório, em WebP, com miniaturas de 250 px para o grid. `unoptimized` nos `Image` desses assets é deliberado: já foram preparados, e o standalone atual não tem `sharp`. Não generalize isso para imagens enormes novas. Reserve dimensões e trate erro de carregamento.

O movimento confirma ações e dá materialidade às capas: entrada curta dos discos, capa que se endireita no hover/foco, imagem do grid que aumenta levemente, botão que reage. A manchete aparece imediatamente. Sua animação foi removida após piorar o LCP; não reintroduza um fade que esconda o conteúdo principal.

Respeite `prefers-reduced-motion`. Não acrescente rolagem forçada, paralaxe, cursores customizados ou animações permanentes para “melhorar” uma interface que já tem personalidade.

## Como expandir para outras partes do site

**Estado atual:** a home, o perfil público em `/user/[username]` e a página de faixa em `/track/[id]` usam a identidade `club`. [PublicShell](components/Landing/PublicShell.tsx) mantém a home no shell público, enquanto o layout do grupo `(club)` usa [ClubShell](components/Club/ClubShell.tsx), [ClubHeader](components/Club/ClubHeader.tsx) e [ClubFooter](components/Landing/ClubFooter.tsx). Os tokens compartilhados estão em [app/club.css](app/club.css). Páginas legais e outras telas logadas continuam com a identidade anterior. `tailwind.config.ts` ainda contém `mir-*` marrom/lima, e `globals.css` contém tokens antigos: não os confunda com o sistema `club`.

1. Leia a captura e o componente da home mais próximo da tarefa. Defina qual conteúdo e qual ação devem dominar a nova tela.
2. Mantenha rotas, sessão, regras do produto, analytics e dados existentes. Mudar apresentação não autoriza inventar funcionalidades.
3. Para migrar várias telas, extraia os tokens, estilos básicos e controle de tema para uma camada compartilhada. Faça essa extração preservando o resultado visual da home; evite copiar dez hexadecimais para cada módulo.
4. Planeje o shell da nova área. Use `ClubShell` e os tokens de `app/club.css`; importar `Club.module.css` sozinho não define as variáveis. Copiar `PublicShell` também não resolve, pois ele é o shell da home.
5. Reuse a hierarquia de botões, capas, textos e estados. Crie layouts adequados à tarefa, em vez de repetir as seções da landing.
6. Compare a home antes/depois da extração e teste a nova tela nos dois temas.

**Tema e portais:** [ThemeToggle](components/Club/ThemeToggle.tsx) usa `data-club-theme="auto|light|dark"`, preferência do sistema e a chave `mirsui-landing-theme` no `localStorage`. Hoje encontra um único shell via `querySelector`. Se houver mais shells ou um tema para todo o app, centralize esse controle e preserve a preferência anterior na migração.

O modal de autenticação é montado em um portal no `body`. Por isso há seletores `body:has([data-club-theme])` que disponibilizam os tokens e adaptam as classes `.au-*`. Um novo diálogo portado para fora do shell precisa receber o tema também. Não resolva isso com um override global que recolore telas ainda não migradas.

| Tela | Como traduzir a identidade |
|---|---|
| Perfil | Identidade da pessoa, capas e seus registros em primeiro plano. Título menor, números com função, ações de seguir/compartilhar claras. |
| Faixa / artista | Capa ou foto principal, nome, contexto e ação dominante. Dê destaque à precedência sem transformar toda informação em badge. A faixa já está migrada: use-a como referência para o artista. |
| Feed | Pessoas e achados com bom ritmo de leitura. Espaçamento mais compacto; preserve legibilidade e navegação. |
| Busca / pilha | A busca e os resultados dominam. Grid de capas, filtros acessíveis e estados vazios úteis. |
| Formulários / admin | Mesmas fontes, cores e formas, com densidade funcional. Sem discos inclinados, manchetes enormes ou linguagem promocional. |

Exemplo de CSS para um **componente novo dentro de um shell já integrado**:

```css
.title {
    color: var(--club-text);
    font-family: var(--font-archivo), sans-serif;
    font-size: clamp(28px, 3vw, 40px);
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.045em;
}
.description {
    color: var(--club-muted);
    font: inherit;
    line-height: 1.6;
}
```

Esse tamanho é uma sugestão para páginas internas, não um valor extraído da manchete da home.

## Mapa do código

| Arquivo | Responsabilidade |
|---|---|
| [app/club.css](app/club.css) | Tokens, base compartilhada, temas, acessibilidade e adaptação do modal em portal |
| [Club.module.css](components/Landing/Club.module.css) | Layouts e componentes visuais específicos da home |
| [Hero.tsx](components/Landing/Hero.tsx) | Navegação, promessa principal, CTA e capas inclinadas |
| [Acervo.tsx](components/Landing/Acervo.tsx) | Seleção editorial e filtros de gêneros reais |
| [ComoFunciona.tsx](components/Landing/ComoFunciona.tsx) | Demonstração local do registro; não grava no banco |
| [Cena.tsx](components/Landing/Cena.tsx) | Pessoas e atividade reais |
| [RecordCover.tsx](components/Club/RecordCover.tsx) | Capa com dimensões reservadas e fallback |
| [Fechamento.tsx](components/Landing/Fechamento.tsx) / [ClubFooter.tsx](components/Landing/ClubFooter.tsx) | Ilustração, convite e assinatura da marca |
| [AuthModalTrigger.tsx](components/AuthModalTrigger/AuthModalTrigger.tsx) | Entrada nos fluxos reais de login/cadastro |
| [page.tsx](app/(public)/page.tsx) | Composição, dados e metadata da home |
| [trackHref.ts](utils/trackHref.ts) | Endereços canônicos de faixas; não monte slugs manualmente |
| [components/Track](components/Track) | Página de faixa: player com forma de onda real da prévia, ações de salvar, registro de descoberta, quem chegou antes e curva do Observatório |

## Checklist de entrega

- [ ] A tela tem uma hierarquia clara e parece parte da mesma marca?
- [ ] Foram usados tokens `club`, fontes existentes e o mesmo vocabulário de formas?
- [ ] Claro, escuro e modais mantêm contraste e consistência?
- [ ] Funciona a 320, 390, 768, 1024 e 1440 px, sem overflow da página?
- [ ] Rolagens locais têm propósito; interações não dependem só de hover?
- [ ] Teclado, foco visível, rótulos, estado selecionado e movimento reduzido funcionam?
- [ ] Textos longos, capas ausentes, erro, carregamento e vazio foram considerados?
- [ ] Dados reais e demonstrações estão diferenciados; ações apontam para funções existentes?
- [ ] A home de referência não regrediu após alterações compartilhadas?
- [ ] O conteúdo principal aparece de imediato; assets estão dimensionados e otimizados?

A landing foi verificada automaticamente com Axe nos dois temas. O Lighthouse mobile de laboratório registrou desempenho 79, acessibilidade 100, boas práticas 100 e CLS 0. Esses resultados são referência histórica, não certificação de telas futuras. O LCP simulado ainda era 3,4 s; não trate a performance como um problema completamente resolvido.

## Preservar e recuperar

O design aprovado está inteiro no Git, incluindo as imagens e capturas. A conversa e os arquivos temporários da VPS não são necessários para reconstruí-lo.

Para inspecionar a referência sem alterar o checkout atual:

```bash
git show design-club-v1:components/Landing/Club.module.css
git worktree add --detach ../mirsui-design-reference design-club-v1
```

Use a referência para comparar e recuperar arquivos de forma seletiva. Não use um reset destrutivo da `main` para recuperar o visual. Para executar a referência, instale dependências próprias no outro checkout; não compartilhe `node_modules` por symlink nem rode build/dev na `.next` usada por produção. Siga o README para configurar o ambiente sem versionar segredos.

Pedido reutilizável para uma próxima sessão:

> Aplique a identidade descrita em DESIGN.md à tela [rota]. Use a home e as capturas como referência visual, adapte a densidade à tarefa e preserve funcionalidades. Mantenha a home aprovada. Valide mobile, temas claro/escuro e interações.
