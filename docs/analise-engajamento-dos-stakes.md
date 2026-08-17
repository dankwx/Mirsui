# Stakes — o que sobrou depois da 028

**Status:** análise. **Nada aqui está implementado** e nenhum item é resolvível
por commit isolado — todos mudam o desenho do jogo e precisam de decisão.
**Data:** 16 de agosto de 2026
**Escopo:** os problemas de **ritmo, finalidade e trava** da feature de Stakes,
depois que a migration 028 corrigiu a **justiça** da pontuação.
**Relacionado:** `Stake.md` (como a feature funciona hoje), backend migrations
018 e 028, `mirsui-backend/docs/analise-escala-apis-e-banco.md`.
**Leia também:** as §§10–14, uma segunda leitura que reenquadra o problema
(cadência, não resolução da métrica) e propõe as saídas.

---

## 1. De onde isto vem

Em 16/08/2026 a pontuação de Stakes foi auditada e corrigida. O que estava
errado era a **régua**: o ganho era medido contra a última medição, então o
acumulado não era "o quanto a faixa subiu", era a soma de todas as subidas —
volatilidade. A migration 028 trocou por marca d'água (só bater o próprio
recorde paga). Junto foram: o confisco do acumulado quando o Deezer para de
resolver a faixa, o botão verde "Recolher · 0 pts" que apagava a posição, e a
copy que dizia "removida do Spotify" sobre uma métrica do Deezer.

Isso resolveu **o que o jogo paga**. Não resolveu **com que frequência ele dá
sinal de vida, o que os pontos servem, nem o que o usuário faz na semana 1.** É
disso que este documento trata.

| # | o quê | natureza |
| --- | --- | --- |
| 3 | métrica parada 81% dos dias | expectativa vs. realidade |
| 4 | o primeiro dia é vazio | ritmo |
| 5 | 3 vagas + 7 dias travam a semana 1 | ritmo |
| 6 | os pontos não compram nada | finalidade |
| 7 | nunca compensa recolher | economia |
| 8 | corrida nas 3 vagas | bug conhecido, pré-existente |

---

## 2. A medição que sustenta o resto

42 dias de snapshots reais (23/06 → 16/08/2026), 3 fichas, 126 linhas em
`stake_snapshots`. Das 123 medições consecutivas:

| | |
| --- | --- |
| não mudou nada | **81%** (100) |
| subiu | 6,5% (8) |
| caiu | 12% (15) |
| movimento absoluto médio | 0,87 ponto de popScore/dia |

Bate com o número que a migration 021 já tinha registrado por outro caminho:
**91,9%** das medições do acervo repetem o rank do dia anterior. São duas
amostras independentes dizendo a mesma coisa.

### Um falso positivo, registrado de propósito

No meio da apuração, medir movimento por faixa de popularidade em
`track_popularity_history` deu **7,9 pontos de popScore por dia** para as faixas
mais obscuras — o oposto do resultado acima, e um argumento aparentemente forte
a favor de guardar `popScore` com decimal para "acender" o card.

É viés de seleção. Desde a 021 aquela tabela **só grava quando o valor muda**.
Medir "com que frequência muda" ali é circular: 100% das linhas mudaram, por
construção. Quem serve para essa pergunta é `stake_snapshots`, que grava todo
dia independente do resultado.

Fica anotado porque a consulta é fácil de refazer e o número é convincente.

---

## 3. A métrica fica parada 81% dos dias

**O sintoma.** O card mostra "+0" em ~93% das visitas. A ficha "Ginseng Strip
2002" subiu **1 vez em 41 medições**.

**Por que não foi "consertado".** A saída óbvia — guardar `popScore` com uma
casa decimal, ou o `rank` cru — faz o card se mexer todo dia. Só que o que
apareceria é jitter sub-10k, exatamente o ruído que a marca d'água acabou de ser
criada para não pagar. Seria desfazer a 028 pela porta dos fundos: o gráfico
voltaria a contar uma história de movimento que a pontuação (corretamente)
ignora, e os dois passariam a se contradizer na tela.

