# RodriGol Broadcast Package 2.0 — Barra Lateral 6.9.1

## Objetivo
Refinar a primeira entrega da barra lateral dividida sem alterar a arquitetura aprovada dos dois carrosséis independentes.

## Mudanças
- O seletor do carrossel inferior passa a oferecer apenas partidas com data igual ou posterior ao dia atual.
- Cards salvos de partidas antigas deixam de ser publicados e são removidos da fila operacional ao abrir a Central.
- A divisão vertical da lateral foi alterada de 56%/44% para 66%/34%, devolvendo espaço ao carrossel superior e compactando a área editorial inferior.
- O cabeçalho e o rodapé do carrossel inferior também foram ligeiramente compactados.
- Cards de partida do carrossel inferior agora recebem os eventos de gol da Cabine.
- Quando houver gols, o card exibe minuto e autor, separados pelo lado mandante/visitante.
- Em partidas sem gols, a área de autores não é criada, preservando o card mais limpo.
- Escalações e lógica dos carrosséis permanecem inalteradas.

## Arquivos principais alterados
- `apps/obs-bridge/public/overlay-control.js`
- `apps/obs-bridge/public/studio-regions.js`
- `apps/overlay-studio/public/app.js`
- `apps/overlay-studio/public/styles.css`

## Verificações
- Sintaxe OBS Bridge: aprovada.
- Sintaxe Overlay Studio: aprovada.
- Build Overlay Studio: aprovado.
- Novos testes 6.9.1: 4/4 aprovados.
- Suíte Overlay Studio: 28/30, mantendo 2 falhas legadas já existentes.
- Suíte OBS Bridge: 57/61, mantendo 4 falhas legadas já existentes.
- O check global dos workspaces continua encontrando erros TypeScript históricos nos pacotes experimentais `editorial`, `football` e `overlay`; esses erros não pertencem a esta mudança.
