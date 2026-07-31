# RodriGol — Relatório do Sprint 5.3

## Base utilizada

Pacote cumulativo `RodriGol-Sprint-5.2-COMPLETO.zip`, preservando Cabine, Multicabine, Bridge, Overlay e os fluxos editoriais dos Sprints anteriores.

## Objetivo

Criar um destino real para as pautas da Mesa Editorial, com uma Central de Notícias capaz de armazenar, editar, publicar e consultar matérias.

## Entregas

- Nova página `/control/news.html` integrada ao pacote gráfico do RodriGol.
- Listagem de notícias com busca, ordenação e filtros por publicadas, rascunhos e urgentes.
- Formulário visual para criar e editar notícia.
- Campos de título, subtítulo, texto completo, categoria, prioridade, partida relacionada, autor e status.
- Leitor interno de matéria, sem sair do sistema.
- Destaque automático para notícia urgente publicada.
- Publicar, transformar em rascunho e excluir.
- Integração com a Mesa Editorial: ao publicar uma pauta, uma notícia correspondente é criada ou atualizada automaticamente.
- Migração automática de pautas já publicadas no Sprint 5.2 para a Central de Notícias.
- Nova persistência local `rodrigol-news-v1`.
- Navegação para Notícias adicionada aos ambientes principais.

## Versão

`0.5.3`

## Observações

A Central de Notícias é interna nesta etapa. Hospedagem pública, imagens, URLs amigáveis e publicação em site externo permanecem para evolução posterior.

O ticker multicobertura no estilo Soccer Saturday continua registrado como prioridade estratégica futura e não foi alterado neste Sprint.
