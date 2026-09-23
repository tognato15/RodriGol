# RodriGol Go-Live 2.1.1 — Sincronização única e Portal

## Objetivo
Consolidar a arquitetura database-first sem duplicar clubes, competições, partidas ou estados e restaurar a navegação pública de agenda/classificação.

## Alterações
- O botão específico `Importar Série A 2026` foi substituído por `Sincronizar databases`.
- Criado `public/data/databases.json`, manifesto extensível de bases disponíveis. Novas competições entram no manifesto sem exigir um botão novo por SQLite/dataset.
- `importCompetitionDataset` agora reconcilia clubes por ID/nome/nome curto/abreviação e mantém o ID do cadastro já existente.
- Competições também são reconciliadas por identidade e preservam o cadastro existente; a temporada importada é vinculada à mesma competição.
- Rodadas e partidas são reconciliadas; sincronizações repetidas atualizam em vez de duplicar.
- Estado operacional ao vivo continua protegido contra sobrescrita por dados estruturais importados.
- Portal: restaurado seletor/calendário de data na lista de jogos e entrada Agenda.
- Corrigido `loadHome`: antes ele redefinia a data para HOJE em toda consulta, impedindo navegar de fato pelo calendário.
- Classificação e Competition Hub existentes permanecem ativos e ligados às APIs públicas já presentes.

## Testes
Novo pacote `golive211-unified-database-portal.test.js`: 4/4 aprovado.
O teste legado 2.1.0 que exigia literalmente o botão `importBrasileirao2026` passa a falhar por design, pois esse botão foi removido e substituído pelo sincronizador universal.

## Uso
No Editor de Partidas, clicar em `Sincronizar databases`. A Série A 2026 é a primeira fonte registrada. Futuras bases serão acrescentadas ao manifesto, sem criar novos botões no editor.

No Portal, `Agenda` leva à lista de jogos e o seletor de data permite navegar pelo calendário; `Classificação` permanece disponível na navegação lateral e o Competition Hub mantém as abas de Classificação/Jogos/Notícias quando há dados publicados.
