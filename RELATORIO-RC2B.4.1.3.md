# RC2B.4.1.3 — Relógio do Overlay e Portal

## Fonte de verdade
A Cabine permanece como fonte operacional correta do relógio.

## Overlay
O problema estava na apresentação do relógio principal:
- recebia snapshots novos;
- reancorava o relógio mesmo quando o valor recebido era mais antigo;
- podia fazê-lo voltar vários minutos.

Agora, na mesma fase, o tempo exibido nunca retrocede.
`elapsedSeconds` é prioritário e o relógio só avança se `clockRunning=true`.

## Portal
O `elapsedSeconds` recebido já representa o tempo efetivo naquele snapshot.
O Portal não soma novamente o `clockStartedAt` original.
Ele ancora o snapshot no instante local em que foi recebido e avança dali.

## Visual
O cronômetro da página foi reduzido para 12px e passa a ser informação secundária.

## Regra arquitetural
Cabine escreve estado.
Overlay e Portal apenas consomem/apresentam estado.
