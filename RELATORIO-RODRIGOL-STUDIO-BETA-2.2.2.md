# RodriGol Studio — Beta 2.2.2

## Objetivo

Remover o limite prático do `localStorage`, criar persistência ampla e compartilhável e iniciar o Overlay 2.0 sem criar uma segunda fonte de verdade.

## Persistência ampla

- Dados operacionais `rodrigol-*` migrados automaticamente do `localStorage` para o IndexedDB (`data-records`).
- API síncrona existente preservada por cache em memória.
- Escrita local ampla por IndexedDB, sem o limite reduzido do `localStorage`.
- `localStorage` mantido somente para preferências pequenas e configuração de runtime.
- Backup e restauração passam a incluir `data-records`, escudos e logotipos.

## Persistência no servidor

O Bridge recebeu armazenamento JSON persistente e atômico em `apps/obs-bridge/data/rodrigol-store.json`.

Endpoints:

- `GET /api/data/snapshot`
- `GET /api/data/:key`
- `PUT /api/data/:key`
- `DELETE /api/data/:key`

Quando o armazenamento remoto está ativado, o navegador usa IndexedDB como cache local e o servidor como cópia compartilhada. Uma consulta periódica detecta atualizações de outros computadores.

## Overlay 2.0 experimental

Nova rota: `/overlay-v2/`.

Inclui protótipo de:

- cabeçalho compacto e participantes;
- stories/câmera;
- jogo principal;
- faixa automática de partidas ao vivo;
- últimas ações compactadas;
- lateral dividida;
- barra da rodada e rodapé editorial.

O Overlay 2.0 é estritamente somente leitura. Ele ignora mensagens de dados, não importa o motor do Studio e não publica comandos.

## Compatibilidade

- Overlay clássico preservado.
- Motor de partidas e cronômetros não alterados.
- Regiões canônicas preservadas.
- Migração automática dos dados locais.
