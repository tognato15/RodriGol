# RodriGol Studio — Beta 1.7.4

## Base

Versão produzida sobre o Beta 1.7.3.

## Correção prioritária: relógios dos jogos secundários

O relógio do jogo principal já possuía interpolação local. Os seis cards do scoreboard e os jogos da barra lateral, porém, exibiam somente o texto recebido na última publicação do Bridge. Isso fazia o tempo permanecer estático até uma nova republicação estrutural.

Foi criado um controlador visual compartilhado no Overlay Studio para relógios auxiliares:

- cada partida é identificada por `matchId`;
- o navegador guarda `elapsedSeconds`, fase, estado do relógio e instante da última sincronização;
- o tempo avança localmente entre publicações do Bridge;
- apenas os elementos do relógio são atualizados a cada 250 ms;
- os cards, escudos, placares, nomes e a lateral não são redesenhados a cada segundo;
- intervalo, final, programado, pré-jogo e jogo sem relógio continuam sem cronômetro;
- primeiro tempo, segundo tempo e prorrogação exibem o tempo, correndo ou pausado conforme o estado oficial.

Os payloads da barra lateral agora transportam também `matchId`, `phase`, `elapsedSeconds` e `clockRunning`, eliminando a dependência exclusiva do texto formatado em `clock`.

## Rodadas Inteligentes

O Editor de Rodadas foi ampliado com:

- progresso de jogos finalizados;
- total de partidas ao vivo e pendentes;
- situação operacional da rodada;
- estados Programada, Em preparação, Em andamento, Aguardando consolidação, Com pendência, Concluída e Arquivada;
- painel detalhado da rodada;
- acesso direto à Cabine, Editor de Partidas e Diagnóstico de Vínculos;
- botão para concluir a rodada, liberado quando todos os jogos estão finalizados e sem pendências;
- botão para arquivar a rodada sem excluir seus jogos ou resultados.

Uma partida finalizada sem `finishedAt` é destacada como pendência, ajudando a localizar resultados que ainda não foram consolidados corretamente.

## Arquivos alterados

- `apps/overlay-studio/public/app.js`
- `apps/obs-bridge/public/studio-regions.js`
- `apps/obs-bridge/public/multicabine.js`
- `apps/obs-bridge/public/rounds.js`
- `apps/obs-bridge/public/rounds.html`
- `apps/obs-bridge/server.mjs`
- `package.json`
- `apps/obs-bridge/package.json`
- `apps/overlay-studio/package.json`

## Validação executada

- verificação de sintaxe de todos os arquivos JavaScript e MJS em `apps`;
- inicialização real do OBS Bridge;
- resposta de `/health` com versão `1.7.4`;
- carregamento da página de Rodadas;
- verificação de integridade dos ZIPs.

## Homologação recomendada

1. Iniciar dois jogos com relógio.
2. Manter um como jogo principal e outro em um card do scoreboard.
3. Confirmar que ambos avançam sem depender de atualização manual.
4. Publicar o segundo jogo na barra lateral e confirmar o avanço do mesmo relógio.
5. Pausar o relógio e confirmar que ele permanece congelado, sem desaparecer.
6. Colocar no intervalo e confirmar que o tempo some.
7. Iniciar o segundo tempo e confirmar que o tempo reaparece e avança.
8. Finalizar e confirmar que o cronômetro desaparece no card e na lateral.
9. Abrir uma rodada e validar progresso, pendências, conclusão e arquivamento.
