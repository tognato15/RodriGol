# RodriGol Broadcast Package 2.0 — Clima Automático 6.7

## Objetivo
Acrescentar consulta opcional de temperatura e condição meteorológica à entrega 6.6, sem tornar o overlay dependente de serviço externo e sem remover o preenchimento manual.

## Implementação

### Serviço meteorológico
- Adicionado `apps/obs-bridge/public/weather-service.js`.
- Integração com Open-Meteo, sem chave de API no fluxo não comercial.
- Geocodificação pelo nome da cidade da partida.
- Se a cidade da partida estiver vazia, usa a cidade cadastrada do clube mandante como fallback.
- Consulta as condições atuais por latitude/longitude.
- O valor retornado é formatado para o campo já existente, por exemplo: `21°C · Parcialmente nublado`.
- Os códigos meteorológicos WMO são convertidos para descrições em português.
- Timeout e mensagens de erro impedem que uma falha externa trave a operação.

### Editor de Partidas
- O campo Clima continua totalmente editável manualmente.
- Adicionado botão **Buscar clima agora**.
- A consulta usa Cidade/local; se não houver, usa a cidade do mandante.
- O resultado apenas preenche o campo Clima; o operador continua salvando a partida normalmente.

### Cabine de Cobertura
- Adicionado botão **Buscar clima agora** no bloco Dados da Partida.
- A busca usa os dados da partida/clube e preenche o campo Clima.
- O operador confirma com **Salvar dados**, preservando o fluxo de publicação já aprovado na 6.6.
- Se a partida estiver no ar, o salvamento continua atualizando o overlay imediatamente.

## Segurança operacional / fallback
- A API externa não participa do placar, relógio, eventos ou escalações.
- Se não houver internet, se a localização não for encontrada ou se a Open-Meteo estiver indisponível, o campo manual continua funcionando normalmente.
- O overlay recebe somente o texto final salvo em `weather`; ele não chama a API diretamente.
- A informação corresponde às condições meteorológicas estimadas/modeladas para as coordenadas da cidade/região da partida, não a um sensor físico dentro do estádio.

## Verificações
- `npm run check -w @rodrigol/obs-bridge`: aprovado.
- Novos testes do serviço meteorológico: 3/3 aprovados.
- Suíte OBS Bridge: 51/55, mantendo as mesmas 4 falhas legadas registradas na entrega 6.6 (antes 48/52; os 3 novos testes foram aprovados).
- Overlay Studio: permanece em 19/21, com as mesmas 2 falhas legadas; build aprovado.
- O check global do monorepo mantém erros históricos dos pacotes TypeScript alpha por dependências internas não resolvidas, fora do escopo desta entrega.

## Referência técnica
- Open-Meteo Geocoding API: https://open-meteo.com/en/docs/geocoding-api
- Open-Meteo Weather Forecast API: https://open-meteo.com/en/docs
