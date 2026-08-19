# RodriGol Studio — Beta 1.9.0

## Base

Versão produzida a partir do Beta 1.8.0.1 completo.

## Objetivo desta entrega

Iniciar a Fase 2 com foco em operação inteligente, consulta de partidas encerradas e diagnóstico operacional. O layout do Overlay Studio, o scoreboard, a barra lateral e o rodapé editorial foram preservados.

## Entregas

### Arquivo Operacional

Nova página:

`/control/archive.html`

Recursos:

- filtros Hoje, Ontem, Últimos 7 dias e Todo o arquivo;
- filtros por competição e rodada;
- separação entre finalizadas, arquivadas e partidas com pendências;
- pesquisa por clube, competição e rodada;
- resumo de encerradas, finalizadas hoje, arquivadas e pendentes;
- placar consolidado, duração da cobertura e quantidade de eventos;
- acessos para Histórico, Editor e Diagnóstico;
- arquivamento sem exclusão do resultado.

A Cabine e o menu principal agora possuem acesso direto ao Arquivo Operacional.

### Centro Operacional da Cabine

O painel existente foi aprimorado com:

- competição e rodada em cada card;
- destaque automático para gol, vermelho ou VAR ocorrido nos últimos três minutos;
- aviso quando uma partida está em fase ao vivo com relógio pausado;
- manutenção da ordem operacional: ao vivo, intervalo, preparação e próximos jogos;
- acesso direto ao novo Arquivo Operacional.

### Diagnóstico de Saúde Operacional

A página de Diagnóstico de Vínculos evoluiu para Saúde Operacional e agora também verifica:

- partida finalizada com relógio ainda ativo;
- fase ao vivo com relógio pausado;
- relógio ativo sem atualização recente;
- partida finalizada sem registro no Histórico;
- mata-mata possivelmente sem agregado consolidado;
- saída principal definida;
- quantidade de partidas ao vivo;
- integração com tabela automática, mata-mata, agenda e histórico.

Foram adicionados filtros para alertas operacionais e partidas ao vivo, além de atalhos diretos para Cabine e Editor.

### Versão

Raiz, OBS Bridge, Overlay Studio, Browser Overlay e endpoint `/health` foram alinhados para `1.9.0`.

## Arquivos novos

- `apps/obs-bridge/public/archive.html`
- `apps/obs-bridge/public/archive.css`
- `apps/obs-bridge/public/archive.js`

## Arquivos alterados

- `package.json`
- `apps/obs-bridge/package.json`
- `apps/obs-bridge/server.mjs`
- `apps/obs-bridge/public/control.js`
- `apps/obs-bridge/public/control.css`
- `apps/obs-bridge/public/diagnostics.html`
- `apps/obs-bridge/public/diagnostics.css`
- `apps/obs-bridge/public/diagnostics.js`
- `apps/obs-bridge/public/global-nav.js`
- `apps/overlay-studio/package.json`
- `apps/overlay/package.json`

## Validação

- verificação de sintaxe do OBS Bridge: aprovada;
- inicialização real do Bridge: aprovada;
- `/health`: versão 1.9.0 confirmada;
- `/control/archive.html`: HTTP 200;
- `/control/diagnostics.html`: HTTP 200;
- 49 de 52 testes antigos do OBS Bridge aprovados.

Os três testes restantes verificam contratos legados de ticker/alerta que já tinham sido removidos antes desta entrega. Eles não foram reativados, pois isso causaria regressão no overlay atual. A suíte precisa ser atualizada futuramente para refletir o contrato vigente.

## Homologação recomendada

1. Finalizar uma partida e abrir o Arquivo Operacional.
2. Arquivar a partida e confirmar que ela permanece pesquisável.
3. Abrir duas partidas ao vivo e validar a prioridade do Centro Operacional.
4. Pausar o relógio de uma partida ao vivo e confirmar o alerta no Centro e no Diagnóstico.
5. Validar uma partida finalizada com classificação e mata-mata vinculados.
