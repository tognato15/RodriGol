# RodriGol Studio — Go-Live 1.7

## Fast Admin Architecture + consistência pública

A Go-Live 1.7 consolida a arquitetura de performance validada na Multicabine e a aplica ao caminho comum de dados do RodriGol.

### 1. Snapshot incremental por registro

O Bridge passa a persistir a revisão individual de cada registro. Quando o navegador já conhece uma revisão anterior, `/api/data/snapshot?since=...` devolve apenas as chaves alteradas e as exclusões posteriores àquela revisão, em vez de retransmitir toda a base.

Isso ataca diretamente os snapshots que, nos testes de uma partida longa, chegaram a aproximadamente 13,8 MB e dezenas de segundos.

### 2. Cabine com custo estável em partidas longas

A cronologia passa a renderizar apenas os 30 acontecimentos mais recentes inicialmente, com botão para carregar blocos adicionais. Registrar o evento seguinte deixa de obrigar o navegador a reconstruir uma lista arbitrariamente grande.

Mudanças de fase usam uma renderização rápida do placar, fase e relógio; a renderização completa é adiada por alguns milissegundos e os snapshots amplos do Studio ganham debounce maior.

### 3. Studio fora do caminho crítico

O caminho rápido continua publicando placar/eventos imediatamente. A consolidação ampla do Studio passa a ser adiada em 5 segundos e agrupada, reduzindo a disputa entre renderização local, persistência e publicação ampla.

### 4. Pênaltis preservados após consolidação

O Portal mantém o formato `(3) 2 × 1 (5)` em uma única linha. Se a cobertura consolidada não trouxer mais os campos diretos de pênaltis, o Portal usa o estado do mata-mata como fallback.

### 5. Português e placar agregado

`PENALTY SCORED`, `PENALTY MISSED`, `FINAL` e demais eventos tratados nesta etapa são apresentados em português. O componente de escudos passa a aceitar o objeto estruturado usado pelo mata-mata, evitando o ícone de imagem quebrada no placar agregado.

### Meta operacional

Uma partida com muitos eventos deve ter custo próximo de uma partida recém-iniciada para registrar o próximo lance. A Multicabine permanece como referência de arquitetura rápida e o mesmo mecanismo de snapshot incremental beneficia Cabine, Central do Overlay, Central de Coberturas, Mesa Editorial e demais telas que usam o data-store compartilhado.
