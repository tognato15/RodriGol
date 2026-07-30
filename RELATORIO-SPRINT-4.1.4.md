# RodriGol — Relatório do Sprint 4.1.4

## Objetivo

Consolidar a saída principal do OBS para que a Multicabine consiga trocar a partida no ar e manter o placar/relógio atualizados sem exigir que a cabine individual esteja aberta.

## Base utilizada

Este pacote foi criado a partir da pasta atual enviada pelo usuário (`quinta².zip`). Portanto, é cumulativo e preserva as correções do Sprint 4.1.3 Revisão.

## Correções realizadas

- A Multicabine agora monta o mesmo payload completo de placar usado pela Cabine.
- Ao clicar em **Colocar no ar**, o estado da partida é publicado imediatamente em `/api/commands`.
- O overlay recebe competição, clubes, escudos, placar, autores dos gols, relógio, período, status e cronologia.
- A partida no ar continua sendo publicada pela Multicabine a cada segundo, permitindo que o relógio avance no overlay mesmo sem abrir a cabine individual.
- Foi incluída uma assinatura do payload para evitar envio duplicado quando nada mudou.
- Alterações de placar/relógio feitas na própria Multicabine são publicadas imediatamente quando a partida afetada está no ar.
- Eventos de `storage` e `rodrigol:data-changed` também provocam sincronização da saída principal.
- Versão atualizada para **0.4.4**.

## Testes executados

- Verificação de sintaxe do OBS Bridge: aprovada.
- Testes automatizados: **14 aprovados, 0 falhas**.
- Inicialização do servidor: aprovada.
- Endpoint `/health`: respondeu com versão 0.4.4.
- Página `/control/multicabine.html`: HTTP 200.

## Teste manual recomendado

1. Inicie o RodriGol com `npm start`.
2. Abra o overlay no navegador ou no OBS.
3. Abra a Multicabine.
4. Clique em **Colocar no ar** em uma partida diferente.
5. Confirme que o overlay troca imediatamente, sem abrir a cabine individual.
6. Inicie o relógio pela Multicabine e confirme que ele avança no overlay.
7. Troque novamente a saída principal e confirme que o novo jogo aparece imediatamente.

## Próxima etapa

Após aprovação desta saída principal, validar todos os botões e eventos da Cabine no overlay. A reformulação visual da Multicabine para lista vertical e operação completa permanece planejada para uma etapa posterior.
