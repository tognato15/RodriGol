# Modelo de Domínio do RodriGol

> Este documento define as entidades centrais do RodriGol, seus relacionamentos e suas responsabilidades.
>
> Ele complementa o `ENGINEERING.md` e servirá como referência para a implementação do Núcleo Operacional.

---

# 1. Objetivo

O Modelo de Domínio descreve as informações que existem dentro do RodriGol e como elas se relacionam.

Ele não define:

- o layout das telas;
- a tecnologia utilizada;
- a estrutura do banco de dados;
- o formato definitivo da API;
- a aparência do Broadcast;
- a aparência do site ou do aplicativo.

Essas decisões serão tomadas em etapas específicas.

O objetivo deste documento é definir a realidade que o sistema deverá representar.

---

# 2. Princípio Fundamental

O RodriGol possui uma única fonte de verdade.

Studio, Broadcast e Live não devem manter versões independentes dos mesmos dados.

```text
                      RodriGol

          ┌──────────────┼──────────────┐
          │              │              │
       Studio        Broadcast         Live
          │              │              │
          └──────────────┼──────────────┘
                         │
                Núcleo Operacional
                         │
                 Fonte Única de Dados
```

Uma informação registrada no RodriGol Studio poderá alimentar todos os canais autorizados.

---

# 3. Visão Geral do Domínio

As principais entidades do RodriGol são:

1. Modalidade;
2. País ou território;
3. Organização;
4. Competição;
5. Temporada;
6. Fase;
7. Participante;
8. Local esportivo;
9. Evento esportivo;
10. Cobertura;
11. Ocorrência;
12. Cronologia;
13. Item editorial;
14. Publicação;
15. Canal;
16. Widget;
17. Usuário;
18. Equipe operacional.

Nem todas precisarão ser implementadas imediatamente.

O modelo define a direção do produto para evitar que a primeira implementação limite sua evolução.

---

# 4. Modalidade

A Modalidade identifica o esporte ou a disciplina esportiva.

Exemplos:

- futebol;
- basquete;
- vôlei;
- tênis;
- automobilismo;
- atletismo;
- natação;
- handebol;
- esportes eletrônicos.

Uma Modalidade poderá possuir variações.

Exemplos:

```text
Futebol
├── Futebol de campo
├── Futsal
├── Futebol de areia
└── Futebol feminino
```

A Modalidade define quais regras e estruturas poderão ser utilizadas pelo sistema.

Exemplos:

- tipos de período;
- forma de pontuação;
- tipos de ocorrência;
- participantes possíveis;
- estrutura de classificação;
- estatísticas disponíveis.

## Relacionamentos

Uma Modalidade pode possuir:

- muitas Competições;
- muitos Eventos Esportivos;
- muitos Participantes;
- muitos tipos de Ocorrência.

---

# 5. País ou Território

Representa a localização institucional ou geográfica de uma organização, competição, participante ou evento.

Pode representar:

- país;
- território;
- região;
- estado;
- província;
- cidade.

Exemplos:

- Brasil;
- Argentina;
- Inglaterra;
- São Paulo;
- Rio de Janeiro.

Essa entidade permitirá organizar competições e participantes sem limitar o RodriGol a uma única estrutura geográfica.

---

# 6. Organização

Representa uma entidade responsável por organizar competições ou administrar uma modalidade.

Exemplos:

- FIFA;
- Conmebol;
- CBF;
- UEFA;
- NBA;
- Comitê Olímpico Internacional;
- federações estaduais;
- ligas independentes.

Uma Organização poderá:

- administrar várias Competições;
- atuar em uma ou mais Modalidades;
- possuir relação com outras Organizações;
- operar em um ou mais países ou territórios.

---

# 7. Competição

A Competição representa um torneio, campeonato, liga, copa, circuito ou conjunto organizado de disputas.

Exemplos:

- Campeonato Brasileiro;
- Copa do Brasil;
- Premier League;
- Copa Libertadores;
- Liga dos Campeões;
- NBA;
- Jogos Olímpicos;
- Campeonato Mundial de Fórmula 1.

A Competição é uma estrutura permanente.

Sua edição em determinado período será representada por uma Temporada.

Exemplo:

```text
Competição:
Campeonato Brasileiro

Temporadas:
├── Campeonato Brasileiro 2025
├── Campeonato Brasileiro 2026
└── Campeonato Brasileiro 2027
```

Uma Competição poderá possuir:

- nome oficial;
- nome curto;
- sigla;
- modalidade;
- organização responsável;
- país ou território;
- identidade visual;
- formato geral;
- temporadas;
- participantes;
- regras;
- fases;
- eventos esportivos.

## Regra importante

Uma Competição não pertence a uma Cobertura.

Ela existe independentemente das operações jornalísticas.

Uma Cobertura apenas referencia as Competições que está acompanhando.

