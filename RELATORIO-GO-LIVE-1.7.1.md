# RodriGol Studio — Go-Live 1.7.1

## Single Source of Truth

Esta entrega consolida placar, fase, agregado, pênaltis e publicação do Overlay a partir do estado persistido mais recente.

### Correções
- Portal prioriza a cobertura persistida para placar e fase e rejeita revisões antigas.
- Mata-mata/agregado e pênaltis usam o estado persistido do `rodrigol-knockout-v1`.
- Pênaltis compactos permanecem em uma única linha.
- Clique na marca RodriGol volta sempre à Home de hoje.
- Bridge republica estado canônico para `scoreboard` e `round-scoreboard` quando cobertura, partidas, mata-mata ou jogo no ar mudam.
- Overlay Studio inicia neutro em `CARREGANDO...`, sem partida fictícia.

### Objetivo operacional
Impedir divergências como Cabine 1×4 / Portal 1×2, FINAL / INTERVALO e agregado 0×0 quando o estado persistido já contém outro resultado.
