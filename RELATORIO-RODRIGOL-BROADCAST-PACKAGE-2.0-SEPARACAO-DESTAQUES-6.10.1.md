# RodriGol Broadcast Package 2.0 — Separação de Destaques 6.10.1

## Objetivo
Corrigir o acoplamento indevido entre eventos operacionais registrados nas Cabines e a Central de Destaques editorial.

## Correção
- Eventos de Cabine (gol, cartões, informação, VAR e demais ocorrências) não são mais enviados para a fila editorial.
- A opção "Adicionar à fila editorial", que estava marcada por padrão na Cabine, foi removida.
- A Cabine continua publicando normalmente cronologia, placar, scoreboard, barra amarela e demais regiões operacionais.
- Itens antigos criados automaticamente pela Cabine são identificados por `sourceEventId` e filtrados da Central de Destaques.
- Manchetes criadas manualmente na Central são preservadas.
- Destaques originados de Notícias são preservados.
- A edição de manchetes adicionada na 6.10 permanece disponível.

## Arquivos alterados
- `apps/obs-bridge/public/control.js`
- `apps/obs-bridge/public/index.html`
- `apps/obs-bridge/public/data-store.js`
- `apps/overlay-studio/package.json`

## Verificações
- Sintaxe OBS Bridge: aprovada.
- Sintaxe Overlay Studio: aprovada.
- Build Overlay Studio: aprovado.
- OBS Bridge: 57/61 testes, mantendo 4 falhas legadas anteriores.
- Overlay Studio: 31/33 testes, mantendo 2 falhas legadas anteriores.
