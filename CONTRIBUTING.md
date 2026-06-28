# Guia de Contribuição - Hospital Dra. Yuska Maritan Brito

Para manter a organização do repositório e garantir a pontuação máxima nos critérios de "Documentação e Apresentação", todos os membros da equipe devem seguir os padrões abaixo.

## 1. Conventional Commits
As mensagens de commit devem ser claras e padronizadas. Use os seguintes prefixos:
*   `feat`: Nova funcionalidade (ex: `feat: adiciona listagem de atendimentos por paciente`).
*   `fix`: Correção de bugs (ex: `fix: corrige erro de concorrência na escala`).
*   `docs`: Alterações em documentação (ex: `docs: atualiza README com instruções do Docker`).
*   `refactor`: Mudança de código que não corrige erro nem adiciona funcionalidade (ex: migração para ORM na Etapa 2).
*   `chore`: Atualizações de tarefas de build, pacotes, etc.


## 2. Padronização de Branches
Para manter a rastreabilidade das alterações e a organização entre o desenvolvimento de **backend, frontend e banco de dados**, adotamos uma nomenclatura semântica para os ramos do repositório. 

O padrão deve seguir rigorosamente o formato: `tipo/onde/o-que-foi-feito`.

*   **tipo**: Define a natureza da alteração (ex: `feat`, `fix`, `docs`, `refactor`, `chore`).
*   **onde**: Define a parte do sistema afetada (`backend`, `frontend`, `database`).
*   **o que foi feito**: Breve descrição do que foi realizado, separada por hifens.

**Exemplos de uso:**
*   `feat/database/criacao-tabelas-etapa1`: Para novas funcionalidades no banco.
*   `fix/backend/validacao-cpf`: Para correções de bugs no servidor.
*   `docs/frontend/instrucoes-execucao`: Para atualizações na documentação do Next.js.
*   `refactor/database/migracao-orm-etapa2`: Para mudanças estruturais sem alteração de funcionalidade.


## 3. Pull Requests e Issues
Os PRs devem estar vinculados às issues.
*   **Vínculo:** A descrição do PR deve obrigatoriamente conter o link para a issue correspondente (ex: "closes #12").
*   **Contexto:** Descreva brevemente o que foi implementado e como testar, garantindo que a funcionalidade atende aos requisitos de **SQL puro** (Etapa 1) ou **ORM** (Etapa 2).

## 4. Checklist para Contribuição
Antes de abrir o PR, verifique:
1. [ ] O banco de dados mantém a **3ª Forma Normal (3FN)**.
2. [ ] O código foi testado no ambiente **Docker**.
3. [ ] As mensagens de commit seguem o padrão definido.
4. [ ] A descrição do PR aponta para a Issue correta.