**A decisão real.** Isto é um jogo de **semanas**, rodando com uma UI que promete
ritmo **diário**: "medimos 1× por dia", o selo "+30", "volte amanhã pra ver a
faixa começar a desenhar a curva". A correção honesta é a UI assumir a escala
certa — falar em semana, mostrar a série semanal, e tratar o dia parado como
estado normal e não como ausência de notícia. Enquanto isso não acontece, o card
mente por omissão.

---

## 4. O primeiro dia é vazio

Quem bota ficha às 14h passa ~19h olhando "Acumulando pontos…" e um botão
desabilitado. O pico de empolgação é o segundo do stake, e é exatamente aí que
não há nada para ver.

Medir na hora do stake **não resolve**: o baseline *é* essa medição — o ganho
contra ela é zero por definição. Precisaria de uma segunda medição algumas horas
depois do stake (não do relógio das 09:00), só para o primeiro dia. Custa uma
chamada extra ao Deezer por ficha nova, o que é barato; o que não é óbvio é se
uma medição de 6h de distância produz sinal ou só ruído — ver §2.

---

## 5. Três vagas + sete dias travam a semana 1

O usuário novo enche as três vagas em cinco minutos e depois **não pode fazer
mais nada** por sete dias. Não é falta de vontade de engajar: é o sistema que
não oferece próxima ação.

A pergunta "ele vai querer tentar com mais músicas?" tem resposta estrutural, e
é não — ele não pode. Qualquer trabalho de retenção em cima dos Stakes esbarra
nisto antes de esbarrar em copy, notificação ou recompensa.

---

## 6. Os pontos não compram nada

`SUM(stake_collections.points)` vira uma linha em mono 11px no hero: "1.240
PONTOS RECOLHIDOS". Não há ranking, não há histórico de coletas, e o sistema não
toca em `profiles.rating`.

O isolamento é **proposital** e está certo do ponto de vista de segurança (ver
migration 018: o valor vem do Deezer, medido pelo servidor, e o ledger é fechado
para escrita do cliente). Mas o preço cobrado por essa escolha é que o loop não
tem prêmio terminal — não existe motivo para a semana 2.

Isolamento de **escrita** e ausência de **destino** são coisas separadas. Dá para
manter o ledger fechado e ainda assim o número significar alguma coisa.

---

## 7. Nunca compensa recolher

Com catraca (o acumulado só sobe) e sem decaimento, **segurar domina
estritamente**. O único motivo para recolher é liberar vaga para algo melhor.

Ou seja: o momento de recompensa do jogo — o "recolhi 340 pontos!" — é
justamente o que o sistema desincentiva. Quem joga bem nunca vê o payoff.

Duas saídas, e são excludentes:

- **Aceitar.** O jogo passa a ser sobre *achar antes dos outros*, não sobre
  colher. Aí o ranking e o contador social ("X pessoas botaram ficha") deixam de
  ser enfeite e viram o produto, e a coleta é só contabilidade.
- **Cobrar por segurar.** A vaga já é um custo, mas é fraco com 3 vagas e nada
  mais para fazer (§5). Precisaria de algo com dente — e aí a promessa "você
  nunca perde ponto", que a 028 acabou de tornar literalmente verdadeira, entra
  em conflito. Mexer aqui é mexer no contrato com o usuário.

---

## 8. Corrida nas três vagas

Pré-existente e já anotado na migration 018. O limite de 3 é contado no Node
sem lock: entre o `count` e o `insert` cabe outro `insert`, então POSTs
simultâneos abrem uma vaga a mais.

O caso gêmeo que dava ponto em dobro — dois stakes ativos na mesma faixa — já
está fechado pelo índice único parcial `stakes_um_ativo_por_faixa`. Este sobrou
porque exigiria trigger, e é o menos grave da lista: rende uma vaga extra, não
pontuação indevida.

