# RodriGol Studio RC2A — Servidor e Acesso Remoto

## O que esta versão permite
A RC2A transforma o Bridge atual em uma base que pode ser colocada em um servidor acessível pela internet sem abandonar o funcionamento local.

Quando o RodriGol é aberto em outro computador através do endereço remoto:
- a Central e as Cabines pedem login;
- partidas, competições, clubes, coberturas, classificações e demais registros usam a persistência do servidor;
- alterações são sincronizadas entre navegadores;
- escudos e logotipos também são sincronizados;
- o Overlay continua servido separadamente em `/studio/`;
- WebSocket continua atualizando as saídas ao vivo.

## Modo local
Nada muda no uso habitual:
`npm start`

Por padrão continua usando `127.0.0.1:4173` e não exige senha.

## Modo remoto
O novo comando é:
`npm run start:remote`

Por segurança, ele NÃO inicia se `RODRIGOL_ADMIN_PASSWORD` não estiver configurada.

### Variáveis principais
Use `.env.remote.example` apenas como referência. O Node não carrega esse arquivo automaticamente nesta versão; as variáveis devem ser definidas no ambiente da hospedagem ou terminal.

- `RODRIGOL_ADMIN_PASSWORD`: senha da Central/Cabines.
- `RODRIGOL_API_TOKEN`: token de integrações.
- `RODRIGOL_PUBLIC_URL`: endereço HTTPS do Bridge.
- `RODRIGOL_PUBLIC_WS`: endereço WSS.
- `RODRIGOL_OVERLAY_URL`: endereço do Overlay.
- `RODRIGOL_ALLOWED_ORIGIN`: domínio permitido.
- `RODRIGOL_SECURE_COOKIES=true`: recomendado/necessário com HTTPS.

## Segurança
Nunca publique diretamente a porta 4173 sem HTTPS numa instalação pública.
A arquitetura prevista é:

Internet
→ domínio HTTPS
→ proxy reverso / plataforma de hospedagem
→ RodriGol Bridge
→ arquivo persistente `apps/obs-bridge/data/rodrigol-store.json`

A senha administrativa protege `/control/`.
O token protege integrações programáticas.
A sessão usa cookie HttpOnly + SameSite=Lax.

## Primeiro acesso remoto
1. Inicie o servidor com a senha configurada.
2. Abra `https://SEU-ENDERECO/control/`.
3. O RodriGol redirecionará para `/login`.
4. Digite a senha.
5. Após o login, a Central abre normalmente.
6. Em Configurações, ative/valide o armazenamento remoto se necessário.

Em hosts que não sejam localhost, a RC2A já assume ambiente remoto e habilita sincronização remota como padrão.

## Sincronização
O servidor é a referência compartilhada para os dados do RodriGol.
O navegador mantém IndexedDB local como cache/fallback.

Isso permite que:
- computador A registre um gol;
- o servidor persista a cobertura;
- computador B receba a atualização;
- Overlay/OBS continuem consumindo o mesmo Bridge.

## Escudos
A RC2A inclui sincronização específica para:
- escudos dos clubes;
- logotipos das competições.

Eles continuam usando IndexedDB no navegador, mas passam a ter cópia compartilhada no servidor quando o armazenamento remoto está ativo.

## O que ainda NÃO é a hospedagem final
A RC2A prepara e protege a aplicação para hospedagem, mas não escolhe nem contrata um provedor.
Também ainda não é o Portal Público. O portal será a RC2B e deverá consumir uma API pública somente de leitura, separada da API administrativa.

## Próximo passo
Subir esta RC2A em um ambiente remoto de teste e, em paralelo, iniciar a RC2B — Portal Público MVP.
