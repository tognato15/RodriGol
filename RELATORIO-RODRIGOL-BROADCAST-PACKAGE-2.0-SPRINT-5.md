# RodriGol Broadcast Package 2.0 — Sprint 5

## Objetivo

Remover a faixa superior do jogo principal e utilizar o espaço recuperado para ampliar o Sumário da Partida, o card principal e os Destaques, preservando a grade fixa e a fonte única de dados do overlay.

## Alterações

- A antiga faixa separada de `JOGO PRINCIPAL / competição / estado` deixou de ocupar uma linha exclusiva.
- As mesmas informações continuam disponíveis em uma faixa interna compacta, integrada ao topo do módulo principal.
- A região principal passou a ocupar uma parcela maior da coluna esquerda.
- O Sumário da Partida ganhou mais altura e linhas mais legíveis.
- Escudos, placar, relógio e nomes do jogo principal foram ampliados.
- Os cards de Destaques passaram a aproveitar melhor a altura disponível.
- A área de escalações permanece fixa abaixo do jogo principal.
- O scoreboard de outros jogos foi reduzido para liberar espaço vertical.

## Segurança operacional

Nenhum payload, região do Bridge, cronômetro, comando ou fonte de verdade foi alterado. Os IDs dinâmicos de competição e estado foram preservados dentro do próprio módulo principal.

## Arquivos alterados

- `apps/overlay-studio/public/index.html`
- `apps/overlay-studio/public/styles.css`
- `apps/overlay-studio/dist/index.html`
- `apps/overlay-studio/dist/styles.css`
- `apps/overlay-studio/package.json`
- `apps/obs-bridge/server.mjs`

## Validação

- Build do Overlay Studio: aprovado.
- Sintaxe JavaScript: aprovada.
- Testes históricos: 19 de 21 aprovados.
- As duas falhas restantes são os contratos antigos de pré-jogo e relógio/lateral já registrados em entregas anteriores; essas áreas não foram modificadas.
