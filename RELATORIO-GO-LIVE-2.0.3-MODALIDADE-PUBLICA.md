# Go-Live 2.0.3 — Modalidade Pública Consistente

## Correções

- A camada pública passa a preservar a modalidade informada no registro central e também na camada de atualização ao vivo.
- O Portal reconhece aliases em português e códigos internos, evitando que uma partida de basquete seja apresentada como futebol.
- A tradução pública de beisebol foi ajustada para `Beisebol`.

## Testes

- `golive202-public-sport-label.test.js`: 2 testes aprovados.
- `node --check apps/obs-bridge/server.mjs`: aprovado.

## Aplicação

Substituir os arquivos incluídos no pacote mantendo a estrutura das pastas e executar o teste antes de iniciar o servidor.
