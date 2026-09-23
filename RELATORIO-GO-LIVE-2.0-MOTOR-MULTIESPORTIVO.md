# RodriGol Go-Live 2.0 — Motor Multiesportivo

## Escopo
- Clubes podem ser vinculados a várias modalidades (`sports[]`), preservando `sport` legado.
- Futebol americano adicionado aos cadastros e ao Portal.
- Cabine adapta eventos básicos de pontuação por modalidade.
- Basquete: +1, +2, +3; vôlei: ponto; rugby: try/conversão/penal/drop goal; futebol americano: touchdown/extra point/conversão de 2/field goal/safety; baseball: corrida; esportes de gol mantêm gol.
- Data padrão de nova partida usa o calendário local do operador, evitando avanço de dia causado por UTC.
- Nomenclatura complementar da Cabine usa Arbitragem.

## Diagnóstico do Pinheiros x Paulistano
A partida foi criada como 17/09 enquanto o Portal ainda estava no dia local 16/09. A causa era o uso de `new Date().toISOString()` no Editor de Partidas, que após 21h no fuso -03 já retorna o dia seguinte em UTC. O Portal estava correto ao exibir somente o dia local atual. O editor agora usa data local.

## Validação
15 testes específicos do Go-Live 2.0 aprovados, 0 falhas.
