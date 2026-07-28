# CURSOR_GUIDE.md

# Guia Oficial para Inteligências Artificiais

> Este documento define como uma IA deve trabalhar no projeto RodriGol.

---

# Antes de qualquer alteração

Antes de escrever qualquer linha de código, leia obrigatoriamente:

1. README.md
2. FOUNDATION.md
3. ARCHITECTURE.md
4. Este documento (CURSOR_GUIDE.md)

Caso exista conflito entre implementação e documentação, a documentação deve prevalecer até que seja atualizada oficialmente.

---

# Objetivo

Você está trabalhando em um software profissional chamado RodriGol.

O RodriGol não é apenas um sistema de placar.

Ele é uma plataforma de operação editorial para transmissões esportivas ao vivo.

Toda implementação deve respeitar essa identidade.

---

# Idioma

Toda comunicação deve ocorrer em português do Brasil.

Comentários de código poderão permanecer em inglês quando fizerem parte de bibliotecas ou padrões da linguagem.

Explicações ao usuário sempre deverão ser feitas em português.

---

# Filosofia de Desenvolvimento

Sempre priorizar:

- simplicidade;
- clareza;
- estabilidade;
- facilidade de manutenção;
- rapidez operacional.

Nunca aumentar a complexidade sem necessidade.

---

# Princípios Obrigatórios

Sempre considerar que:

- o jornalista está no centro da plataforma;
- a Cabine é o ambiente de operação;
- o Overlay é o ambiente de apresentação;
- a arquitetura é modular;
- a transmissão nunca pode ser prejudicada.

---

# Antes de implementar

Sempre:

- analisar o problema;
- compreender o objetivo;
- verificar impacto em outros módulos;
- explicar a solução proposta.

---

# Durante a implementação

Priorizar:

- código legível;
- reutilização;
- baixo acoplamento;
- alta coesão;
- modularidade.

Evitar duplicação de código.

---

# Nunca fazer sem autorização

Nunca:

- alterar arquitetura;
- remover funcionalidades existentes;
- quebrar compatibilidade com OBS;
- adicionar dependências desnecessárias;
- modificar estrutura de pastas sem necessidade;
- reescrever módulos inteiros quando pequenas alterações resolvem o problema.

---

# Depois da implementação

Sempre informar:

- arquivos modificados;
- motivo das alterações;
- impacto esperado;
- riscos conhecidos;
- sugestões futuras (quando existirem).

---

# Qualidade

Antes de considerar uma tarefa concluída, verificar:

- consistência;
- organização;
- compatibilidade;
- legibilidade;
- manutenção futura.

---

# Forma de Responder

Sempre responder de forma objetiva.

Quando necessário utilizar listas.

Evitar respostas excessivamente longas quando uma explicação simples for suficiente.

---

# Resolução de Problemas

Quando encontrar um problema:

1. identificar a causa;
2. explicar o diagnóstico;
3. apresentar solução;
4. implementar somente após aprovação quando houver impacto estrutural.

---

# Evolução

Novas funcionalidades deverão seguir a arquitetura existente.

Evitar criar soluções paralelas.

Sempre reutilizar componentes quando possível.

---

# Compatibilidade

Toda implementação deve preservar:

- OBS Studio;
- arquitetura existente;
- funcionamento das funcionalidades atuais.

Retrocompatibilidade é prioridade.

---

# Regra de Ouro

Antes de implementar qualquer funcionalidade, pergunte mentalmente:

"Esta solução torna o trabalho do jornalista mais simples?"

Se a resposta for negativa, reavalie a implementação.

---

# Fluxo Oficial de Trabalho

1. Compreender o problema.
2. Ler a documentação.
3. Analisar impacto.
4. Explicar a solução.
5. Implementar.
6. Revisar.
7. Informar as alterações.

---

# O que o RodriGol espera de uma IA

Uma IA que trabalhe neste projeto deve agir como um engenheiro de software experiente.

Isso significa:

- compreender antes de modificar;
- preservar a arquitetura;
- explicar decisões;
- evitar improvisações;
- manter consistência em todo o projeto.

O objetivo não é apenas gerar código.

O objetivo é contribuir para a evolução sustentável da plataforma.

---

# Declaração Final

Toda implementação realizada neste projeto deve respeitar os princípios definidos em FOUNDATION.md e a arquitetura definida em ARCHITECTURE.md.

Caso exista dúvida, a prioridade será sempre preservar a identidade do RodriGol.