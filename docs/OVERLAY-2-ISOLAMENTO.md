# Overlay 2.0 — contrato de isolamento

O Overlay 2.0 é um consumidor visual somente leitura.

## Regras

- Não importa `data-store.js`.
- Não grava `localStorage`, IndexedDB ou dados do servidor.
- Ignora mensagens WebSocket do tipo `data-change`.
- Aceita somente envelopes `command` e o snapshot visual do `welcome`.
- Usa as mesmas regiões canônicas do Overlay clássico.
- Não publica comandos, não altera partidas e não recalcula estados oficiais.

## Rotas

- Overlay clássico: `/`
- Overlay 2.0 experimental: `/overlay-v2/`
- Demonstração: `/overlay-v2/?demo=1`

Abrir os dois overlays simultaneamente não cria publicadores adicionais. Ambos leem o mesmo estado de apresentação do Bridge.
