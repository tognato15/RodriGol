# @rodrigol/core

Fundação compartilhada do RodriGol 2.0.

## Módulos

- `common`: congelamento, igualdade profunda e tipos utilitários.
- `errors`: erros de domínio e invariantes.
- `result`: resultados de sucesso e falha.
- `value-object`: base para objetos de valor.
- `identity`: identidades tipadas.
- `time`: instantes, durações e relógios.
- `domain`: entidades, aggregates e eventos de domínio.
- `events`: Event Bus em memória e dispatcher de eventos.
- `persistence`: contratos de repositório, paginação e Unit of Work.
- `audit`: contratos e trilha de auditoria em memória.
- `state-machine`: máquina de estados genérica.

## Validação

Na raiz do monorepo:

```bash
npm install
npm run check
npm test
npm run build
```

Ou dentro de `packages/core`:

```bash
npm run check
npm test
npm run build
```
