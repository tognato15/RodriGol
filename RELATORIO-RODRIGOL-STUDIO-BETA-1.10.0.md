# RodriGol Studio — Beta 1.10.0

## Operação Assistida

Base utilizada: **Beta 1.9.0 completo**.

## Entregas implementadas

### Centro de Missões Operacionais

Nova página:

```text
http://127.0.0.1:4173/control/missions.html
```

O módulo gera prioridades automaticamente a partir dos dados já existentes no RodriGol. As missões incluem:

- partida em fase ao vivo com relógio pausado;
- relógio ativo sem sincronização recente;
- partida finalizada sem registro no Histórico;
- divergência entre placar oficial e placar da cobertura;
- gol, VAR ou cartão vermelho recente em jogo que não está no ar;
- partida que começa em até 30 minutos e ainda não foi preparada;
- ausência de jornada ativa;
- ausência de notícia em destaque no rodapé;
- ausência de classificação automática configurada.

As missões são ordenadas por prioridade:

1. crítica;
2. alta;
3. média;
4. baixa.

Foram adicionados filtros por prioridade e por tipo de missão, além de ações diretas para Cabine, Agenda, Arquivo, Diagnóstico, Destaques e Classificações.

### Modo Transmissão

A página de missões recebeu um modo de foco que:

- oculta o menu lateral;
- amplia o espaço operacional;
- remove missões de baixa prioridade da visualização;
- mantém apenas o que exige atenção imediata.

### Integração com a Central de Produção

A Central de Produção agora possui:

- atalho permanente para o Centro de Missões;
- faixa com a missão de maior prioridade;
- total de missões pendentes;
- destaque visual quando existe missão crítica.

### Monitor do Bridge

O Centro de Missões mostra em tempo real:

- estado do Bridge;
- versão em execução;
- overlays conectados;
- comandos publicados;
- sequência atual;
- tempo de atividade;
- memória usada;
- horário da última publicação.

O endpoint `/health` foi ampliado com:

- `uptimeSeconds`;
- `commandCount`;
- `lastPublicationAt`;
- `memory`.

### Navegação

Foi incluído no menu principal:

```text
⚑ Missões Operacionais
```

## Arquivos principais

Novos:

- `apps/obs-bridge/public/operational-missions.js`
- `apps/obs-bridge/public/missions.html`
- `apps/obs-bridge/public/missions.js`
- `apps/obs-bridge/public/missions.css`

Alterados:

- `apps/obs-bridge/public/global-nav.js`
- `apps/obs-bridge/public/production.html`
- `apps/obs-bridge/public/production.js`
- `apps/obs-bridge/public/production.css`
- `apps/obs-bridge/server.mjs`
- `package.json`
- `apps/obs-bridge/package.json`
- `apps/overlay-studio/package.json`
- `apps/overlay/package.json`

## Validação

- sintaxe de todos os arquivos JavaScript e MJS em `apps`: aprovada;
- inicialização real do OBS Bridge: aprovada;
- `/health`: versão `1.10.0` e novas métricas aprovadas;
- Centro de Missões: HTTP 200;
- Central de Produção: HTTP 200;
- testes do OBS Bridge: **49 de 52 aprovados**.

Os três testes antigos que continuam falhando verificam componentes de ticker/alerta legados que já foram removidos do produto. O teste global da raiz também continua encontrando as falhas TypeScript preexistentes de resolução entre os pacotes `@rodrigol/core`, `@rodrigol/editorial` e `@rodrigol/overlay`.

## Próximos itens do ciclo Beta 1.10

Esta entrega inaugura a Operação Assistida. Permanecem para as próximas entregas do ciclo:

- filtros avançados da Timeline de eventos;
- painel geral detalhado da rodada;
- registro de operador e estação de trabalho;
- fluxo editorial preparado para publicação no futuro Portal;
- refinamento do Modo Transmissão dentro da Cabine.