---

## 9. Ordem sugerida

1. **§3 e §5 juntos**, porque são o mesmo problema visto de dois lados: o jogo é
   semanal e a semana 1 não tem o que fazer. Qualquer coisa feita em §4, §6 ou
   §7 antes disso é otimização em cima de um loop que não fecha.
2. **§6**, que é o mais barato de todos e o único com efeito direto em semana 2.
3. **§7**, que é decisão de produto e provavelmente decorre de §6 — se os pontos
   passam a valer alguma coisa, "quando recolher" vira uma pergunta de verdade.
4. **§4** e **§8**, acabamento.

---

# Segunda leitura — engajamento, ritmo e dopamina

*16 de agosto de 2026. Escrito depois de reler este doc junto com `Stake.md`,
`components/StakesContent/StakesContent.tsx` e o job do Observatório
(`mirsui-backend/src/jobs/catalogSnapshot.ts`). O que vem abaixo não substitui a
ordem sugerida da §9 — reenquadra o problema e propõe as saídas.*

O doc acima é honesto e a medição sustenta tudo que ele afirma. Onde eu discordo
é no **enquadramento**: ele diagnostica dois problemas de sintoma quando o
problema é um só, estrutural.

---

## 10. O diagnóstico que eu daria

**As fichas são uma carteira sem pregão.** Você tem escassez (3 vagas) e não tem
cadência (a ficha fica lá pra sempre). Escassez sem cadência não é tensão, é
paralisia — é exatamente o §5 e o §7 sendo o mesmo bug visto de dois ângulos.
Todo jogo bom com vaga limitada tem um relógio que zera as vagas: fantasy tem a
rodada, pôquer tem a mão, bolsa tem o fechamento. O Mirsui tem um lock de 7 dias
que, na prática, o jogador ótimo nunca usa.

**E o app mostra ao usuário o mais lento dos três sinais que ele já tem.** Você
mede três coisas:

| sinal | velocidade | o usuário vê |
| --- | --- | --- |
| o rank da **minha** faixa | 0,87 pt/dia, 81% parado | é o único que o card mostra |
| o **catálogo** (Observatório, milhares de faixas/noite) | sempre tem alguém subindo | só a `/pilha`, estática |
| as **pessoas** (quem fichou, quem salvou, quem recolheu) | move o dia inteiro | 11px dentro de um accordion |

O §3 trata "métrica parada" como problema de UI. Não é. É que o app escolheu o
sinal errado pra ser o batimento cardíaco. O rank da sua faixa é uma notícia
semanal; o catálogo e as pessoas são notícias diárias e **igualmente
verdadeiras**. Não precisa mentir pra ter movimento na tela — precisa parar de
olhar só pro relógio mais lento.

### A lei que sai da medição do §2

Vale escrever no doc, porque descarta metade das ideias antes de gastá-las:

> Com 81% parado, **nenhuma mecânica baseada em "a MINHA faixa se mexeu" pode ser
> diária.** Feedback diário só pode vir de (a) comparação relativa entre muitas
> faixas, (b) ação de outras pessoas, (c) agregado do catálogo. Os três sempre
> resolvem.

Corolário útil: o jitter sub-10k é ruim **como pagador** e ótimo **como critério
de ordem**. Usar `rank` cru pra desempatar "qual das duas subiu mais" não
contradiz a 028 — a 028 diz que ruído não vira ponto, não que ruído não vira
ordinal.

---

## 11. As propostas

### A. Fechamento automático (a keystone)

A ficha não é segurada indefinidamente: ela **fecha sozinha no 7º dia**. Os
pontos caem na conta, a vaga volta, e você é **avisado**. Se quiser continuar
naquela faixa, você **re-ficha** — baseline novo (mais alto) e multiplicador novo
(mais baixo, porque ela subiu).

O que isso resolve, tudo de uma vez:

