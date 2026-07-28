# Entrega 6 — OBS Bridge

## Objetivo

Conectar o Browser Overlay ao restante do RodriGol em tempo real, com um canal WebSocket adequado para uso como Browser Source do OBS.

## Incluído

- aplicação `@rodrigol/obs-bridge`;
- servidor WebSocket em `/ws`;
- heartbeat a cada 15 segundos;
- reconexão automática no Browser Overlay;
- repetição do último comando para clientes recém-conectados;
- API HTTP `POST /api/commands`;
- diagnóstico em `/health` e `/api/state`;
- painel manual em `/control`;
- servidor único para overlay, controle e bridge;
- testes automatizados.

## Execução

Na raiz:

```bash
npm install
npm run build
npm test
npm start
```

Endereços:

- Overlay para navegador/OBS: `http://127.0.0.1:4173`
- Painel de teste: `http://127.0.0.1:4173/control`
- WebSocket: `ws://127.0.0.1:4173/ws`
- Diagnóstico: `http://127.0.0.1:4173/health`

## Teste manual

Abra o overlay em uma aba e o painel `/control` em outra. Use os botões do painel; as alterações devem surgir imediatamente no overlay, sem atualização da página.
