# RodriGol Studio RC2A.4

## Substituição — erro confirmado em teste real
O Diagnóstico da Cabine exibiu:

`esc is not defined`

A origem estava no novo renderizador das sugestões de substituição:
- a Cabine possui o helper `escapeHtml()`;
- o bloco novo chamava `esc()`, que existe em outros módulos, mas não em `control.js`;
- ao clicar em SUBSTITUIÇÃO, o JavaScript interrompia a execução antes de preencher as opções.

## Correção
As chamadas foram substituídas por `escapeHtml(player)`.

Também foi criado um teste de regressão específico que verifica:
- ausência de `esc()` no bloco de substituição da Cabine;
- presença de `escapeHtml(player)`;
- existência das listas de quem sai e quem entra.

## Scoreboard
A velocidade reduzida da RC2A.3 foi preservada:
- aproximadamente 36 px/s;
- cerca de 30% mais lenta que a configuração anterior.

## Validação
- Bridge check: aprovado.
- Bridge tests: aprovado.
- Overlay check: aprovado.
- Overlay tests: aprovado.
- Overlay build: aprovado.
- Preflight: aprovado.
