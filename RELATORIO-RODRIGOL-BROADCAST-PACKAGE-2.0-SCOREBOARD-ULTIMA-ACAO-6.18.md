# RodriGol Broadcast Package 2.0 — Scoreboard + Tela Branca 6.18

## Tela branca
- Removido qualquer destaque de cor do clube no RESULTADO.
- Removido qualquer destaque de cor específico de GOL.
- COMP., RESULTADO, AÇÃO, TEMPO e AUTOR passam a usar o mesmo padrão cromático.
- Mantidas as posições e regras de conteúdo já aprovadas.

## Scoreboard
- Cada card passa a exibir a última ação centralizada abaixo do placar.
- Em gol: GOL · minuto · autor.
- Cartões, intervalo, final e em andamento também possuem rótulo compacto quando forem a ação mais recente.
- A linha não aumenta a altura do card e usa corte por reticências caso o texto seja longo.
- Jogos programados não exibem última ação.

## Validação
- Overlay Studio check: aprovado.
- Overlay Studio build: aprovado.
- OBS Bridge check: aprovado.
- Confirmado no JS compilado que a tela branca não cria mais span de destaque para o clube.
