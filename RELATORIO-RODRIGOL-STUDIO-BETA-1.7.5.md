# RodriGol Studio — Beta 1.7.5

## Objetivo

Consolidar a apresentação canônica da barra lateral e preservar o fluxo operacional de partidas finalizadas e rodadas já introduzido nas versões 1.7.3 e 1.7.4.

## Correção principal — barra lateral

A causa da regressão era a presença de fases em formatos diferentes no mesmo fluxo. Alguns registros chegavam como enum técnico (`PRE_GAME`, `FIRST_HALF`, `FINAL`) e outros como rótulo visual (`PRÉ-JOGO`, `1º TEMPO`, `FIM DE JOGO`). O motor considerava apenas os enums e tratava rótulos localizados como fase desconhecida. Isso fazia a lateral cair no rótulo genérico de pré-jogo.

Foi adicionada a função canônica `canonicalMatchPhase()` ao motor compartilhado `match-presentation.js`.

Agora são normalizados, entre outros:

- `PROGRAMADO`, `AGENDADO` → `SCHEDULED`;
- `PRÉ-JOGO` → `PRE_GAME`;
- `1º TEMPO` → `FIRST_HALF`;
- `INTERVALO` → `HALFTIME`;
- `2º TEMPO` → `SECOND_HALF`;
- `PRORROGAÇÃO` → `EXTRA_TIME`;
- `EM ANDAMENTO` → `LIVE_UNKNOWN`;
- `FIM DE JOGO`, `FINALIZADO` → `FINAL`;
- `ADIADO`, `SUSPENSO`, `CANCELADO` → seus estados oficiais.

## Regra visual final da lateral

- Partida em outro dia: data.
- Partida no mesmo dia e ainda não iniciada: horário.
- Primeiro tempo: `1º TEMPO` e relógio ativo.
- Intervalo: `INTERVALO`, sem relógio.
- Segundo tempo: `2º TEMPO` e relógio ativo.
- Prorrogação: `PRORROGAÇÃO` e relógio ativo.
- Em andamento sem relógio: `EM ANDAMENTO`, sem relógio.
- Finalizada: `FINAL`, sem relógio.
- Adiada, suspensa ou cancelada: estado correspondente, sem relógio.

O rótulo visual `PRÉ-JOGO` deixa de ser usado na lista lateral. Para partidas ainda não iniciadas prevalece sempre a data ou o horário.

## Proteção contra estado antigo

O motor também passou a impedir que uma cobertura antiga em `PRE_GAME` ou `SCHEDULED` rebaixe uma partida cujo estado oficial já esteja em andamento ou finalizado. O estado `FINAL` oficial sempre prevalece e interrompe o relógio.

## Arquivo operacional e rodadas

Permanecem consolidadas as funções já implantadas:

- filtros de partidas próximas, em operação, finalizadas e arquivadas;
- arquivamento sem exclusão dos dados esportivos;
- estados operacionais de rodada;
- conclusão e arquivamento de rodada;
- identificação de pendências antes da consolidação.

## Arquivos alterados

- `apps/obs-bridge/public/match-presentation.js`
- `apps/overlay-studio/public/match-presentation.js`
- `apps/overlay-studio/public/app.js`
- `apps/obs-bridge/server.mjs`
- arquivos `package.json` dos workspaces e raiz

## Validação

- Normalização de fases localizada e técnica: aprovada.
- Visibilidade de relógio por fase: aprovada.
- Verificação de sintaxe de todos os arquivos JavaScript e MJS em `apps`: aprovada.
- Integridade dos ZIPs: verificada.
