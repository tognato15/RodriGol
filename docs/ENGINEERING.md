# ENGINEERING.md

# Engenharia do RodriGol

> Este documento define o funcionamento interno da plataforma.
> Ele descreve os objetos centrais do sistema, seus relacionamentos e as regras de negócio que deverão ser preservadas durante toda a evolução do RodriGol.

---

# Objetivo

O RodriGol não é construído a partir de telas.

Também não é construído a partir de funcionalidades.

O RodriGol é construído a partir de objetos de domínio.

Toda implementação deverá respeitar esses objetos.

As telas, APIs, banco de dados e integrações representam apenas diferentes formas de utilizar essas informações.

---

# Princípio Fundamental

A plataforma possui uma única fonte de verdade.

Todas as interfaces consomem essa mesma informação.

Nenhum canal deve possuir regras próprias.

---

# Ecossistema

```
                     RodriGol

          ┌────────────┼────────────┐

          │            │            │

      Studio      Broadcast      Live

          │            │            │

          └────────────┼────────────┘

              Núcleo Operacional
```

Todo o ecossistema compartilha o mesmo núcleo.

---

# Objetos Fundamentais

A plataforma é composta por um conjunto reduzido de objetos centrais.

Todo o restante deriva deles.

---

# Cobertura

A Cobertura representa uma operação jornalística.

É o maior objeto do sistema.

Uma cobertura pode representar:

- uma partida;
- uma rodada;
- uma competição;
- um programa esportivo;
- uma janela de transferências;
- uma cobertura olímpica.

Toda operação acontece dentro de uma Cobertura.

---

Uma Cobertura possui:

- competições;
- partidas;
- eventos;
- operadores;
- cabine;
- publicações;
- widgets ativos;
- cronologia;
- agenda;
- prioridades.

---

# Competição

Uma Competição organiza partidas pertencentes ao mesmo torneio.

Possui:

- nome;
- temporada;
- regulamento;
- fases;
- classificação;
- calendário.

---

# Partida

Representa um evento esportivo específico.

Possui:

- mandante;
- visitante;
- placar;
- período;
- relógio;
- escalações;
- estatísticas;
- cronologia;
- estado.

---

# Evento

Todo acontecimento registrado pelo operador.

Exemplos:

- gol;
- cartão;
- substituição;
- início;
- intervalo;
- reinício;
- encerramento;
- informação;
- breaking news.

Todo Evento pertence a uma Partida ou diretamente a uma Cobertura.

---

# Publicação

Representa qualquer informação destinada ao público.

Pode alimentar:

- Broadcast;
- Site;
- Aplicativo;
- APIs futuras.

Uma Publicação nunca altera a realidade.

Ela apenas comunica informações produzidas pelo sistema.

---

# Widget

Representa um componente visual.

Exemplos:

- ticker;
- placar;
- classificação;
- alerta;
- lower third;
- manchete;
- cronologia.

Widgets apenas apresentam informações.

Nunca armazenam estado.

---

# Operador

Usuário responsável pela Cobertura.

O Operador controla:

- registro;
- publicação;
- prioridades;
- destaques.

O sistema auxilia.

A decisão final sempre pertence ao operador.

---

# Fluxo Oficial

Todo acontecimento seguirá exatamente este fluxo.

```
Acontecimento

↓

Evento

↓

Atualização do Estado

↓

Mesa Editorial

↓

Publicação

↓

Widgets

↓

Broadcast

↓

RodriGol Live
```

Nenhuma interface poderá ignorar esse fluxo.

---

# Fonte Única da Verdade

O estado da plataforma será armazenado apenas uma vez.

Studio.

Broadcast.

Site.

Aplicativo.

Todos consomem exatamente o mesmo estado.

Nunca deverão existir estados paralelos.

---

# Responsabilidades

## Studio

Operação.

Registro.

Gerenciamento.

---

## Broadcast

Apresentação.

---

## Live

Consulta pública.

---

## Núcleo Operacional

Processamento.

Estado.

Regras de negócio.

---

# Regras Gerais

Nenhuma tela possui lógica de negócio.

Toda lógica pertence ao Núcleo Operacional.

Nenhuma publicação altera informações.

Publicações apenas comunicam.

Widgets nunca armazenam estado.

Eventos sempre modificam objetos.

Objetos nunca conhecem interfaces.

---

# Engenharia Evolutiva

O RodriGol deverá crescer adicionando novos módulos.

Nunca substituindo os existentes.

Toda expansão deverá preservar:

- modularidade;
- simplicidade;
- compatibilidade;
- estabilidade.

---

# Definição Oficial

A engenharia do RodriGol foi projetada para permitir que uma única operação alimente simultaneamente o Studio, o Broadcast e o RodriGol Live.

Toda evolução futura deverá preservar este princípio.
