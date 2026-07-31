# RodriGol Studio — Overlay de Teste — Bloco 1

## Base utilizada

Pacote cumulativo `RodriGol-Sprint-6.4-COMPLETO` aprovado.

## Estratégia

O overlay anterior foi preservado. Foi criada uma nova aplicação independente em:

`apps/overlay-studio/`

Ela usa a porta 4174 para não disputar a porta 4173 do OBS Bridge.

## Implementação aprovada neste bloco

- novo canvas de tela cheia para OBS;
- barra superior com identidade visual do software RodriGol;
- data e horário posicionados à esquerda;
- nome `RODRIGOL STUDIO` centralizado, sem utilizar o logo das redes sociais;
- subtítulo `Sistema Operacional de Redação Esportiva`;
- estado da cobertura à direita;
- indicador animado de transmissão;
- conexão preparada com o OBS Bridge;
- áreas dos próximos blocos apenas demarcadas para auxiliar no dimensionamento.

## Como abrir

Com o terminal na pasta principal do projeto:

`npm run start:studio`

Depois, abrir:

`http://127.0.0.1:4174/?demo=1`

No OBS, usar essa mesma URL em uma Fonte de Navegador com resolução 1920 × 1080.

O OBS Bridge pode continuar sendo iniciado normalmente na porta 4173.

## Observação

As caixas abaixo da barra superior são somente guias visuais sem conteúdo operacional. Elas serão substituídas à medida que cada bloco for aprovado.
