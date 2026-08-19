# RodriGol Broadcast Package 2.0 — Hotfix 6.17.1

## Correção
- Removida na origem a classe visual especial usada somente em eventos GOL na coluna AÇÃO.
- Todas as ações da tela branca passam a usar exatamente a mesma cor, fonte, tamanho, peso e fundo.
- A correção não altera a lógica dos eventos nem os demais componentes do overlay.
- O destaque do clube autor do gol na coluna RESULTADO permanece conforme aprovado anteriormente.

## Validação
- Overlay Studio check: aprovado.
- Overlay Studio build: aprovado.
- OBS Bridge check: aprovado.
- Confirmado no JS compilado que a classe especial de GOL não é mais gerada.
