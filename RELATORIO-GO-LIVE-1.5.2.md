# RodriGol Studio — Go-Live 1.5.2 · Fast Lifecycle

## Objetivo
Reduzir a latência das transições de fase (em andamento, intervalo, retomada e final) observada em produção na Go-Live 1.5.1.

## Diagnóstico de produção
O teste no Edge caiu para 35 requests / 3,0 MB, mas as transições ainda apresentaram lotes de 7–16 s. A captura mostrou que cada mudança de fase ainda reenviava a coleção completa `rodrigol-matches-v1` (~172 KB). No encerramento, o histórico completo (~1 MB) também era reenviado.

## Mudanças
- `upsertMatch` mantém a atualização local síncrona, mas sincroniza remotamente somente o registro da partida alterada por `PATCH /api/data-patch/match/:id`.
- O servidor aplica o patch na coleção central, incrementa a revisão e persiste normalmente no volume.
- Outros navegadores recebem um envelope WebSocket `data-patch` e atualizam somente o item afetado em seu cache local.
- O arquivamento final usa `PATCH /api/data-patch/history/:matchId`, evitando upload do histórico inteiro durante o fim de jogo.
- `saveMatches` e `saveHistoryState` completos continuam disponíveis para operações administrativas/migrações; o caminho incremental é usado nas operações de partida.
- Em falha do endpoint incremental, existe fallback para a sincronização completa já existente.

## Resultado esperado
Mudanças de fase deixam de disputar conexão com uploads repetidos de ~172 KB e o encerramento deixa de enviar ~1 MB de histórico. A resposta visual continua imediata e a consolidação central permanece persistente e compartilhada.