---

# 8. Temporada

A Temporada representa uma edição específica de uma Competição.

Exemplos:

- Campeonato Brasileiro 2026;
- Premier League 2026/27;
- NBA 2026/27;
- Fórmula 1 2026;
- Jogos Olímpicos de 2028.

Uma Temporada poderá possuir:

- data de início;
- data de encerramento;
- participantes;
- fases;
- regulamento;
- classificação;
- calendário;
- eventos esportivos;
- estado operacional.

Uma Competição poderá possuir muitas Temporadas.

Uma Temporada pertence a uma única Competição.

---

# 9. Fase

A Fase representa uma divisão interna de uma Temporada.

Exemplos:

- fase de grupos;
- primeira fase;
- oitavas de final;
- quartas de final;
- semifinal;
- final;
- turno;
- returno;
- temporada regular;
- playoffs;
- etapa classificatória.

Fases poderão ser organizadas hierarquicamente.

```text
Temporada
├── Fase de grupos
│   ├── Grupo A
│   ├── Grupo B
│   └── Grupo C
└── Eliminatórias
    ├── Oitavas de final
    ├── Quartas de final
    ├── Semifinal
    └── Final
```

Uma Fase poderá possuir:

- eventos esportivos;
- grupos;
- rodadas;
- regras próprias;
- critérios de classificação;
- classificação específica.

---

# 10. Participante

Participante é a entidade que disputa um Evento Esportivo.

Pode representar:

- clube;
- seleção;
- franquia;
- equipe;
- atleta;
- piloto;
- dupla;
- equipe de automobilismo;
- delegação;
- competidor individual.

Exemplos:

- Palmeiras;
- Seleção Brasileira;
- Los Angeles Lakers;
- Novak Djokovic;
- uma equipe de Fórmula 1;
- um atleta olímpico.

O tipo do Participante dependerá da Modalidade.

Um Participante poderá possuir:

- nome oficial;
- nome curto;
- sigla;
- identidade visual;
- cores;
- país ou território;
- modalidade;
- elenco;
- comissão técnica;
- informações institucionais;
- participações em Competições.

## Regra importante

O sistema não deve assumir que todo Evento Esportivo possui exatamente dois times.

O modelo deverá comportar:

- dois adversários;
- vários competidores;
- participantes individuais;
- equipes;
- baterias;
- corridas;
- grupos;
- provas coletivas.

---

# 11. Pessoa

Pessoa representa um indivíduo relacionado ao ambiente esportivo ou editorial.

Pode representar:

- atleta;
- técnico;
- árbitro;
- dirigente;
- jornalista;
- operador;
- comentarista;
- narrador;
- produtor;
- membro de comissão técnica.

Uma Pessoa poderá exercer diferentes funções em diferentes contextos.

Exemplo:

```text
Pessoa
└── Vínculos
    ├── Atleta de um clube
    ├── Integrante de uma seleção
    └── Usuário do RodriGol
```

Nem toda Pessoa será um Usuário do sistema.

Nem todo Usuário precisará estar associado a uma personalidade esportiva pública.

---

# 12. Local Esportivo

Representa o local em que um Evento Esportivo acontece.

Pode ser:

- estádio;
- ginásio;
- arena;
- autódromo;
- circuito;
- quadra;
- piscina;
- pista;
- cidade;
- sede virtual.

Um Local Esportivo poderá possuir:

- nome;
- nome curto;
- cidade;
- país ou território;
- capacidade;
- fuso horário;
- coordenadas;
- identidade visual;
- características específicas da modalidade.

---

# 13. Evento Esportivo

Evento Esportivo representa uma disputa real programada ou realizada.

É uma entidade genérica que poderá representar diferentes modalidades.

Exemplos:

- uma partida de futebol;
- um jogo de basquete;
- uma corrida;
- uma prova de natação;
- uma luta;
- uma partida de tênis;
- uma etapa de ciclismo;
- uma competição de ginástica.

## Estrutura básica

Um Evento Esportivo poderá possuir:

- modalidade;
- competição;
- temporada;
- fase;
- rodada ou etapa;
- participantes;
- local;
- data e horário;
- estado;
- placar ou resultado;
- relógio esportivo;
- períodos;
- ocorrências;
- escalações ou inscrições;
- estatísticas;
- classificação relacionada;
- responsáveis oficiais.

## Regra importante

“Partida” será um tipo de Evento Esportivo.

Isso impede que o núcleo do RodriGol fique limitado ao futebol ou a esportes disputados entre duas equipes.

```text
Evento Esportivo
├── Partida
├── Corrida
├── Prova
├── Luta
├── Etapa
└── Disputa
```

---

# 14. Partida

Partida é uma especialização de Evento Esportivo.

Ela poderá ser usada por modalidades como:

- futebol;
- basquete;
- vôlei;
- handebol;
- tênis;
- futsal;
- hóquei.

