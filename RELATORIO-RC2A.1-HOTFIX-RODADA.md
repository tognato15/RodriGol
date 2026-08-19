# RodriGol Studio RC2A.1 — Hotfix de rodada

## Substituições
- O motor agora aceita escalações em formatos antigos e atuais.
- Titulares podem vir em `starters`, `startingXI`, `startingPlayers` ou `lineup`.
- Reservas podem vir em `bench`, `reserves`, `substitutes` ou `subs`.
- Listas em texto separadas por linhas, ponto-e-vírgula ou vírgulas também são normalizadas.
- A Cabine usa os campos de escalação visíveis como fallback se o estado operacional não trouxer opções.
- Mantida a lógica de quem está em campo e reservas já utilizados.

## Sumário do card principal
- Eventos de HOME/AWAY passam a receber o nome real do clube antes de chegar ao Overlay.
- O Sumário não exibe mais HOME, AWAY ou NEUTRAL como nome.
- Eventos de ciclo como EM ANDAMENTO ficam apenas como EM ANDAMENTO, sem linha NEUTRAL.

## Scoreboard
- GOL: `⚽ · minuto · autor`.
- Cartão amarelo: `🟨 · minuto · jogador`.
- Cartão vermelho: `🟥 · minuto · jogador`.
- Nenhuma mudança na tela branca.

## Validação
- Bridge check aprovado.
- Bridge tests aprovados.
- Overlay check aprovado.
- Overlay tests aprovados.
- Overlay build aprovado.
- Preflight aprovado.