- **§7 morre inteiro.** Não existe mais "segurar domina", porque segurar não é
  uma opção. E o botão "Recolher", que o doc prova ser uma armadilha, deixa de
  existir como decisão — vira uma **notificação**: *"sua ficha em Leviathan
  fechou: +340. Vaga livre."* O momento de recompensa passa a ser **entregue** ao
  usuário em vez de esperar ele clicar.
- **§5 vira o loop.** Toda semana você tem 3 decisões pra tomar: renovo no que
  deu certo ou giro pra um achado novo? Essa é a pergunta que o produto quer que
  a pessoa faça, e hoje ela nunca é feita.
- **O contrato "você nunca perde ponto" continua literalmente verdadeiro.** O doc
  trata §7 como escolha entre aceitar ou cobrar por segurar, e diz que cobrar
  quebra a promessa da 028. Não quebra, se você **limitar a duração em vez de
  decair o saldo**. Vida útil finita ≠ decaimento. É a saída que o doc não
  considerou.
- E "fechar antes do prazo" passa a ser uma decisão real: você abre mão do que
  ainda ia render pra liberar a vaga pra um achado mais quente **agora**.

### B. As fichas dos outros no feed (o mais barato de todos)

Hoje o payoff é invisível — inclusive pra quem ganhou. Ninguém no Mirsui jamais
viu outra pessoa ganhar. Os dados já existem (`stake_collections`,
`count_stakes_by_track_uri`):

- *"Fulano botou ficha em `meat computer — stray` · x2,73"*
- *"Fulano fechou 340 pontos em Leviathan"* ← isto é o comercial do jogo
- e na sua ficha: *"+2 pessoas ficharam essa faixa desde ontem"*

Junto com isso, tire o contador social de dentro do accordion e bote na cara do
card, com a leitura que interessa: **ficha solitária vs. consenso**. *"Ninguém
mais fichou essa — se ela subir, o crédito é seu"* é a frase mais viciante que
esse produto pode dizer, e ela é verdadeira todo dia, mesmo com o rank parado.

### C. O Boletim das 9

O app tem um ritual e não conta pra ninguém: **todo dia às 09:00 o Mirsui mede o
catálogo inteiro.** Isso é um fato genuinamente legal do produto e hoje é
invisível. Transforme em compromisso diário — uma tela (e um e-mail/push) que
responde "o que se moveu ontem", puxando do Observatório, não das suas 3 fichas:

- 14 faixas do seu gênero bateram recorde
- 3 faixas do seu acervo subiram
- a subida da noite: X, +9
- e sim: *"suas fichas: paradas"* — mas agora isso é **uma linha num boletim**,
  não a tela inteira.

Dia parado deixa de ser ausência de notícia porque a notícia não era sua faixa.

### D. Faro como destino (§6)

Duas saídas pros pontos, e as duas mantêm o ledger fechado (isolamento de escrita
≠ ausência de destino, como o próprio doc diz):

1. **Ponto compra vaga.** 3 → 4 → 5 fichas. O melhor sorvedouro possível: o
   prêmio do loop é mais loop. E preserva a restrição pro novato sem congelar o
   veterano.
2. **Faro vira nível público** — no perfil, do lado do nome no feed. É projeção
   de leitura do `SUM(stake_collections.points)`, não escrita nova. O vocabulário
   já diz que Faro é a pontuação e ele não tem página nenhuma; essa é a página.

Hoje a hierarquia visual diz o contrário disso: "Fichas" tem 116px e "1.240
PONTOS RECOLHIDOS" tem 11px em mono. Se o ponto vira destino, isso inverte.

### E. Palpite do dia (o jogo diário de verdade)

Se você quer a dopamina diária mesmo, ela tem que ser **relativa** (ver a lei da
§10). Uma pergunta por dia, resolvida em 24h com dado que já está no banco:

> *5 faixas. Qual sobe mais até amanhã?*

