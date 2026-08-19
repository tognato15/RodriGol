# RC2B.4.1 — Home Editorial

## Cabeçalho
- relógio e data foram retirados do hero;
- horário/data passam a integrar o cabeçalho, seguindo a linguagem visual do overlay;
- logo permanece centralizado;
- navegação e indicador AO VIVO permanecem no topo;
- ticker de jogos ao vivo continua logo abaixo.

## Home
O antigo hero fixo foi substituído por uma área de Destaques RodriGol em slider.

Prioridade:
1. notícias/destaques editoriais recebidos pelo Portal;
2. se não houver conteúdo editorial, jogos do dia são usados automaticamente;
3. partidas ao vivo têm prioridade no fallback.

O slider:
- avança automaticamente a cada 7 segundos;
- possui anterior/próximo;
- possui indicadores de posição;
- pode apontar diretamente para uma partida ou para Notícias.

## Próxima integração
A estrutura está pronta para receber um editor de destaques no Studio. A próxima etapa pode criar a interface administrativa para o operador escolher e ordenar as manchetes sem nova alteração estrutural da Home.
