# RodriGol Studio RC2B.2.2 — Hotfix de Navegação da Partida

## Mudança de estratégia
A página individual não depende mais da API para conseguir abrir.

Ao renderizar os jogos da Home:
1. o objeto completo da partida é guardado em memória;
2. uma cópia é guardada em `sessionStorage`;
3. o card recebe uma chave estável.

Ao clicar:
1. a página recupera exatamente o mesmo objeto usado na Home;
2. renderiza o jogo imediatamente;
3. tenta consultar `/api/public/matches/:id` apenas para enriquecer/atualizar os dados.

Se a API responder 404 ou estiver desatualizada, o jogo continua aberto com os dados da Home.

## Por que isso resolve a inconsistência
Se um jogo existe visualmente na Home, ele já contém dados suficientes para abrir a página básica.
A navegação deixa de depender de uma segunda consulta para provar que aquela mesma partida existe.

## API
A API individual continua disponível e segue sendo utilizada para cronologia, escalações e demais informações quando responder normalmente.

## Overlay
O bug de rolagem da manchete editorial permanece registrado separadamente.
