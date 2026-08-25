# RodriGol Studio — Go-Live 1.7.2

## Live Discovery & Launch Hardening

Pacote de fechamento para a semana de lançamento público.

### Correções
- Reconhecimento canônico das fases em português (`1º TEMPO`, `2º TEMPO`, `INTERVALO`, `EM ANDAMENTO`, `PRORROGAÇÃO`, `PÊNALTIS` e `FINAL`).
- Partidas iniciadas passam a ser elegíveis para Portal e Studio ao vivo mesmo quando a Cabine persiste a fase já traduzida.
- `PRÉ-JOGO`/`PROGRAMADO` permanecem fora das áreas AO VIVO.
- Placar principal com disputa por pênaltis ganha tipografia compacta e indivisível para não invadir os escudos.
- Placar agregado reutiliza as equipes/escudos da partida como fallback quando o modelo de mata-mata não traz os objetos visuais das equipes.
- Slider editorial da Home pública removido da apresentação para priorizar os jogos do dia.

### Regra operacional
A partir desta entrega os testes de operação devem usar partidas reais ao vivo. Registros antigos de teste não fazem parte do cenário de validação.
