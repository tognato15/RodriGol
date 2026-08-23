# RodriGol Studio — Go-Live 1.6.5

## Multicabine Fast Render + Estado Canônico

- Multicabine não bloqueia a interface aguardando o snapshot remoto inicial; usa cache local e hidrata o servidor em segundo plano.
- Revisão remota é persistida para evitar baixar novamente snapshots completos quando nada mudou.
- Filtros da Multicabine operam localmente e a grade renderiza no máximo 12 partidas por lote, com carregamento incremental.
- Relógios usam o mapa de partidas já renderizado em vez de clonar toda a coleção a cada segundo.
- Resumo operacional deixa de varrer duas vezes toda a base e prioriza partidas atuais/operacionais.
- Portal resolve fase de forma monotônica: FINAL não pode regressar para INTERVALO por causa de payload atrasado.
- Evento SSE passa a enviar também a partida alterada, inclusive quando acabou de sair da lista de jogos ao vivo.
- Portal corrige o conflito da classe `empty` que criava caixas vazias e deslocava escudos quando uma equipe não tinha goleadores.