Uma Partida poderá possuir:

- mandante;
- visitante;
- placar;
- períodos;
- relógio;
- escalações;
- banco de reservas;
- arbitragem;
- estatísticas;
- ocorrências;
- estado.

## Regra importante

Os conceitos de mandante e visitante não devem ser obrigatórios para todas as modalidades.

Eles serão utilizados apenas quando fizerem sentido.

---

# 15. Cobertura

Cobertura representa uma operação jornalística realizada pelo RodriGol.

É uma das entidades centrais do RodriGol Studio.

Uma Cobertura poderá acompanhar:

- uma única partida;
- várias partidas;
- uma rodada;
- uma competição;
- várias competições;
- uma modalidade;
- várias modalidades;
- um programa esportivo;
- uma janela de transferências;
- um dia de Jogos Olímpicos;
- uma programação contínua de 24 horas.

## Exemplos

```text
Cobertura:
Palmeiras x Flamengo
```

```text
Cobertura:
Rodada do Campeonato Brasileiro
```

```text
Cobertura:
Domingo de Futebol Internacional
```

```text
Cobertura:
Jogos Olímpicos — Dia 8
```

```text
Cobertura:
RodriGol 24 Horas
```

## Uma Cobertura poderá possuir

- título;
- descrição;
- período operacional;
- estado;
- prioridade;
- modalidades acompanhadas;
- competições acompanhadas;
- eventos esportivos acompanhados;
- operadores;
- equipe editorial;
- cabine;
- cronologia;
- itens editoriais;
- publicações;
- canais de saída;
- widgets ativos;
- alertas;
- configurações.

## Relacionamentos

Uma Cobertura pode acompanhar muitas Competições.

Uma Competição pode aparecer em muitas Coberturas.

```text
Cobertura N : N Competição
```

Uma Cobertura pode acompanhar muitos Eventos Esportivos.

Um Evento Esportivo pode ser acompanhado por mais de uma Cobertura.

```text
Cobertura N : N Evento Esportivo
```

## Regra importante

A Cobertura não é proprietária da Competição nem do Evento Esportivo.

Ela organiza a forma como essas entidades serão acompanhadas jornalisticamente.

---

# 16. Cabine

A Cabine é o ambiente operacional de uma Cobertura.

Ela reúne as ferramentas necessárias para que os operadores acompanhem, registrem e publiquem informações.

A Cabine não é uma entidade esportiva independente.

Ela existe dentro de uma Cobertura.

```text
Cobertura
└── Cabine
```

Uma Cabine poderá reunir:

- visão geral;
- eventos esportivos acompanhados;
- relógios;
- ocorrências;
- cronologia;
- escalações;
- informações de apoio;
- notas;
- alertas;
- itens editoriais;
- publicações;
- controles de Broadcast;
- operadores presentes.

## Regra importante

A Cabine é uma interface operacional.

As regras de negócio utilizadas por ela pertencem ao Núcleo Operacional.

---

# 17. Ocorrência

Ocorrência representa um acontecimento registrado durante uma Cobertura ou um Evento Esportivo.

Exemplos esportivos:

- gol;
- ponto;
- cartão;
- substituição;
- pênalti;
- lesão;
- início;
- intervalo;
- reinício;
- encerramento;
- abandono;
- desclassificação;
- alteração de liderança.

Exemplos gerais:

- chuva;
- paralisação;
- atraso;
- problema técnico;
- informação;
- confirmação de escalação;
- entrevista;
- notícia de bastidor;
- breaking news.

## Uma Ocorrência poderá possuir

- tipo;
- origem;
- momento de registro;
- momento esportivo;
- descrição;
- participante relacionado;
- pessoa relacionada;
- evento esportivo relacionado;
- cobertura relacionada;
- prioridade;
- confiabilidade;
- estado de validação;
- autor do registro;
- dados complementares;
- consequências provocadas.

## Escopo da Ocorrência

Uma Ocorrência poderá estar relacionada:

- a um Evento Esportivo específico;
- diretamente à Cobertura;
- a uma Competição;
- a um Participante;
- a uma Pessoa;
- a mais de uma entidade relacionada.

Exemplo:

```text
Informação:
“Partida suspensa por causa da chuva”
```

Essa informação pode pertencer à Partida sem pertencer a nenhum dos dois times.

## Regra importante

O sistema nunca deverá associar automaticamente uma ocorrência geral ao mandante ou ao primeiro participante.

A associação com participante será opcional quando o tipo de ocorrência permitir.

---

# 18. Tipo de Ocorrência

Define a natureza de uma Ocorrência.

Exemplos:

- gol;
- cartão amarelo;
- cartão vermelho;
- substituição;
- início de período;
- fim de período;
- informação;
- alerta;
- resultado confirmado.

