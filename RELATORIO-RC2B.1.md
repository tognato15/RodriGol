# RodriGol Studio RC2B.1 — Fundação do Portal + API Pública

## Entregue
### API pública somente leitura
- GET `/api/public/home`
- GET `/api/public/matches`
- GET `/api/public/matches/:id`
- GET `/api/public/standings`
- GET `/api/public/news`

### Portal
Servido em `/portal/`.

A Home contém:
- jogos do dia;
- partidas agrupadas por competição;
- placar/status;
- classificação;
- notícias;
- atualização automática a cada 5 segundos;
- layout responsivo;
- identidade RodriGol Studio.

## Segurança
A API pública foi separada da API administrativa.
Nenhum endpoint público permite gravação ou alteração de dados.

## Compatibilidade
- servidor remoto RC2A preservado;
- Cabine e Multicabine preservadas;
- Overlay aprovado preservado;
- substituições RC2A.5 preservadas.

## Validação
- Bridge check: aprovado.
- Bridge tests: aprovado.
- Overlay check: aprovado.
- Overlay tests: aprovado.
- Overlay build: aprovado.
- Portal check: aprovado.
- Preflight: aprovado.
- Smoke test HTTP real:
  - `/portal/`: 200;
  - `/api/public/home`: 200;
  - `/api/public/standings`: 200.
