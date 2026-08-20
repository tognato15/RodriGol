# RodriGol Studio — Go-Live 1.5.1

## Objetivo

Hotfix de latência operacional após medição real no Edge. A Go-Live 1.5 reduziu o tráfego do teste de rodada de 40,9 MB para 6,8 MB, porém várias chamadas `commands` ainda chegaram a 7–13 segundos e algumas gravações da base central continuaram concorrendo com a publicação do overlay.

## Correções

### 1. Fast Commands em lote

- `bridge-client.js` passa a oferecer `publishCommands()`.
- Novo endpoint `POST /api/commands/batch` no Bridge.
- `publishStudioLiveUpdate()` envia `round-scoreboard` + `live-events` em uma única requisição HTTP.
- `publishStudioSnapshot()` envia as cinco regiões do snapshot em uma única requisição HTTP.
- O Bridge continua criando e transmitindo um envelope WebSocket individual por região, preservando o contrato do Overlay Studio.

### 2. Persistência central sem bloquear a resposta HTTP

Antes, cada `PUT /api/data/:key` esperava a gravação completa de `rodrigol-store.json` no volume antes de responder ao navegador. Em sequência de gols/transições isso criava fila de I/O e podia atrasar também os comandos de overlay.

Agora:

- a atualização entra imediatamente na memória central;
- a mudança é transmitida por WebSocket/SSE imediatamente;
- o navegador recebe HTTP 202 sem aguardar a escrita física do arquivo;
- gravações próximas são agrupadas por uma janela curta de 120 ms;
- o arquivo persistente continua sendo gravado de forma serial e atômica;
- backups automáticos permanecem ativos;
- importação de backup continua aguardando persistência antes de confirmar sucesso.

### 3. Instrumentação de comandos

As respostas de `/api/commands` e `/api/commands/batch` agora incluem `serverTimingMs`, permitindo separar tempo gasto dentro do Bridge do tempo de fila/rede observado no navegador.

## Compatibilidade

- Sem alteração no formato dos envelopes WebSocket existentes.
- Sem alteração na lógica de placar, relógio, mata-mata ou pênaltis.
- `public-match-data` continua fora do update urgente de cada lance e entra apenas no snapshot consolidado.

## Validação

- Bridge: 129 testes aprovados, 0 falhas.
- Go-Live 1.5.1: 4 testes específicos aprovados.
- Portal: check aprovado.
- Overlay Studio: 41 testes aprovados.
- Preflight operacional aprovado.

## Teste de produção recomendado

Repetir no Edge o cenário já medido:

1. limpar a aba Network;
2. colocar partida em andamento;
3. registrar gols/transições;
4. finalizar;
5. comparar quantidade de requests, MB transferidos e principalmente duração de `commands`.

Referência anterior da Go-Live 1.5: 51 requests / 6,8 MB, com `commands` chegando a 13,03 s.