Cada Modalidade poderá disponibilizar tipos específicos.

Um Tipo de Ocorrência poderá definir:

- campos obrigatórios;
- campos opcionais;
- impacto no placar;
- impacto no relógio;
- impacto no estado;
- impacto na classificação;
- prioridade padrão;
- possibilidade de publicação automática;
- apresentação sugerida.

Exemplo:

```text
Tipo: Gol

Pode exigir:
- participante;
- autor;
- minuto.

Pode provocar:
- atualização do placar;
- atualização da cronologia;
- recálculo da classificação;
- criação de item editorial;
- atualização dos widgets.
```

---

# 19. Cronologia

A Cronologia organiza acontecimentos em ordem temporal.

Ela não deve duplicar as informações das Ocorrências.

Ela apresenta referências organizadas aos acontecimentos registrados.

Poderão existir diferentes cronologias:

- cronologia da Partida;
- cronologia do Evento Esportivo;
- cronologia da Cobertura;
- cronologia da Competição;
- cronologia editorial.

Exemplo:

```text
Cobertura
└── Cronologia
    ├── 14:58 — Escalações confirmadas
    ├── 15:00 — Partida iniciada
    ├── 15:18 — Gol do Palmeiras
    ├── 15:34 — Cartão amarelo
    └── 15:48 — Intervalo
```

---

# 20. Estado Esportivo

Estado Esportivo representa a situação atual de um Evento Esportivo.

Exemplos genéricos:

- agendado;
- adiado;
- cancelado;
- atrasado;
- em preparação;
- ao vivo;
- interrompido;
- suspenso;
- encerrado;
- abandonado.

Estados específicos poderão variar de acordo com a Modalidade.

Exemplo no futebol:

```text
Agendada
↓
Pré-jogo
↓
Primeiro tempo
↓
Intervalo
↓
Segundo tempo
↓
Encerrada
```

As transições serão definidas detalhadamente no documento de máquinas de estado.

---

# 21. Relógio Esportivo

O Relógio Esportivo representa o tempo interno de um Evento Esportivo.

Ele é diferente do horário comum.

Cada Evento Esportivo poderá possuir seu próprio relógio.

Um relógio poderá:

- iniciar;
- pausar;
- continuar;
- encerrar;
- avançar manualmente;
- receber correção;
- trocar de período.

Exemplos:

- minuto de uma partida de futebol;
- cronômetro regressivo no basquete;
- tempo de uma prova;
- volta atual de uma corrida;
- período de um jogo de vôlei.

## Regra importante

Pausar o relógio de um Evento Esportivo não poderá interferir nos relógios dos demais eventos acompanhados pela mesma Cobertura.

---

# 22. Resultado

Resultado representa o estado competitivo de um Evento Esportivo.

Pode incluir:

- placar;
- pontuação;
- sets;
- games;
- voltas;
- tempos;
- posições;
- penalidades;
- classificação final.

O formato do Resultado dependerá da Modalidade.

## Regra importante

O núcleo não deverá representar todos os resultados apenas como:

```text
Mandante 0 x 0 Visitante
```

Esse formato atende ao futebol, mas não atende a todo o ecossistema esportivo.

---

# 23. Estatística

Estatística representa um dado quantitativo relacionado a uma entidade esportiva.

Ela poderá estar vinculada a:

- Evento Esportivo;
- Participante;
- Pessoa;
- Competição;
- Temporada;
- Fase.

Exemplos:

- posse de bola;
- finalizações;
- rebotes;
- aces;
- voltas mais rápidas;
- aproveitamento;
- pontos;
- vitórias.

## Regra estrutural

A Central de Estatísticas não fará parte dos ambientes principais do RodriGol Studio.

As Estatísticas continuarão existindo como dados contextuais dentro de:

- Eventos Esportivos;
- Competições;
- Participantes;
- Coberturas;
- páginas públicas;
- widgets;
- publicações.

---

# 24. Classificação

Classificação representa a organização competitiva dos Participantes em uma Temporada, Fase, Grupo ou etapa.

Poderá possuir:

- posição;
- participante;
- pontos;
- jogos;
- vitórias;
- empates;
- derrotas;
- critérios específicos;
- zonas de classificação;
- atualização ao vivo.

O formato dependerá da Modalidade e do regulamento.

A Classificação deverá ser calculada ou atualizada pelo Núcleo Operacional.

Widgets e interfaces apenas apresentam seu estado.

---

# 25. Item Editorial

Item Editorial representa uma informação que precisa ser analisada, preparada, destacada ou publicada pela redação.

Ele funciona como unidade de trabalho da Mesa Editorial.

Poderá nascer de:

- uma Ocorrência;
- uma apuração;
- uma nota manual;
- uma fonte externa;
- uma decisão do operador;
- um alerta automático do sistema.

Um Item Editorial poderá possuir:

