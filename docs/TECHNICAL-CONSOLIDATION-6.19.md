# RodriGol Studio — Consolidação Técnica + Administrativa 6.19

## Objetivo
Consolidar a base aprovada do Broadcast Package 2.0 sem alterar regras de transmissão, ao mesmo tempo em que as telas administrativas passam a compartilhar o mesmo shell visual e a validação técnica fica menos dependente de listas manuais.

## Revisão administrativa
- 23 telas administrativas auditadas.
- Todas carregam `design-system.css`, `admin-consolidation.css`, `global-nav.css` e `global-nav.js`.
- 9 telas legadas passaram a carregar o Design System comum: Agenda, Clubes, Competições, Mesa Editorial, Mata-mata, Partidas, Notícias, Rodadas e Classificações.
- Marca antiga `RODRIGOL TV` normalizada para `RODRIGOL STUDIO`.
- Rótulo antigo `SPRINT 5.3` removido da Central de Notícias.
- Nova camada `admin-consolidation.css` padroniza tipografia, campos, botões, avisos, espaçamento e comportamento responsivo, preservando o CSS funcional de cada módulo.

## Limpeza técnica
- O `check` do OBS Bridge deixou de listar arquivos JavaScript manualmente.
- Novo `scripts/check-public.mjs` valida automaticamente todos os `.js` públicos do Bridge e o `server.mjs`.
- O mesmo check audita a presença do shell visual comum em todas as telas HTML administrativas.
- Versões e descrições do pacote operacional atualizadas para 6.19.
- Nenhuma regra de negócio do Overlay, Cabine, Multicabine, classificação ou publicação foi alterada nesta etapa.

## Validação comparativa
### OBS Bridge
- `npm run check`: aprovado.
- Testes: 57/61.
- A 6.18.1 original também apresentou 57/61; portanto não houve regressão nova.

### Overlay Studio
- `npm run check`: aprovado.
- `npm run build`: aprovado.
- Testes: 29/33.
- A 6.18.1 original também apresentou 29/33; portanto não houve regressão nova.

## Dívida técnica identificada e não alterada nesta entrega
O `npm run check` na raiz também executa os packages TypeScript experimentais (`football`, `editorial` e `overlay`). Esses packages têm referências de workspace e tipos quebradas anteriores ao Broadcast Package atual. Eles não compõem o fluxo operacional que hoje roda Bridge + Overlay Studio.

A correção desses packages deve ser tratada como uma etapa arquitetural própria, para evitar misturar estabilização do produto atual com uma reestruturação de domínio experimental.

## Próxima sequência sugerida
1. Validar visualmente as telas administrativas principais no uso normal.
2. Corrigir inconsistências visuais encontradas sem alterar fluxo funcional.
3. Testar classificação ao vivo em uma rodada real.
4. Implementar substituições reais na Cabine/Multicabine.
5. Abrir uma etapa separada para a dívida dos packages TypeScript e consolidação definitiva do monorepo.
