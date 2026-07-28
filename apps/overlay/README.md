# @rodrigol/browser-overlay — Entrega 5.1

Aplicação visual transparente para uso como **Browser Source** no OBS.

## Executar pela raiz do projeto

```bash
npm install
npm start
```

O terminal exibirá os endereços. Por padrão:

- Overlay: `http://127.0.0.1:4173`
- Demonstração: `http://127.0.0.1:4173/?demo=1`
- Diagnóstico: `http://127.0.0.1:4173/health`
- Fundo de teste da transparência: `http://127.0.0.1:4173/?background=test`

Também continuam válidos:

```bash
npm run dev:overlay
npm run start -w @rodrigol/browser-overlay
```

## OBS

1. Adicione uma fonte **Browser**.
2. URL: `http://127.0.0.1:4173`.
3. Largura: `1920`.
4. Altura: `1080`.
5. Marque a opção para atualizar o navegador quando a cena ficar ativa.

## Comandos aceitos

```js
window.RodriGolOverlay.execute({
  type: "show",
  region: "side-alert",
  payload: { label: "GOL", headline: "PALMEIRAS 1 × 0", summary: "32 minutos" },
  durationMs: 5000
});
```

Tipos: `show`, `update`, `hide`, `clear` e `clear-all`.
Regiões: `scoreboard`, `ticker`, `lower-third`, `side-alert`, `headline` e `fullscreen`.

A aplicação recebe comandos por `window.postMessage`, evento `rodrigol:overlay` e `BroadcastChannel("rodrigol-overlay")`. Ela também publica o evento `rodrigol:overlay-ready` e oferece `window.RodriGolOverlay.snapshot()`, contratos preparados para a Entrega 6.
