# RodriGol Broadcast Package 2.0 — Destaques Editáveis 6.10

## Objetivo
Permitir que o operador corrija ou atualize destaques já existentes sem precisar excluir e recriar a manchete.

## Mudanças
- Cada item da fila da Central de Destaques ganhou o botão **Editar**.
- O formulário é preenchido com texto, categoria, crédito, agendamento, expiração e prioridade do item selecionado.
- Durante a edição, o compositor mostra **EDITAR DESTAQUE** e o botão principal muda para **Salvar alterações**.
- Foi adicionado **Cancelar edição** para retornar ao modo de nova manchete.
- O salvamento preserva o ID, data de criação, vínculo com evento/notícia e posição na fila; não cria uma duplicata.
- Se o item em edição for excluído, o formulário sai automaticamente do modo de edição.
- Publicação automática e publicação manual continuam usando o mesmo fluxo já existente.

## Arquivos alterados
- `apps/obs-bridge/public/ticker.html`
- `apps/obs-bridge/public/ticker.js`
- `apps/obs-bridge/public/ticker.css`

## Verificações
- Sintaxe do OBS Bridge: aprovada.
- Sintaxe do Overlay Studio: aprovada.
- Build do Overlay Studio: aprovado.
