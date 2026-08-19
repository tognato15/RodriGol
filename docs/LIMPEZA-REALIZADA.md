# Limpeza realizada

- Removido `apps/overlay-studio/dist/`: cópia gerada e não utilizada pelo servidor do Overlay Studio.
- Adicionado `.gitignore` para impedir inclusão futura de artefatos locais.
- Nenhuma pasta `test/` foi removida, pois todas são chamadas pelos scripts de teste dos workspaces.
- `apps/overlay/dist/` foi preservado porque é servido pelo OBS Bridge.
- `packages/*/dist/` foi preservado temporariamente porque o build TypeScript global está quebrado.
