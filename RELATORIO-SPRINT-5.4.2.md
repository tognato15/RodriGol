# RodriGol — Relatório do Sprint 5.4.2

## Base utilizada

Pacote completo do Sprint 5.4.1.

## Versão

`0.5.4-patch.2`

## Alterações realizadas

### Placar central

- Removidos os botões manuais de mais e menos gol.
- O placar passa a ser controlado pelos gols registrados, editados ou excluídos na cronologia.
- Incluída uma orientação curta abaixo do relógio para evitar comandos redundantes.

### Outros jogos

- Neutralizado o estilo de link visitado do navegador.
- Nomes, placares e escudos agora mantêm as cores do RodriGol em todos os estados do link.
- Melhorados hover, foco, contraste, alinhamento e destaque da partida no ar.

### Escalações

- O botão Salvar escalações foi definido explicitamente como botão comum (`type="button"`).
- O formulário mantém um estado de alterações não salvas.
- A atualização periódica da Cabine não sobrescreve os campos enquanto a escalação está sendo editada.
- Após salvar, o sistema confirma a persistência no armazenamento da partida.
- O botão mostra retorno visual de sucesso e o diagnóstico registra a operação.
- Cada partida continua possuindo escalações independentes.

## Arquivos alterados

- `apps/obs-bridge/public/index.html`
- `apps/obs-bridge/public/control.js`
- `apps/obs-bridge/public/control.css`
- `apps/obs-bridge/server.mjs`
- `apps/obs-bridge/package.json`
- `package.json`

## Testes

- Verificação de sintaxe de `control.js`: aprovada.
- Verificação de sintaxe de `server.mjs`: aprovada.
- Testes do OBS Bridge: 18 aprovados, 0 falhas.
- Rotas `/health`, `/control/` e `/control/multicabine.html`: verificadas no servidor local.
