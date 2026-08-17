# Stakes — o que sobrou depois da 028

**Status:** análise. **Nada aqui está implementado** e nenhum item é resolvível
por commit isolado — todos mudam o desenho do jogo e precisam de decisão.
**Data:** 16 de agosto de 2026
**Escopo:** os problemas de **ritmo, finalidade e trava** da feature de Stakes,
depois que a migration 028 corrigiu a **justiça** da pontuação.
**Relacionado:** `Stake.md` (como a feature funciona hoje), backend migrations
018 e 028, `mirsui-backend/docs/analise-escala-apis-e-banco.md`.

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
