# Manual do Operador — Beta 2.2

## Antes da rodada
1. Abra Configurações e confirme o ambiente.
2. Use **Testar conexões**.
3. Abra **Rede e Conexões** e confirme Bridge, WebSocket e latência.
4. Somente depois abra Cabine, Multicabine e Central do Overlay.

## Em caso de queda
- Aguarde a reconexão automática do WebSocket.
- Verifique o Monitor de Conexões.
- Se o Bridge estiver offline, preserve as telas abertas e reinicie apenas o serviço.
- Se a internet cair, a operação local continua dependendo dos dados existentes no navegador; evite limpar o armazenamento.

## Ambiente local
Use `npm start` para o Bridge e `npm run start:studio` quando o Studio estiver em servidor separado. Na instalação integrada, o overlay também responde em `/studio/`.
