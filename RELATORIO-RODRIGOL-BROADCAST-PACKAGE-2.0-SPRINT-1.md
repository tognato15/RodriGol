# RodriGol Broadcast Package 2.0 — Sprint 1

## Base

RodriGol Studio Beta 2.2.2 completo.

## Objetivo

Evoluir o overlay homologado sem criar uma segunda fonte de dados e sem alterar o motor operacional. Esta sprint modifica apenas o cabeçalho e a base visual do Broadcast Package.

## Alterações

### Cabeçalho compacto

- Altura reduzida de 9,5% para 7,2% da tela.
- Área útil abaixo do cabeçalho ampliada sem alterar a ordem dos módulos.
- Relógio, data, marca e status receberam tipografia menor e alinhamento mais preciso.
- O indicador de cobertura ao vivo foi movido para a extremidade direita.
- Bordas e sombras foram suavizadas.
- A estrutura continua fixa em 1920×1080 e também acompanha o dimensionamento proporcional atual.

### Participante da transmissão

Foi preparada uma área opcional no cabeçalho para:

- nome;
- perfil;
- foto ou iniciais.

Ela permanece escondida quando esses dados não são enviados. Os campos opcionais aceitos pelo comando `studio-topbar` são:

- `presenterName` ou `hostName`;
- `presenterHandle` ou `hostHandle`;
- `presenterPhoto` ou `hostPhoto`.

Os campos já existentes do cabeçalho continuam funcionando sem mudança.

### Broadcast Design System

Foi criado o arquivo:

`apps/overlay-studio/public/broadcast-design-system.css`

Ele inicia a padronização de:

- cores;
- grafites;
- tipografia;
- espaçamentos;
- sombras;
- altura oficial do cabeçalho.

### Fim do protótipo paralelo

O protótipo `/overlay-v2/` foi removido para evitar confusão operacional. O Broadcast Package passa a evoluir somente o overlay oficial existente.

Também foi removido o atalho experimental da Central do Overlay. A rota agora responde 404 e não existe um segundo consumidor visual apresentado ao operador.

## Áreas preservadas

Não foram alterados:

- motor da partida;
- cronômetros;
- placares;
- scoreboard;
- barra lateral;
- tela branca;
- barra amarela;
- rodapé;
- Cabine;
- Multicabine;
- publicações e regiões do Bridge;
- camada de armazenamento.

## Arquivos principais alterados

- `apps/overlay-studio/public/index.html`
- `apps/overlay-studio/public/app.js`
- `apps/overlay-studio/public/styles.css`
- `apps/overlay-studio/public/broadcast-design-system.css` (novo)
- `apps/obs-bridge/server.mjs`
- `apps/obs-bridge/public/overlay-control.html`
- `package.json`
- `package-lock.json`
- `apps/overlay-studio/package.json`

Removido:

- `apps/overlay-v2/`

## Validação

- Sintaxe de `app.js`: aprovada.
- Sintaxe de `server.mjs`: aprovada.
- Build do Overlay Studio: aprovado.
- Inicialização real do Bridge: aprovada.
- `/health`: versão `2.2.2-bp.1` confirmada.
- Overlay oficial: HTTP 200.
- Rota experimental removida: HTTP 404.
- Testes do Overlay Studio: 19 de 21 aprovados.

Os dois testes restantes verificam contratos históricos de relógio/lateral que já não correspondem literalmente ao código atual. Esta sprint não modificou essas áreas.

## Próxima sprint

Card do jogo principal, após homologação do cabeçalho no OBS.
