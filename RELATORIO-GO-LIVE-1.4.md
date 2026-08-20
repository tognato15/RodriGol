# RodriGol Studio — Go-Live 1.4

## Performance e higiene operacional
- polling da base central passa a usar `since=revision`; quando não há mudança o servidor não retransmite os 300+ registros.
- polling remoto passa de 5s para 7s e continua pausado em abas invisíveis.
- Cabine reduz atualização de jogos secundários e healthcheck em segundo plano.
- Mesa Editorial passa a operar por fila do dia, preservando partidas/histórico antigo sem renderizar centenas de cartões.
- máximo de 80 cartões por coluna na Mesa; busca continua disponível.
- botão `Arquivar anteriores a hoje` limpa a fila operacional sem apagar o histórico das partidas.
- botão `Mostrar históricos` permite consulta excepcional.

## Portal
- placares compactos do ticker e barra lateral usam siglas/abreviações dos clubes.
- fundação do player 24h da Rádio RodriGol.
- configuração remota em `/control/radio.html`; URL do stream pode ser alterada sem deploy.
- player fica persistente na parte inferior do Portal e respeita as limitações de autoplay do navegador.

## Escopo
Esta entrega prioriza velocidade e operação. Pênaltis e mata-mata continuam em observação da Go-Live 1.3.
