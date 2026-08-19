# RodriGol Studio — Beta 2.0.0

## Base

Versão produzida sobre o RodriGol Studio Beta 1.10.0.

## 1. Design System RodriGol

Foi criado o arquivo compartilhado `apps/obs-bridge/public/design-system.css`, com:

- paleta centralizada;
- superfícies, bordas, sombras e raios padronizados;
- botões primários, secundários e críticos;
- formulários e estados de foco;
- painéis, cards, cabeçalhos e barra de status;
- navegação lateral padronizada;
- ajustes responsivos para notebook e janelas menores.

A primeira aplicação foi feita nas telas operacionais:

- Central de Produção;
- Cabine;
- Multicabine;
- Central do Overlay;
- Central de Coberturas;
- Missões Operacionais;
- Arquivo Operacional;
- Diagnóstico.

O Overlay Studio exibido no OBS não teve seu layout alterado.

## 2. Navegação reorganizada

O menu global foi reorganizado em quatro grupos:

- Operação;
- Competições;
- Editorial;
- Controle.

A alteração centraliza a navegação sem modificar as URLs existentes.

## 3. Barra amarela em bloco único

Os dois controles separados da barra amarela foram consolidados em um único bloco dentro da Central do Overlay.

O novo bloco reúne:

- fonte do conteúdo;
- competição;
- rodada;
- modo de exibição;
- velocidade;
- inclusão de programados, ao vivo e finalizados;
- prévia da seleção;
- publicação.

## 4. Correção de “Jogos da rodada”

A fonte `Jogos de uma rodada` agora salva explicitamente:

- `yellowTickerCompetitionId`;
- `yellowTickerRoundId`.

Antes, a origem dependia apenas das rodadas presentes nos seis jogos do scoreboard. Isso fazia a função parecer inoperante quando a rodada desejada não coincidia com a seleção do scoreboard.

A regra corrigida foi aplicada em:

- Central do Overlay;
- publicação de fotografia completa do Studio;
- Multicabine.

A opção `Dia + rodada` também usa a rodada explicitamente selecionada.

## 5. Prévia e estado vazio

A Central do Overlay informa quantos jogos foram encontrados e mostra uma prévia dos primeiros resultados. Quando não há partidas vinculadas, exibe uma mensagem clara, em vez de publicar silenciosamente uma lista vazia.

## Validação

- Sintaxe de todos os arquivos JavaScript do painel: aprovada.
- Inicialização real do OBS Bridge: aprovada.
- Endpoint `/health`: versão 2.0.0 confirmada.
- Central do Overlay e Central de Produção: HTTP 200.
- Testes do OBS Bridge: 49 de 52 aprovados.

Os três testes remanescentes continuam exigindo os componentes legados de ticker e alerta já removidos do produto. A suíte global também continua encontrando falhas preexistentes nos pacotes TypeScript `football` e `overlay`, relacionadas à resolução de `@rodrigol/core`; essas falhas não foram introduzidas pelo Beta 2.0.0.
