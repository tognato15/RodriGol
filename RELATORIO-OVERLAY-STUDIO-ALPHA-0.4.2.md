# RodriGol Studio — Overlay Alpha 0.4.2

## Objetivo da entrega

Fechar a etapa visual do Alpha com uma correção pontual no scoreboard e a atualização do identificador social, sem modificar as demais áreas já aprovadas do overlay.

## Alterações realizadas

### Scoreboard

- Mantidos seis jogos em uma única linha.
- Reorganizados apenas os elementos internos dos cards.
- Escudo e nome de cada equipe passaram a usar disposição vertical.
- Os nomes agora podem ocupar até duas linhas, reduzindo cortes e abreviações em resoluções menores.
- Placar, minuto, competição e informação complementar foram preservados.

### Identidade social

- Substituído `@RODRIGOLTV` por `@RODRIGOL.STUDIO` no canto inferior direito.

## Áreas preservadas

Nenhuma alteração estrutural foi feita em:

- barra superior;
- jogo principal;
- barra amarela;
- quadro branco de últimas ações;
- rodapé de destaque;
- painel lateral;
- integração com o OBS Bridge.

## Arquivos alterados

- `apps/overlay-studio/public/styles.css`
- `apps/overlay-studio/public/index.html`
- `apps/overlay-studio/dist/styles.css`
- `apps/overlay-studio/dist/index.html`
- `apps/overlay-studio/package.json`
- `apps/overlay-studio/test/overlay-studio.test.js`
- `package.json`

## Validações executadas

- Build do Overlay Studio concluído.
- Verificação sintática concluída.
- Sete testes automatizados aprovados.
- Integridade dos pacotes ZIP validada.

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

Para o OBS, mantenha a resolução da fonte de navegador em 1920 × 1080.
