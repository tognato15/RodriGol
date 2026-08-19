# RodriGol Broadcast Package 2.0 — Consolidação 6.17

## Card principal
- Removida a linha de grid fantasma do antigo contexto do jogo principal.
- A área antes vazia passa a pertencer de fato ao card principal.
- Sumário e jogo principal ocupam uma única linha estrutural.

## Escudos
- Consolidada uma única regra final por região.
- Card principal: 88×88 px.
- Scoreboard: 36×36 px.
- Barra lateral: 43×43 px.
- Escalação principal: 30×30 px.
- Escalação lateral: 25×25 px.
- Todos os escudos usam object-fit: contain, sem clip-path, sem transform e sem recorte.

## Últimas Ações
- Todas as ações usam a mesma fonte, peso e cor.
- GOL deixa de receber cor especial na coluna AÇÃO.
- O clube autor do gol pode continuar destacado somente dentro da coluna RESULTADO.
- O bloco AÇÃO / TEMPO / AUTOR foi deslocado para mais perto do centro.

## Validação
- Overlay Studio check: aprovado.
- Overlay Studio build: aprovado.
- OBS Bridge check: aprovado.
- public e dist sincronizados.
