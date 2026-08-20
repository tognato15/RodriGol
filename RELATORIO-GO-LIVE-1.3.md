# RodriGol Studio — Go-Live 1.3 · Operação de Rodada

## Prioridades
- Cabine: ação local imediata e publicação remota em segundo plano.
- Portal: deduplicação sem depender do ID de cada fonte.
- Mata-mata: ida e volta só define classificado após os dois jogos terminarem.
- Pênaltis: cobranças convertidas/perdidas separadas do placar regulamentar.

## Regras de pênaltis
- Ative a fase `PÊNALTIS`.
- Use `PÊNALTI CONVERTIDO` ou `PÊNALTI PERDIDO`.
- Cobranças não incrementam o placar da partida.
- O Portal recebe um placar separado de pênaltis.

## Performance
A seleção do tipo de evento não grava mais cobertura. O botão de publicação deixa de aguardar Overlay/Studio; a sincronização acontece em segundo plano com a fila de retry existente.
