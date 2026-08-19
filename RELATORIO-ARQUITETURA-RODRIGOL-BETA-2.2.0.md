# Relatório de Arquitetura — Beta 2.2.0

## Decisão principal
URLs, timeout, reconexão e token passam a pertencer ao Runtime Manager. Módulos não devem construir endereços fixos.

## Novos componentes
- `runtime-config.js`: configuração e ambientes.
- `bridge-client.js`: HTTP, comandos e WebSocket gerenciado.
- `storage-service.js`: fachada para persistência local/remota.
- `network.html/js`: observabilidade operacional.

## Fluxo remoto
Navegador → Runtime Manager → Bridge HTTP/WS → Overlay Studio.

## Segurança
Token bearer e CORS são opcionais localmente, mas recomendados na VPS. HTTPS deve ser terminado no proxy reverso.

## Próximas decisões
1. Banco persistente compartilhado.
2. Autenticação e permissões.
3. Sincronização multioperador com versionamento.
4. Backup e restauração automatizados.
