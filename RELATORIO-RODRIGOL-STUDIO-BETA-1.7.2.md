# RodriGol Studio — Beta 1.7.2

## Objetivo

Consolidar o fluxo único da partida após os testes reais do Beta 1.7.1 e remover definitivamente os componentes flutuantes de breaking news que não fazem parte do produto aprovado.

## Alterações

### Remoção do breaking/alerta flutuante

- Removido o componente visual `studio-break-alert` do Overlay Studio.
- Removidas as publicações automáticas da Cabine e da Multicabine para esse componente.
- Removida a opção “Exibir alerta lateral” da Cabine.
- Mesa Editorial passa a publicar somente no rodapé `editorial-highlight`.
- Comandos legados `ticker` e `side-alert` são direcionados ao rodapé editorial como compatibilidade, sem gerar faixas flutuantes.
- Permanecem: Últimas Ações, Agora na Rodada, DESTAQUE, lower-third, headline e fullscreen.

### Sincronização integral após mudanças na partida

Criado `apps/obs-bridge/public/studio-regions.js`, responsável por republicar uma fotografia coerente das regiões dependentes dos jogos:

- cards da rodada;
- Últimas Ações;
- Agora na Rodada;
- barra lateral, incluindo jogos, classificações e mata-matas.

A Cabine chama essa sincronização após eventos e após a finalização. Assim, encerrar uma partida atualiza o jogo principal e também os demais componentes do Studio, sem depender de a Multicabine estar aberta.

### Multicabine

Adicionado um filtro de escopo explícito:

- Em operação;
- Todos de hoje;
- Todos os jogos.

O comportamento padrão continua operacional, mas o operador pode consultar jogos programados ou finalizados sem perder os filtros de competição, rodada e estado.

### Agenda Esportiva

As jornadas agora podem receber partidas específicas, além de competições e rodadas.

- Novo seletor “Partidas específicas”.
- As partidas escolhidas são gravadas em `matchIds`.
- A lista de jornadas mostra quantos jogos foram incluídos.
- Uma jornada ativa passa a ter um destino claro: restringir a visão operacional da Multicabine e da Central aos jogos, competições e rodadas escolhidos.

### Versão

Versões dos workspaces e do Bridge atualizadas para `1.7.2`.

## Arquivos principais alterados

- `apps/obs-bridge/public/studio-regions.js` — novo
- `apps/obs-bridge/public/control.js`
- `apps/obs-bridge/public/multicabine.js`
- `apps/obs-bridge/public/multicabine.html`
- `apps/obs-bridge/public/agenda.js`
- `apps/obs-bridge/public/agenda.html`
- `apps/obs-bridge/public/editorial.js`
- `apps/obs-bridge/public/editorial.html`
- `apps/obs-bridge/public/index.html`
- `apps/obs-bridge/server.mjs`
- `apps/overlay-studio/public/app.js`
- `apps/overlay-studio/public/index.html`
- `apps/overlay-studio/public/styles.css`
- arquivos `package.json`

## Validação realizada

- Verificação de sintaxe JavaScript/MJS aprovada nos arquivos alterados.
- Inicialização do OBS Bridge aprovada.
- `/health` respondeu com versão `1.7.2`.
- Overlay Studio carregou na raiz da porta 4173.
- Cabine, Agenda e Multicabine foram servidas corretamente.
- Nenhuma referência ativa a `studio-break-alert` ou `showAlert` permanece no runtime visual/operacional.

## Homologação recomendada

1. Colocar um jogo no ar e registrar um gol: deve atualizar placar, Últimas Ações e demais painéis, sem faixa flutuante.
2. Finalizar pela Cabine: jogo principal, cards, Últimas Ações e lateral devem refletir o estado final.
3. Criar uma jornada com partidas específicas e ativá-la.
4. Na Multicabine, alternar entre Em operação, Todos de hoje e Todos os jogos.
5. Confirmar mata-mata e classificação após um resultado final consolidado.
