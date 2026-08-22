# RodriGol Studio — Go-Live 1.6 · Operação Instantânea

## Objetivo

Corrigir os dois gargalos operacionais mais graves observados em produção: a Multicabine praticamente inutilizável sob carga e a Cabine exibindo uma partida demonstrativa enquanto a partida solicitada ainda estava sendo resolvida.

## Multicabine

- Remove o redesenho completo da grade a cada segundo.
- O relógio passa a atualizar somente os elementos de relógio dos cards já existentes.
- `health` passa de 2,5 s para 30 s.
- A Central de Missões/Resumo deixa de recalcular a cada 5 s e passa a ser prioritariamente orientada por eventos, com fallback de 60 s.
- Mudanças recebidas de outras abas/dispositivos atualizam a interface, mas não republicam automaticamente o Overlay. Isso elimina tempestades de comandos quando várias telas administrativas estão abertas.
- As quatro regiões amplas do Studio são publicadas em um único `batch`.
- Ações operacionais atualizam placar/fase/relógio imediatamente no card antes da persistência e da publicação remota.
- Publicações consecutivas são coalescidas. Se uma requisição ainda estiver em voo, a atualização mais nova fica pendente e é enviada em seguida, sem bloquear o clique do operador.
- Abrir a Multicabine deixa de republicar todo o Overlay apenas por carregar a página.

## Cabine

- O HTML deixa de conter Palmeiras x Red Bull Bragantino como estado visual inicial.
- A Cabine abre com estado neutro `CARREGANDO...` até o `matchId` solicitado ser resolvido.
- A interface real só é liberada depois do primeiro `render()` com a partida correta.

## Resultado esperado

A Multicabine deve continuar funcional mesmo com várias partidas em operação, sem rerender da grade a cada segundo e sem múltiplas abas provocarem republicações redundantes. A Cabine nunca deve exibir uma partida incorreta durante o carregamento.
