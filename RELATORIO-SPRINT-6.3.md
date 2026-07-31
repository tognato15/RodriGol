# RodriGol — Relatório do Sprint 6.3

## Base utilizada

Pacote cumulativo `RodriGol-Sprint-6.2-COMPLETO.zip`, aprovado pelo usuário.

## Versão

`0.6.3`

## Objetivo

Criar a primeira versão operacional do grande ticker dinâmico do RodriGol, inspirado na lógica de fila contínua do Soccer Saturday, e aproximar o Banco Histórico do padrão visual das demais páginas em produção.

## Implementações

### Central do Ticker

Nova página disponível em:

`http://127.0.0.1:4173/control/ticker.html`

Recursos:

- fila contínua de informações;
- inclusão manual de itens;
- identificação por competição, partida, evento, minuto e responsável;
- prioridade editorial;
- ativação e pausa individual de itens;
- reordenação da fila;
- exclusão individual;
- configuração do intervalo de rotação;
- nome configurável da tarja;
- publicação completa da fila no overlay;
- ocultação do ticker;
- diagnóstico do Bridge;
- persistência local da fila.

### Integração com a Cabine

Eventos registrados com a opção “Exibir no ticker” agora entram automaticamente na fila editorial do ticker.

São preservados:

- competição;
- partida;
- tipo do evento;
- minuto;
- jogador ou responsável;
- detalhes;
- prioridade.

A publicação imediata no overlay continua ocorrendo quando a partida está no ar.

### Overlay

O overlay passou a aceitar uma lista de itens e alterná-los automaticamente no intervalo definido pela Central do Ticker.

O comportamento anterior de exibição de texto único foi preservado para compatibilidade.

### Banco Histórico

A página de Histórico passou a carregar a base visual compartilhada da Central de Coberturas e recebeu a mesma organização de navegação, incluindo o acesso à Central do Ticker.

### Navegação

Foi adicionado acesso à Central do Ticker nas principais páginas operacionais e editoriais.

## Estatísticas

Nenhuma integração de estatísticas externas foi adicionada. O projeto continua sem dependência de API esportiva, conforme decisão do usuário.

O painel de estatísticas ao vivo permanece nesta versão e será retirado na pausa planejada ao final do Sprint 6, durante a preparação do overlay de teste.

## Validação

- sintaxe de `control.js`: aprovada;
- sintaxe de `ticker.js`: aprovada;
- sintaxe de `data-store.js`: aprovada;
- sintaxe do overlay: aprovada;
- sintaxe de `server.mjs`: aprovada;
- build do Browser Overlay: aprovado;
- testes do OBS Bridge: 18 aprovados, 0 falhas.

## Arquivos principais modificados

- `apps/obs-bridge/public/data-store.js`
- `apps/obs-bridge/public/control.js`
- `apps/obs-bridge/public/ticker.html`
- `apps/obs-bridge/public/ticker.css`
- `apps/obs-bridge/public/ticker.js`
- páginas HTML de navegação do painel;
- `apps/overlay/public/app.js`
- `apps/overlay/dist/app.js`
- arquivos de versão e servidor.