- título;
- resumo;
- conteúdo;
- origem;
- prioridade;
- confiabilidade;
- responsável;
- estado editorial;
- entidades relacionadas;
- destinos sugeridos;
- horário;
- instruções.

## Estados possíveis

Exemplos iniciais:

- recebido;
- em análise;
- confirmado;
- rejeitado;
- preparado;
- aprovado;
- publicado;
- arquivado.

Os estados definitivos serão definidos na etapa de máquinas de estado.

---

# 26. Publicação

Publicação representa uma informação preparada para um ou mais canais públicos.

Ela poderá alimentar:

- Broadcast;
- site;
- aplicativo;
- notificações;
- redes sociais;
- APIs futuras.

Uma Publicação poderá possuir:

- título;
- texto;
- conteúdo estruturado;
- origem;
- prioridade;
- estado;
- canais de destino;
- entidades relacionadas;
- horário de publicação;
- horário de expiração;
- autor;
- aprovador;
- versões.

## Regra importante

Publicação não altera o fato esportivo.

Ela comunica uma informação existente no sistema.

Exemplo:

```text
Ocorrência:
Gol do Palmeiras aos 18 minutos.

Consequência esportiva:
Placar atualizado para 1 a 0.

Item editorial:
Gol confirmado — preparar destaque.

Publicações:
├── Alerta no Broadcast
├── Atualização no ticker
├── Atualização no site
└── Notificação no aplicativo
```

---

# 27. Canal

Canal representa um destino de distribuição.

Exemplos:

- Broadcast principal;
- overlay de testes;
- canal do YouTube;
- site;
- aplicativo;
- notificação;
- painel interno;
- API.

Um Canal poderá possuir:

- nome;
- tipo;
- estado;
- público;
- configurações;
- permissões;
- formatos aceitos;
- regras de publicação.

Uma Publicação poderá ser destinada a vários Canais.

Um Canal poderá receber muitas Publicações.

```text
Publicação N : N Canal
```

---

# 28. Widget

Widget representa um componente visual que apresenta informações.

Exemplos:

- placar;
- ticker;
- alerta de gol;
- classificação;
- lista de partidas;
- cronologia;
- manchete;
- lower third;
- agenda;
- relógio;
- notícia.

Um Widget poderá ser utilizado em:

- Broadcast;
- telas internas;
- site;
- aplicativo;
- painéis de acompanhamento.

## Um Widget poderá possuir

- tipo;
- região visual;
- estado de exibição;
- prioridade;
- fonte de dados;
- publicação relacionada;
- cobertura relacionada;
- canal relacionado;
- configuração visual;
- tempo de permanência.

## Regra importante

Widgets não são fontes de verdade.

Eles apenas apresentam dados fornecidos pelo Núcleo Operacional.

Remover um Widget da tela não poderá remover nem alterar a informação original.

---

# 29. Usuário

Usuário representa uma pessoa autorizada a acessar o RodriGol Studio ou seus ambientes administrativos.

Um Usuário poderá possuir:

- nome;
- identidade;
- credenciais;
- perfil;
- permissões;
- equipes operacionais;
- coberturas atribuídas;
- histórico de ações;
- estado de acesso.

Exemplos de perfis:

- administrador;
- editor-chefe;
- produtor;
- operador;
- jornalista;
- narrador;
- comentarista;
- observador.

As permissões deverão ser definidas por capacidade, e não apenas por tela.

Exemplos:

- criar Cobertura;
- registrar Ocorrência;
- corrigir placar;
- aprovar Publicação;
- controlar Widgets;
- administrar Competição;
- gerenciar Usuários.

---

# 30. Equipe Operacional

Equipe Operacional representa um grupo de Usuários reunidos para trabalhar em uma Cobertura ou operação.

Exemplos:

- equipe do futebol nacional;
- equipe do futebol internacional;
- equipe olímpica;
- equipe de publicação;
- equipe do Broadcast;
- plantão da madrugada.

Uma Equipe Operacional poderá possuir:

- nome;
- usuários;
- funções;
- coberturas atribuídas;
- turno;
- responsável;
- permissões específicas.

Uma Cobertura poderá possuir várias equipes.

Um Usuário poderá participar de várias equipes.

```text
Usuário N : N Equipe Operacional
```

---

# 31. Alerta

Alerta representa uma informação que exige atenção operacional.

Pode ser criado:

- manualmente;
- por uma regra;
- por uma Ocorrência;
- por falha técnica;
- por mudança de estado;
- por conflito de informações.

Exemplos:

- gol aguardando confirmação;
- relógio parado inesperadamente;
- placar divergente;
- publicação não entregue;
- partida atrasada;
- operador desconectado;
- informação de alta prioridade.

Um Alerta poderá possuir:

- tipo;
- severidade;
- mensagem;
- origem;
- entidades relacionadas;
- responsável;
- estado;
- horário;
- ação recomendada.

