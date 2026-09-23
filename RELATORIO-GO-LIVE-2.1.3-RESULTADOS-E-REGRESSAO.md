# RodriGol Go-Live 2.1.3 — Resultados e regressão

Data de corte: 23/09/2026.

## Entrega
- Base: Go-Live 2.1.2.
- Série A 2026 preservada com 20 clubes, 38 rodadas e 380 partidas.
- 277 partidas efetivamente disputadas até 20/09/2026 marcadas como FINAL, com placar.
- 103 partidas permanecem SCHEDULED.
- Jogos atrasados da 21ª rodada não foram falsamente encerrados: São Paulo x Santos segue programado para 02/10 às 20h; Atlético-MG x Red Bull Bragantino para 03/10 às 18h30; Chapecoense x Vasco permanece pendente de data na fonte oficial usada.
- Botafogo 3 x 2 Grêmio, disputado em 16/09, foi incorporado à 21ª rodada.
- SQLite recebeu `home_score`, `away_score`, `result_source` e `result_updated_at`.

## Classificação auditada
A tabela calculada exclusivamente a partir dos 277 resultados fecha no topo com a situação pública após a 28ª rodada:
1. Flamengo — 60 pts, 28 J, 55 GP, 23 GC, +32
2. Palmeiras — 57 pts, 28 J, 47 GP, 21 GC, +26
3. Athletico-PR — 49 pts, 28 J, +11
4. Fluminense — 48 pts, 28 J, +8
5. Bahia — 46 pts, 28 J, +8
6. Cruzeiro — 45 pts, 28 J, +2

Atlético-MG e Santos aparecem com 27 jogos, respeitando os atrasados.

## Correções de arquitetura
- Reconciliação de clubes ganhou aliases canônicos para impedir novas duplicações por variações como Flamengo/CR Flamengo, Bragantino/Red Bull Bragantino e Athletico/Atlético-PR.
- Campos editoriais já preenchidos continuam protegidos contra valores vazios da database.
- Resultado FINAL importado passa a alimentar também o coverage canônico, permitindo que Portal/Classificação/Cabine leiam o mesmo placar.
- O sincronizador agora espera a fila de persistência/publicação remota antes de informar conclusão. Isso corrige o caso em que o Editor tinha os 380 jogos localmente, mas o Portal consultava a base central antes de ela receber a atualização.
- O Portal mantém clique nos cards para abrir a página da partida, calendário, Classificação e Campeonatos.

## Testes
Pacote novo de regressão 2.1.3: 5/5 aprovados.
Conjunto 2.1.1 + 2.1.3: 9/9 aprovados.
Uma bateria ampliada com testes antigos retornou 27 aprovações e 6 falhas. As seis falhas são assertions legadas por texto/regex do código anterior (incluindo forma antiga de serialização de `sport` e relógio) e não falhas dos testes novos. Elas permanecem registradas para modernização da suíte, em vez de serem ocultadas.

## Fontes de resultados
CBF como referência oficial prioritária para situação atual, detalhamentos e jogos remarcados. Para reconstrução em massa das rodadas anteriores, foram cruzados dados públicos de resultados do Placa do Jogo/openfootball e, para o bloco mais recente, Cornerflick; rodadas 27 e 28 foram conferidas contra notícias/páginas de partidas atuais da CBF e resultados recentes.
