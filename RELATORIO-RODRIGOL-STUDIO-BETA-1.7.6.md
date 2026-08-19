# RodriGol Studio — Beta 1.7.6

## Base

Esta entrega foi produzida sobre o **Beta 1.7.5**.

## 1. Relógio contínuo da barra lateral

O relógio dos cards do scoreboard já avançava localmente, mas a barra lateral podia receber novamente o mesmo `elapsedSeconds` em republicações estruturais. Cada republicação recriava a âncora temporal e fazia o relógio parecer parado.

A rotina compartilhada de relógios auxiliares foi alterada para:

- manter o relógio vinculado ao `matchId`;
- usar `clockStartedAt` quando estiver disponível;
- calcular o tempo efetivo no momento da sincronização;
- preservar a contagem local quando chegar um valor repetido ou atrasado;
- nunca fazer o relógio voltar na mesma fase;
- continuar atualizando somente o texto, sem redesenhar a lateral.

A regra visual permanece:

- relógio ativo: primeiro tempo, segundo tempo e prorrogação;
- sem relógio: programado, pré-jogo, intervalo, ao vivo sem relógio, pênaltis, finalizado, suspenso, adiado e cancelado.

## 2. Rodapé editorial

A Central de Destaques passa a administrar uma fila de **notícias em destaque**, e não uma mensagem genérica permanente.

Foram mantidos os modos:

- destaque fixo;
- rotação automática;
- ordenação manual;
- destaque principal fixado.

Foram adicionados:

- agendamento de publicação;
- expiração automática;
- estados `NO AR`, `AGENDADA`, `PAUSADA` e `ARQUIVADA`;
- identificação de manchetes originadas da Central de Notícias;
- remoção do texto genérico quando não existir manchete válida.

## 3. Integração com a Central de Notícias

Ao criar ou editar uma notícia publicada, o operador pode marcar:

**Publicar também como notícia em destaque no rodapé**

Também é possível definir:

- data e hora de entrada;
- data e hora de expiração.

Na lista de notícias foi adicionado o comando:

- **Destacar no rodapé**;
- **Remover destaque**.

Quando uma notícia é transformada em rascunho ou excluída, seu destaque também é removido. A alteração é enviada ao Overlay Studio sem exigir recadastro da manchete na Central de Destaques.

## 4. Arquivos alterados

- `apps/overlay-studio/public/app.js`
- `apps/obs-bridge/public/data-store.js`
- `apps/obs-bridge/public/ticker.html`
- `apps/obs-bridge/public/ticker.js`
- `apps/obs-bridge/public/news.html`
- `apps/obs-bridge/public/news.js`
- `apps/obs-bridge/server.mjs`
- arquivos `package.json` dos workspaces e da raiz

## 5. Validação

- verificação de sintaxe de todos os arquivos JavaScript e MJS em `apps`;
- inicialização do OBS Bridge em porta alternativa;
- endpoint `/health` confirmado na versão `1.7.6`;
- verificação de integridade dos arquivos ZIP;
- pacote sem `node_modules`.

## Checklist operacional recomendado

1. Colocar uma partida no primeiro ou segundo tempo e publicar a lateral.
2. Confirmar que o relógio avança sem nova publicação do Bridge.
3. Alternar o carrossel lateral e confirmar que o tempo não reinicia.
4. Colocar a partida no intervalo e confirmar que o relógio desaparece.
5. Criar uma notícia publicada e marcar como destaque.
6. Confirmar a manchete no rodapé.
7. Remover o destaque pela Central de Notícias.
8. Testar uma manchete agendada e outra com expiração.
