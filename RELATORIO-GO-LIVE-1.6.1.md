# RodriGol Studio — Go-Live 1.6.1

## Objetivo

Complemento operacional da Go-Live 1.6 para corrigir dois pontos observados durante o teste real de rodada:

1. placar da disputa por pênaltis visível no Portal e no Overlay sem alterar o placar regulamentar;
2. placar do Portal recebendo a mesma atualização live que já chegava ao sumário, sem esperar o snapshot amplo posterior.

## Alterações

### Pênaltis

- O payload Studio passa a transportar `penaltiesHome` e `penaltiesAway`.
- A Cabine e a Multicabine preservam o placar regulamentar e enviam a disputa separadamente.
- Portal: listas, barra de jogos ao vivo, lateral, destaque e página da partida usam o formato `(3) 0 × 0 (5)` quando houver disputa.
- Overlay: card principal, scoreboard da rodada, resumo e card lateral exibem a disputa no mesmo padrão.

### Portal em tempo real

O `round-scoreboard` é a região publicada no caminho rápido de cada lance. Antes, a API pública priorizava `public-match-data`, que é uma consolidação adiada e podia estar alguns segundos atrasada. Assim, o evento já aparecia no sumário enquanto o placar ainda mostrava o valor antigo.

A API pública agora prioriza o `round-scoreboard` para os campos operacionais da partida. `public-match-data` continua fornecendo os dados ricos/consolidados, mas não bloqueia nem sobrescreve um placar live mais recente.

## Critério de aceite

- Gol: placar e sumário do Portal mudam juntos no mesmo ciclo de atualização.
- Disputa por pênaltis 3–5 em jogo 0–0: Portal e Overlay exibem `(3) 0 × 0 (5)`.
- Os pênaltis não incrementam `homeScore`/`awayScore`.
