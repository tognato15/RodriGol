# RodriGol Broadcast Package 2.0 — Escalações 6.5.2

## Objetivo
Ajustar a faixa de escalações do Overlay Studio para o layout aprovado em 09/08/2026, priorizando legibilidade em uma faixa horizontal baixa.

## Alterações
- Cabeçalho de cada equipe passa a exibir somente escudo e nome do clube.
- Removido visualmente o prefixo `ESCALAÇÃO`.
- Formação e treinador deixam de ocupar espaço na faixa de escalações.
- Os 11 titulares passam a ser exibidos em duas linhas horizontais:
  - linha 1 de jogadores: titulares 1 a 5;
  - linha 2 de jogadores: titulares 6 a 11.
- A ordem recebida no payload é preservada.
- Quando o texto do jogador começa com número de camisa, o número ganha destaque na cor do lado da equipe.
- Mantido o bloco central com Fase, Data, Público, Árbitro e Clima.
- Nenhuma alteração no Bridge, cronômetros, placar principal, destaques ou demais regiões do overlay.

## Arquivos alterados
- `apps/overlay-studio/public/app.js`
- `apps/overlay-studio/public/index.html`
- `apps/overlay-studio/public/styles.css`
- `apps/overlay-studio/package.json`
- `apps/overlay-studio/dist/*` regenerado pelo build.

## Validação
- `npm run check -w @rodrigol/overlay-studio`: aprovado.
- `npm run build -w @rodrigol/overlay-studio`: aprovado.
- Testes do Overlay Studio: 19/21 aprovados.
- Permanecem as mesmas 2 falhas legadas relacionadas ao comportamento de pré-jogo/relógio, sem relação com esta alteração de escalações.

## Versão
`@rodrigol/overlay-studio 2.0.0-bp.6.5.2`
