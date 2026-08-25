# RodriGol — Go-Live 1.7.3 — Live UX & Portuguese

## Objetivo
Fechar as regressões observadas durante a primeira validação com partidas reais após a 1.7.2.

## Alterações
- Portal deixa de expor estados técnicos como `SECOND_HALF` ao público.
- A coluna temporal dos jogos passa a priorizar minuto ao vivo, `INTERVALO`, `PÊNALTIS`, `FINAL` ou horário programado.
- Card compacto passa a ter faixa inferior dedicada aos autores dos gols, separada por uma linha fina, evitando truncamento provocado pelo placar.
- A faixa de goleadores tenta completar minutos ausentes usando os eventos canônicos da partida.
- O estado canônico enviado ao Overlay Studio volta a incluir `latestAction` e `latestScoreboardAction`.
- O sumário do Overlay Studio traduz tipos técnicos de eventos para português.

## Próximos blocos da Go-Live Week
- Competition Hub: edição/publicação de classificações e hotsite por competição.
- News MVP: foto, lead sugerido/editável e página editorial modular ligada à partida.
- Launch Candidate: regressões, desempenho e ensaio geral.
