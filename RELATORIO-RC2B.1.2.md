# RodriGol Studio RC2B.1.2

## Portal
O Portal foi simplificado para um único arquivo autocontido em:
`apps/obs-bridge/public/portal/index.html`

As URLs `/portal` e `/portal/` servem diretamente esse arquivo.
CSS e JavaScript do Portal estão incorporados ao HTML.

## Destaque editorial
O mecanismo anterior foi abandonado.
Agora manchetes longas usam duas cópias do texto em um track contínuo.
Se a manchete couber, permanece estática. Se ultrapassar a área, a segunda cópia é criada e o track rola continuamente.

## Validação
- Bridge check/testes: aprovados.
- Overlay check/testes/build: aprovados.
- Portal check: aprovado.
- Preflight: aprovado.
- HTTP real:
  - `/portal`: 200
  - `/portal/`: 200
  - `/api/public/home`: 200
