# RodriGol Portal — Go-Live 1
## Publicação inicial no Railway

Esta versão não muda o funcionamento do Portal. Ela prepara o mesmo RodriGol para rodar fora do computador local.

## Arquitetura inicial

- **Produção:** Railway
- **Desenvolvimento:** continua no computador local
- **Dados da produção:** volume persistente `/data`
- **Portal público:** `/portal/`
- **Studio/Cabine:** `/control/`, protegido por senha
- **Diagnóstico:** `/health`

Não usar o mesmo arquivo de dados entre desenvolvimento e produção.

---

## Etapa 1 — criar a conta Railway

1. Entre no site do Railway.
2. Crie uma conta.
3. Ainda não é necessário comprar domínio.
4. Crie um projeto novo chamado, por exemplo, `rodrigol-production`.

## Etapa 2 — colocar o código em um repositório GitHub

O Railway consegue publicar diretamente de um repositório GitHub.

Nesta fase, não publique senhas dentro do repositório.

Arquivos como `.env.production.example` são apenas modelos e não contêm a senha real.

## Etapa 3 — criar o serviço

No projeto Railway:

1. Escolha **Deploy from GitHub repo**.
2. Selecione o repositório do RodriGol.
3. O Railway encontrará o `Dockerfile` na raiz.
4. Aguarde o primeiro build.

O primeiro deploy poderá falhar antes de configurarmos as variáveis. Isso é esperado porque o RodriGol bloqueia acesso remoto sem senha administrativa.

## Etapa 4 — variáveis obrigatórias

No serviço Railway, abra **Variables** e adicione:

- `HOST` = `0.0.0.0`
- `RODRIGOL_ENV` = `production`
- `RODRIGOL_DATA_DIR` = `/data`
- `RODRIGOL_ADMIN_PASSWORD` = uma senha forte escolhida por você
- `RODRIGOL_SECURE_COOKIES` = `true`
- `RODRIGOL_SESSION_TTL_HOURS` = `12`
- `RODRIGOL_OVERLAY_ROOT` = `studio`
- `RODRIGOL_ALLOWED_ORIGIN` = `*`

Opcional agora:
- `RODRIGOL_API_TOKEN` = token longo e aleatório

Não crie manualmente a variável `PORT`; Railway fornece a porta.

## Etapa 5 — volume persistente

Este passo é obrigatório.

Adicione um volume ao serviço e configure:

**Mount Path:** `/data`

É nesse diretório que a produção gravará `rodrigol-store.json`.

Sem o volume, um novo deploy poderia perder alterações feitas no Studio.

## Etapa 6 — domínio temporário

No serviço:

**Settings → Networking → Public Networking → Generate Domain**

O Railway fornecerá um endereço temporário.

Exemplo conceitual:

`https://rodrigol-production.up.railway.app`

A partir dele:

- Portal: `https://.../portal/`
- Studio: `https://.../control/`
- Health: `https://.../health`

Ao entrar em `/control/`, o RodriGol solicitará a senha configurada.

## Etapa 7 — primeiro teste externo

Não teste apenas no mesmo computador.

Abra o Portal:

1. Chrome;
2. Edge;
3. celular usando 4G/5G, com o Wi-Fi desligado.

Se os três abrirem o mesmo endereço HTTPS, o primeiro objetivo do Go-Live estará cumprido.

## Etapa 8 — domínio definitivo

Não é obrigatório para o primeiro teste público.

Depois podemos configurar algo como:

- `rodrigol.com.br`
- `www.rodrigol.com.br`
- `studio.rodrigol.com.br`

A definição do domínio será feita depois de escolhermos/registrarmos o endereço definitivo.

## Regra de segurança

O público deve usar o Portal.
A área `/control/` permanece protegida.

Nunca envie a senha administrativa em mensagem pública, código-fonte ou arquivo versionado.

## Próxima fase após o servidor funcionar

1. player persistente da Rádio RodriGol;
2. calendário/filtro por datas;
3. siglas nos placares compactos;
4. hotsite de competição + classificação individual;
5. slider com imagens;
6. primeiro motor multiesportes.
