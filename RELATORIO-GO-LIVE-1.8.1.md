# RodriGol — Go-Live 1.8.1

## Hierarquia e navegação de competições

Esta atualização consolida as correções identificadas na validação pública do Competition Hub 1.8.0.

### O que mudou

- A lista pública de Campeonatos passa a considerar todas as competições cadastradas, inclusive torneios sem tabela de classificação e competições em mata-mata.
- Competições são organizadas por continente e país, com ordenação interna pela prioridade editorial definida no Studio.
- O Editor de Competições ganha a opção **Destaque no Portal**, preservando também o campo de prioridade editorial.
- A barra lateral pública passa a oferecer um diretório de competições agrupado territorialmente.
- A Classificação utiliza os metadados de país, continente, prioridade, fase e grupo para organizar a navegação.
- Hotsites de competição exibem todas as tabelas publicadas, agrupadas por fase e respeitando a ordem de grupos.
- Partidas do hotsite passam a ser organizadas por rodada/fase cadastrada, com seletor e navegação anterior/próxima.
- Cada partida exibida no hotsite é clicável e leva à página pública do jogo.
- As abas **Visão geral**, **Classificação** e **Jogos** são funcionais. Artilharia, Campeões e Arquivo ficam sinalizados como módulos futuros, sem comportamento decorativo enganoso.

### Compatibilidade

- Mantida a experiência aprovada do Go-Live 1.7.3 para Jogos do Dia e UX ao vivo.
- Mantida a base do Competition Hub 1.8.0.
- Nenhum hotsite de clube foi criado nesta etapa; a navegação para clubes permanece reservada para uma evolução posterior.

### Arquivos alterados

- `apps/obs-bridge/server.mjs`
- `apps/obs-bridge/public/portal/index.html`
- `apps/obs-bridge/public/competitions.html`
- `apps/obs-bridge/public/competitions.js`
- `apps/obs-bridge/test/golive181-competition-navigation.test.js`
- `RELATORIO-GO-LIVE-1.8.1.md`
