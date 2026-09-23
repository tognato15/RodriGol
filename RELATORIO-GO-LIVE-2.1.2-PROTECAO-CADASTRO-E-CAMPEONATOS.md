# RodriGol Go-Live 2.1.2 — Proteção de cadastro e Campeonatos

## Objetivo
Corrigir os dois problemas observados no teste da 2.1.1: sincronizações não devem apagar dados editoriais já preenchidos em clubes/competições, e o Portal deve expor novamente o acesso visual a Campeonatos e Classificação.

## Alterações
- O reconciliador de clubes preserva os valores já preenchidos no RodriGol. Um valor vindo da database só completa um campo quando o cadastro local está vazio.
- Escudo existente tem precedência sobre escudo importado; database vazia nunca remove escudo/cidade/dados editoriais.
- A mesma proteção foi aplicada ao cadastro de competições e logotipos.
- O cabeçalho público agora inclui Jogos, Classificação, Campeonatos e Notícias.
- A página #competitions e o Competition Hub existentes continuam sendo usados; não foi criado um segundo catálogo.
- A proteção de estado/relógio ao vivo da 2.0.5/2.1.x permanece inalterada.

## Regra de precedência
1. Estado operacional/cobertura canônica: soberano para fase, relógio e operação ao vivo.
2. Cadastro editorial local preenchido: preservado em sincronizações.
3. Database: cria registros ausentes e completa campos vazios; atualiza a estrutura das partidas conforme o importador, respeitando a proteção ao vivo.

## Testes
Executados em conjunto:
- golive212-catalog-protection-portal.test.js
- golive211-unified-database-portal.test.js
- golive205-canonical-clock-source.test.js

Resultado: 8 testes aprovados, 0 falhas.

## Observação
Esta versão não tenta recuperar automaticamente cidades/escudos que já tenham sido apagados por sincronizações anteriores. As correções manuais feitas após a 2.1.1 passam a ser preservadas nas próximas sincronizações.
