# RC2B.4.1.2 — Hotfix de Inicialização do Portal

## Causa
O bloco JavaScript do relógio inserido na RC2B.4.1.1 continha sequências literais `\n`. O navegador interrompia o módulo inteiro antes da inicialização.

## Sintomas
- cabeçalho em CARREGANDO;
- slider em Carregando os principais destaques;
- Jogos do Dia em Carregando partidas;
- sidebars sem dados.

## Correção
As sequências foram convertidas em quebras de linha JavaScript válidas. A funcionalidade do relógio de partida foi preservada.

## Validação adicional
Além dos testes normais, o JavaScript inline do HTML do Portal foi extraído e validado diretamente com `node --check`.
