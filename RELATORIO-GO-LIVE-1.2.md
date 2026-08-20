# RodriGol Studio — Go-Live 1.2

## Objetivo

Blindar a operação online contra perda de dados, reinícios do servidor, falhas temporárias de rede e conflitos entre a base central e estados locais antigos.

## Entregas

- sessão administrativa assinada e stateless: permanece válida após restart/redeploy enquanto a senha administrativa não mudar e o TTL não expirar;
- persistência atômica continua em `/data/rodrigol-store.json`;
- backup automático no volume após alterações, com retenção dos 20 backups mais recentes;
- backup obrigatório da base existente antes de qualquer importação manual;
- recuperação automática pelo backup mais recente se o arquivo principal estiver corrompido;
- endpoint autenticado `/api/data/status` com quantidade de registros, revisão, última gravação e quantidade de backups;
- `/health` também publica diagnóstico resumido da base central;
- proteção de migração: uma base central suspeitamente vazia não apaga automaticamente uma base local muito maior;
- fila de repetição para gravações remotas que falhem temporariamente;
- importação online agora grava primeiro no servidor e só depois substitui o estado do navegador;
- exportação online passa a usar a base central como fonte do backup;
- Central de Armazenamento exibe registros/revisão da base central e horário da última gravação.

## Testes

- 5 testes específicos Go-Live 1.2 aprovados;
- suíte completa do OBS Bridge: 108 testes aprovados, 0 falhas;
- verificação de sintaxe dos arquivos alterados aprovada.

## Teste de aceitação recomendado após deploy

1. Conferir em Armazenamento que o servidor mostra aproximadamente a quantidade atual de registros centrais.
2. Alterar uma partida no Edge e validar no Chrome e celular sem reimportar backup.
3. Registrar um gol e aguardar a atualização nos demais dispositivos.
4. Fazer redeploy controlado no Railway.
5. Confirmar que partidas, eventos, placares e escalações continuam presentes.
6. Confirmar que a sessão administrativa continua válida após o redeploy.
7. Iniciar uma partida de data anterior e validar que ela aparece no Portal enquanto estiver ao vivo.

## Arquivos deste patch

- `apps/obs-bridge/server.mjs`
- `apps/obs-bridge/public/data-store.js`
- `apps/obs-bridge/public/storage.js`
- `apps/obs-bridge/test/golive12-operational-safety.test.js`
- `RELATORIO-GO-LIVE-1.2.md`
