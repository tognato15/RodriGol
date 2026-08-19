# RC2B.4.1.1 — Relógio ao vivo no Portal

## Correção
A API pública agora entrega `clockStartedAt`, além de `elapsedSeconds`, estado de execução e período.

Na página da partida, quando o jogo foi iniciado com relógio, o Portal calcula o tempo efetivo localmente e o atualiza a cada segundo no formato `MM:SS`, seguindo o padrão do RodriGol.

O período aparece ao lado do relógio. O horário originalmente programado continua disponível como `Início HH:MM`.

Partidas iniciadas sem relógio não recebem cronômetro artificial. Com o relógio pausado, o último tempo registrado permanece visível.
