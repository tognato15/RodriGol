# RodriGol Studio — Beta 2.2.1

## Objetivo

Correção emergencial do bloqueio de gravação provocado pelo esgotamento do `localStorage`, com proteção contra perda silenciosa de dados, backup completo e redução imediata do consumo de espaço.

## Correções implementadas

### 1. Proteção contra armazenamento cheio

O `data-store.js` agora identifica `QuotaExceededError` e erros equivalentes. Quando uma gravação falha:

- nenhum sucesso falso é exibido pelo fluxo normal;
- é emitido o evento `rodrigol:storage-error`;
- o erro é preservado na sessão;
- um aviso global aparece nas páginas do sistema;
- o operador recebe acesso direto à nova Central de Armazenamento.

### 2. Central de Armazenamento e Backup

Nova página:

`/control/storage.html`

Recursos:

- estimativa do uso do `localStorage`;
- uso por categoria;
- relação dos maiores registros;
- indicador de risco;
- exportação completa em JSON;
- importação e recuperação do backup;
- otimização segura de registros pesados.

### 3. Backup ampliado

O backup inclui:

- todas as chaves do `localStorage`;
- escudos de clubes do IndexedDB;
- logotipos de competições do IndexedDB;
- metadados de formato, versão e data.

### 4. Logotipos das competições no IndexedDB

Os logotipos deixaram de permanecer dentro do registro principal das competições no `localStorage`.

A migração é automática:

- imagens antigas são copiadas para `competition-logos` no IndexedDB;
- os metadados continuam síncronos no `localStorage`;
- a interface continua recebendo `logoDataUrl` sem mudança visual.

### 5. Histórico compactado

Antes de salvar o Histórico, o sistema remove cópias base64 incorporadas de:

- escudos;
- logotipos;
- imagens e fotos duplicadas.

Partidas, placares, eventos, anotações e vínculos são preservados.

### 6. Otimização manual segura

A nova página pode retirar imagens base64 duplicadas dos registros antigos, sem apagar competições, partidas, coberturas, classificações, mata-mata, notícias ou histórico.

## Arquivos principais alterados

- `apps/obs-bridge/public/data-store.js`
- `apps/obs-bridge/public/competitions.js`
- `apps/obs-bridge/public/global-nav.js`
- `apps/obs-bridge/public/storage.html`
- `apps/obs-bridge/public/storage.js`
- `apps/obs-bridge/public/storage.css`
- `apps/obs-bridge/server.mjs`
- `apps/obs-bridge/package.json`
- `package.json`

## Limites desta entrega

O Beta 2.2.1 elimina o bloqueio silencioso e reduz fortemente o consumo causado por imagens duplicadas. Ele ainda não transforma o servidor em banco de dados definitivo.

A próxima etapa arquitetural permanece:

1. banco persistente no servidor;
2. migração de partidas, competições e eventos;
3. sincronização entre computadores;
4. armazenamento remoto de imagens;
5. `localStorage` apenas como cache e preferências.

## Validação

- verificação de sintaxe do OBS Bridge: aprovada;
- versão atualizada para 2.2.1;
- ferramenta de backup e diagnóstico criada;
- migração automática de logos preparada;
- nenhuma regra de cronômetro, placar, classificação, mata-mata ou Overlay Studio foi alterada.
