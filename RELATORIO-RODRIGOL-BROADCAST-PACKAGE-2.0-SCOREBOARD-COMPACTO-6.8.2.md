# RodriGol Broadcast Package 2.0 — Scoreboard Compacto 6.8.2

## Objetivo
Refinar o layout aprovado do scoreboard 6.8.1, afastando visualmente o relógio/status do placar e aproximando-o do topo do card.

## Alterações
- relógio/status continua único e centralizado;
- relógio/status passa a ficar ancorado no topo interno do card;
- placar permanece centralizado verticalmente e com o mesmo tamanho aprovado;
- escudos, altura da faixa, entrada/saída automática e rolagem para excesso de jogos não foram alterados;
- estados continuam iguais: `1ºT MM:SS`, `2ºT MM:SS`, `PRORR. MM:SS`, `INTERVALO` e `EM ANDAMENTO`.

## Escopo
A alteração é exclusivamente visual no CSS do Overlay Studio. Não houve mudança na lógica dos relógios, estados de partida, cabines ou Bridge.

## Validação
- `npm run check -w @rodrigol/overlay-studio`: aprovado.
- teste específico 6.8.2: aprovado.
- suíte Overlay Studio: 26 testes, 24 aprovados e 2 falhas históricas já presentes na versão anterior.
- `npm run build -w @rodrigol/overlay-studio`: aprovado.
- `node --check apps/overlay-studio/dist/app.js`: aprovado.