---

# 32. Nota e Apuração

Nota representa uma informação interna da redação.

Ela poderá ser:

- rascunho;
- observação;
- pauta;
- fonte;
- informação não confirmada;
- instrução ao narrador;
- contexto;
- lembrete editorial.

Uma Nota não será pública por padrão.

Ela poderá posteriormente gerar:

- Item Editorial;
- Publicação;
- Alerta;
- Ocorrência confirmada.

## Regra importante

Informações internas e informações públicas devem permanecer claramente diferenciadas.

---

# 33. Mídia

Mídia representa um material utilizado pela redação ou pelos canais de publicação.

Exemplos:

- imagem;
- vídeo;
- áudio;
- escudo;
- logotipo;
- fotografia;
- gráfico;
- documento;
- trecho de entrevista.

Uma Mídia poderá estar associada a:

- Participante;
- Competição;
- Evento Esportivo;
- Cobertura;
- Item Editorial;
- Publicação;
- Widget.

---

# 34. Histórico

O histórico representa o registro persistente das ações e acontecimentos do sistema.

A retirada do Centro Histórico não elimina a necessidade de preservar o histórico dos dados.

O histórico poderá existir dentro de:

- Coberturas;
- Eventos Esportivos;
- Competições;
- Publicações;
- Usuários;
- auditoria;
- cronologias.

## Regra estrutural

O Centro Histórico não será um ambiente principal independente do RodriGol Studio.

O histórico será acessado dentro do contexto correspondente.

Exemplos:

- histórico de uma Cobertura;
- histórico de uma Partida;
- histórico de alterações do placar;
- histórico de uma Publicação;
- histórico de ações de um Usuário.

---

# 35. Relacionamentos Principais

## Estrutura esportiva

```text
Modalidade
└── Competições
    └── Temporadas
        └── Fases
            └── Eventos Esportivos
                ├── Participantes
                ├── Ocorrências
                ├── Resultado
                ├── Relógio
                └── Estatísticas
```

Essa representação demonstra a organização mais comum.

Ela não significa que todas as modalidades precisarão utilizar todas as entidades da mesma forma.

---

## Estrutura operacional

```text
Cobertura
├── Cabine
├── Competições acompanhadas
├── Eventos Esportivos acompanhados
├── Equipes Operacionais
├── Cronologia
├── Ocorrências gerais
├── Itens Editoriais
├── Publicações
├── Alertas
└── Widgets ativos
```

---

## Estrutura editorial

```text
Ocorrência
↓
Item Editorial
↓
Publicação
↓
Canal
↓
Widget ou Interface Pública
```

Nem toda Ocorrência precisará gerar um Item Editorial.

Nem todo Item Editorial precisará gerar uma Publicação.

Nem toda Publicação precisará ser apresentada por um Widget.

---

# 36. Relacionamentos de Cardinalidade

## Modalidade e Competição

```text
Uma Modalidade possui muitas Competições.
Uma Competição pertence principalmente a uma Modalidade.
```

```text
Modalidade 1 : N Competição
```

---

## Competição e Temporada

```text
Uma Competição possui muitas Temporadas.
Uma Temporada pertence a uma Competição.
```

```text
Competição 1 : N Temporada
```

---

## Temporada e Fase

```text
Uma Temporada possui muitas Fases.
Uma Fase pertence a uma Temporada.
```

```text
Temporada 1 : N Fase
```

---

## Evento Esportivo e Participante

```text
Um Evento Esportivo possui um ou muitos Participantes.
Um Participante pode disputar muitos Eventos Esportivos.
```

```text
Evento Esportivo N : N Participante
```

---

## Cobertura e Competição

```text
Uma Cobertura pode acompanhar muitas Competições.
Uma Competição pode aparecer em muitas Coberturas.
```

```text
Cobertura N : N Competição
```

---

## Cobertura e Evento Esportivo

```text
Uma Cobertura pode acompanhar muitos Eventos Esportivos.
Um Evento Esportivo pode aparecer em mais de uma Cobertura.
```

```text
Cobertura N : N Evento Esportivo
```

---

## Evento Esportivo e Ocorrência

```text
Um Evento Esportivo pode possuir muitas Ocorrências.
Uma Ocorrência esportiva pertence principalmente a um Evento Esportivo.
```

```text
Evento Esportivo 1 : N Ocorrência
```

Ocorrências gerais poderão pertencer diretamente à Cobertura.

---

## Cobertura e Item Editorial

```text
Uma Cobertura pode possuir muitos Itens Editoriais.
Um Item Editorial pertence a uma Cobertura operacional.
```

```text
Cobertura 1 : N Item Editorial
```

---

## Item Editorial e Publicação

```text
Um Item Editorial pode gerar nenhuma, uma ou várias Publicações.
Uma Publicação pode ser derivada de um Item Editorial.
```

