# RodriGol Studio RC2B.2.4

## Jogos do Dia
Lista cronológica por competição, com horário, equipes, escudos, placar e status.

## Live Scoreboard no header
Jogos em andamento aparecem automaticamente numa faixa abaixo do header. Com poucos jogos, fica estática; quando ultrapassa o espaço, rola continuamente. Cada jogo é clicável.

## Página da partida
A API cruza coverage, round-summary, round-scoreboard e live-events. O vínculo usa ID e também mandante/visitante como fallback. O Portal mescla Home + API individual, preservando eventos e escalações.

## Validação
Bridge, Overlay, Portal, build e preflight aprovados. Teste HTTP com placar, gol, substituição e escalações aprovado.

## Pendência
Ticker editorial do Overlay continua separado e não foi alterado.
