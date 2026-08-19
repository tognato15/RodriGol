# Auditoria técnica — RodriGol Studio Beta 1.6.1.3

## Situação atual do projeto

O projeto está no ciclo **Beta 1.6**, com a base operacional já formada:

- CMS local para clubes, competições, partidas, rodadas, classificações e mata-mata;
- Cabine de Cobertura e Multicabine;
- Central do Overlay e Overlay Studio;
- Agenda esportiva e jornadas de cobertura;
- classificação automática/oficial/ao vivo;
- Central Inteligente de Produção;
- operação em tempo real via OBS Bridge e WebSocket.

A fase atual não é mais de protótipo visual. É uma fase de **consolidação arquitetural e estabilidade operacional**, especialmente de relógios, estados de partida, persistência e sincronização entre telas.

## Verificação da pasta

### Pontos positivos

- Estrutura em npm workspaces organizada em `apps/*` e `packages/*`.
- Os três aplicativos visuais/operacionais possuem scripts de start, check, build e test.
- O OBS Bridge possui 35 testes que passaram.
- O Browser Overlay possui 7 testes que passaram.
- O Overlay Studio possui 21 testes que passaram.
- Não foram encontrados `node_modules`, caches, logs, backups, arquivos temporários ou lixo de sistema dentro do ZIP.
- `apps/overlay/public` e `apps/overlay/dist` estavam sincronizados no momento da auditoria.

### Problemas encontrados

1. **`npm test`, `npm run check` e `npm run build` falham no conjunto completo.**
   - Os pacotes TypeScript `football` e `overlay` não resolvem corretamente `@rodrigol/core` e `@rodrigol/editorial`.
   - Há erros derivados de tipos-base não encontrados (`id`, `value`, `recordDomainEvent`, `AggregateRoot`, `ValueObject`).
   - Os testes dos aplicativos passam, mas a validação global termina com código de erro 2.

2. **Não existe `package-lock.json`.**
   - Instalações futuras podem usar versões diferentes e gerar comportamentos distintos.

3. **Não existia `.gitignore`.**
   - A versão limpa recebeu um arquivo conservador para evitar inclusão de cache, logs, `node_modules` e builds regeneráveis.

4. **Versões divergentes.**
   - A raiz está em 1.6.1.3, mas alguns pacotes e respostas `/health` ainda usam números antigos como 0.8.0-beta.1.1, 0.2.0 e 0.1.1.

5. **Dois overlays visuais diferentes coexistem.**
   - `apps/overlay` é o Browser Overlay servido pelo Bridge em 4173.
   - `apps/overlay-studio` é o overlay usado em 4174.
   - Isso aumenta o risco de uma correção ser feita em um overlay e não no outro.

6. **Risco de build antigo.**
   - O Bridge serve `apps/overlay/dist`, enquanto o desenvolvimento ocorre em `apps/overlay/public`.
   - Uma alteração sem `npm run build` pode não aparecer no overlay servido pelo Bridge.

7. **Os testes do Overlay Studio são majoritariamente testes estáticos.**
   - Eles procuram trechos de texto e expressões regulares nos arquivos.
   - Confirmam que o código existe, mas não comprovam o comportamento real do relógio no navegador durante transições.

## Limpeza realizada

Removido:

- `apps/overlay-studio/dist/`

Motivo: era uma cópia idêntica de `apps/overlay-studio/public/`, e o servidor de `overlay-studio` usa diretamente a pasta `public`. Portanto, esse `dist` não participava da execução.

Não removido:

- pastas `test/`: todos os testes são chamados por `npm test` nos respectivos workspaces;
- `apps/overlay/dist/`: é utilizado diretamente pelo OBS Bridge;
- `packages/*/dist/`: são artefatos gerados, mas foram mantidos porque os builds TypeScript estão atualmente quebrados e removê-los poderia inviabilizar importações já compiladas.

## Mapeamento dos cronômetros

Hoje o relógio é calculado ou reinterpretado em vários lugares:

1. `apps/obs-bridge/public/control.js`
   - fonte operacional principal;
   - usa `phase`, `elapsedSeconds`, `clockRunning` e `clockStartedAt`;
   - calcula `effectiveElapsed()`;
   - publica atualizações frequentes do scoreboard.

2. `apps/obs-bridge/public/multicabine.js`
   - recalcula o tempo das coberturas e publica relógios sem abrir a cabine.

3. `apps/obs-bridge/public/overlay-control.js`
   - recalcula `elapsed()` novamente;
   - cria payloads diferentes para jogo principal, scoreboard e lateral;
   - mantém campos `clock`, `clockVisible` e `finalClock`.

