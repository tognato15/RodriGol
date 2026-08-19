# RodriGol Studio 6.20 — Classificação ao Vivo

## Auditoria
A estrutura existente já calculava tabelas OFICIAL e AO VIVO. A 6.20 reforça a confiabilidade e torna o funcionamento visível ao operador.

## Correções
- Todos os clubes vinculados à fase/grupo aparecem desde o início, inclusive antes de sua primeira partida começar.
- Fases finais legadas (FINAL, FINISHED, CONFIRMED e ARCHIVED) são reconhecidas no cálculo oficial.
- Estados ao vivo compatíveis também são reconhecidos.
- O desempate após ajustes de pontos agora reutiliza os critérios configurados na competição, em vez de uma ordem fixa.
- A tela de Classificações reage também ao evento interno `rodrigol:data-changed`, além do evento de storage entre abas.

## Diagnóstico operacional
A tela de Classificações mostra:
- quantidade de clubes;
- jogos vinculados;
- jogos em andamento;
- finalizados;
- programados;
- quantos jogos estão sendo usados na prévia escolhida;
- modo enviado ao overlay (OFICIAL ou AO VIVO);
- horário da última atualização visual.

## Como testar em rodada
1. Em Classificações, escolha a competição e fase/grupo.
2. Use Modo de cálculo = Automático.
3. Selecione Prévia = Ao vivo.
4. Selecione Overlay = Ao vivo e marque Mostrar no painel lateral.
5. Salve/publice a tabela.
6. Inicie uma partida vinculada à mesma competição/fase/grupo.
7. Registre um gol e confira se pontos, saldo, gols e posição mudam imediatamente.
8. Termine a partida e confira se a tabela OFICIAL passa a incorporar o resultado.

## Validação
- OBS Bridge check: aprovado.
- Teste novo 6.20: aprovado.
- Suite Bridge: 58/62, mantendo as mesmas 4 falhas legadas da 6.19.2 (baseline 57/61).
- Overlay Studio check: aprovado.
- Overlay Studio build: aprovado.
