# RodriGol Studio — Beta 2.0.1

## Base
Beta 2.0.0a completo.

## Entrega

### Multicabine totalmente integrada ao Design System
- Sidebar mestre recebeu regras explícitas e deixou de herdar cores roxas/estilos antigos.
- Estado ativo, grupos, espaçamentos, fundo e comportamento responsivo foram alinhados às demais centrais.
- Indicador superior permanece dentro da área segura do cabeçalho.

### Operação assistida na Multicabine
- Resumo com partidas ao vivo, intervalo, no ar e número de missões.
- Faixa com a prioridade operacional mais urgente e acesso direto à ação.
- Atualização por eventos entre abas e ciclo de cinco segundos.

### Preparação para hospedagem
- Criado `runtime-config.js` para centralizar HTTP, WebSocket e URL do Overlay Studio.
- Documentação inicial em `docs/RUNTIME-CONFIG.md`.

## Preservado
Não foram alterados relógios, placares, motor da partida, Overlay Studio, classificações ou mata-mata.

## Validação
- Sintaxe dos JavaScript/MJS verificada.
- Estrutura dos ZIPs verificada.
