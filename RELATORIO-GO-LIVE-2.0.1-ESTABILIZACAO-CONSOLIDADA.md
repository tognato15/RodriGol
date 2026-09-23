# RodriGol Go-Live 2.0.1 — Estabilização Consolidada

Pacote incremental sobre o Go-Live 2.0.1 Clubes e Equipes.

## Entrega
- Editor de Clubes compacto: modalidades em chips/recolhíveis e equipes/categorias resumidas.
- API pública resolve a modalidade pela competição quando partidas antigas não possuem `sport` explícito.
- Portal infere Basquete por quartos/eventos de pontos como proteção de compatibilidade.
- Faixa de autores de gols permanece exclusiva do Futebol.
- Detalhe ao vivo prioriza o estado canônico em vez de exibir `PROGRAMADO` residual.
- Atualizações do detalhe deixam de trocar a página por uma tela de carregamento quando já existe snapshot, reduzindo a sensação de piscar.
- Atualização SSE idêntica não força nova renderização completa.

## Teste novo
`apps/obs-bridge/test/golive201-stabilization-bigpack.test.js` — 7 testes.
