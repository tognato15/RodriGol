# RodriGol Studio — Beta 1.7.4.1

## Objetivo

Correção pontual do relógio dos jogos exibidos na barra lateral do Overlay Studio, preservando o relógio já aprovado do jogo principal e dos cards do scoreboard.

## Causa identificada

A lateral ainda decidia se uma partida estava antes do início com base principalmente no campo textual `status`. Em registros antigos ou em atualizações parciais, esse campo podia permanecer como `PRÉ-JOGO` ou outro estado desatualizado, mesmo quando a fase canônica da cobertura já era `FIRST_HALF`, `SECOND_HALF` ou `EXTRA_TIME`.

Com isso, a lateral não criava o elemento de relógio ao vivo ou mostrava apenas o último texto recebido do Bridge.

## Correção aplicada

- A barra lateral agora prioriza a fase canônica da partida (`phase`).
- O estado visual é derivado por `deriveVisualState()`.
- O relógio lateral é habilitado somente quando `shouldShowClock()` autoriza a fase.
- Cada relógio continua vinculado ao `matchId` e avança localmente entre sincronizações.
- A rotação do carrossel recria o elemento visual sem perder o estado temporal mantido em memória.
- `status` textual desatualizado não consegue mais transformar uma partida ao vivo em pré-jogo.

## Regra final da lateral

O relógio aparece e avança apenas em:

- primeiro tempo;
- segundo tempo;
- prorrogação.

O relógio não aparece em:

- programado;
- pré-jogo;
- intervalo;
- em andamento sem relógio;
- pênaltis;
- pós-jogo;
- finalizado;
- suspenso;
- adiado;
- cancelado.

Para partidas programadas e em pré-jogo, a lateral continua mostrando data ou horário.

## Arquivos alterados

- `apps/obs-bridge/public/studio-regions.js`
- `apps/overlay-studio/public/app.js`
- arquivos `package.json` e identificação de versão do Bridge

## Validação

- Sintaxe de todos os arquivos JavaScript e MJS em `apps`: aprovada.
- Inicialização do OBS Bridge: aprovada.
- Endpoint `/health`: versão 1.7.4.1 confirmada.
- Integridade dos ZIPs: aprovada.
