# Go-Live 2.0.4 — Correção de estado público e modalidade

Correções direcionadas:

- fases como 1º/2º/3º/4º quarto e sets são reconhecidas como andamento;
- a situação pública não reutiliza um status antigo de PROGRAMADO quando a fase canônica já está em andamento;
- a modalidade específica tem prioridade sobre o fallback FOOTBALL quando os dados públicos trazem uma modalidade válida.

Validação: 3 testes aprovados.
