# Hotfix 6.13.1

A versão 6.13 alterava os arquivos-fonte em `apps/overlay-studio/public`, porém o diretório compilado `apps/overlay-studio/dist` permaneceu da versão anterior. O servidor do Overlay Studio entrega `dist`, portanto a interface exibida podia ficar presa no conteúdo estático antigo e não refletir corretamente a publicação do Bridge.

Correção:
- Overlay Studio recompilado após as alterações 6.13.
- `dist/index.html`, `dist/app.js` e `dist/styles.css` agora correspondem ao código-fonte 6.13.
- Mantidas as mudanças aprovadas de Feed Limpo e Lower Third Editorial.
- Check e build aprovados.