Sempre resolve (o rank cru desempata), custa zero API nova, dá motivo pra voltar
amanhã, e é notificável. Grátis, ilimitado, alimenta o Faro em migalhas — a
escassez continua sendo da ficha.

E o doce instantâneo, se quiser: **duelo cego** — duas capas, "qual tem mais
audiência?", resposta na hora. Não é trivia à toa: é literalmente o treino do
faro que faz a pessoa fichar melhor. Dá pra jogar 10 vezes seguidas. É a alavanca
do caça-níquel, e é honesta porque o número é real.

### F. A vindicação (a alma do negócio)

"Discover before the world does" não tem dopamina diária — tem dopamina de
**prova**, seis meses depois. Construa a máquina que entrega isso: quando uma
faixa que você fichou ou salvou cruza um limiar, o app te procura.

> *Em 12/03 você botou ficha em X quando ela tinha 40 mil ouvintes. Hoje tem 900
> mil. Você estava certo.*

Isso é a coisa mais compartilhável que esse produto pode produzir, o
`/api/og/selo` já existe pra virar imagem, e o `track_popularity_history` permite
**backfillar** — dá pra disparar retroativo no dia que ligar. É o pagamento que
justifica a métrica lenta.

### G. O §4 sem medição extra

Não precisa de segunda chamada ao Deezer. No segundo em que a pessoa bota a
ficha, mostre o que você **já sabe**: a curva daquela faixa no Observatório
("subiu 12 nos últimos 30 dias" / "parada desde maio"), quem mais fichou, e um
**relógio** — "próxima medição em 14h32". Relógio visível transforma espera vazia
em espera antecipada; é o primitivo mais barato de engajamento que existe.

---

## 12. O que eu não faria

Isso aqui é o que "deixa viciante" costuma significar, e nesse produto
especificamente envenena: **XP, confete, streak de login, níveis com nome
inventado, medalha por abrir o app.** A credibilidade inteira do Mirsui está em o
número ser real — é o padrão que você já caçou e deletou em três páginas.
Conquista aqui só pode ser **registro de fato**, não crachá de atividade: *"1ª
pessoa a fichar uma faixa que passou de 500k"* é um fato sobre o mundo; *"7 dias
seguidos"* é um fato sobre você ter sido manipulado. E tem que ser raro — selo
que todo mundo tem é decoração.

Streak honesto existe, mas é **da faixa, não sua**: *"Ginseng Strip: 41 dias sem
sair do recorde"*. Aí o dia parado virou conteúdo.

---

## 13. Duas cafonices vistas de passagem

- **O multiplicador está escondido.** `START_EXPANDED = false` — o `x2,73`, que é
  a identidade da ficha e o número mais empolgante do card, está atrás de "ver
  infos da ficha". Ele devia estar na capa. Junto: o momento em que ele trava
  (`POST /stakes`) é o único momento genuinamente de caça-níquel que o jogo tem
  hoje, e ele passa num toast.
- **O `+30` só aparece em ~7% das visitas**, então 93% do tempo o card não tem
  nenhum elemento vivo. Trocar aquele espaço por algo que sempre tem o que dizer
  (o social, ou os 7 pontinhos da semana) resolve mais que qualquer aumento de
  resolução da métrica.

---

## 14. Se fosse eu

**A + B primeiro, juntos.** O fechamento automático conserta a estrutura (§5 e §7
de uma vez, e §7 sem quebrar o contrato da 028), e as fichas no feed fazem o
payoff existir socialmente — é o mais barato da lista e o único que já tem todos
os dados prontos. Sem esses dois, C/D/E são otimização em cima de um loop que não
fecha, exatamente como o doc argumenta na §9.

Depois **D** (Faro com destino) e **C** (boletim), que é onde o Observatório
finalmente vira produto pro usuário logado. **E** e **F** quando houver canal de
notificação — e vale dizer com todas as letras: **um jogo semanal não retém sem
um jeito de alcançar a pessoa fora do site.** Isso é infra, não design, e é o
multiplicador de tudo acima.
