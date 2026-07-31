# RodriGol Studio — Overlay Alpha 0.3

## Base
Desenvolvido cumulativamente sobre o pacote aprovado `RodriGol-Overlay-Studio-Bloco-2-COMPLETO`.

## Implementado
- Jogo principal redimensionado conforme o layout aprovado.
- Placar com ambos os números em laranja e período em branco.
- Nomes das equipes discretamente ampliados.
- Autores de gols em branco, acompanhados do símbolo de bola.
- Scoreboard com até seis partidas simultâneas.
- Barra branca de últimas ações, na ordem: competição, ação, resultado, tempo e autor.
- Padronização visual da barra branca, sem cores distintas por ação.
- Barra amarela de resumo diário com nome completo das competições, status, resultados e autores/minutos dos gols.
- Rodapé editorial de Destaque.
- Painel lateral reservado para a Alpha 0.4.

## Regiões preparadas no OBS Bridge
- `studio-topbar`
- `scoreboard`
- `round-scoreboard`
- `live-events`
- `round-summary`
- `editorial-highlight`

## Teste
1. Execute `npm start` no diretório principal para iniciar o OBS Bridge.
2. Em outro terminal, execute `npm run start:studio`.
3. Abra `http://127.0.0.1:4174/?demo=1`.
4. No OBS, configure uma Browser Source em 1920 × 1080.

## Observação
Nesta etapa, o painel lateral permanece como área de reserva. As centrais operacionais dedicadas serão construídas depois da aprovação visual dos blocos.
