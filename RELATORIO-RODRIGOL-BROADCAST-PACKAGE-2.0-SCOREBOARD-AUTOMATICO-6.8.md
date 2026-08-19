# RodriGol Broadcast Package 2.0 — Scoreboard Automático 6.8

## Entrega

- O bloco `round-scoreboard` deixa de depender da seleção manual de partidas para a operação normal.
- Uma partida entra automaticamente quando a cobertura passa para `FIRST_HALF` ou `LIVE_UNKNOWN`.
- Permanece durante `HALFTIME`, `SECOND_HALF`, `EXTRA_TIME` e `PENALTIES`.
- Sai automaticamente quando passa para `FINAL`.
- A regra vale para a Cabine individual e para a Multicabine.
- Até 6 partidas, o scoreboard fica estático e distribui os cards na largura disponível.
- Com 7 ou mais partidas, o scoreboard vira uma faixa rolante horizontal contínua, duplicando o trilho para loop sem salto.
- O relógio usa a mesma fonte canônica já existente: tempo visível nas fases com relógio; `INTERVALO` no intervalo; `EM ANDAMENTO` para partida iniciada sem relógio.
- Quando não há jogos ativos, o bloco mostra `NENHUM JOGO EM ANDAMENTO`.

## Compatibilidade

A seleção manual de coleções continua armazenada para recursos editoriais/legados, mas não determina mais quais partidas aparecem no scoreboard automático de jogos em andamento.

## Verificações

- OBS Bridge: `check` aprovado.
- OBS Bridge: 53/57 testes aprovados; permanecem 4 falhas legadas anteriores à entrega.
- Overlay Studio: `check` e `build` aprovados.
- Overlay Studio: 21/23 testes aprovados; os 2 testes novos do Scoreboard Automático passaram e permanecem 2 falhas legadas anteriores.
