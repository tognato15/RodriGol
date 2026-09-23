# RodriGol Go-Live 2.1.4 — Classificação sincronizada

## Diagnóstico
Os 380 jogos e os resultados importados chegavam ao Portal, mas a sincronização não criava/publicava uma tabela de classificação automática. O Portal só exibe tabelas presentes em `rodrigol-standings-v1`, por isso Jogos e rodadas apareciam e Classificação ficava vazia.

## Correção
- A sincronização universal agora registra os alvos de classificação da competição importada.
- Define a tabela como `AUTO` e modo `OFFICIAL`.
- Recalcula a classificação a partir das partidas finalizadas e dos placares canônicos.
- Publica automaticamente a tabela para o Portal e para o Competition Hub.
- Aguarda `flushDataSync()` depois da gravação da classificação, evitando o Portal receber jogos antes da tabela.
- Mantém as proteções da 2.1.3 para jogos atrasados, estado operacional e reconciliação de clubes.

## Testes
Executados os 5 testes da 2.1.3 e 2 novos testes da 2.1.4: 7/7 aprovados. Também foi executado `node --check` no Editor de Partidas.

## Teste manual recomendado
Depois de substituir a versão local, abrir o Editor de Partidas e clicar uma vez em **Sincronizar databases**. Em seguida, abrir **Classificação** no Portal e o hotsite do Campeonato Brasileiro Série A. A tabela deve ser gerada a partir dos resultados importados, sem preenchimento manual.
