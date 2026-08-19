# RodriGol Studio — Beta 2.0.0a

## Base

Produzido sobre o Beta 2.0.0 completo.

## Alterações

### Barra amarela

- Grid responsivo com campos de largura fluida.
- `select`, `label` e colunas passam a respeitar `min-width: 0`.
- Regras específicas para 5, 3, 2 e 1 coluna conforme a largura.
- Botão de publicação reorganizado em telas menores.

### Multicabine

- Estrutura integrada ao menu mestre do Design System.
- Novo cabeçalho operacional.
- Filtros agrupados em painel próprio.
- Cards de partidas, relógios, estados, botões e formulários rápidos redesenhados.
- Responsividade para notebook e janelas divididas.
- Lógica JavaScript preservada.

### Arquivo Operacional

- Miolo convertido para superfícies escuras do RodriGol.
- Resumos, filtros, placares, estados e ações padronizados.
- Melhor comportamento responsivo.

### Banco Histórico

- Design System carregado explicitamente.
- Cabeçalho, filtros, cards, painel de detalhes, fatos, escalações e timeline padronizados.
- Marca atualizada de RodriGol TV para RodriGol Studio na tela interna.

### RodriGol UI

- Utilitários compartilhados para toolbars, grades, status e estados vazios.
- Proteções gerais contra overflow em formulários responsivos.

## Núcleo preservado

Não foram alteradas as regras de partida, Bridge, relógios, classificações, mata-mata ou Overlay Studio.

## Versionamento

A identificação pública é `2.0.0a`. Nos `package.json` foi utilizada a versão SemVer válida `2.0.0-alpha.1`.

## Validação

- Sintaxe de todos os arquivos JavaScript e MJS em `apps`: aprovada.
- Inicialização real do OBS Bridge: aprovada.
- `/health`: versão pública `2.0.0a`.
- Multicabine, Arquivo Operacional e Banco Histórico: HTTP 200.
- Suíte histórica do Bridge: 49 de 52 testes aprovados. Os três testes restantes verificam contratos antigos já removidos ou versões fixas anteriores.
