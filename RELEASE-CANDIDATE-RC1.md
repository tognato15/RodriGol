# RodriGol Studio — RC1

## Status
Primeira Release Candidate do RodriGol Studio.

A partir desta versão, o produto entra em **congelamento funcional**:
- não adicionar funções grandes;
- não redesenhar o overlay;
- corrigir apenas bugs, regressões, inconsistências operacionais e problemas detectados em uso real.

## Base consolidada
- Overlay aprovado visualmente.
- Card principal, scoreboard, barra lateral, tela branca, ticker editorial e rodapé consolidados.
- Cabine individual.
- Multicabine.
- Scoreboard automático.
- Central do Overlay.
- Classificações.
- Classificação ao vivo implementada.
- Substituições estruturadas implementadas.
- Clima automático.
- Escalações, banco, árbitro e público.
- Central Editorial / Destaques.
- Persistência e sincronização Bridge ↔ Overlay.
- Preflight operacional unificado.

## Pontos prioritários ainda em observação
### 1. Classificação ao vivo
Validar durante uma rodada real:
- tabela antes do início;
- alteração após gol;
- mudança de posição;
- empate e critérios de desempate;
- intervalo;
- fim do jogo;
- passagem do resultado ao vivo para o resultado oficial.

### 2. Substituições
Validar durante uma rodada real:
- lista correta de jogadores que estão em campo;
- lista correta de reservas disponíveis;
- escolha da equipe mandante/visitante;
- registro de quem sai e quem entra;
- segunda e demais substituições;
- jogador que entrou podendo depois ser substituído;
- edição/exclusão/desfazer;
- reflexo correto no Sumário e nas áreas do Overlay.

## Regra para bugs encontrados na RC1
Cada problema deve ser classificado como:
1. BLOQUEADOR — impede operação ou transmissão;
2. ALTO — informação incorreta no ar ou perda de dados;
3. MÉDIO — função funciona parcialmente;
4. BAIXO — detalhe visual ou de usabilidade.

Correções da RC1 devem gerar RC1.1, RC1.2 etc., sem introduzir novas funções.

## Critério para promover a versão final
A RC1 pode evoluir para versão estável quando:
- classificação ao vivo tiver sido validada em rodada real;
- substituições tiverem sido validadas em rodada real;
- não existirem bugs bloqueadores ou altos conhecidos;
- preflight operacional estiver 100% aprovado;
- uma rodada completa puder ser operada sem necessidade de intervenção no código.
