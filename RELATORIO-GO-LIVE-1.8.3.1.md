# RodriGol — Go-Live 1.8.3.1

## Integridade ao vivo e sincronização

Hotfix criado após a validação pública do Go-Live 1.8.3.

### Correções

- placar agregado de mata-mata passa a ser calculado a partir dos placares reais das partidas vinculadas e dos clubes de cada lado do confronto, independentemente de quem foi mandante em cada jogo;
- agregado público é atualizado também durante o segundo jogo, sem depender do valor consolidado salvo no cadastro do mata-mata;
- exclusão/anulação de gol na cobertura passa a ser autoritativa para eventos e goleadores públicos, evitando que um evento antigo volte pela consolidação do Portal;
- cache da página da partida aceita uma lista vazia de eventos como atualização válida, permitindo remover o último evento mostrado;
- cards de Jogos do Dia exibem minuto e período na coluna esquerda (ex.: `46'` e `2ºT`) e removem o período duplicado da direita;
- sincronização remota deixa de depender da disponibilidade do IndexedDB para enviar dados ao Railway;
- navegador com revisão local antiga, mas sem os registros centrais essenciais, força uma hidratação completa do servidor;
- polling de segurança entre navegadores reduzido para 10 segundos, mantendo WebSocket como caminho principal;
- o Studio passa a exibir estado de sincronização: sincronizando, sincronizado, pendente ou erro.

### Arquivos alterados

- `apps/obs-bridge/server.mjs`
- `apps/obs-bridge/public/portal/index.html`
- `apps/obs-bridge/public/data-store.js`
- `apps/obs-bridge/public/match-lifecycle.js`
- `apps/obs-bridge/public/global-nav.js`
- `apps/obs-bridge/test/golive1831-integrity-sync.test.js`

### Validação local

- Go-Live 1.8.3.1: 5/5
- regressão 1.8.3: 5/5
- regressão 1.8.2: 5/5
- regressão 1.8.1: 5/5
- regressão 1.8.0: 5/5
- regressão 1.7.3: 5/5

**Total: 30 testes aprovados, 0 falhas.**

### Teste manual recomendado após Railway

1. cadastrar uma partida no Chrome e confirmar que ela aparece no Edge;
2. editar essa partida no Edge e confirmar a atualização no Chrome;
3. registrar um gol, conferir Portal e Studio, apagar o gol e confirmar remoção em todas as superfícies;
4. abrir um confronto de ida e volta e validar o agregado durante o segundo jogo;
5. conferir no card público que minuto e período aparecem juntos à esquerda e que não há período duplicado à direita.
