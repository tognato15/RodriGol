# RodriGol Broadcast Package 2.0 — Sprint 6.1

## Objetivo

Corrigir definitivamente a distribuição do bloco superior do overlay para que o código reproduza a grade aprovada:

- Sumário da Partida à esquerda;
- Jogo Principal amplo no centro;
- Destaques colados à direita da área operacional;
- Escalações em faixa independente abaixo.

## Diagnóstico da falha da Sprint 6

A grade nova havia sido adicionada ao `styles.css`, mas o arquivo `broadcast-design-system.css` ainda continha uma regra antiga da fase experimental dos stories:

```css
.bp-main-match {
  grid-template-columns: story + equipe + placar + equipe + story !important;
}
```

Como essa regra usava `!important`, ela continuava vencendo a grade de três colunas. O HTML já possuía apenas Sumário, Card Principal e Destaques; por isso, os elementos ocupavam as primeiras colunas e sobravam duas colunas vazias do lado direito.

O mesmo bloco antigo também limitava o tamanho dos escudos com `!important`, impedindo a ampliação visual prevista.

## Correção aplicada

Foi adicionada uma regra final, mais específica, que substitui definitivamente a grade antiga:

```text
15 partes  — Sumário
63 partes  — Jogo Principal
22 partes  — Destaques
```

A correção também:

- fixa explicitamente cada componente em sua área da grade;
- faz o card principal ocupar toda a coluna central;
- faz os Destaques preencherem integralmente a coluna direita;
- organiza os dois destaques verticalmente;
- restaura o tamanho ampliado dos escudos;
- mantém as Escalações como uma faixa separada abaixo da linha superior;
- preserva a grade fixa em resoluções menores.

## Arquivos alterados

- `apps/overlay-studio/public/styles.css`
- `apps/overlay-studio/dist/styles.css`
- `apps/overlay-studio/public/index.html`
- `apps/overlay-studio/dist/index.html`
- `apps/overlay-studio/package.json`

## Segurança operacional

Não foram alterados:

- Bridge;
- payloads;
- Cabine;
- motor das partidas;
- cronômetros;
- armazenamento;
- scoreboard;
- barra amarela;
- últimas ações;
- barra lateral;
- rodapé editorial.

A alteração é exclusivamente de layout.

## Validação

- Build do Overlay Studio: aprovado.
- Sintaxe dos arquivos JavaScript e servidor: aprovada.
- Servidor do overlay iniciado: aprovado.
- Rota principal: HTTP 200.
- Testes históricos: 19 de 21 aprovados.

Os dois testes restantes são contratos antigos já conhecidos, relacionados ao pré-jogo e ao relógio/barra lateral. Nenhuma dessas áreas foi modificada nesta entrega.
