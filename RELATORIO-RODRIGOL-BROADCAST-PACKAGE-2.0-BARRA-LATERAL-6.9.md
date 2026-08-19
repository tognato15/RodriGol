# RodriGol Broadcast Package 2.0 — Barra Lateral Dividida 6.9

## Objetivo
Dividir a barra lateral do Overlay Studio em dois carrosséis independentes.

## Carrossel superior
Mantém a lógica já existente de competições, classificações, jogos e mata-mata, com sua sequência editorial própria.

## Carrossel inferior
Novo carrossel controlado manualmente pelo operador na Central do Overlay. Cada partida oferece três ações: adicionar o card do jogo, adicionar a escalação do mandante ou adicionar a escalação do visitante. Os cards podem ser ativados/desativados, reordenados e removidos.

### Card de jogo
Mostra escudos, placar e o mesmo relógio/status operacional da partida. Pré-jogo mantém horário/data; intervalo mostra INTERVALO; partidas sem relógio mostram EM ANDAMENTO.

### Card de escalação
Mostra escudo, nome da equipe e os 11 titulares salvos na Cabine, em lista vertical compacta. O técnico aparece no rodapé quando informado.

## Sincronização
O payload `studio-sidebar` agora carrega a estrutura superior em `panels` e a inferior em `lower`. A publicação pela Multicabine também respeita a mesma configuração.

## Verificações
- Sintaxe dos JS alterados: aprovada.
- Build do Overlay Studio: aprovado.
- 4 testes específicos da entrega 6.9: aprovados.
- Suítes gerais preservam as falhas legadas já existentes: OBS Bridge 53/57; Overlay Studio 24/26.
