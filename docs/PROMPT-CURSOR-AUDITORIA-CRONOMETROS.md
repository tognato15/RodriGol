# Prompt para o Cursor — auditoria dos cronômetros e estabilidade

Analise todo o projeto RodriGol Studio Beta 1.6.1.3 antes de alterar qualquer arquivo.

## Objetivo principal

Identificar a causa raiz das inconsistências dos cronômetros e propor uma correção arquitetural, não mais uma sequência de correções locais.

## Sintomas observados

- relógio do jogo principal congela em alguns momentos;
- intervalo pode manter `00:00` visível;
- segundo tempo pode iniciar sem alterar corretamente a indicação de período;
- jogo finalizado pode conservar relógio na barra lateral;
- partidas em andamento sem relógio podem exibir minuto em alguns componentes;
- últimas ações podem desaparecer temporariamente e voltar depois;
- sensação de lentidão quando existem partidas ao vivo e vários painéis atualizando.

## Arquivos obrigatórios para análise

- `apps/obs-bridge/public/control.js`
- `apps/obs-bridge/public/multicabine.js`
- `apps/obs-bridge/public/overlay-control.js`
- `apps/obs-bridge/public/data-store.js`
- `apps/obs-bridge/public/production.js`
- `apps/obs-bridge/server.mjs`
- `apps/overlay-studio/public/app.js`
- `apps/overlay-studio/public/index.html`
- todos os testes relacionados a relógio, fase, período, eventos e Bridge.

## Perguntas que a análise deve responder

1. Qual módulo é hoje a fonte de verdade do relógio?
2. Quantos lugares recalculam `elapsedSeconds`?
3. Quantos timers podem existir ao mesmo tempo?
4. Cabine e Multicabine podem publicar o mesmo jogo simultaneamente?
5. O merge parcial do Bridge mantém `clock`, `finalClock`, `period` ou `status` antigos quando eles deveriam ser apagados?
6. Há condição de corrida entre atualizações de relógio e mudanças de fase?
7. Por que o Overlay Studio precisa recalcular localmente um tempo que já chega calculado?
8. Quais estados permitem relógio visível e quais obrigatoriamente o ocultam?
9. Como garantir idempotência nas transições e eventos sistêmicos?
10. Quais renderizações completas podem ser substituídas por atualizações pontuais?

## Regra funcional canônica esperada

- `SCHEDULED`: sem placar e sem relógio; mostrar horário hoje ou data em outro dia.
- `PRE_GAME`: sem placar e sem relógio; mostrar horário.
- `FIRST_HALF`: mostrar `1º TEMPO` e relógio se habilitado.
- `HALFTIME`: mostrar `INTERVALO`, sem relógio.
- `SECOND_HALF`: mostrar `2º TEMPO` e relógio se habilitado.
- `EXTRA_TIME`: mostrar período correspondente e relógio se habilitado.
- `PENALTIES`: sem cronômetro corrido, salvo regra futura específica.
- `LIVE_UNKNOWN`: mostrar ao vivo, sem relógio.
- `FINAL`: mostrar final, sem relógio em todos os componentes.
- suspensa, adiada ou cancelada: sem relógio.

## Arquitetura desejada

Crie ou proponha um módulo compartilhado, por exemplo:

- `match-presentation.js` ou equivalente;
- `getEffectiveElapsedSeconds(coverage, now)`;
- `deriveVisualState(match, coverage)`;
- `shouldShowClock(visualState)`;
- `buildMatchPresentationPayload(match, coverage)`.

Cabine, Multicabine, Central do Overlay e Overlay Studio devem consumir a mesma regra.

O Bridge precisa permitir limpeza explícita de campos antigos. Avalie uma estratégia como `null`, lista `unset`, substituição completa por região ou versionamento de payload.

## Testes obrigatórios antes de concluir

Não use apenas testes por regex. Crie testes de comportamento e, preferencialmente, testes com navegador para:

1. Programado → 1º tempo.
2. 1º tempo → intervalo.
3. Intervalo → 2º tempo.
4. 2º tempo → final.
5. Em andamento sem relógio.
6. Pausar e retomar.
7. Recarregar a Cabine durante relógio ativo.
8. Trocar o jogo principal.
9. Reconectar o overlay ao WebSocket.
10. Publicações simultâneas da Cabine e Multicabine.
11. Eventos não desaparecem em atualização parcial vazia.
12. Nenhum timer duplicado após várias transições.

## Outros problemas a corrigir ou documentar

- `npm run check`, `npm run build` e `npm test` globais falham nos pacotes TypeScript;
- falta `package-lock.json`;
- versões estão divergentes entre pacotes e endpoints de health;
- existem dois overlays e dois fluxos `public/dist`;
- avaliar `toISOString().slice(0,10)` versus data local;
- avaliar renderizações duplicadas causadas por `storage` + `rodrigol:data-changed`;
- avaliar capacidade do localStorage com escudos base64;
- criar relatório final com causa raiz, arquivos alterados, riscos e testes executados.

Antes de modificar, apresente um plano. Depois, faça mudanças completas e entregue arquivos prontos, sem pedir que o usuário edite trechos manualmente.
