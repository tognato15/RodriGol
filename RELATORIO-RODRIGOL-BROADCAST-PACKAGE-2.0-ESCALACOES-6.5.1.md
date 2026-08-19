# RodriGol Broadcast Package 2.0 — Escalações 6.5.1

## Base

Esta correção usa como base o pacote `RodriGol-Broadcast-Package-2.0-Escalacoes-6.5-COMPLETO(1).zip`.

## Escopo

Correção isolada da visualização dos 11 titulares no bloco de escalações do overlay oficial.

## Correção

- Mantida a faixa de escalações já aprovada na entrega 6.5.
- Mantidas as duas colunas por equipe.
- Corrigido o fluxo da grade: os jogadores agora são exibidos de cima para baixo na primeira coluna e depois continuam na segunda coluna.
- A ordem cadastrada passa a aparecer como 1–6 na coluna esquerda e 7–11 na coluna direita.
- Removida a alternância visual anterior (1|2, 3|4, 5|6...).
- Mantidos escudo, equipe, formação, treinador e bloco central de informações da partida.
- Nenhum payload, Bridge, cronômetro, armazenamento ou motor de partidas foi alterado.

## Arquivos alterados

- `apps/overlay-studio/public/styles.css`
- `apps/overlay-studio/dist/styles.css`
- `apps/overlay-studio/package.json`

## Validação

- `node --check` do Overlay Studio: aprovado.
- Build do Overlay Studio: aprovado.
- Testes históricos: 19 de 21 aprovados.
- Permanecem as mesmas duas falhas legadas já registradas relacionadas a pré-jogo e relógio/lateral; não houve nova regressão nesta correção.
