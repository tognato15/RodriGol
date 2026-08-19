# RodriGol Studio — Beta 1.7.0 — Overlay Único

## Implementado

- Overlay Studio tornou-se o overlay oficial servido em `http://127.0.0.1:4173/`.
- O overlay legado permanece temporariamente em `http://127.0.0.1:4173/legacy/` para rollback.
- `http://127.0.0.1:4173/studio/` também serve o Studio para diagnóstico.
- A porta 4174 permanece opcional apenas para desenvolvimento independente.
- O Bridge traduz automaticamente regiões antigas (`ticker`, `side-alert`, `lower-third`, `headline`, `fullscreen`) para regiões Studio.
- Cabine, Multicabine e Mesa Editorial passam a publicar regiões Studio.
- O Studio recebeu breaking ticker, alerta temporário, lower third, headline, fullscreen e suporte a `hide`, `clear` e `clear-all`.
- WebSocket do Studio usa mesma origem por padrão.

## Comandos

```bash
npm start
```

Esse comando agora basta para abrir sistema, Bridge e Overlay Studio oficial.

- Sistema: `http://127.0.0.1:4173/control/`
- Overlay oficial: `http://127.0.0.1:4173/`
- Legado de segurança: `http://127.0.0.1:4173/legacy/`

## Compatibilidade

O comando `npm run start:studio` continua disponível para abrir a porta 4174 durante desenvolvimento, mas deixou de ser obrigatório para a operação normal.
