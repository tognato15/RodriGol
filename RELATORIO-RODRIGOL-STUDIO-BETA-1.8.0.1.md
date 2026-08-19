# RodriGol Studio — Beta 1.8.0.1

## Objetivo

Corrigir a apresentação dos confrontos de ida e volta na barra lateral do Overlay Studio.

## Correções

- O placar central dos confrontos com ida e volta agora usa o agregado (`aggregateHome` x `aggregateAway`).
- As linhas de **IDA** e **VOLTA** foram preservadas.
- Quando uma partida da ida ou da volta ainda não começou:
  - mostra o horário se for no mesmo dia;
  - mostra a data se for em outro dia.
- Quando a partida já começou ou terminou, a linha correspondente mostra o placar oficial.
- Pênaltis, classificado e observações continuam abaixo do agregado.
- Confrontos de partida única continuam usando o placar normal.

## Arquivos alterados

- `apps/obs-bridge/public/studio-regions.js`
- `apps/obs-bridge/public/overlay-control.js`
- `apps/obs-bridge/server.mjs`
- arquivos `package.json` de versão

## Validação

- Sintaxe JavaScript/MJS aprovada nos arquivos alterados.
- O payload gerado pelas duas rotas de publicação usa o agregado no placar central.
- As informações de ida e volta não foram removidas.
