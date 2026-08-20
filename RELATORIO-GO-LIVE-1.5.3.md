# RodriGol Studio — Go-Live 1.5.3 · Server Fast Batch

## Diagnóstico
Os testes no Edge mostraram dois gargalos distintos. Após isolar a inspeção HTTPS do antivírus, um batch de 11,55 s passou a concentrar 6,76 s em espera pela resposta e 4,19 s no download. O tráfego total já havia caído para menos de 1 MB, confirmando que a otimização incremental da 1.5.2 funcionou, mas o caminho operacional ainda carregava trabalho desnecessário.

## Mudanças
- Resposta de `/api/commands/batch` virou ACK compacto: não ecoa os payloads completos que acabaram de ser enviados.
- Broadcast WebSocket serializa cada envelope uma única vez e reutiliza o frame para todos os clientes conectados.
- Transições de fase usam `publishStudioLiveUpdate()` imediatamente e deixam `publishStudioSnapshot()` amplo para execução adiada.
- Encerramento de cobertura segue a mesma estratégia, evitando bloquear o operador com snapshot amplo.

## Objetivo operacional
Intervalo, retomada e finalização devem responder no mesmo caminho leve usado pelos eventos ao vivo. O snapshot editorial completo continua sendo publicado, mas fora do caminho crítico do clique do operador.
