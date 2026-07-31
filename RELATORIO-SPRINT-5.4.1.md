# RodriGol — Sprint 5.4.1

## Base utilizada

Pacote cumulativo criado a partir de `RodriGol-Sprint-5.4-COMPLETO(1).zip`.

## Correções operacionais

### Multicabine

- O formulário rápido deixa de ser reconstruído a cada segundo enquanto está aberto ou em edição.
- Os campos de minuto, equipe, jogador e detalhes agora preservam foco e conteúdo digitado.
- Os relógios continuam sendo atualizados visualmente sem interromper o preenchimento.

### Cabine

- Novo comando **Limpar cobertura**, separado de **Zerar relógio**.
- A limpeza remove placar, autores, cartões e cronologia, preservando relógio e escalações.
- Eventos publicados agora podem ser editados ou excluídos.
- Após edição ou exclusão, placar e autores dos gols são recalculados automaticamente.
- Controles manuais de placar foram movidos para a área central abaixo do relógio.
- A coluna direita passou a exibir os outros jogos com escudos, placares, relógio, fase e indicação da saída principal.
- O diagnóstico foi movido para o centro da Cabine.

### Escalações

- Nova seção própria na Cabine.
- Cadastro separado para mandante e visitante.
- Campos para técnico, titulares e reservas.
- Dados persistidos por partida junto ao estado da cobertura.

## Versão

`0.5.4-patch.1`

## Testes executados

- `node --check` em `control.js`: aprovado.
- `node --check` em `multicabine.js`: aprovado.
- Testes do OBS Bridge: **18 aprovados, 0 falhas**.
- `GET /health`: HTTP 200.
- `GET /control/`: HTTP 200.
- `GET /control/multicabine.html`: HTTP 200.

## Observação

Os erros TypeScript antigos dos pacotes internos `football` e `overlay` permanecem fora do escopo desta correção. Eles já existiam no pacote-base e não impedem a execução do OBS Bridge usado nos testes operacionais.
