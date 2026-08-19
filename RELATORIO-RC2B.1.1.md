# RC2B.1.1 — Portal + Ticker

## Portal
O Portal agora fica fisicamente em `apps/obs-bridge/public/portal/`, dentro da mesma árvore pública já usada pelo Bridge.

`/portal/` serve explicitamente o index, evitando o erro "Arquivo não encontrado".

## Destaque editorial
Manchetes que ultrapassam o espaço disponível passam a:
- permanecer em uma única linha;
- medir a largura real do texto;
- rolar apenas quando houver overflow;
- recalcular depois do carregamento da fonte;
- recalcular se a largura da área mudar.

## Validação
Checks, testes, build e preflight aprovados.
Smoke HTTP real:
- /portal/ = 200
- /portal/app.js = 200
- /portal/styles.css = 200
- /api/public/home = 200
