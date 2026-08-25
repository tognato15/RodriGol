# RodriGol — Go-Live 1.8.0 — Competition Hub

## Objetivo
Evoluir a Classificação pública para uma estrutura de competição, reaproveitando a classificação já publicada pelo Studio e sem assumir que todo campeonato usa uma única tabela de pontos corridos.

## Alterações
- API pública de classificações passa a expor fase, grupo, temporada, formato e estatísticas completas.
- Linhas da classificação passam a incluir escudo do clube, J, V, E, D, GP, GC, SG e PTS.
- Nova API pública de competições lista somente campeonatos que possuem classificação publicada.
- Novo endpoint de hotsite por competição reúne metadados, classificações publicadas e partidas da competição.
- Tela Classificação do Portal agrupa tabelas por competição e permite filtro por campeonato.
- Fases e grupos publicados aparecem como blocos independentes dentro da competição.
- Tela Campeonatos deixa de ser placeholder e passa a listar as competições disponíveis.
- Novo hotsite de competição exibe identidade, classificação por fase/grupo e jogos cadastrados.

## Compatibilidade
- Home e Jogos do Dia mantêm o layout aprovado no Go-Live 1.7.3.
- A estrutura existente de cálculo OFICIAL/AO VIVO do Studio não foi alterada.
- Nenhuma mudança foi feita no Overlay Studio nesta entrega.

## Validação sugerida
1. Publicar uma classificação de pontos corridos no Studio e abrir Classificação no Portal.
2. Conferir as colunas J, V, E, D, GP, GC, SG e PTS.
3. Abrir Campeonatos e entrar no hotsite da competição.
4. Em competição com grupos, publicar duas ou mais tabelas e conferir se cada grupo aparece separado.
5. Confirmar que Jogos do Dia e a faixa de goleadores permanecem iguais à versão 1.7.3.
