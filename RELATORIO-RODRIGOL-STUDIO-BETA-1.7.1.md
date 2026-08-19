# RodriGol Studio — Beta 1.7.1

## Motor Único do Ciclo da Partida

Base utilizada: `terça¹.zip` (Beta 1.7.0).

### Entregas principais

- Novo módulo `match-lifecycle.js` para consolidar fase, status, placar e datas operacionais da partida.
- Cabine e Multicabine passam a sincronizar automaticamente o registro principal da partida a cada alteração relevante.
- Finalização na Cabine ou Multicabine agora:
  - encerra o relógio;
  - grava `FINAL` na cobertura e na partida;
  - consolida o placar;
  - registra `finishedAt` e `confirmedAt`;
  - cria/atualiza o histórico;
  - sincroniza confrontos de mata-mata vinculados.
- Classificações automáticas passam a encontrar o resultado consolidado sem exigir nova edição manual do jogo.
- Partidas finalizadas deixam de aparecer na lista operacional da Multicabine.
- Editor de Partidas recebeu filtros: Todas, Próximas, Em operação, Finalizadas e Arquivo.
- Partidas finalizadas podem ser arquivadas sem exclusão do cadastro.
- Página de Rodadas recebeu “Abrir rodada”, com lista de jogos, placares, status e atalhos para Cabine e Editor.
- Removido do Overlay Studio o componente visual `studio-breaking-ticker`.
- Cabine e Multicabine não publicam mais a faixa preta de breaking ticker.
- Alertas temporários opcionais (`studio-break-alert`) e o rodapé editorial `DESTAQUE` permanecem.
- Compatibilidade antiga de `ticker` no Bridge agora aponta para `editorial-highlight`, e não para a faixa removida.
- Migração automática normaliza partidas antigas ao abrir Cabine, Multicabine ou Editor.
- Versões dos pacotes atualizadas para `1.7.1`.

## Fluxo consolidado

```text
Editor / Cabine / Multicabine
          ↓
match-lifecycle.js
          ↓
Partida oficial + cobertura
          ↓
Mata-mata + classificação + rodada + histórico + overlay
```

## Validação executada

- Verificação de sintaxe de todos os arquivos `.js` e `.mjs` do diretório `apps`: aprovada.
- Inicialização real do OBS Bridge: aprovada.
- `/health`: aprovado.
- Overlay Studio na raiz `http://127.0.0.1:4173/`: aprovado.
- Editor de Partidas: servido corretamente.
- Estrutura dos ZIPs: verificada.

## Limitação da validação

O ZIP de origem foi enviado sem `node_modules` e sem as pastas de testes. Por isso não foi possível executar a suíte completa de testes automatizados nem uma simulação real de navegador com dados persistidos. A primeira homologação deve validar especialmente:

1. finalizar uma partida pela Cabine;
2. confirmar sua saída da Multicabine;
3. conferir o placar no mata-mata;
4. conferir a classificação automática;
5. abrir a rodada e verificar o resultado;
6. arquivar a partida no Editor;
7. confirmar que a faixa preta removida não volta a aparecer.

## Legacy

A rota `/legacy/` foi preservada apenas como rollback técnico. Nenhum fluxo novo da Cabine, Multicabine ou Mesa Editorial depende dela.
