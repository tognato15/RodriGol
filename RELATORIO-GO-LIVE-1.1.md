# RodriGol Go-Live 1.1 — Base Central + Live Multidiário

## Correções

### 1. Produção deixa de depender do navegador
- em domínio remoto, `remoteStorageEnabled` passa a ser obrigatório;
- Cabine/Studio sincronizam dados com a base persistente do servidor;
- snapshots remotos passam a ser a fonte de verdade e removem dados locais obsoletos;
- alterações feitas em Edge/Chrome/outro dispositivo são propagadas via servidor e polling.

### 2. Importação de backup para produção
- novo endpoint autenticado `POST /api/data/import-backup`;
- a tela Armazenamento e Backup envia o backup completo para o servidor quando usada em produção;
- `data-records`, escudos e logos são gravados no volume persistente `/data`;
- navegadores novos deixam de precisar importar o mesmo backup individualmente.

### 3. Jogos ao vivo de datas anteriores
- a Home pública une os jogos da data consultada com todas as partidas atualmente ao vivo;
- uma partida cadastrada em dia anterior que seja iniciada passa a aparecer no Portal e no ticker ao vivo;
- ao finalizar, ela deixa de ser incluída automaticamente fora de sua data.

### 4. Infraestrutura preservada
- Railway com `drainingSeconds` numérico;
- `package-lock.json` sincronizado;
- dependências dos workspaces internos corrigidas para `2.0.0-alpha.1`.

## Overlay online
No serviço `obs-bridge`, o Overlay Studio é servido em `/studio/`.

## Validação
- 103 testes do Bridge aprovados;
- 41 testes do Overlay aprovados;
- Portal/preflight aprovados;
- importação real do backup de 9,5 MB validada localmente: 581 registros persistidos;
- simulação de partida de data anterior iniciada ao vivo apareceu corretamente na Home pública.
