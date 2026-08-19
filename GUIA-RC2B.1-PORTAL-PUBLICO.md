# RodriGol Studio RC2B.1 — Portal Público MVP

## Endereços locais
Com o RodriGol iniciado normalmente:

- Portal: `http://127.0.0.1:4173/portal/`
- API Home: `/api/public/home`
- Jogos: `/api/public/matches`
- Partida individual: `/api/public/matches/ID_DA_PARTIDA`
- Classificações: `/api/public/standings`
- Notícias: `/api/public/news`

## O que já existe no Portal
- identidade visual RodriGol;
- relógio e data;
- jogos do dia agrupados por competição;
- status e placares;
- escudos quando disponíveis no servidor;
- classificações publicadas;
- notícias publicadas;
- layout responsivo para desktop e celular;
- atualização automática a cada 5 segundos, sem F5.

## API pública
A API desta versão é SOMENTE LEITURA.

Ela não expõe:
- senha;
- token;
- configurações administrativas;
- backups;
- dados de sessão;
- escalações completas;
- controles do Overlay;
- endpoints de escrita.

O objetivo é permitir que o Portal consulte apenas informações adequadas para publicação.

## Atualização durante uma rodada
Quando os dados estão centralizados no servidor remoto, o Portal recebe a mesma base usada pelo RodriGol Studio.

No modo local, existe também um fallback para as informações que o Studio já publica nas regiões do Overlay. Assim, placares do dia e classificações podem ser exibidos durante os testes mesmo antes da hospedagem definitiva.

## Próximos blocos previstos
### RC2B.2
Página de partida:
- cronologia;
- autores dos gols;
- status;
- estádio;
- eventos relevantes;
- atualização automática.

### RC2B.3
Navegação completa:
- resultados;
- competições;
- páginas de clubes;
- classificação completa;
- arquivo.

### RC2C
Tempo real Studio ↔ Portal ↔ Overlay:
- substituir polling onde fizer sentido por canal público em tempo real;
- preparar cache e publicação na internet;
- primeiro teste público de rodada.
