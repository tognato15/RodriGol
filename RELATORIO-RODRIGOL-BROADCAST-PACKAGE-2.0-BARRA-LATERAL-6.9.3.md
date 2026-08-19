# RodriGol Broadcast Package 2.0 — Barra Lateral 6.9.4

## Objetivo
Corrigir a divergência de relógio/estado entre Cabine, scoreboard horizontal e card lateral e recuperar espaço útil na barra lateral.

## Correções
- O relógio auxiliar não soma mais `clockStartedAt` sobre um `elapsedSeconds` que já chegou efetivo do Bridge. Isso elimina a duplicação observada ao abrir a Central do Overlay ou trocar de Cabine/Multicabine.
- Scoreboard horizontal e card lateral passam a ancorar localmente o valor efetivo recebido da Cabine e seguem contando a partir dele.
- O payload lateral recebe um marcador explícito `isFinal`, derivado do estado oficial da partida.
- Cards editoriais encerrados exibem `FINAL`, mesmo se houver algum campo textual antigo ainda presente no objeto publicado.
- Os rodapés/paginadores visuais dos carrosséis superior e inferior foram removidos; a troca automática continua funcionando normalmente.
- O espaço antes ocupado pelos paginadores volta para o conteúdo dos dois carrosséis.

## Arquivos principais alterados
- `apps/overlay-studio/public/app.js`
- `apps/overlay-studio/public/styles.css`
- `apps/obs-bridge/public/studio-regions.js`
- `apps/obs-bridge/public/multicabine.js`

## Verificações
- Sintaxe dos arquivos alterados: aprovada.
- Testes específicos 6.9.4: 3/3 aprovados.
- Build do Overlay Studio: aprovado.
- Suíte geral do Overlay Studio: mantém 2 falhas legadas já existentes.
- Suíte geral do OBS Bridge: mantém 4 falhas legadas já existentes.
