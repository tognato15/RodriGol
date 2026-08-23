# RodriGol Studio · Go-Live 1.6.2 — Latência Zero + Portal Compacto

## Objetivo
Transformar latência perceptível em bloqueador de lançamento: a ação operacional deve chegar ao Portal pelo mesmo evento em tempo real que atualiza o estado canônico, sem aguardar novo snapshot HTTP.

## Alterações
- `round-scoreboard` passa a emitir no SSE público um payload `live` já normalizado pelo servidor.
- O Portal aplica esse delta imediatamente na Home e na página da partida; o GET completo fica como reconciliação/fallback.
- A cronologia usa `createdAt` como ordem canônica quando disponível e minuto semântico como fallback, evitando transições fora de ordem.
- Home de resultados mais compacta, preservando a identidade RodriGol, com lista densa por competição, navegação rápida de sete dias e filtros Todos/Ao vivo, inspirada na lógica de consulta do Promiedos sem copiar sua identidade visual.
- Hero editorial reduzido para dar prioridade operacional aos jogos.

## Critério de aceite
- Gol/fase aparecem no Portal pelo evento SSE sem depender de `GET /api/public/home`.
- Em condições normais, a atualização visual deve ser praticamente imediata; o fallback de 30 s permanece apenas para recuperação de conexão.
- A timeline não pode colocar uma transição posterior fora da sequência real do jogo.
