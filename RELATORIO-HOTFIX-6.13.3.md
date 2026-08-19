# RodriGol Broadcast Package 2.0 — Hotfix 6.13.3

## Correções
- Removidas definitivamente as duas linhas/molduras da área Últimas Ações.
- Mantida a faixa de títulos das colunas, mas sem bordas de tabela.
- Lower third editorial passa a quebrar de verdade em até duas linhas, sem marquee e sem deslocamento horizontal.
- Texto da manchete recebe largura fixa do espaço disponível, evitando corte por largura intrínseca em flex.
- Escudos do card principal passam a ocupar uma área própria, isolada do nome da equipe.
- Arquivos de escudo muito altos/largos usam object-fit contain e não podem sobrepor o nome.
- Ajuste aplicado simetricamente a mandante e visitante.

## Validação
- npm run check (Overlay Studio): aprovado.
- npm run build (Overlay Studio): aprovado.
- public e dist recompilados e sincronizados.
