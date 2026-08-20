# RodriGol Studio — Go-Live 1.5

## Objetivo
Reduzir drasticamente a carga da Cabine durante uma rodada real, atacando os gargalos observados no DevTools: polling contínuo em repouso, gravação do histórico completo a cada lance, payloads repetidos com escudos e cinco publicações Studio pesadas por evento.

## Alterações
- Sincronização da base central passa a ser orientada por WebSocket (`data-change`).
- Polling de snapshot permanece apenas como fallback a cada 60 segundos e ao retornar para a aba.
- `health` da Cabine passa de 5 para 30 segundos; atualização de jogos secundários passa de 4 para 15 segundos.
- Eventos deixam de arquivar o histórico completo a cada lance; o histórico completo continua sendo consolidado no encerramento.
- Scoreboard envia `show` completo apenas na primeira publicação/forçada e usa `update` incremental nos lances seguintes, sem retransmitir escudos e identificação estática.
- Atualização Studio imediata durante um lance fica limitada a `round-scoreboard` e `live-events`.
- `round-summary`, `studio-sidebar` e `public-match-data` são consolidados em snapshot completo adiado e deduplicado, 2,5 s após a última ação.
- Portal passa a receber invalidações públicas por SSE e atualiza Home/jogo imediatamente quando o servidor muda; polling de 5/3 s vira fallback de 30 s.

## Meta operacional
Repetir o teste real registrado na Go-Live 1.4 (andamento sem relógio + três gols + final). A referência anterior foi 59 requisições / 40,9 MB. A 1.5 deve reduzir de forma substancial requisições em repouso, tráfego por lance e tempo de bloqueio do operador.

## Observação
Classificação ao vivo permanece em validação de rodada real. Pênaltis/mata-mata permanecem em observação; o fluxo automático de classificação por pênaltis funcionou em 2 de 3 testes reportados e não foi alterado nesta entrega para evitar regressão sem reprodução do caso residual.
