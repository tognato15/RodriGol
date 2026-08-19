# RodriGol Broadcast Package 2.0 — Dados da Partida 6.6

## Objetivo
Integrar ao card principal do Overlay Studio os dados operacionais de arbitragem, público e clima, mantendo o layout de escalações aprovado na entrega 6.5.2.

## Implementação

### Editor de Partidas
- Mantido o campo de árbitro.
- Adicionados os campos Público e Clima.
- Ao salvar a partida, Árbitro, Público e Clima são persistidos tanto no cadastro da partida quanto no estado de cobertura correspondente.

### Cabine de Cobertura
- Adicionado o bloco **DADOS DA PARTIDA** logo após a faixa de situação da cobertura.
- Campos disponíveis: Árbitro, Público e Clima.
- O operador pode completar ou corrigir as informações durante a cobertura.
- Ao salvar, os valores são persistidos na partida e na cobertura.
- Se a partida estiver no ar, o card principal é atualizado imediatamente.
- Se não estiver no ar, os dados ficam salvos e serão publicados quando a partida entrar no ar, evitando interferência em outra cabine.

### Overlay / Multicabine
- O payload principal da Cabine agora envia explicitamente referee, attendance e weather.
- A Multicabine agora envia escalações e os três dados da partida no payload do jogo principal.
- No conflito entre cadastro e atualização de cobertura, o valor operacional da cobertura tem prioridade.

## Compatibilidade
- Layout das escalações 6.5.2 preservado.
- Placar, relógio, eventos, cronologia e demais regiões não foram redesenhados.

## Verificações
- Sintaxe validada com `node --check` nos arquivos alterados.
- Overlay Studio: suíte atual permanece em 19/21 testes.
- OBS Bridge: suíte atual registra 48/52 testes; há verificações legadas já incompatíveis com a arquitetura atual.
- Pacotes TypeScript alpha continuam apresentando dependências internas não resolvidas no build global do monorepo, fora do escopo desta entrega.
