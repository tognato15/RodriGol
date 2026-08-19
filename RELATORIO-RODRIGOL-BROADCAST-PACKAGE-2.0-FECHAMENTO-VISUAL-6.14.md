# RodriGol Broadcast Package 2.0 — Fechamento Visual 6.14

## Alterações
- Ticker editorial reduzido em aproximadamente 17% adicionais na altura/tipografia.
- Escalações do card principal ampliadas em aproximadamente 10%.
- Quadro ★ Destaques do jogo principal removido do Overlay Studio.
- Tela de configuração ★ Destaques do jogo principal removida da Central do Overlay.
- O payload do jogo principal não publica mais `highlightConfig`.
- Área liberada pelo quadro Destaques foi incorporada ao card principal.
- Escudos normalizados por região em caixas fixas com `object-fit: contain`:
  - card principal: 88 x 88 px;
  - scoreboard horizontal: 32 x 32 px;
  - card de jogo da barra lateral: 40 x 40 px;
  - escalações principais: 30 x 30 px;
  - escalações da lateral: 26 x 26 px.
- Todos os escudos preservam proporção e ficam impedidos de invadir textos vizinhos.

## Validação
- Overlay Studio `npm run check`: aprovado.
- Overlay Studio `npm run build`: aprovado.
- OBS Bridge `npm run check`: aprovado.
- `public` e `dist` sincronizados.
