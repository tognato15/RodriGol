# RodriGol Go-Live 2.0 — vínculo multiesportivo

## Objetivo
Completar a fundação multiesportiva sem ampliar a complexidade operacional do Portal.

## Alterações
- Editor de Partidas filtra competições e equipes pela modalidade selecionada.
- Registros legados sem modalidade continuam tratados como Futebol.
- Editor de Competições passa a usar a mesma lista estruturada de modalidades.
- Editor de Clubes/Equipes ganha Modalidade para permitir equipes de basquete, vôlei, futsal etc.
- `Árbitro` passa a `Arbitragem` e aceita texto livre para múltiplos oficiais.
- `Estádio` passa a `Local`, adequado a estádio, ginásio, arena, piscina, rink etc.
- Portal usa `Local` e `Arbitragem` nas informações da partida.
- Agenda pública mantém agrupamento por modalidade + competição.

## Escopo deliberadamente preservado
- Motor e cadastros de competições continuam existentes.
- Futebol legado continua funcional.
- Não foram criadas cabines específicas por modalidade nesta entrega.
- Informações complementares permanecem opcionais.

## Validação
Comando:
`node --test apps/obs-bridge/test/golive20-multisport-essential.test.js apps/obs-bridge/test/golive20-multisport-linkage.test.js`

Resultado preparado: 10 pass / 0 fail.
