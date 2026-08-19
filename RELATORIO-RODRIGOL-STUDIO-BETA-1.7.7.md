# RodriGol Studio — Beta 1.7.7

## Base

Produzido a partir do RodriGol Studio Beta 1.7.6.

## Centro Operacional da Cabine

O painel lateral **Outros Jogos** foi substituído por **Centro Operacional**.

A lista principal agora exclui partidas finalizadas e prioriza:

1. partidas ao vivo;
2. partidas no intervalo;
3. partidas em preparação ou com início em até 30 minutos;
4. demais partidas programadas.

Cada card apresenta:

- estado operacional;
- clubes e placar;
- relógio quando aplicável;
- último acontecimento registrado;
- ação para abrir ou assumir a cobertura;
- ação para colocar a partida no ar.

## Troca rápida

Ao usar **Colocar no ar** em outro jogo, a Cabine:

- define a partida como ativa;
- define a partida como saída principal;
- abre a Cabine correspondente;
- publica o placar principal e sincroniza as regiões do Studio.

## Partidas finalizadas

As partidas finalizadas não ocupam mais a lista operacional principal.

O painel recebeu:

- seção recolhível **Finalizados hoje**;
- atalho **Abrir Arquivo Operacional**;
- abertura direta do Editor de Partidas com o filtro de finalizadas.

O arquivo reutiliza a estrutura já existente no Editor de Partidas, preservando resultados, classificação, mata-mata, histórico e vínculos.

## Rodadas e fluxo único

Foram preservados os recursos existentes de:

- conclusão e arquivamento de rodadas;
- bloqueio por jogos não finalizados ou pendências;
- consolidação automática ao encerrar a cobertura;
- sincronização de resultado oficial, classificação e mata-mata;
- remoção de partidas finalizadas das visões operacionais.

## Desempenho

O Centro Operacional usa uma única leitura organizada por ciclo de atualização e limita a renderização principal aos jogos que ainda exigem operação. Partidas encerradas ficam recolhidas.

## Arquivos alterados

- `apps/obs-bridge/public/control.js`
- `apps/obs-bridge/public/index.html`
- `apps/obs-bridge/public/control.css`
- `apps/obs-bridge/public/matches.js`
- `apps/obs-bridge/server.mjs`
- `package.json`
- `apps/obs-bridge/package.json`
- `apps/overlay/package.json`
- `apps/overlay-studio/package.json`

## Validação

- Sintaxe de `control.js`: aprovada.
- Sintaxe de `matches.js`: aprovada.
- Sintaxe de `server.mjs`: aprovada.
- Inicialização real do OBS Bridge: aprovada.
- Endpoint `/health`: versão `1.7.7` confirmada.

## Checklist de homologação

1. Abrir a Cabine com dois ou mais jogos ao vivo.
2. Confirmar que jogos ao vivo aparecem antes dos programados.
3. Usar **Assumir** para trocar de Cabine.
4. Usar **Colocar no ar** e verificar o jogo principal no overlay.
5. Finalizar uma partida e confirmar que ela sai da lista principal.
6. Abrir **Finalizados hoje**.
7. Abrir o **Arquivo Operacional** e confirmar o filtro de finalizadas.
