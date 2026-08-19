# RodriGol Broadcast Package 2.0 — Destaques 6.4

## Base
Pacote base: `RodriGol-Broadcast-Package-2.0-Integracao-Jogo-Principal-6.3-COMPLETO.zip`.

## Escopo desta entrega
Esta entrega acelera o refinamento do overlay sem alterar a arquitetura operacional.

### Destaques
- A área de Destaques passa a exibir **um único destaque por vez**.
- Os lances entram em **carrossel automático**, com troca a cada 8 segundos.
- A área mantém tamanho fixo e não cria nova região no Bridge.
- O conteúdo continua derivado do mesmo payload do Jogo Principal.
- Indicadores inferiores mostram a posição do item dentro do carrossel.
- A barra superior do card funciona como progresso visual do story atual.

### Card principal
- Nomes das equipes e autores dos gols foram empurrados para a base de cada bloco de equipe.
- O ajuste reduz a chance de conflito com escudos altos ou largos.
- Nenhuma dimensão estrutural do card principal foi alterada.

## Segurança de dados
Não foi criada nova fonte de verdade. Destaques, card, sumário, escalações e fatos continuam consumidores do mesmo estado oficial do Jogo Principal.

Não foram alterados:
- Bridge;
- Cabine;
- Multicabine;
- motor de partida;
- cronômetros;
- armazenamento;
- scoreboard da rodada;
- barra amarela;
- tela branca;
- barra lateral.

## Validação
- `node --check public/app.js`: aprovado.
- Build do Overlay Studio: aprovado.
- Testes históricos: 19 de 21 aprovados.
- As duas falhas restantes são os mesmos contratos legados anteriores de pré-jogo/relógio lateral e não foram introduzidas nesta entrega.
