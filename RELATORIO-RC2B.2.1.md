# RodriGol Studio RC2B.2.1 — Hotfix da Página de Partida

## Problema reproduzido
A Home podia listar partidas vindas diretamente da região `round-summary`.
Ao clicar, `/api/public/matches/:id` procurava somente no banco persistido.
Resultado: "Partida não encontrada ou indisponível".

## Correção
A rota individual agora procura:
1. banco persistido;
2. `round-summary`;
3. `round-scoreboard`.

Se a partida veio do fluxo ao vivo, o servidor reconstrói o detalhe com:
- equipes;
- escudos;
- placar/status;
- relógio;
- cronologia;
- escalação atual disponível;
- fatos disponíveis na coverage.

## Teste real
Foi publicado um jogo sintético apenas em `round-summary`, sem registro no banco.
- Home encontrou a partida.
- Página individual retornou HTTP 200.
- Placar e equipes foram recuperados corretamente.

## Overlay
A rolagem da manchete editorial continua marcada como pendência separada.
