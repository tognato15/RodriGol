# RodriGol Studio RC2A — Servidor e Acesso Remoto

## Entrega
A RC2A prepara o RodriGol Studio para operação fora do computador local, mantendo o modo local intacto.

## Servidor remoto
- Novo comando `npm run start:remote`.
- O modo remoto usa `HOST=0.0.0.0`.
- Por segurança, a inicialização remota é bloqueada se não houver `RODRIGOL_ADMIN_PASSWORD`.
- Existe opção explícita de exceção insegura apenas para desenvolvimento: `RODRIGOL_ALLOW_INSECURE_REMOTE=true`.

## Autenticação administrativa
- `/control/` e todas as Cabines/Centrais passam a exigir login quando `RODRIGOL_ADMIN_PASSWORD` estiver definida.
- Login em `/login`.
- Logout em `/logout`.
- Sessão em cookie HttpOnly, SameSite=Lax.
- Cookies Secure configuráveis para HTTPS.
- Tempo de sessão configurável.
- A API continua aceitando Bearer Token via `RODRIGOL_API_TOKEN`.
- A API também aceita a sessão administrativa quando acessada pelo navegador autenticado.

## WebSocket
- Instalações protegidas exigem sessão administrativa ou token.
- Token de integração pode ser enviado no parâmetro `token` da URL WSS.
- O cliente gerenciado monta esta URL automaticamente quando o token existe.

## Persistência compartilhada
Já existia uma base de persistência do servidor e ela foi integrada ao fluxo remoto:
- dados ficam registrados em `apps/obs-bridge/data/rodrigol-store.json`;
- navegadores remotos usam a cópia do servidor;
- IndexedDB continua como cache local/fallback;
- em hostname remoto, o sistema ativa persistência compartilhada por padrão.

## Assets
A RC2A adiciona sincronização remota para:
- escudos de clubes;
- logotipos de competições.

Isto evita que outro computador tenha os dados da partida mas não possua as imagens cadastradas no navegador original.

## Segurança
- Servidor remoto sem senha: bloqueado.
- Área administrativa: protegida.
- Sessão: HttpOnly.
- Integração: token.
- Produção prevista atrás de HTTPS/proxy reverso.
- `.env.remote.example` incluído apenas como modelo, sem credenciais reais.

## Arquivos de apoio
- `GUIA-RC2A-ACESSO-REMOTO.md`
- `.env.remote.example`
- `RC2A-BUILD-INFO.json`

## Validação
- Bridge check: aprovado.
- Bridge: 68/68 testes aprovados.
- Overlay check: aprovado.
- Overlay: 33/33 testes aprovados.
- Overlay build: aprovado.
- Gate de segurança remoto sem senha: aprovado (inicialização bloqueada).
- `npm run preflight`: aprovado.

## Próxima frente
RC2B — Portal Público MVP, consumindo uma API pública somente de leitura, separada da área administrativa.
