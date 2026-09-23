# RodriGol Go-Live 2.0 — Portal Essencial e Fundação Multiesportiva

## Objetivo
Reduzir a carga operacional pública do RodriGol e abrir a agenda para esportes coletivos.

## Entrega
- Portal público concentrado em Jogos de Hoje, Notícias e Rádio.
- Barra lateral esquerda oculta e navegação pública de classificações/competições retirada do cabeçalho.
- Agenda sempre carregada com a data atual; calendário público retirado.
- Estruturas administrativas de competições preservadas, sem exclusão de dados ou motores existentes.
- Cadastro de partidas recebe Modalidade: Futebol, Futsal, Basquete, Vôlei, Handebol, Rugby, Polo Aquático, Baseball, Hockey e Outro.
- API pública preserva `sport` e o Portal agrupa jogos por modalidade + competição.
- Rádio usa persistência central existente e recebe fallback imediato para `https://hts09.brascast.com:8438/live`.

## Limite consciente desta entrega
A versão cria a fundação multiesportiva para cadastro e agenda. Cabines específicas (quartos, sets, innings etc.) ficam para incrementos posteriores, evitando uma implementação longa antes de colocar o novo Portal em operação.
