# RodriGol Portal — Go-Live 1

## Objetivo
Preparar a RC2B.4.2 para sair de `127.0.0.1` e rodar em serviço público HTTPS.

## Alterações técnicas
- `RODRIGOL_DATA_DIR` permite separar dados persistentes do código.
- Em ambiente Railway, o servidor assume `0.0.0.0` quando `HOST` não estiver definido.
- Dockerfile de produção.
- `railway.json` com healthcheck `/health`.
- modelo de variáveis de produção.
- volume planejado para `/data`.
- checker `npm run check:golive`.

## O que não mudou
- Portal;
- Cabine;
- partidas;
- placares;
- classificação;
- notícias;
- Destaques do Portal;
- Overlay.

## Arquitetura inicial
Produção na nuvem e desenvolvimento local.

Isso reduz o risco de uma atualização em desenvolvimento derrubar diretamente o Portal público.
