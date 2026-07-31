# RodriGol Studio — Overlay Alpha 0.4.1

## Base utilizada

Entrega cumulativa produzida sobre o arquivo `RodriGol-Overlay-Studio-Alpha-0.4-COMPLETO.zip`.

## Ajustes visuais aprovados

- Scoreboard reorganizado em uma única linha com até seis partidas simultâneas.
- Cards do scoreboard ficaram mais compactos para liberar espaço vertical.
- Área **Últimas Ações** ampliada e mantida com fundo branco.
- Lista de últimas ações aumentada de quatro para oito registros.
- Resultados das últimas ações passam a priorizar os nomes completos dos clubes.
- Foi incluída compatibilidade para expandir siglas conhecidas quando um evento antigo ainda chegar no formato abreviado.
- Rodapé **Destaque** alterado para fundo preto, preservando a etiqueta laranja.
- Painel lateral mantido com a estrutura e o carrossel da versão Alpha 0.4, sem a ampliação mostrada nos mockups descartados.

## Comportamento dos resultados

Quando o evento fornece `homeName`, `awayName`, `homeScore` e `awayScore`, a apresentação segue o formato:

`Corinthians 1 x 0 Palmeiras`

Para eventos antigos que ainda fornecem apenas uma string abreviada, o overlay tenta converter siglas cadastradas para nomes completos.

## Arquivos alterados

- `package.json`
- `apps/overlay-studio/package.json`
- `apps/overlay-studio/public/index.html`
- `apps/overlay-studio/public/styles.css`
- `apps/overlay-studio/public/app.js`
- `apps/overlay-studio/dist/index.html`
- `apps/overlay-studio/dist/styles.css`
- `apps/overlay-studio/dist/app.js`
- `apps/overlay-studio/test/overlay-studio.test.js`

## Validações executadas

- Verificação sintática do Overlay Studio.
- Seis testes automatizados do Overlay Studio.
- Build da pasta `dist` concluído.

## Como testar

Na pasta principal do projeto, execute:

```text
npm start
```

Em outro terminal:

```text
npm run start:studio
```

Abra no navegador:

```text
http://127.0.0.1:4174/?demo=1
```
