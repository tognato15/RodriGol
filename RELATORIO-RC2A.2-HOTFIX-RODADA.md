# RodriGol Studio RC2A.2 — Hotfix de rodada

## Substituições
A causa real era a ordem de renderização.

Antes:
1. a Cabine tentava montar os selects;
2. só depois preenchia titulares e reservas na interface.

Agora:
1. carrega os dados da partida;
2. preenche titulares e banco;
3. consulta também a coverage persistida;
4. reconstrói quem está em campo;
5. somente então monta os selects "quem sai" e "quem entra".

Se realmente não houver titulares ou banco, o select passa a informar isso explicitamente.

## Scoreboard
Foram corrigidos três pontos:
- Cabine usa formato compacto;
- Multicabine usa exatamente o mesmo formato e não pode mais sobrescrever com texto antigo;
- `latestScoreboardAction` entra no fingerprint do Overlay, então cartão atualiza o card mesmo sem alteração no placar.

Formato:
- ⚽ · minuto · autor
- 🟨 · minuto · jogador
- 🟥 · minuto · jogador

## Sumário
Mantida integralmente a correção já validada na RC2A.1.

## Validação
- Bridge check: aprovado.
- Bridge tests: aprovado.
- Overlay check: aprovado.
- Overlay tests: aprovado.
- Overlay build: aprovado.
- Preflight: aprovado.
