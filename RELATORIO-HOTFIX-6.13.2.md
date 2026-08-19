# Hotfix 6.13.2 — Reconexão do Overlay ao Bridge

## Causa
A versão 6.13 removeu a antiga animação horizontal do lower third editorial, porém o bootstrap do Overlay Studio ainda chamava `updateHighlightMotion`. Como a função já não existia, o JavaScript lançava `ReferenceError` antes de executar `connectBridge()`. O overlay carregava a interface, mas não recebia nenhuma atualização das Cabines.

## Correções
- removidas as chamadas obsoletas a `updateHighlightMotion`;
- `connectBridge()` volta a ser executado no bootstrap;
- removida a ativação do modo demonstrativo `?demo=1` da versão operacional;
- placeholders iniciais do jogo principal foram neutralizados para não parecerem dados reais se o Bridge estiver desconectado;
- Overlay Studio recompilado para `dist` após as correções.

## Validação
- `npm run check` do Overlay Studio: aprovado;
- `npm run build` do Overlay Studio: aprovado;
- `node --check dist/app.js`: aprovado.
