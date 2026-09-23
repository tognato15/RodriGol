# RodriGol Go-Live 2.0 — Megapack Multiesportivo

## Escopo
- 20 modalidades oficiais no cadastro: Futebol, Basquete, Beisebol, Boxe, Críquete, Football, Futsal, Handebol, Hockey, Hóquei Sobre Grama, Hóquei Sobre Patins, Judô, Netball, Polo aquático, Rugby, Rugby League, Tênis, Tênis de Mesa, Vôlei e Vôlei de Praia.
- Perfis de modalidade centralizados em `sports-engine.js`.
- Basquete com 4 quartos e eventos +1/+2/+3.
- Vôlei, praia, tênis e tênis de mesa com sets.
- Beisebol com innings; Cricket com innings; Boxe com rounds; Hockey com períodos; Football/Netball/Polo aquático/Hóquei de grama com quartos conforme perfil.
- Rugby e Rugby League com eventos/valores próprios.
- Clubes continuam aceitando múltiplas modalidades.
- Situação inicial e Cabine passam a montar períodos conforme a modalidade.
- Compatibilidade preservada para identificador legado `AMERICAN_FOOTBALL`.

## Correção do Portal local / ao vivo
- Sincronização central fica ativa também no ambiente local, para que Controle e Portal usem a mesma fonte durante os testes.
- Partida marcada explicitamente como `on-air` é incluída no feed público mesmo se a fase armazenada estiver atrasada e independentemente da data.
- Fases segmentadas (Q1-Q4, sets, innings, rounds, períodos e overtime) são reconhecidas como estados ao vivo.

## Fora deste pacote
Modalidades de prova/classificação (automobilismo, ciclismo, golfe, atletismo, natação, ginástica) ficam reservadas para um segundo motor, pois não seguem naturalmente o modelo Mandante × Visitante.

## Validação
26/26 testes focados no Go-Live 2.0 aprovados, incluindo os testes anteriores e o novo `golive20-megapack-sports.test.js`.
