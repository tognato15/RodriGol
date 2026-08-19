# RC2B.2.4.2 — Sincronização Progressiva

A aparição tardia e parcial dos dados mostrou que havia múltiplas fontes chegando em tempos diferentes.

## Correções
- `public-match-data` não participa mais do Promise.all essencial da Cabine.
- Falha na publicação extra do Portal não interrompe scoreboard, round-summary ou sidebar.
- Home usa `public-match-data` como fallback se round-summary estiver vazio.
- Cronologia agora é união de coverage + public-match-data + round-summary + round-scoreboard + live-events.
- Escalações usam o conjunto mais completo disponível entre todas as fontes.

## Teste
Uma fonte parcial com 1 evento e 2 jogadores foi publicada junto de uma fonte completa com 2 eventos e 11 jogadores.
A API pública retornou 2 eventos e 11 jogadores.
