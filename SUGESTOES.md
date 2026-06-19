# Sugestões de melhoria

Observações de revisão de código que não são bugs urgentes, mas valem refinar no futuro.

## Busca (SearchWithResults)

Contexto: a busca já segue boas práticas — debounce de 300ms no cliente
(`components/SearchWithResults/SearchWithResults.tsx`), mínimo de 2 caracteres,
e cache de 5 minutos no servidor via `next: { revalidate: 300 }`
(`utils/spotifyService.ts`). As sugestões abaixo são refinamentos opcionais.

### 1. Sem cache no cliente

Se o usuário apaga e redigita o mesmo termo, o navegador refaz o fetch — o
cache de 5 minutos é só no servidor, então é barato, mas ainda é uma ida ao
servidor.

**Fix sugerido:** SWR ou React Query resolvem isso automaticamente (cache por
chave de busca, deduplicação de requisições). Para um dropdown de busca é
opcional; só vale se a lib já for adotada em outros pontos do app.
