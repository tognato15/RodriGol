# RodriGol Go-Live 2.1.0 — Database Série A 2026

## Entrega
- Dataset da Série A 2026 com 20 clubes, 38 rodadas e 380 partidas.
- Arquivo SQLite incluído em `apps/obs-bridge/data/brasileirao-serie-a-2026.sqlite`.
- Dataset operacional do editor em `apps/obs-bridge/public/data/brasileirao-2026.json`.
- Botão **Importar Série A 2026** no Editor de Partidas.
- Importação acumulativa: preserva partidas já existentes e não recria IDs.
- Proteção do estado ao vivo: uma atualização estrutural não rebaixa uma partida em operação para `SCHEDULED`.
- Rodadas 27–30 recebem data, horário, estádio e cidade do detalhamento publicado em 31/08/2026.
- Coritiba x Botafogo (30ª rodada) já incorpora a alteração mais recente para 12/10/2026 às 16h, no Couto Pereira.

## Funcionamento
1. Abrir **Editor de Partidas**.
2. Clicar em **Importar Série A 2026**.
3. O RodriGol incorpora competição, clubes, 38 rodadas e 380 jogos.
4. Os jogos passam a aparecer no editor e podem ser abertos na cabine normalmente.
5. Reimportar o dataset funciona como atualização estrutural, sem duplicar os jogos.

## Fonte de verdade
O SQLite é entregue como base estruturada e auditável. Para compatibilidade com a arquitetura atual do RodriGol/Railway, o editor consome uma projeção JSON do mesmo conjunto de registros. Isso evita introduzir uma dependência nativa de SQLite no navegador e permite migrar o backend posteriormente sem alterar a interface do operador.

## Testes novos
`golive210-brasileirao-database.test.js`
- 380 partidas / 38 rodadas / 20 clubes: OK
- IDs únicos: OK
- segundo turno com mandos invertidos: OK
- atualização Coritiba x Botafogo da 30ª rodada: OK
- botão/importador no editor: OK

Resultado: **4/4 testes novos aprovados**.

## Observação
Esta entrega implementa a infraestrutura e a tabela estrutural completa. Resultados já disputados, placares e fichas de 2026 serão uma camada de atualização do mesmo dataset; não é necessário recriar a competição nem os jogos.
