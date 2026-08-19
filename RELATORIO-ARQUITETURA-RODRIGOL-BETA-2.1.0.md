# Relatório de Arquitetura — RodriGol Beta 2.1.0

## Camadas
- **Dados:** `data-store.js`, localStorage e IndexedDB para escudos.
- **Domínio esportivo:** `match-lifecycle.js`, `match-presentation.js`, classificações e mata-mata.
- **Operação:** Cabine, Multicabine, Central da Rodada, Missões e Arquivo.
- **Publicação:** OBS Bridge, WebSocket e Overlay Studio.
- **Editorial:** Notícias, Destaques e Mesa Editorial.

## Nova integração
A Central da Rodada consome uma fotografia consolidada de `operational-missions.js`, sem criar uma nova fonte de verdade. A timeline global deriva dos eventos das coberturas existentes.

## Decisão arquitetural
Configurações de ambiente passam a ser tratadas como dados próprios, preparando a migração para VPS. Nesta versão, o armazenamento é local e não altera o servidor automaticamente.

## Pendências
- aplicar a configuração centralizada a todos os módulos;
- substituir localStorage por banco compartilhado na etapa de nuvem;
- adicionar autenticação e identificação de operadores;
- atualizar três testes históricos que ainda esperam componentes legados removidos.
