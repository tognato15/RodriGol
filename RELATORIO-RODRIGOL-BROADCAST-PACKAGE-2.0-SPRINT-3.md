# RodriGol Broadcast Package 2.0 — Sprint 3

## Objetivo

Ampliar a área do jogo principal do overlay oficial e introduzir uma primeira estrutura fixa de stories, sem criar um segundo overlay ou uma nova fonte de dados.

## Alterações

- Área do jogo principal aumentada de 34% para 40% da coluna principal.
- Scoreboard secundário compactado de 23% para 17%, preservando a faixa existente.
- Dois cards fixos de stories adicionados ao jogo principal.
- Story esquerdo alimentado pelos mesmos dados da partida principal: competição, confronto, estado e escudo do mandante.
- Story direito preparado para câmera ou destaque editorial, usando apenas informações já presentes no payload do jogo principal.
- Grade permanece fixa em 1920×1080; nenhum painel muda de tamanho durante a transmissão.
- Tokens específicos adicionados ao Broadcast Design System.

## Segurança dos dados

A implementação não cria região nova no Bridge, publicador adicional ou armazenamento próprio. Os stories são derivados do mesmo payload de `main-match` já homologado.

Não foram alterados Cabine, Multicabine, cronômetros, partidas, classificações, mata-mata, armazenamento ou sincronização.

## Validação

- Sintaxe do JavaScript do overlay: aprovada.
- Sintaxe do Bridge: aprovada.
- Build do Overlay Studio: aprovado.
- Estrutura fixa e IDs existentes preservados.
