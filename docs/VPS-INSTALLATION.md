# Instalação em VPS — Beta 2.2

## Requisitos
- Ubuntu 24.04 ou equivalente
- Node.js 20+ e npm 10+
- Proxy reverso com HTTPS e suporte a WebSocket

## Execução
1. Copie `.env.example` para `.env` e ajuste domínio, origem e token.
2. Execute `npm install` na raiz.
3. Inicie com as variáveis do `.env`: `npm start`.
4. No proxy reverso, encaminhe HTTP e `/ws` para a porta 4173.
5. Abra `/control/settings.html`, selecione Produção e informe as URLs públicas.
6. Valide em `/control/network.html`.

## Segurança
Use HTTPS, limite `RODRIGOL_ALLOWED_ORIGIN`, configure `RODRIGOL_API_TOKEN` e não exponha a porta interna diretamente à internet.

## Observação
A persistência remota desta versão é uma camada preparatória em memória. Ainda não substitui o banco compartilhado permanente planejado para a próxima evolução.
