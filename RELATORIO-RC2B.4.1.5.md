# RC2B.4.1.5 — Card da partida e estabilidade da Cabine

## Portal
Hierarquia central: período → status → relógio → placar.
O relógio fica logo abaixo de AO VIVO, em 15px.
Escudos e nomes ficam centralizados, com os escudos acima dos nomes.

## Cabine
O tick do relógio deixou de executar `render()` completo. Agora atualiza apenas relógio/minuto.
Isso impede que o navegador feche as listas de jogadores enquanto o operador escolhe um atleta.
Os datalists também só são reconstruídos quando a lista de opções realmente muda.

## Preservado
- relógio monotônico do Overlay (RC2B.4.1.3);
- ícones de gol/cartões nas escalações (RC2B.4.1.4).
