# RodriGol Studio RC2B.2.3 — Eventos e Escalações no Portal

## Causa confirmada
O `round-summary` já continha cronologia e escalações, mas a Home reconstruía os jogos
e descartava esses campos.

## Correção
A Home passa a usar o `publicRegionMatch()` completo.

Quando existe também registro persistido:
- dados persistidos e ao vivo são mesclados;
- eventos ao vivo têm prioridade;
- escalação atual tem prioridade;
- placar, relógio e fatos disponíveis são preservados.

## Teste end-to-end
Foi publicado um jogo sintético com:
- placar 3 x 2;
- gol;
- substituição;
- escalações atuais.

A Home retornou 2 eventos e os jogadores em campo.
A rota individual retornou os mesmos 2 eventos.

## Overlay
A rolagem da manchete editorial continua pendente e separada desta correção.
