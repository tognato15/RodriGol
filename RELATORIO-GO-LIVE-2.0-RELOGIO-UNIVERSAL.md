# RodriGol Go-Live 2.0 — Relógio Universal

## Escopo
- Segmentos multiesportivos (como 1º quarto) passam a ser apresentados como AO VIVO, sem herdar PRÉ-JOGO.
- Basquete usa relógio regressivo de 10:00 por quarto.
- Perfis com contagem regressiva adicionados também a Football, Hockey, hóquei sobre grama, netball e polo aquático.
- Tênis, tênis de mesa, vôlei, vôlei de praia, beisebol e críquete podem operar sem relógio por padrão.
- Cabine ganha Editar relógio e Sem relógio; o operador pode informar MM:SS durante a cobertura e depois retomar.
- O modo sem relógio é independente do segmento: a partida pode continuar AO VIVO no 1º quarto/set/etc.
- Eventos POINT_1/2/3 são apresentados no Portal como 1 ponto, 2 pontos e 3 pontos.

## Testes
Novo teste: `apps/obs-bridge/test/golive20-universal-clock.test.js` (5 testes).
Suíte específica Go-Live 2.0: 31 aprovados, 0 falhas.
