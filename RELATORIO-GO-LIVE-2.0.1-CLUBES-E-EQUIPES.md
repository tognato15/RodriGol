# RodriGol Go-Live 2.0.1 — Clubes e Equipes Multiesportivas

- Clube permanece como entidade única.
- Um clube pode estar vinculado a várias modalidades.
- Cada clube pode cadastrar várias equipes/categorias por modalidade.
- Cada equipe interna pode registrar modalidade, categoria, gênero e nível.
- Clubes antigos sem equipes internas continuam funcionando como equipe principal.
- Editor de Partidas filtra as equipes internas pela modalidade selecionada.
- Partidas preservam homeClubId/awayClubId e passam a registrar homeTeamId/awayTeamId quando houver equipe interna.
- Compatibilidade preservada com partidas e clubes anteriores.

Validação local: 43 testes específicos Go-Live 2.0/2.0.1 aprovados, 0 falhas.
