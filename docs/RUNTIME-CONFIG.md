# Configuração de execução — Beta 2.0.1

O arquivo `apps/obs-bridge/public/runtime-config.js` centraliza os endereços usados pelo navegador. Por padrão, HTTP, WebSocket e interface usam o mesmo host atual. Em hospedagem remota, `globalThis.RODRIGOL_CONFIG` poderá sobrescrever `bridgeHttp`, `bridgeWs` e `overlayStudio` sem alterar os módulos de negócio.
