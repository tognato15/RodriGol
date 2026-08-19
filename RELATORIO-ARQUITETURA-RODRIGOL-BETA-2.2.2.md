# Relatório de Arquitetura — Beta 2.2.2

## Camadas de dados

1. Cache síncrono em memória para compatibilidade com os módulos atuais.
2. IndexedDB para persistência local ampla e contingência.
3. Bridge com arquivo JSON atômico para compartilhamento entre computadores.
4. `localStorage` restrito a preferências pequenas.

## Sincronização

A escrita atualiza imediatamente o cache, é persistida no IndexedDB e, quando habilitada, enviada ao Bridge. O cliente consulta revisões remotas e emite `rodrigol:data-changed` apenas quando encontra diferenças.

## Separação dos overlays

O Bridge mantém um único estado de apresentação. Overlay clássico e Overlay 2.0 são consumidores paralelos. Nenhum overlay é fonte de dados esportivos.

## Próxima evolução

- substituir o arquivo JSON por banco transacional;
- controle de conflitos por registro e versão;
- autenticação de usuários e trilha de auditoria;
- armazenamento remoto de imagens por URL;
- homologação visual do Overlay 2.0.
