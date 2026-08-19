# RodriGol Broadcast Package 2.0 — Sprint 4

## Objetivo

Implementar o blueprint aprovado para a área principal do overlay oficial, preservando a grade fixa, o motor de partidas e a fonte única de dados.

## Entregas

### Sumário da partida

O antigo story esquerdo foi removido. A área passa a exibir a cronologia oficial enviada pela Cabine no mesmo payload `scoreboard`.

- até oito eventos;
- minuto, ícone, autor e equipe/detalhe;
- estado vazio quando não houver eventos;
- nenhuma gravação ou nova região do Bridge.

### Jogo principal

A região central foi reorganizada com:

- escudos maiores;
- placar como elemento dominante;
- período e relógio preservados;
- autores dos gols abaixo de cada equipe;
- faixa fixa para fase, data, público, árbitro e clima;
- campos ainda não cadastrados aparecem como `—`.

### Destaques

O antigo story direito foi substituído por dois cards de destaques. Nesta primeira etapa eles são derivados dos autores dos gols do próprio jogo principal. Isso evita criar uma fonte editorial concorrente antes de existir um contrato oficial para esses cards.

### Escalações

A Cabine já armazenava escalações, mas elas não eram incluídas na publicação do jogo principal. O payload oficial agora inclui `lineups` e o overlay mostra:

- titulares de mandante e visitante;
- técnicos;
- formação quando disponível;
- campo tático compacto usando os números informados nas escalações.

Nenhuma segunda base de escalações foi criada.

### Scoreboard compacto

A faixa dos demais jogos foi reduzida visualmente para se aproximar do blueprint aprovado. A região e o payload `round-scoreboard` permanecem os mesmos.

## Segurança de dados

Fluxo mantido:

```text
Cabine
  → cobertura oficial
  → payload scoreboard
  → Bridge
  → overlay oficial
```

Sumário, destaques e escalações são apenas diferentes apresentações do mesmo payload oficial. Não publicam comandos e não gravam dados.

## Arquivos alterados

- `apps/overlay-studio/public/index.html`
- `apps/overlay-studio/public/styles.css`
- `apps/overlay-studio/public/app.js`
- `apps/obs-bridge/public/control.js`
- `apps/overlay-studio/package.json`
- `apps/obs-bridge/package.json`
- `apps/obs-bridge/server.mjs`
- `apps/overlay-studio/dist/*` (gerado pelo build)

## Validação

- sintaxe de `app.js`: aprovada;
- sintaxe de `control.js`: aprovada;
- build do Overlay Studio: aprovado;
- Bridge inicializado: aprovado;
- 19 de 21 testes históricos do Overlay Studio aprovados.

Os dois testes restantes verificam contratos antigos de pré-jogo e relógio/lateral e já falhavam nas entregas anteriores.
