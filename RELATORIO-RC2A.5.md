# RodriGol Studio RC2A.5

## Tela branca
- SUBSTITUIÇÃO deixa de ser publicada em Últimas Ações.
- Mantida no Sumário da Partida.
- Cartões continuam fora da tela branca como já aprovado.

## Card principal
- A escalação passa a exibir `onField` quando existe.
- Após a substituição, quem saiu desaparece da lista e quem entrou ocupa seu lugar.
- A escalação inicial continua preservada internamente em `starters`.

## Card lateral de escalação
- Passa a usar a escalação atual em campo.
- O jogador que entrou recebe entre parênteses o jogador substituído.
- Exemplo visual:
  - `4 - Bjortfurt`
  - `5 - Aleesami (6 - Gundersen)`
  - `15 - Bjorkan`

## Compatibilidade
- Sem substituições, o sistema continua usando os 11 titulares originais.
- Cabine e Multicabine publicam o mesmo comportamento.

## Validação
- Bridge check aprovado.
- Bridge tests aprovados.
- Overlay check aprovado.
- Overlay tests aprovados.
- Overlay build aprovado.
- Preflight aprovado.
