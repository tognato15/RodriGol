# RodriGol Studio 6.21 — Substituições Reais

## O que foi implementado

### Cabine
- O botão SUBSTITUIÇÃO deixa de ser um evento genérico.
- Ao selecionar substituição, o campo livre de jogador é trocado por:
  - Jogador que sai
  - Jogador que entra
- A lista de quem sai usa apenas os jogadores atualmente em campo.
- A lista de quem entra usa apenas reservas ainda disponíveis.
- A equipe precisa ser mandante ou visitante.
- O evento registra minuto, equipe, jogador que sai e jogador que entra.

### Estado da escalação
- Os 11 titulares originais continuam preservados em `starters`.
- O banco original continua preservado em `bench`.
- Foi criado o estado operacional `onField`, que representa quem está efetivamente em campo.
- Foi criado o histórico `substitutions`.
- Um reserva que já entrou deixa de aparecer como opção de nova entrada.
- Um jogador substituído deixa de aparecer entre os atletas em campo.
- Editar, excluir ou desfazer uma substituição reconstrói o estado operacional a partir do histórico de eventos.

### Multicabine
- A ação SUBSTITUIÇÃO também passa a abrir os seletores de quem sai e quem entra.
- Ao trocar Mandante/Visitante, as listas são recalculadas para aquela equipe.
- O estado operacional é persistido do mesmo modo que na Cabine individual.

### Overlay e sistema
- O Sumário da Partida mostra a substituição de forma exata:
  - ENTRA jogador
  - SAI jogador
- A tela de Últimas Ações pode receber `SUBSTITUIÇÃO` com a descrição exata da troca.
- A escalação inicial exibida no overlay não é destruída pelas substituições; ela continua representando os titulares que começaram o jogo.

## Compatibilidade
Escalações antigas sem `onField` ou `substitutions` são normalizadas automaticamente usando os titulares cadastrados.

## Validação
- OBS Bridge `npm run check`: aprovado.
- Overlay Studio `npm run check`: aprovado.
- Overlay Studio `npm run build`: aprovado.
- Teste novo 6.21: aprovado.
- Teste direto do motor:
  - 2 B sai
  - 12 C entra
  - `onField` passa para 1 A / 12 C
  - 12 C deixa de ser opção de banco
- Suíte geral: 59/63, mantendo as mesmas 4 falhas legadas já existentes anteriormente.
