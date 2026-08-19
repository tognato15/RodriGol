# Relatório — RodriGol Studio Beta 2.2.0

## Base
Beta 2.1.0 completo.

## Entregas
- Runtime Manager centralizado e migrador da configuração Beta 2.1.
- Cliente HTTP único com timeout, token opcional e mensagens de erro consistentes.
- WebSocket gerenciado com reconexão exponencial e reaplicação automática de configuração.
- Página **Rede e Conexões** com Bridge, WebSocket, latência, memória, publicações e ambiente.
- Endpoints `/api/network`, `/api/runtime-config` e preparação de `/api/storage/:namespace`.
- Proteção opcional da API com `RODRIGOL_API_TOKEN`.
- Restrição configurável de origem via `RODRIGOL_ALLOWED_ORIGIN`.
- Ambientes local, desenvolvimento, homologação e produção.
- `.env.example`, manual de VPS e manual do operador.
- Overlay Studio preparado para ler a URL WebSocket centralizada.

## Limites atuais
A camada de storage remoto é preparatória e mantém dados apenas em memória do processo. Banco persistente, autenticação de usuários e sincronização multioperador continuam para a próxima fase.
