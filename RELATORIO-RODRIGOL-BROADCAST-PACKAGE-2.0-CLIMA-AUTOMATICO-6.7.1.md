# RodriGol Broadcast Package 2.0 — Clima Automático 6.7.1

## Objetivo
Corrigir a localização automática da cidade usada pela consulta de clima da Open-Meteo.

## Problema encontrado
Cadastros antigos ou preenchidos manualmente podiam registrar a cidade em formatos como `São Paulo-SP, Brasil`. O geocodificador recebia esse texto sem separar corretamente cidade, UF e país e podia retornar nenhum resultado.

## Correção
- Normalização automática dos formatos:
  - `São Paulo-SP`
  - `São Paulo/SP`
  - `São Paulo - SP`
  - `São Paulo, SP`
  - `São Paulo-SP, Brasil`
- O valor é convertido internamente para cidade + UF, por exemplo `São Paulo, SP`.
- Quando o país é Brasil/Brazil/BR, a consulta usa também `countryCode=BR`.
- A primeira busca usa cidade + UF.
- Se nenhum resultado for encontrado, o RodriGol faz uma segunda tentativa apenas pelo nome limpo da cidade, mantendo o filtro de país.
- O preenchimento manual de Clima continua funcionando como fallback.

## Arquivos alterados
- `apps/obs-bridge/public/weather-service.js`
- `apps/obs-bridge/test/weather-service.test.js`

## Validação
- `npm run check` do OBS Bridge: aprovado.
- 5 testes específicos do serviço de clima: aprovados.
- Suíte completa do OBS Bridge: 53/57; permanecem as mesmas 4 falhas legadas já existentes na versão 6.7.
- `npm run check` do Overlay Studio: aprovado.
- `npm run build` do Overlay Studio: aprovado.

## Resultado esperado
Uma partida cadastrada com `São Paulo-SP, Brasil` deve ser interpretada como `São Paulo, SP`, permitindo localizar a cidade e consultar a temperatura atual sem recadastrar a partida.
