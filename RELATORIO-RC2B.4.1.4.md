# RC2B.4.1.4 — Ícones de eventos nas escalações

## Regressão
Os ícones ⚽ 🟨 🟥 podiam desaparecer quando a cronologia pública chegava sem `team=HOME/AWAY` perfeitamente preenchido.

## Correção
A associação do evento com o atleta agora considera:
- nome normalizado sem número da camisa;
- acentos e pontuação;
- HOME/AWAY quando disponível;
- nome/abreviação da equipe como fallback;
- lista de autores de gols (`scorers`) caso o evento de gol esteja incompleto.

## Preservado
A correção RC2B.4.1.3 do relógio do Overlay e do Portal foi mantida sem alteração.
