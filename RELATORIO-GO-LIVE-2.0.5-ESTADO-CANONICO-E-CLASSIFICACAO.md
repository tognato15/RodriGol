# RodriGol Go-Live 2.0.5 — Estado canônico e classificação

## Base
Esta versão parte de `teste.zip` (ramo multiesportivo), e usa como referência visual/funcional o Portal atualmente publicado no Railway em `/portal/`.

## Alterações
- O `coverage` persistido passa a ser a fonte canônica do relógio público quando existe.
- `elapsedSeconds`, `clockRunning`, `clockStartedAt`, direção, visibilidade e período deixam de ser sobrescritos por regiões de publicação atrasadas.
- A direção do relógio (`UP`/`DOWN`) passa a ser enviada também no payload público básico.
- O Portal agora respeita `DOWN` para modalidades com cronômetro regressivo (ex.: basquete), mantendo `UP` no futebol.
- A fase canônica continua prevalecendo sobre estados antigos `PROGRAMADO/PRE_GAME`.
- A estrutura de Classificações já existente foi preservada: página pública, Competition Hub e cálculo automático pelo `standings-engine`.
- O motor multiesportivo foi preservado; nenhuma regra específica de futebol substitui os períodos das demais modalidades.

## Testes focados
Foram executados os testes de Competition Hub, português ao vivo, prorrogação, relógio universal, multiesportes, consistência de relógio, consistência do estado público, fases públicas e a nova regressão de fonte canônica do relógio.

Resultado: todos os testes focados aprovados.

## Observação sobre suíte completa
A suíte global do monorepo já apresentava falhas de configuração/compilação em workspaces TypeScript (`@rodrigol/core` e dependências de pacotes) e um teste legado de configuração de storage. Essas falhas não foram introduzidas por esta alteração e devem ser tratadas separadamente antes de considerar a suíte global verde.

## Próximo passo
Importar a Série A 2026 para a camada de dados e conectar a seleção de partidas importadas ao Editor/Cabines, mantendo esta regra de estado canônico.
