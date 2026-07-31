# RodriGol — Relatório do Sprint 6.4

## Base utilizada

Pacote cumulativo `RodriGol-Sprint-6.3-COMPLETO.zip`, aprovado pelo usuário.

## Versão

`0.6.4`

## Objetivo

Encerrar o Sprint 6 com uma visão operacional consolidada e estabilizar o comportamento da fila dinâmica do ticker antes da pausa destinada à definição do overlay de teste.

## Entregas

### Central de Produção

Nova página disponível em:

`http://127.0.0.1:4173/control/production.html`

A página reúne em uma única visão:

- quantidade de coberturas ao vivo e em pré-jogo;
- estado das partidas e acesso rápido às cabines;
- últimos eventos registrados;
- resumo das pautas e notícias;
- prévia da fila ativa do ticker;
- situação do Bridge e quantidade de overlays conectados;
- atalhos para Multicabine, Ticker, Overlay e cadastro de partidas.

A Central de Produção foi adicionada à navegação dos ambientes principais.

### Estabilização do ticker

- confirmação de rotação automática entre todos os itens ativos;
- opção `Continuar repetindo` para giro permanente;
- opção `Ocultar após um giro` para impedir que a última informação permaneça indefinidamente;
- opção de publicação automática das alterações da fila;
- alterações de ativação, exclusão, ordem e inclusão podem atualizar o overlay automaticamente quando essa opção estiver habilitada;
- fila vazia ou ticker desabilitado envia comando de ocultação;
- compatibilidade preservada com publicação manual.

### Direção visual do ticker

O Sprint 6.4 não transforma ainda o overlay no modelo final do Soccer Saturday. A referência enviada foi registrada como direção para a pausa de definição do overlay de teste:

- faixa branca para acontecimentos da rodada;
- faixa informativa complementar;
- scoreboard superior;
- coluna lateral para resultados, classificação, escalações e informações.

Essa composição deverá ser definida após o encerramento do Sprint 6, sem antecipar uma interface definitiva neste pacote.

### Estatísticas

Nenhuma integração externa ou painel estatístico novo foi criado. A retirada do campo atual de estatísticas ao vivo permanece reservada para a preparação do overlay de teste, conforme combinado.

## Arquivos principais alterados

- `package.json`
- `apps/obs-bridge/package.json`
- `apps/obs-bridge/public/data-store.js`
- `apps/obs-bridge/public/ticker.html`
- `apps/obs-bridge/public/ticker.js`
- `apps/overlay/public/app.js`
- `apps/overlay/dist/app.js`
- páginas HTML de navegação

## Arquivos criados

- `apps/obs-bridge/public/production.html`
- `apps/obs-bridge/public/production.css`
- `apps/obs-bridge/public/production.js`

## Validação

- verificação de sintaxe do OBS Bridge: aprovada;
- build do Browser Overlay: aprovado;
- testes automatizados do OBS Bridge: 18 aprovados, 0 falhas;
- versão do pacote: `0.6.4`.
