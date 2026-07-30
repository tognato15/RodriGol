# RodriGol — Sprint 4.1.3 (revisão de cabines e Bridge)

## Objetivo

Corrigir o erro em que cabines diferentes abriam sempre a primeira partida cadastrada e tornar o diagnóstico do Bridge visível mesmo quando a renderização da Cabine encontra um problema.

## Causa principal encontrada

`setActiveMatchId()` e `setOnAirMatchId()` salvavam os identificadores com `JSON.stringify`, mas `getActiveMatchId()` e `getOnAirMatchId()` liam diretamente com `localStorage.getItem()`. O valor armazenado continha aspas JSON e nunca correspondia ao `match.id`. Por isso o sistema caía continuamente no primeiro jogo da lista.

## Correções aplicadas

1. **Desserialização consistente**
   - `getActiveMatchId()` agora usa o mesmo mecanismo `parse()` empregado pelo restante do armazenamento.
   - `getOnAirMatchId()` recebeu a mesma correção.
   - `deleteMatch()` também compara os IDs já desserializados.

2. **Identidade da cabine pela URL**
   - Os botões “Abrir” da Central e do Editor de Partidas agora navegam para `/control/?matchId=ID_DA_PARTIDA`.
   - Ao entrar em `/control/` sem parâmetro, a Cabine escolhe a partida ativa e transforma a URL atual em uma URL canônica com `matchId`, usando `history.replaceState()`.
   - Assim, cada aba mantém sua própria partida ao ser atualizada.

3. **Inicialização mais robusta da Cabine**
   - O diagnóstico `/health` é chamado antes da renderização completa.
   - Uma falha de renderização não deixa mais o texto preso indefinidamente em “Bridge conectando…”.
   - Respostas HTTP inválidas em `/health` agora são tratadas como indisponibilidade.
   - Clubes ausentes recebem uma representação de segurança, evitando erro fatal ao acessar `shortName` ou dados do escudo.

4. **Testes de regressão**
   - Foram adicionados testes para a desserialização da partida ativa e saída principal.
   - Foram adicionados testes para propagação de `matchId` e canonicalização da URL.
   - Foi adicionado teste para garantir que o diagnóstico do Bridge começa antes da renderização.

## Arquivos alterados

- `apps/obs-bridge/public/data-store.js`
- `apps/obs-bridge/public/control.js`
- `apps/obs-bridge/public/central.js`
- `apps/obs-bridge/public/matches.js`
- `apps/obs-bridge/test/obs-bridge.test.js`

## Testes executados

- Verificação de sintaxe dos arquivos alterados: aprovada.
- Testes do workspace `@rodrigol/obs-bridge`: **12 aprovados, 0 falhas**.
- Servidor iniciado localmente.
- `GET /health`: aprovado, retornando versão `0.4.3` e campo `connections`.
- `/control/?matchId=pal-rbb-2026`: HTTP 200.
- `/control/multicabine.html`: HTTP 200.

## Observação sobre o teste global do monorepo

O comando global `npm run check` ainda encontra erros TypeScript preexistentes nos workspaces `editorial`, `football` e `overlay`, principalmente por resolução dos pacotes internos `@rodrigol/core`, `@rodrigol/football` e `@rodrigol/editorial`. Esses erros não foram introduzidos por esta revisão e não pertencem ao fluxo executável do OBS Bridge corrigido aqui.

## Como testar no Cursor

1. Faça uma cópia de segurança da pasta atual.
2. Substitua pelos arquivos do ZIP de correções ou use o pacote completo.
3. Na raiz do projeto, execute `npm start`.
4. Abra a Multicabine e selecione partidas diferentes.
5. Confirme que cada Cabine abre com uma URL diferente, sempre contendo `?matchId=`.
6. Abra duas ou três cabines em abas separadas e atualize cada aba.
7. Confirme que cada uma continua exibindo sua própria partida.
8. O topo deve mudar de “Bridge conectando…” para `Bridge online · 0 overlay(s)` mesmo sem o overlay aberto.