```text
Item Editorial 1 : N Publicação
```

---

## Publicação e Canal

```text
Uma Publicação pode ser enviada a vários Canais.
Um Canal pode receber várias Publicações.
```

```text
Publicação N : N Canal
```

---

# 37. Fluxo de um Acontecimento

Exemplo de registro de gol:

```text
1. O operador registra uma Ocorrência do tipo Gol.

2. O Núcleo Operacional valida os dados.

3. A Ocorrência é vinculada ao Evento Esportivo.

4. O Resultado da Partida é atualizado.

5. A Cronologia da Partida é atualizada.

6. A Cronologia da Cobertura é atualizada.

7. A Classificação ao vivo poderá ser recalculada.

8. Um Item Editorial poderá ser criado.

9. Uma ou mais Publicações poderão ser geradas.

10. Os Canais autorizados recebem a atualização.

11. Os Widgets apresentam o novo estado.

12. Broadcast e Live passam a refletir a mesma informação.
```

Representação:

```text
Operador
   ↓
Ocorrência
   ↓
Validação
   ↓
Atualização do Evento Esportivo
   ├── Resultado
   ├── Cronologia
   ├── Estatísticas
   └── Classificação
            ↓
       Item Editorial
            ↓
         Publicação
            ↓
    ┌───────┼────────┐
    │       │        │
Broadcast  Site   Aplicativo
```

---

# 38. Identidade das Entidades

Toda entidade persistente deverá possuir uma identidade única.

Exemplos:

- identificador da Cobertura;
- identificador da Competição;
- identificador do Evento Esportivo;
- identificador da Ocorrência;
- identificador da Publicação.

A identidade deverá permanecer estável mesmo quando:

- o nome for alterado;
- a descrição for corrigida;
- a situação mudar;
- o registro for arquivado;
- a entidade for apresentada em outro canal.

## Regra importante

O sistema não deve utilizar o nome visível como identidade técnica permanente.

---

# 39. Data e Hora

Todos os registros relevantes deverão armazenar data e hora.

Quando necessário, o sistema deverá diferenciar:

- horário real do acontecimento;
- horário do registro;
- horário da confirmação;
- horário da publicação;
- horário de atualização;
- tempo esportivo;
- fuso horário.

Exemplo:

```text
Gol ocorrido:
21h18min04s

Registrado no Studio:
21h18min12s

Confirmado:
21h18min20s

Publicado:
21h18min22s

Tempo esportivo:
34 minutos do primeiro tempo
```

Esses horários não representam a mesma coisa e não deverão ser confundidos.

---

# 40. Origem da Informação

Toda informação relevante deverá indicar sua origem.

Exemplos:

- registro manual;
- operador;
- fonte oficial;
- API;
- integração;
- importação;
- cálculo do sistema;
- automação;
- correção administrativa.

Quando possível, o sistema deverá preservar:

- origem;
- responsável;
- horário;
- confiabilidade;
- estado de confirmação.

Isso será importante para a operação jornalística e para a auditoria.

---

# 41. Correções

Informações poderão precisar de correção.

Uma correção não deve apagar silenciosamente o que aconteceu.

O sistema deverá preservar:

- valor anterior;
- valor corrigido;
- responsável pela correção;
- horário;
- motivo;
- consequências da alteração.

Exemplo:

```text
Ocorrência original:
Gol atribuído ao jogador A.

Correção:
Gol confirmado para o jogador B.
```

A correção poderá atualizar:

- cronologia;
- estatísticas;
- publicações;
- widgets;
- páginas públicas.

---

# 42. Arquivamento

Entidades que não estiverem mais em uso poderão ser arquivadas.

Arquivar não é o mesmo que excluir.

O arquivamento deverá permitir preservar:

- histórico;
- relacionamentos;
- publicações;
- auditoria;
- resultados;
- cronologias.

Exclusões permanentes deverão ser excepcionais e protegidas por permissões específicas.

---

# 43. Extensibilidade

O Modelo de Domínio deverá permitir a expansão do RodriGol sem exigir a reconstrução do núcleo.

O sistema deverá permitir adicionar:

- novas Modalidades;
- novos Tipos de Ocorrência;
- novos formatos de Resultado;
- novos Canais;
- novos Widgets;
- novas regras de Competição;
- novas formas de Publicação.

## Regra importante

Adicionar uma nova modalidade não deve exigir a criação de uma plataforma separada.

As particularidades deverão ser adicionadas por módulos especializados conectados ao mesmo núcleo.

---

# 44. Limites dos Módulos

O domínio deverá ser dividido em áreas de responsabilidade.

```text
Núcleo RodriGol
├── Esportes
├── Competições
├── Coberturas
├── Operação
├── Editorial
├── Publicação
├── Identidade e Acesso
└── Apresentação
```

