# Sugestões de melhoria

Observações de revisão de código que não são bugs urgentes, mas valem refinar no futuro.

## Busca (SearchWithResults)

Contexto: a busca já segue boas práticas — debounce de 300ms no cliente
(`components/SearchWithResults/SearchWithResults.tsx`), mínimo de 2 caracteres,
e cache de 5 minutos no servidor via `next: { revalidate: 300 }`
(`utils/spotifyService.ts`). Todas as sugestões registradas aqui já foram implementadas.
