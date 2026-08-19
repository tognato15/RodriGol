# RC2B.2.4.1 — Fonte real da Cabine para o Portal

## Problema confirmado
Placar e status chegavam ao Portal pelas regiões do Overlay, mas acontecimentos e escalações podiam desaparecer quando a partida saía do conjunto ao vivo ou quando o round-summary não continha aquela partida.

## Correção
A Cabine agora publica `public-match-data`, um espelho dedicado de todas as partidas com:
- cronologia;
- escalações;
- placar;
- autores de gols;
- fase;
- dados da partida.

Essa região não depende das regras visuais do Overlay, do scoreboard ou do ticker.

A API pública prioriza a versão mais completa da partida e continua mantendo os fallbacks anteriores.

## Próxima etapa
Depois da validação em uso real, RC2B.3: identidade visual integrada do Portal inspirada na Cabine, incluindo coluna direita contextual e navegação lateral pública.
