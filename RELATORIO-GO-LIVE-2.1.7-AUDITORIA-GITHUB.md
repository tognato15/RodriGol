# RodriGol 2.1.7 — Fundação para auditoria no GitHub

Pacote preparado para ser versionado na branch de auditoria, sem indicação de deploy no Railway.

## Alterações desta entrega

- desativação dos seeds esportivos de produção (Palmeiras, Flamengo, Red Bull Bragantino e a partida `pal-rbb-2026` não são mais usados como fallback silencioso);
- quando clubes, competições ou partidas ainda não foram hidratados, os getters retornam coleção vazia em vez de fabricar dados de teste;
- aliases canônicos separados para Botafogo-RJ, Botafogo-SP e Botafogo-PB;
- aliases separados para Atlético-GO/Athletico-PR, Juventude/Juventus-SP, Santa Cruz/Santos e Inter de Limeira/Internacional;
- preservação da normalização de rodadas por competição, temporada, fase, grupo e número;
- atualização dos metadados raiz que ainda descreviam o projeto como Go-Live 1.1;
- testes de regressão específicos desta fundação.

## Não incluído como concluído

As bases B/C do 2.1.6 continuam precisando da reconstrução de resultados, datas e horários. O script `scripts/fill-bc-2026.py` continua sendo objeto de auditoria e não deve ser tratado como fonte final de resultados.

A nomenclatura física `brasileirao-2026.json` da Série A foi preservada nesta entrega para não quebrar consumidores antes do rastreamento completo das referências.

## Destino

GitHub/branch de auditoria. Não publicar este pacote no Railway antes da conclusão da auditoria e da validação das databases.
