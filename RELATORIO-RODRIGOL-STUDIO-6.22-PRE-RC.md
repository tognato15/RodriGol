# RodriGol Studio 6.22 — Pré-RC / Estabilização Geral

## Objetivo
Preparar a base operacional para uma Release Candidate sem adicionar novas funções.

## O que foi corrigido

### Suítes de teste
As quatro falhas antigas do Bridge e as quatro falhas antigas do Overlay foram auditadas.

Elas eram, em sua maioria, testes que ainda procuravam implementações já aposentadas:
- publicação direta via `fetch('/api/commands')`;
- nomes antigos de regiões Studio;
- cabeçalhos removidos da tela branca;
- função antiga de rolagem do ticker editorial;
- regras antigas de relógio/lateral;
- regex rígida para opções que agora ficam em linhas separadas.

Os testes foram atualizados para validar a arquitetura atual, sem reintroduzir código obsoleto.

### Health do Bridge
O endpoint `/health` não usa mais uma versão fixa antiga.
Agora ele lê automaticamente a versão real de `apps/obs-bridge/package.json`.

## Preflight operacional
Foi criado o comando:

`npm run preflight`

Ele executa, em sequência:
1. Bridge — check
2. Bridge — testes
3. Overlay Studio — check
4. Overlay Studio — testes
5. Overlay Studio — build

### Resultado desta versão
- Bridge: 63/63 testes aprovados.
- Overlay Studio: 33/33 testes aprovados.
- Bridge check: aprovado.
- Overlay check: aprovado.
- Overlay build: aprovado.
- Preflight operacional: APROVADO.

## Versões sincronizadas
- Projeto: 2.2.2-bp.6.22
- OBS Bridge: 2.2.2-bp.6.22.0
- Overlay Studio: 2.0.0-bp.6.22

## Pontos ainda em observação de rodada
- Classificação ao vivo 6.20.
- Seleção de jogadores nas substituições 6.21.
- Qualquer comportamento extremo de relógio, placar ou sincronização descoberto em uso real.

Esses itens não impedem o avanço do projeto, mas precisam ser validados antes de uma RC ser considerada pronta para publicação geral.

## Observação arquitetural
Os workspaces TypeScript experimentais continuam fora do preflight operacional. Eles não fazem parte da cadeia atualmente usada pela transmissão: Cabine + Multicabine + Bridge + Overlay Studio.
