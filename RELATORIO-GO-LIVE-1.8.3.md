# RodriGol — Go-Live 1.8.3
## Competition Hub Editorial & Archive Ready

### Objetivo
Refinar a experiência do Competition Hub após a validação pública do 1.8.2 e preparar os vínculos editoriais e o futuro arquivo histórico.

### Entregas
- A aba **Jogos** dos hotsites reutiliza o card visual da Home, com escudos, data/hora/status e faixa inferior.
- Mata-mata prioriza a fase em andamento/próxima; fases futuras vêm em seguida e fases anteriores ficam como histórico.
- Cards de confronto passam a exibir escudos quando disponíveis.
- Nova aba **Notícias** no hotsite da competição.
- O cadastro de notícias aceita múltiplas competições e múltiplos clubes relacionados.
- Ao relacionar uma notícia a uma partida, competição e clubes da partida são herdados automaticamente.
- A API pública expõe os vínculos editoriais e entrega ao hotsite apenas notícias relacionadas à competição.

### Arquivo histórico
A estrutura de partidas continua baseada em datas absolutas `AAAA-MM-DD`, sem janela mínima de ano. O desenho do seletor por ano/década fica reservado para a evolução específica de Arquivo, permitindo posteriormente navegação direta para acervos dos séculos XIX, XX e XXI sem paginação mês a mês.

### Preservado
- Go-Live 1.8.2: fases, confrontos e classificação completa.
- Go-Live 1.8.1: hierarquia territorial e navegação de competições.
- Go-Live 1.8.0: Competition Hub.
- Go-Live 1.7.3: UX ao vivo e português.
