# Relatório — RodriGol Broadcast Package 2.0 · Sprint 2

## Base

- Base utilizada: Broadcast Package 2.0 · Sprint 1.
- Overlay oficial preservado.
- Nenhuma nova rota de overlay foi criada.
- Nenhuma região, payload ou publicador do Bridge foi alterado.

## Objetivo

Refinar visualmente o componente **Jogo Principal**, preservando integralmente a lógica já homologada de placar, fase, relógio, escudos, autores dos gols e local da partida.

## Alterações visuais

### Hierarquia

- placar central ganhou maior protagonismo;
- escudos foram ampliados;
- nomes dos clubes receberam hierarquia mais equilibrada;
- fase foi transformada em marcador compacto;
- relógio ganhou caixa própria, sem alteração em sua lógica;
- estádio/local passou a ter identificação visual discreta;
- autores dos gols foram organizados como resumo de cada equipe.

### Broadcast Design System

Foram adicionados tokens para:

- tamanho do placar principal;
- tamanho dos escudos;
- tamanho dos nomes;
- raio dos painéis.

Também foram criadas classes específicas do componente BP Main Match, mantendo as classes e IDs históricos exigidos pelo JavaScript.

## Compatibilidade operacional

Foram preservados, sem duplicação, os IDs:

- `mainCompetition`
- `mainStatus`
- `homeCrest`
- `homeName`
- `homeScorers`
- `mainPeriod`
- `homeScore`
- `awayScore`
- `mainClock`
- `mainVenue`
- `awayName`
- `awayScorers`
- `awayCrest`
- `mainMatchMessage`

Não foram modificados:

- Cabine;
- Multicabine;
- Central do Overlay;
- motor da partida;
- regras do relógio;
- scoreboard da rodada;
- barra lateral;
- tela branca;
- barra amarela;
- rodapé editorial;
- armazenamento.

## Versões

- Overlay Studio: `2.0.0-bp.2`
- Bridge: `2.2.2-bp.2`

## Validação

- `npm run build` do Overlay Studio: aprovado;
- `npm run check` do Overlay Studio: aprovado;
- sintaxe do Bridge: aprovada;
- Bridge iniciado e `/health` respondeu com a versão correta;
- todos os IDs operacionais do jogo principal foram verificados como únicos;
- testes históricos: 19 de 21 aprovados.

Os dois testes restantes são contratos antigos já existentes na base, relacionados ao formato anterior de partidas programadas e ao relógio/lateral. Nenhuma dessas lógicas foi alterada nesta sprint.
