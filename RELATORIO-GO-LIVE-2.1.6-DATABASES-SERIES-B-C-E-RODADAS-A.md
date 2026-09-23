# RodriGol Go-Live 2.1.6 — Databases Série B/C e rodadas Série A

## Entrega
- Série B 2026: 38 rodadas, 380 confrontos, 20 clubes; turno e returno completos.
- Série C 2026: primeira fase completa com 19 rodadas e 190 confrontos; segunda fase preservada com 24 partidas (Grupos B/C).
- Série A 2026: base existente validada com 38 rodadas e 380 partidas; reconciliação de rodadas usa identidade canônica por número + temporada + fase + grupo, evitando duplicação entre nomes como `20ª Rodada` e `Rodada 20`.
- `databases.json`: A, B e C publicadas para a sincronização única.

## Fontes de confrontos
- CBF — Tabela Básica do Campeonato Brasileiro Série B 2026.
- CBF / ge — Tabela Básica do Campeonato Brasileiro Série C 2026.

## Importante sobre placares
Esta entrega fecha a estrutura integral das rodadas/confrontos. Os placares históricos da Série B e da primeira fase da Série C não foram inventados: onde não havia resultado previamente consolidado no pacote, o jogo permanece `SCHEDULED`, sem placar. Os 12 resultados já consolidados das três primeiras rodadas da segunda fase da Série C foram preservados.

## Validação
- Série A: 380 jogos / 38 rodadas / 10 jogos por rodada.
- Série B: 380 jogos / 38 rodadas / 10 jogos por rodada / 190 pares únicos de adversários.
- Série C primeira fase: 190 jogos / 19 rodadas / 10 jogos por rodada / 190 pares únicos.
- Série C segunda fase: 24 jogos preservados.
- 7 testes específicos 2.1.5/2.1.6 aprovados.

## Arquivos principais
- `apps/obs-bridge/data/brasileirao-serie-b-2026.sqlite`
- `apps/obs-bridge/data/brasileirao-serie-c-2026.sqlite`
- `apps/obs-bridge/public/data/brasileirao-serie-b-2026.json`
- `apps/obs-bridge/public/data/brasileirao-serie-c-2026.json`
- `apps/obs-bridge/public/data/databases.json`
- `apps/obs-bridge/public/data-store.js`
