# RodriGol Studio — Go-Live 1.6.3

## Bridge resiliente + refinamento do Portal compacto

Esta entrega combina o hotfix de confiabilidade do caminho operacional com os ajustes visuais aprovados para a Home do Portal.

### Bridge
- Publicações em lote passam por uma fila única no navegador.
- Atualizações concorrentes são consolidadas por região, preservando o estado mais recente.
- Após falha de transporte do `/api/commands/batch`, o batch entra temporariamente em circuito aberto e os comandos são enviados individualmente e em série.
- O objetivo é evitar tempestades de conexões HTTP/2 e impedir que falhas de snapshot complementar prejudiquem a ação operacional.

### Portal
- Remove o segundo horário duplicado nas partidas programadas.
- Exibe uma linha fina com autores/minutos dos gols abaixo do placar.
- Substitui a faixa de sete datas por um único botão de data.
- O botão abre um calendário mensal navegável para escolha de qualquer dia.
- Mantém os filtros Todos / Ao vivo e a identidade visual RodriGol.

### Validação
- Testes específicos cobrem fila resiliente, fallback, placar compacto, autores de gols e calendário.
- A suíte completa deve ser executada antes do deploy.
