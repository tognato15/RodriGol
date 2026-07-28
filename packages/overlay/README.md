# @rodrigol/overlay

Motor de apresentação gráfica do RodriGol 2.0.

O pacote organiza cenas, componentes, regiões, resolução, tema, transições e comandos de exibição. Ele não depende do OBS: produz um estado gráfico neutro que poderá ser consumido pelo futuro navegador de overlay e pela integração com OBS.

## Principais recursos

- Cena padrão para cobertura ao vivo;
- regiões para placar, ticker, lower third, alertas, manchete e tela cheia;
- resolução e margem segura;
- tema RodriGol configurável;
- comandos `show`, `update`, `hide`, `clear` e `clear-all`;
- duração automática para elementos temporários;
- snapshots serializáveis para renderização;
- adaptador dos comandos do Editorial Engine.
