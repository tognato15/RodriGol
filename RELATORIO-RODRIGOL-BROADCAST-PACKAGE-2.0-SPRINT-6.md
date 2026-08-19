# RodriGol Broadcast Package 2.0 — Sprint 6

## Objetivo

Aplicar ao overlay oficial a grade aprovada pelo operador, preservando o funcionamento e as fontes de dados existentes.

## Nova distribuição do bloco superior

A região principal passou a utilizar uma grade fixa com:

- **15% — Sumário da Partida**, à esquerda;
- **63% — Card do Jogo Principal**, ampliado no centro;
- **22% — Destaques**, à direita.

As escalações permanecem em uma faixa única abaixo dos três painéis, ocupando toda a largura operacional disponível.

## Jogo principal

O card central recebeu mais largura para melhorar a leitura de:

- escudos;
- nomes das equipes;
- placar;
- fase e relógio;
- estádio;
- autores dos gols;
- dados complementares da partida.

A competição e o estado da partida agora ficam integrados ao topo do próprio card central. A antiga identificação visual “Jogo Principal” não ocupa mais espaço dentro da grade.

## Sumário da partida

O painel permanece ligado exclusivamente à cronologia oficial da Cabine. Ele foi mantido estreito e vertical, conforme a marcação aprovada, sem criar armazenamento ou publicador independente.

## Destaques

O painel de destaques foi fixado à direita do jogo principal. A região continua consumindo dados derivados do payload oficial já recebido pelo overlay.

## Escalações

A faixa inferior mantém três áreas fixas:

- escalação do mandante;
- campo tático;
- escalação do visitante.

Nenhuma lógica de escalação foi alterada nesta entrega.

## Segurança operacional

Não foram alterados:

- Bridge;
- regiões de publicação;
- Cabine;
- Multicabine;
- motor de partidas;
- cronômetros;
- scoreboard;
- barra amarela;
- tela branca;
- barra lateral;
- armazenamento.

A alteração é exclusivamente de HTML/CSS de apresentação, com os mesmos IDs e o mesmo payload da Sprint 5.

## Validação

- Build do Overlay Studio: aprovado;
- sintaxe do JavaScript e servidor: aprovada;
- integridade dos arquivos ZIP: aprovada;
- testes históricos: **19 de 21 aprovados**.

Os dois testes restantes verificam contratos legados de pré-jogo e relógio/barra lateral e já falhavam nas entregas anteriores. Essas áreas não foram modificadas nesta sprint.
