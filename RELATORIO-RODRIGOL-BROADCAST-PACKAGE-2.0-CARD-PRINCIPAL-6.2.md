# RodriGol Broadcast Package 2.0 — Card Principal 6.2

## Objetivo

Alteração isolada do BP-101 (Card Principal), preservando o Sumário da Partida, Destaques, barra lateral, scoreboard, tela branca, barra amarela, Cabine, Bridge e motor da partida.

## Mudanças

- faixa superior repetida ocultada definitivamente;
- escudos do jogo principal reduzidos;
- nomes dos clubes reduzidos;
- autores dos gols reduzidos e limitados a três linhas, evitando sobreposição;
- placar e relógio ajustados proporcionalmente;
- bloco Fase, Data, Público, Árbitro e Clima removido do interior do card;
- o mesmo bloco passou a ocupar o antigo espaço central do campo tático das escalações;
- campo tático deixou de ser renderizado;
- paddings e margens do card principal ajustados.

## Segurança operacional

Não houve alteração em payloads, IDs de dados, cronômetros, comandos, publicações do Bridge ou armazenamento. Os IDs dos fatos da partida foram apenas reposicionados no HTML.

## Validação

- sintaxe do JavaScript aprovada;
- build do Overlay Studio aprovado;
- alteração concentrada em HTML, CSS e renderização visual das escalações.