4. `apps/overlay-studio/public/app.js`
   - recebe um relógio já calculado;
   - cria outra âncora local (`mainClockAnchorSeconds`, `mainClockAnchorAt`);
   - cria um `setInterval` local para continuar avançando o relógio.

5. `apps/obs-bridge/server.mjs`
   - faz merge parcial de payloads na memória por região;
   - valores antigos podem permanecer quando um campo deixa de ser enviado, em vez de ser explicitamente limpo.

### Causas prováveis dos bugs

- Há mais de uma fonte calculando o mesmo tempo.
- `phase`, `period`, `status`, `clockVisible` e `clockRunning` podem divergir.
- O merge parcial do Bridge conserva campos antigos, inclusive relógios.
- `FINAL`, `HALFTIME` e `LIVE_UNKNOWN` não são tratados de forma idêntica em todos os módulos.
- A troca para o segundo tempo altera `phase`, reinicia ou reposiciona `elapsedSeconds`, registra evento e publica o overlay em etapas distintas.
- Atualizações por segundo da Cabine, Multicabine e Central do Overlay podem disputar a última gravação/publicação.
- O Overlay Studio cria um relógio derivado localmente sobre um relógio já derivado no sistema.
- Não há um teste funcional com navegador simulando o ciclo completo da partida.

## Próximos passos recomendados

### Prioridade 1 — Motor único de estado e relógio

Criar um módulo compartilhado com:

- enum canônico de fase;
- função única `deriveMatchPresentation()`;
- função única `getEffectiveElapsedSeconds()`;
- regra única de visibilidade do relógio;
- payload canônico para Cabine, Multicabine, Overlay e lateral.

O relógio deve ter **uma fonte de verdade**. O overlay pode interpolar visualmente entre sincronizações, mas não pode decidir a fase nem reconstruir regras próprias.

### Prioridade 2 — Corrigir os workspaces TypeScript

- configurar referências de projeto ou paths no TypeScript;
- garantir ordem de build `core → football → editorial → overlay`;
- fazer `npm run check`, `npm run build` e `npm test` terminarem com sucesso na raiz.

### Prioridade 3 — Testes funcionais reais

Adicionar Playwright ou testes equivalentes para:

- Programado → Pré-jogo → 1º tempo;
- pausa e retomada;
- intervalo sem relógio;
- 2º tempo com indicação correta;
- ao vivo sem relógio;
- final sem relógio;
- troca do jogo principal;
- reconexão do WebSocket;
- atualização simultânea pela Cabine e Multicabine;
- lista de eventos sem desaparecer temporariamente.

### Prioridade 4 — Persistência e migração

- adicionar versão do schema do localStorage;
- criar migrações explícitas;
- substituir imagens em base64 por armazenamento mais apropriado;
- preparar IndexedDB ou banco no servidor;
- criar backup automático e restauração validada.

### Prioridade 5 — Consolidar o overlay

Definir qual é o overlay oficial e reduzir a duplicação entre `apps/overlay` e `apps/overlay-studio`.

## Outras questões para o Cursor investigar

1. Por que a Central de Produção executa `render()` completo a cada 5 segundos, mesmo sem mudança de dados?
2. Quantos `setInterval` permanecem ativos simultaneamente em Cabine, Multicabine, Central do Overlay, Central de Produção e Overlay Studio?
3. Existe condição de corrida entre publicações da Cabine, Multicabine e Central do Overlay?
4. O merge de `regionState` no Bridge deveria aceitar um marcador explícito para apagar campos antigos?
5. Por que `finalClock` ainda existe se a regra aprovada é não exibir relógio em partidas finalizadas?
6. A função de evento duplicado é idempotente após recarregar a página ou apenas durante a sessão atual?
7. A tabela de últimas ações pode receber payload vazio temporário e substituir o cache visual?
8. A atualização da classificação ao vivo recalcula toda a tabela em cada tick de relógio, mesmo sem mudança de placar?
9. O armazenamento de escudos em base64 continuará escalando para centenas/milhares de clubes?
10. Há validação referencial ao excluir clube, competição, fase, rodada ou partida?
11. Há conflito entre `status` da partida cadastrada e `phase` da cobertura?
12. As datas usam horário local ou UTC de forma consistente? `toISOString().slice(0,10)` pode mudar o dia em determinados horários/fusos.
13. Por que as versões de `/health`, package.json e UI não são obtidas de uma fonte única?
14. O servidor deve servir `public` ou `dist`; qual fluxo oficial evita build antigo?
15. Os listeners `storage` e `rodrigol:data-changed` podem disparar renderizações duplicadas para a mesma alteração?
