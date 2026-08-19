# RodriGol Studio — Beta 1.8.0

## Base

Versão produzida a partir do RodriGol Studio Beta 1.7.8.

## Escopo desta entrega

### 1. Placar central dos confrontos eliminatórios

Nos painéis de mata-mata da barra lateral, confrontos de ida e volta passam a usar o placar agregado no centro do card.

- Partida única: placar oficial do jogo.
- Ida e volta: agregado parcial ou final.
- Pênaltis, ida, volta e classificado continuam exibidos nas linhas complementares.

Com isso, o centro do confronto deixa de permanecer em `0 x 0` quando o agregado já foi calculado.

### 2. Organização das partidas na Central do Overlay

A lista **Partidas da cobertura** passou a ser ordenada operacionalmente:

1. partidas de hoje em andamento;
2. partidas de hoje ainda não iniciadas;
3. partidas finalizadas hoje;
4. partidas dos próximos dias em ordem cronológica;
5. partidas antigas e finalizadas.

Dentro do mesmo grupo, data e horário definem a ordem.

### 3. Filtros rápidos

A Central do Overlay recebeu os filtros:

- Todos;
- Hoje;
- Ao vivo;
- Próximos;
- Finalizados.

A seleção dos seis jogos e a estrela de jogo principal foram preservadas.

### 4. Identificação de estado

Cada partida da lista agora mostra uma pequena identificação de estado, facilitando diferenciar jogos programados, ao vivo e finalizados antes de incluí-los no scoreboard.

## Arquivos alterados

- `apps/obs-bridge/public/overlay-control.js`
- `apps/obs-bridge/public/overlay-control.html`
- `apps/obs-bridge/public/overlay-control.css`
- `apps/obs-bridge/server.mjs`
- `package.json`
- `apps/*/package.json`
- `packages/*/package.json`

## Validação executada

- Sintaxe de `overlay-control.js`: aprovada.
- Sintaxe de `app.js` do Overlay Studio: aprovada.
- Sintaxe de `server.mjs`: aprovada.
- Inicialização real do OBS Bridge em porta de validação: aprovada.
- Endpoint `/health`: versão `1.8.0` confirmada.
- Central do Overlay: resposta HTTP 200.
- Integridade dos arquivos ZIP: verificada.

## Observação operacional

O relógio da barra lateral não foi alterado nesta entrega. Ele permanece para homologação durante uma rodada real, conforme combinado.
