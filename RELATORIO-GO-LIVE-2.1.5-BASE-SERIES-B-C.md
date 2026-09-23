# Go-Live 2.1.5 — Base Série B e Série C

Pacote intermediário seguro para validação local. Não deve ser sincronizado no Railway ainda.

## Implementado
- Correção da identidade canônica de rodadas: `20ª Rodada` e `Rodada 20` passam a ser reconciliadas pelo número, respeitando competição, temporada, fase e grupo.
- SQLite Série B 2026 com 20 clubes, 38 rodadas e snapshot oficial da classificação consultada na CBF.
- SQLite Série C 2026 com 20 clubes, 1ª fase (19 rodadas), 2ª fase separada em grupos B/C (6 rodadas por grupo) e snapshot final da 1ª fase.
- Série C: 24 confrontos da 2ª fase estruturados; 12 partidas das rodadas 1–3 com resultados confirmados até 23/09/2026.
- JSONs de ingestão preparados, mas propositalmente fora de `databases.json` enquanto a ingestão jogo a jogo não estiver completa.

## Segurança
Série B e Série C NÃO foram adicionadas ao manifesto de sincronização. Clicar em “Sincronizar databases” continua afetando somente as bases já liberadas. Isso evita publicar uma competição parcial no Railway.

## Próxima etapa
Completar partidas da Série B (380 jogos, com detalhamento oficial até a 34ª rodada) e a 1ª fase da Série C (190 jogos), validar classificações calculadas contra a CBF e só então habilitar ambas no manifesto.
