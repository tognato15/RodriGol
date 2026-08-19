# RodriGol Broadcast Package 2.0 — Escalações 6.5

## Base

Esta entrega usa como base o pacote `RodriGol-Broadcast-Package-2.0-Destaques-6.4-COMPLETO.zip`.

## Escopo

Refinamento isolado do bloco de escalações do overlay oficial, sem alteração do Bridge, do motor das partidas, dos cronômetros, do armazenamento ou dos payloads.

## Alterações

- Os 11 titulares deixam de ser exibidos em uma única linha corrida.
- Cada escalação passa a ser organizada em duas colunas dentro da faixa fixa existente.
- Escudo, nome da equipe e formação foram compactados para preservar espaço vertical.
- O nome do treinador permanece na base do bloco.
- Quando não existe escalação cadastrada, a mensagem de ausência continua sendo exibida normalmente.
- O bloco central de Fase / Data / Público / Árbitro / Clima foi preservado.
- A ligação com a partida principal continua usando o mesmo payload `scoreboard`; nenhuma nova fonte de dados foi criada.

## Arquivos alterados

- `apps/overlay-studio/public/app.js`
- `apps/overlay-studio/public/styles.css`
- `apps/overlay-studio/dist/app.js`
- `apps/overlay-studio/dist/styles.css`
- `apps/overlay-studio/package.json`

## Validação

- `node --check` do Overlay Studio: aprovado.
- Build do Overlay Studio: aprovado.
- Testes históricos: 19 de 21 aprovados.
- As duas falhas permanecem as mesmas verificações legadas já existentes relacionadas a pré-jogo e relógio/lateral; não houve nova regressão nesta entrega.

## Próximo passo sugerido

Refinamento do scoreboard dos outros jogos, mantendo a regra de mostrar de forma prioritária/automática as partidas em andamento e ocupando menos altura na tela.
