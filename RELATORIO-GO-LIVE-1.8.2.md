# RodriGol — Go-Live 1.8.2

## Fases, confrontos e classificação completa

Esta atualização corrige os pontos encontrados na validação pública do Competition Hub 1.8.1, sem alterar a experiência aprovada de Jogos do Dia.

### O que mudou

- A página pública **Classificações** passa a buscar o endpoint completo de classificações, em vez de reutilizar apenas o recorte resumido da Home. Assim, competições com vários grupos exibem todas as tabelas publicadas.
- O território `América` é normalizado publicamente para **América do Sul**, mantendo a navegação territorial consistente.
- Rodadas públicas recebem também os metadados de fase e grupo. O seletor passa a contextualizar nomes como **Quartas de final · Volta**, evitando rótulos isolados como apenas `Volta`.
- Competições em mata-mata ganham cards de confronto no hotsite, com fase, formato, ida, volta, agregado e links para as partidas cadastradas.
- A aba **Jogos** passa a inicializar seu próprio navegador de rodadas. O mesmo componente funciona tanto na Visão geral quanto na aba Jogos, eliminando o caso em que a rodada aparecia sem a lista de partidas.
- Partidas exibidas dentro dos confrontos continuam navegáveis para a página pública do jogo.

### Compatibilidade

- Mantida a hierarquia e navegação de competições do Go-Live 1.8.1.
- Mantido o Competition Hub do Go-Live 1.8.0.
- Mantidas as correções de UX ao vivo do Go-Live 1.7.3.
- Artilharia, Campeões, Arquivo e hotsites de clubes continuam reservados para evoluções futuras.

### Arquivos alterados

- `apps/obs-bridge/server.mjs`
- `apps/obs-bridge/public/portal/index.html`
- `apps/obs-bridge/test/golive182-phases-knockout.test.js`
- `RELATORIO-GO-LIVE-1.8.2.md`
