# RodriGol Broadcast Package 2.0 — Scoreboard Compacto 6.8.1

## Objetivo
Aplicar ao scoreboard automático o layout aprovado após a validação visual da versão 6.8 e eliminar a duplicação aparente do relógio/status.

## Alterações
- relógio/status passa a existir em um único ponto, acima do placar;
- 1º tempo: `1ºT MM:SS`;
- 2º tempo: `2ºT MM:SS`;
- prorrogação: `PRORR. MM:SS`;
- intervalo: `INTERVALO`;
- jogo em andamento sem relógio: `EM ANDAMENTO`;
- linha inferior do card (competição/autores/status) removida;
- placar ampliado e equilibrado visualmente com os escudos;
- cards e faixa do scoreboard ficaram um pouco mais baixos;
- rolagem automática da 6.8 foi preservada: até 6 jogos estáticos, acima disso marquee contínuo;
- entrada ao iniciar e remoção ao encerrar a partida permanecem inalteradas.

## Correção do relógio duplicado
O card antigo possuía o relógio em uma área própria e ainda carregava informação operacional no rodapé. O novo card possui apenas um elemento dinâmico de timing (`data-match-timing`). O timer local atualiza esse elemento, incluindo a indicação do período, sem criar uma segunda representação do relógio.

## Validação
- `npm run check -w @rodrigol/overlay-studio`: aprovado.
- novos testes 6.8.1: aprovados.
- suíte Overlay Studio: 25 testes, 23 aprovados, 2 falhas históricas já presentes na 6.8 (Beta 1.5.6.1 e Beta 1.6.1.3).
- `npm run build -w @rodrigol/overlay-studio`: aprovado.
- `node --check apps/overlay-studio/dist/app.js`: aprovado.
