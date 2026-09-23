# RodriGol Go-Live 2.0 — Apresentação pública multiesportiva

Correção de acabamento da camada pública após validação real do basquete.

- O endpoint público agora expõe a direção do relógio (`UP`/`DOWN`) e respeita relógio desativado.
- A página da partida usa a direção central: basquete e demais modalidades regressivas deixam de crescer no Portal.
- Eventos públicos preservam `label` e `details`, permitindo traduzir `SEGMENT_START` como “Início do 2º quarto”, por exemplo.
- A faixa inferior de autores/minutos no card fica restrita ao Futebol; basquete não lista cada ação de pontuação.
- A página de partida consulta primeiro o estado central mais recente, evitando renderização inicial com cache antigo antes da atualização automática.
- Os rótulos públicos foram alinhados às modalidades do Megapack, incluindo Basquete, Beisebol, Críquete, Football, Hockey, Rugby League, Tênis de Mesa e Vôlei de Praia.
