# RELATÓRIO — GO-LIVE 1.8.3.2

## Eventos canônicos e prorrogação

Hotfix criado após validação real da rodada de 25/08/2026.

### Correções
- Corrige reconstrução da cronologia após editar/excluir eventos: os contadores de pênaltis agora são inicializados antes do replay dos eventos. Isso evita falha silenciosa que mantinha gols antigos na cabine e no Portal.
- Serializa gravações remotas por chave. Coberturas sucessivas de uma partida chegam ao Railway na mesma ordem em que foram produzidas, evitando que um estado antigo sobrescreva gols, cartões, substituições ou exclusões mais recentes.
- Mantém cobertura completa (eventos, placar, escalações e relógio) como registro canônico compartilhado entre navegadores.
- Adiciona 1º tempo da prorrogação, intervalo da prorrogação e 2º tempo da prorrogação à Cabine e ao motor canônico.
- 1º tempo da prorrogação parte de 90:00; 2º tempo parte de 105:00.
- Portal e Studio reconhecem os novos períodos.
- Corrige o relógio do detalhe da partida no Portal: quando existe `clockStartedAt`, ele usa essa referência persistida, em vez de reiniciar a contagem ao abrir/recarregar o card.

### Validação esperada
1. Criar/editar/excluir evento no Chrome e confirmar no Edge.
2. Converter um gol lançado por engano em cartão e confirmar que o gol desaparece de cabine, Portal e autores.
3. Selecionar os dois tempos da prorrogação e validar 90+/105+.
4. Abrir/recarregar o detalhe no Portal e confirmar que o relógio não reinicia.
