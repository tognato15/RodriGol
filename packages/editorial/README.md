# @rodrigol/editorial

Motor editorial do RodriGol 2.0. Converte fatos esportivos em itens editoriais, prioriza a fila de redação, aplica regras de publicação e gera comandos destinados aos overlays.

## Fluxo principal

1. Um evento esportivo é convertido em `EditorialItem`.
2. O item entra na `EditorialQueue`.
3. A redação revisa e marca o item como pronto.
4. `EditorialPublisher` aplica uma `PublicationRule`.
5. As publicações podem virar `OverlayCommand`.
