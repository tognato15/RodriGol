# README.md

# RodriGol

> Plataforma profissional para cobertura esportiva em tempo real.

---

## Visão Geral

O RodriGol é uma plataforma desenvolvida para jornalistas esportivos, narradores, comentaristas, produtores e criadores de conteúdo que realizam transmissões ao vivo.

Seu objetivo é oferecer um ambiente único para operação editorial, gerenciamento de eventos esportivos e apresentação visual durante transmissões.

Mais do que um sistema de placar ou um conjunto de overlays para OBS, o RodriGol funciona como uma central de cobertura esportiva inspirada na dinâmica das grandes redações esportivas.

---

# Objetivos

O RodriGol busca permitir que uma única pessoa consiga operar uma cobertura esportiva com rapidez, organização e qualidade profissional.

Entre seus principais objetivos estão:

- Centralizar a operação da transmissão.
- Reduzir o tempo entre o acontecimento e sua publicação.
- Organizar informações de forma editorial.
- Facilitar a vida do jornalista durante eventos ao vivo.
- Produzir uma apresentação visual profissional.

---

# Estrutura da documentação

Antes de alterar qualquer parte do projeto, leia os documentos abaixo na seguinte ordem.

## 1. FOUNDATION.md

Define a identidade do RodriGol.

Contém:

- missão;
- visão;
- filosofia;
- princípios;
- regras permanentes do projeto.

---

## 2. ARCHITECTURE.md

Explica como o sistema está organizado.

Apresenta:

- módulos;
- responsabilidades;
- comunicação entre componentes;
- arquitetura conceitual.

---

## 3. CURSOR_GUIDE.md

Documento destinado às Inteligências Artificiais utilizadas no desenvolvimento.

Define:

- forma de trabalho;
- limitações;
- padrões;
- comportamento esperado.

---

## 4. ROADMAP.md

Apresenta a evolução planejada do projeto.

Contém:

- funcionalidades concluídas;
- funcionalidades em desenvolvimento;
- objetivos futuros.

---

# Estrutura do projeto

```text
docs/
│
├── README.md
├── FOUNDATION.md
├── ARCHITECTURE.md
├── CURSOR_GUIDE.md
├── ROADMAP.md
│
├── adr/
│   └── Architecture Decision Records
│
└── deliveries/
    └── Histórico das entregas
```

---

# Filosofia

O RodriGol foi criado para ajudar jornalistas esportivos a contar histórias em tempo real.

Todas as decisões do projeto devem seguir esse princípio.

Sempre que existir dúvida sobre a implementação de uma funcionalidade, a prioridade será aquilo que melhora a experiência do operador durante uma cobertura esportiva.

---

# Fluxo de desenvolvimento

Todo desenvolvimento do RodriGol segue o seguinte fluxo:

Planejamento

↓

Definição da solução

↓

Implementação

↓

Testes

↓

Revisão

↓

Versionamento (Git)

↓

Publicação (GitHub)

---

# Compatibilidade

O RodriGol foi desenvolvido para funcionar em conjunto com o OBS Studio.

A compatibilidade com o OBS deve ser preservada em todas as futuras implementações.

---

# Contribuindo

Antes de implementar qualquer funcionalidade:

1. Leia toda a documentação.
2. Entenda o objetivo da alteração.
3. Preserve a arquitetura existente.
4. Explique claramente qualquer mudança estrutural.
5. Priorize soluções simples e bem documentadas.

---

# Princípio Fundamental

> O RodriGol não existe apenas para mostrar informações.
>
> Ele existe para ajudar jornalistas esportivos a produzir coberturas mais rápidas, organizadas e profissionais.