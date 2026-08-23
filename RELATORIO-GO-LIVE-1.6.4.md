# RodriGol Studio — Go-Live 1.6.4

## Fast Path Operacional + Portal de Resultados

### Objetivo
Eliminar a regressão observada na 1.6.3, em que `batch` e o fallback por `commands` podiam falhar em sequência com `ERR_HTTP2_PROTOCOL_ERROR`, e consolidar o visual aprovado da Home de resultados.

### Operação em tempo real
- Cabine e Multicabine reutilizam o WebSocket persistente já aberto pela página para publicar comandos operacionais.
- O clique deixa de depender da abertura de uma nova conexão HTTP/2.
- O servidor passa a aceitar `publish-command` e `publish-commands` pelo WebSocket e confirma com `command-ack`.
- O transporte HTTP permanece apenas como fallback quando não existe WebSocket disponível.
- Em falha de transporte do batch HTTP, o sistema abre um circuito curto e não inicia a antiga cascata `batch -> commands -> commands`.
- Frames WebSocket grandes/fragmentados são recompostos pelo Bridge antes do processamento.

### Portal
- Autores dos gols aparecem diretamente abaixo do nome da respectiva equipe, centralizados.
- Tipografia dos autores fica mais forte e integrada à linha da partida.
- Minutos como `45+3'` são preservados.
- Se a lista de goleadores vier sem minuto, o Portal procura o evento de gol correspondente na cronologia e recupera o minuto.
- Separadores horizontais entre partidas ficam mais nítidos, mantendo a densidade inspirada no Promiedos e a identidade RodriGol.

### Critério de validação em produção
O teste prioritário é operar Cabine e Multicabine sem que o Network crie uma sequência de requisições HTTP `batch/commands` a cada clique. Com WebSocket conectado, os comandos operacionais devem trafegar pela conexão persistente.
