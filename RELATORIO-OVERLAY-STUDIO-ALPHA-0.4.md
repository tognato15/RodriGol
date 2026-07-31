# RodriGol Studio — Overlay Alpha 0.4

## Base utilizada
RodriGol-Overlay-Studio-Alpha-0.3-COMPLETO.zip

## Alterações visuais
- Hierarquia definitiva da tela: jogo principal, scoreboard, barra amarela, barra branca e rodapé Destaque.
- Remoção da faixa “Jogos em Destaque” para ampliar a área útil do scoreboard.
- Scoreboard redesenhado em seis blocos menores, com melhor proporção e escudos dos clubes.
- Barra amarela reduzida para uma única linha e posicionada imediatamente acima das Últimas Ações.
- Barra branca preservada para as ações recentes.
- Rodapé Destaque reduzido.
- Painel lateral transformado em carrossel automático.

## Integrações do Alpha 0.4
- O jogo principal continua recebendo a região `scoreboard`.
- A Multicabine agora publica também:
  - `round-scoreboard`
  - `live-events`
  - `round-summary`
  - `studio-sidebar`
- A barra amarela usa nomes completos de competições e equipes.
- Gols exibidos na barra amarela mantêm minuto e autor.
- Publicações editoriais destinadas à região `ticker` também alimentam o rodapé Destaque no Overlay Studio.

## Comportamento do painel lateral
Rotação automática a cada 10 segundos entre:
- Jogos da rodada
- Classificação
- Últimas notícias

A estrutura já aceita atualização pela região `studio-sidebar`.

## Testes executados
- Verificação de sintaxe do OBS Bridge: aprovada.
- Verificação de sintaxe do Overlay Studio: aprovada.
- Build do Overlay Studio: aprovado.
- 18 testes do OBS Bridge: aprovados.
- 4 testes do Overlay Studio: aprovados.

## Observação técnica
O comando geral `npm run check` continua apresentando erros TypeScript antigos nos pacotes de domínio `editorial`, `football` e `overlay`, relacionados à resolução interna de workspaces. Esses erros já estavam fora do escopo do Overlay Studio. Os módulos alterados nesta entrega foram verificados e aprovados isoladamente.

## Teste visual
1. Execute `npm start` na pasta principal.
2. Em outro terminal, execute `npm run start:studio`.
3. Abra `http://127.0.0.1:4174/?demo=1`.
4. No OBS, use 1920 × 1080.
