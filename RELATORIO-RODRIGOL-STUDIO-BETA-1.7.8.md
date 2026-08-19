# RodriGol Studio — Beta 1.7.8

## Escopo

Revisão da exibição operacional da rodada, com prioridade para o relógio da lateral, filtros editoriais e consistência entre partidas, eventos e rodapé.

## Alterações

### Relógio da barra lateral
- O payload publicado pela Multicabine agora envia `matchId`, `phase`, `elapsedSeconds`, `clockRunning` e `clockStartedAt`.
- O relógio lateral mantém uma âncora por partida e só aparece em primeiro tempo, segundo tempo e prorrogação.
- Republicações estruturais não devem mais reiniciar a contagem.

### Filtro da lateral por rodada
- Cada painel de jogos da sequência lateral recebeu um seletor de rodada.
- O operador pode manter “Todos os jogos” ou restringir o painel a uma rodada cadastrada.
- A preferência é persistida em `rodrigol-sidebar-sequence-v1`.

### Barra amarela
- Nova configuração de fonte: jogos do dia, jogos da rodada do scoreboard, ambos ou somente selecionados.
- Filtros independentes para programados, ao vivo e finalizados.
- Autores e minutos dos gols continuam anexados ao resumo quando disponíveis.

### Scoreboard
- Cards programados, ao vivo, intervalo e finalizados ganharam tratamentos visuais distintos, sem mudar dimensões ou proporções.

### Últimas Ações
- Informações personalizadas usam o texto preenchido pelo operador.
- Eventos sistêmicos usam “INÍCIO DE JOGO”, “INÍCIO DO 2º TEMPO”, “INTERVALO” e “FIM DE JOGO”.
- Eventos sistêmicos não exibem minuto artificial.
- A sigla cadastrada da competição tem prioridade.

### Rodapé editorial
- Comandos legados `ticker` e `side-alert` são desativados no Bridge e não são mais convertidos para `editorial-highlight`.
- O rodapé DESTAQUE continua reservado às centrais editoriais que publicam explicitamente em `editorial-highlight`.

## Arquivos principais alterados
- `apps/obs-bridge/public/data-store.js`
- `apps/obs-bridge/public/overlay-control.html`
- `apps/obs-bridge/public/overlay-control.js`
- `apps/obs-bridge/public/studio-regions.js`
- `apps/obs-bridge/public/multicabine.js`
- `apps/obs-bridge/server.mjs`
- `apps/overlay-studio/public/app.js`
- `apps/overlay-studio/public/styles.css`
- arquivos espelhados em `apps/overlay-studio/dist`

## Validação
- Todos os arquivos JavaScript e MJS em `apps` passaram por `node --check`.
- O OBS Bridge iniciou em porta de validação e `/health` respondeu com a versão `1.7.8`.
- A suíte do OBS Bridge teve 49 de 52 testes aprovados. Os três testes restantes verificam contratos históricos removidos nesta versão (breaking ticker/side alert legado e formatos exatos de estado anteriores). Não indicaram erro de sintaxe ou falha de inicialização.
- Os workspaces TypeScript `football` e `overlay` continuam com erros pré-existentes de resolução de pacotes internos e não fazem parte desta entrega.

## Homologação recomendada
1. Publicar uma competição na lateral com “Todos os jogos”.
2. Selecionar uma rodada específica e republicar.
3. Iniciar uma partida e conferir o relógio no scoreboard e na lateral por pelo menos dois minutos.
4. Passar para intervalo, segundo tempo e final.
5. Testar a barra amarela em cada uma das quatro fontes.
6. Registrar uma informação personalizada, como “Pênalti desperdiçado”.
7. Confirmar que comandos esportivos não alteram o rodapé DESTAQUE.