## Esportes

Responsável por:

- modalidades;
- participantes;
- pessoas;
- eventos esportivos;
- ocorrências;
- resultados;
- relógios;
- estatísticas.

## Competições

Responsável por:

- competições;
- temporadas;
- fases;
- calendários;
- classificações;
- regulamentos.

## Coberturas

Responsável por:

- coberturas;
- cabines;
- eventos acompanhados;
- prioridades;
- equipes operacionais.

## Editorial

Responsável por:

- itens editoriais;
- notas;
- apurações;
- prioridades jornalísticas;
- aprovações.

## Publicação

Responsável por:

- publicações;
- canais;
- distribuição;
- versões;
- estado de entrega.

## Identidade e Acesso

Responsável por:

- usuários;
- perfis;
- permissões;
- equipes;
- auditoria.

## Apresentação

Responsável por:

- widgets;
- regiões visuais;
- configurações de exibição;
- contratos com Broadcast e Live.

---

# 45. O que não pertence ao Modelo de Domínio

As seguintes decisões não fazem parte deste documento:

- posição final dos tickers;
- número definitivo de widgets na transmissão;
- cores finais;
- animações;
- tipografia;
- tecnologia do banco de dados;
- framework utilizado;
- provedor de hospedagem;
- estrutura definitiva dos menus;
- formato final do aplicativo.

Essas decisões deverão respeitar o domínio, mas serão definidas em documentos e entregas específicas.

---

# 46. Primeira Implementação

A primeira implementação não precisará construir todas as entidades deste documento.

O primeiro fluxo vertical deverá priorizar:

```text
Cobertura
↓
Cabine
↓
Evento Esportivo
↓
Partida de futebol
↓
Ocorrência
↓
Resultado
↓
Cronologia
↓
Item Editorial
↓
Publicação
↓
Canal de teste
↓
Widget de teste
```

O objetivo inicial será comprovar que um acontecimento registrado uma única vez consegue atualizar toda a cadeia operacional.

---

# 47. Cenário Inicial de Validação

A primeira validação prática poderá utilizar o seguinte cenário:

```text
Cobertura:
Rodada do Campeonato Brasileiro

Evento Esportivo:
Palmeiras x Flamengo

Estado inicial:
Partida ao vivo
Placar 0 x 0
Primeiro tempo
17 minutos

Ação do operador:
Registrar gol do Palmeiras
Autor: jogador selecionado
Tempo: 18 minutos

Resultado esperado:
- ocorrência registrada;
- placar atualizado para 1 x 0;
- cronologia atualizada;
- item editorial criado;
- publicação criada;
- ticker de teste atualizado;
- placar de teste atualizado;
- alerta de gol exibido;
- todas as interfaces consumindo o mesmo estado.
```

Esse cenário deverá ser usado como referência durante a implementação da Entrega 06.3.

---

# 48. Regras Invioláveis

1. A mesma informação não deve possuir estados independentes no Studio, Broadcast e Live.

2. Interfaces não devem armazenar a verdade do sistema.

3. Widgets apenas apresentam informações.

4. Publicações comunicam fatos, mas não alteram a realidade esportiva.

5. Ocorrências gerais não devem ser automaticamente vinculadas a um participante.

6. Cada Evento Esportivo deverá possuir controle independente de relógio e estado.

7. Competições e Eventos Esportivos existem independentemente das Coberturas.

8. Uma Cobertura poderá acompanhar várias modalidades, competições e eventos simultaneamente.

9. O núcleo não poderá depender exclusivamente do modelo de uma partida de futebol.

10. Correções relevantes deverão preservar histórico e autoria.

11. Informações internas não poderão se tornar públicas sem uma ação ou regra autorizada.

12. Toda expansão deverá preservar a compatibilidade com o ecossistema RodriGol.

---

# 49. Definição Oficial

O domínio do RodriGol organiza uma operação jornalística capaz de acompanhar diferentes modalidades, competições e eventos esportivos simultaneamente.

O RodriGol Studio controla essa operação.

O Núcleo Operacional mantém o estado e aplica as regras.

O RodriGol Broadcast apresenta a operação em formato audiovisual.

O RodriGol Live oferece ao público uma experiência de acompanhamento esportivo em site e aplicativo.

Todos utilizam a mesma fonte de verdade.

---

# 50. Situação do Documento

Este documento faz parte da Entrega 06.3.

Durante a implementação, poderá receber ajustes decorrentes de descobertas técnicas ou funcionais.

Alterações estruturais deverão:

1. respeitar o `FOUNDATION.md`;
2. respeitar o `ENGINEERING.md`;
3. preservar a visão do ecossistema;
4. ser aprovadas antes da implementação;
5. ser registradas na documentação.

Após a conclusão da Entrega 06.3, este documento deverá ser revisado e publicado junto com os demais arquivos da entrega.