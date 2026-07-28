# ADR-011 — Monorepo com npm Workspaces

## Status

Aceito.

## Contexto

O RodriGol terá múltiplas aplicações e pacotes que precisarão compartilhar contratos e tipos.

## Decisão

Utilizar npm Workspaces como fundação do monorepo.

## Consequências

- Uma instalação de dependências na raiz.
- Scripts coordenados por workspace.
- Compartilhamento explícito entre pacotes.
- Possibilidade de adoção futura de uma ferramenta de orquestração sem alterar a organização lógica.
