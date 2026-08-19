# RodriGol Broadcast Package 2.0 — Integração do Jogo Principal 6.3

## Objetivo
Conectar a seleção do Jogo Principal a uma única partida de referência, evitando que Card Principal, Sumário da Partida, Escalações e bloco informativo exibam dados de jogos diferentes.

## Alterações

### Fonte única da partida principal
Ao selecionar um jogo principal na Central do Overlay, o mesmo `matchId` agora também é registrado como partida ativa e partida no ar. Isso alinha a seleção visual da Central do Overlay com a Cabine/Multicabine e permite que as atualizações posteriores da cobertura continuem chegando ao mesmo jogo exibido no OBS.

### Payload completo
O payload `scoreboard` publicado pela Central do Overlay passou a incluir, a partir da cobertura oficial da partida:

- cronologia (`chronology`);
- escalações (`lineups`);
- árbitro;
- público, quando disponível;
- clima, quando disponível.

Card Principal, Sumário, Escalações e bloco Fase/Data/Público/Árbitro/Clima continuam sendo apenas visualizações do mesmo payload e do mesmo `matchId`.

### Refinamento visual do card
Os nomes das equipes e os autores dos gols foram deslocados levemente para baixo dentro do card principal, preservando o tamanho homologado do layout.

## Segurança operacional
Não foi criada nova região do Bridge, novo armazenamento ou nova fonte de verdade. O fluxo permanece:

`Partida selecionada → cobertura oficial → região scoreboard → Card + Sumário + Escalações + Informações`

## Arquivos alterados
- `apps/obs-bridge/public/overlay-control.js`
- `apps/overlay-studio/public/styles.css`
- `apps/overlay-studio/dist/styles.css`
- `apps/overlay-studio/package.json`

## Validação
- `node --check` do Overlay Studio: aprovado.
- `node --check` do OBS Bridge: aprovado.
- build do Overlay Studio: aprovado.
- suíte histórica: 19 de 21 testes aprovados, mantendo as mesmas duas falhas legadas anteriores ligadas a contratos antigos de pré-jogo/relógio lateral.
