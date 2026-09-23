# RodriGol Go-Live 2.0.2 — Sincronização da direção do relógio

## Alteração
- Preserva `clockDirection` ao reconstruir o estado público de uma partida.
- O Portal continua consumindo a direção central (`UP`/`DOWN`) na página do confronto.
- Mantém a faixa de autores exclusiva do Futebol.

## Validação local
- 13 testes aprovados no conjunto direcionado:
  - `golive201-clock-consistency.test.js`
  - `golive20-universal-clock.test.js`
  - `golive20-public-sport-presentation.test.js`

## Aplicação
Copiar os arquivos do pacote para a raiz do projeto `rodrigol-2`, mantendo as pastas.
