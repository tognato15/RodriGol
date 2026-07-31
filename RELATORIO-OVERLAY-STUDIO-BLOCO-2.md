# RodriGol Overlay Studio — Bloco 2

## Base utilizada

Pacote cumulativo aprovado `RodriGol-Overlay-Studio-Bloco-1-COMPLETO.zip`.

## Ajustes aprovados no Bloco 1

- Removido o subtítulo “Sistema Operacional de Redação Esportiva”.
- Horário da barra superior alterado para laranja.
- Marca central `RODRIGOL STUDIO` preservada no estilo visual do software.

## Bloco 2 — Jogo principal

Foi implementado o painel principal da partida com:

- identificação de “Jogo Principal”;
- competição e rodada;
- status da cobertura;
- nomes e escudos dos clubes;
- placar em destaque;
- autores dos gols;
- período e cronômetro;
- local da partida;
- indicação de partida no ar.

## Integração

O novo painel consome a região já existente `scoreboard` do OBS Bridge. Assim, quando uma Cabine ou a Multicabine publica a partida que está no ar, o jogo principal do Overlay Studio é atualizado com os mesmos dados.

A URL de demonstração continua sendo:

`http://127.0.0.1:4174/?demo=1`

Para receber dados reais, o OBS Bridge deve estar ativo na porta 4173 e o overlay deve ser aberto sem o parâmetro de demonstração:

`http://127.0.0.1:4174/`

## Segurança

O overlay anterior e todos os módulos operacionais do Sprint 6.4 foram preservados. As alterações ficaram concentradas em `apps/overlay-studio/` e nas versões dos pacotes.

## Versões

- Projeto: `0.6.4-overlay.2`
- Overlay Studio: `0.2.0`

## Validação

- Verificação de sintaxe aprovada.
- Build do Overlay Studio aprovado.
- 4 testes automatizados aprovados.
- Nenhuma falha encontrada nos testes do bloco.
