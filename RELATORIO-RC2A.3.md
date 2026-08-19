# RodriGol Studio RC2A.3

## Substituição
A Cabine deixa de depender exclusivamente de selects rígidos.

- "Jogador que sai" e "Jogador que entra" viram campos pesquisáveis com sugestões.
- As sugestões continuam vindo dos titulares/em campo e reservas.
- A fonte combina coverage persistida, estado atual e campos visíveis da Cabine.
- Se por qualquer motivo a lista não puder ser reconstruída, o operador ainda pode digitar o nome manualmente.
- O evento estruturado continua registrando quem sai e quem entra.
- O estado operacional é atualizado após a troca.

Isso elimina o bloqueio operacional observado durante a rodada.

## Scoreboard
A velocidade do carrossel foi reduzida de aproximadamente 52 px/s para 36 px/s,
cerca de 30% mais lenta.

Nenhum tamanho, escudo, placar ou composição do card foi alterado.

## Validação
- Bridge check aprovado.
- Bridge tests aprovados.
- Overlay check aprovado.
- Overlay tests aprovados.
- Overlay build aprovado.
- Preflight aprovado.
