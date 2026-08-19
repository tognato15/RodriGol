# RodriGol Broadcast Package 2.0 — Barra Lateral 6.9.5

## Correções
- Restaurados os autores e minutos dos gols no card inferior, inclusive após o encerramento da partida.
- O Bridge usa eventos GOAL quando disponíveis e, se eles não estiverem presentes, usa automaticamente os artilheiros salvos na Cabine como fallback.
- Classificações com até seis clubes passam a usar lista compacta no topo, sem esticar as linhas para preencher toda a altura.
- Classificações grandes continuam aproveitando a altura completa da lateral.

## Arquivos alterados
- `apps/obs-bridge/public/studio-regions.js`
- `apps/overlay-studio/public/app.js`
- `apps/overlay-studio/public/styles.css`

## Verificações
- Sintaxe OBS Bridge: aprovada.
- Sintaxe Overlay Studio: aprovada.
- Build Overlay Studio: aprovado.
- Suíte Overlay Studio: 31/33, mantendo as duas falhas legadas de pré-jogo já existentes.
