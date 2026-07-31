# Explicação Detalhada das Consultas Analíticas (SQL)

Este documento foi criado para detalhar o funcionamento e a relação com a modelagem de dados das consultas presentes no arquivo `04_analytical_queries.sql`. O foco é explicar o raciocínio por trás de cada instrução, ideal para apresentações e defesas técnicas (ex: para professores de Banco de Dados).

---

## Consulta 1: Ranking dos Residentes por Qtd de Atendimentos

**Objetivo:** Listar todos os residentes e a quantidade de atendimentos que realizaram, ordenando do maior para o menor.

```sql
SELECT
    pessoa.nome AS residente,
    COUNT(atendimento.id_atendimento) AS total_atendimentos
FROM RESIDENTE residente
    JOIN PROFISSIONAL profissional ON profissional.id_pessoa = residente.id_profissional
    JOIN PESSOA pessoa ON pessoa.id_pessoa = profissional.id_pessoa
    LEFT JOIN ATENDIMENTO atendimento ON atendimento.id_residente = residente.id_profissional
GROUP BY pessoa.nome
ORDER BY total_atendimentos DESC;
```

### Principais Pontos Técnicos:

1. **Relações de Herança (Generalização/Especialização):** 
   Na modelagem de dados, `RESIDENTE` é uma especialização de `PROFISSIONAL`, que por sua vez especializa `PESSOA`. Para obter o nome do residente, é necessário navegar de baixo para cima na hierarquia. O `id_profissional` na tabela `RESIDENTE` atua simultaneamente como Chave Primária e Chave Estrangeira apontando para `PROFISSIONAL(id_pessoa)`.
2. **Uso de `LEFT JOIN` (Crucial):**
   Foi utilizado um `LEFT JOIN` entre a hierarquia do residente e a tabela `ATENDIMENTO`. Se fosse utilizado um `INNER JOIN` (ou apenas `JOIN`), qualquer residente que possuísse `0` atendimentos seria completamente excluído do resultado (pois a interseção seria nula). O `LEFT JOIN` preserva todos os registros da tabela à esquerda (os Residentes), preenchendo os dados da tabela da direita (Atendimentos) com `NULL` onde não há correspondência.
3. **Uso de `COUNT(coluna)` ao invés de `COUNT(*)`:**
   Ao fazer o `LEFT JOIN` com um residente sem atendimentos, o banco gera uma linha com o nome do residente e o resto nulo. Se usássemos `COUNT(*)`, o banco contaria essa "linha vazia" e retornaria o valor `1`. Ao usar `COUNT(atendimento.id_atendimento)`, a função ignora os valores nulos e retorna corretamente `0`.

---

## Consulta 2: Preceptores com mais de 5 atendimentos num mês

**Objetivo:** Identificar preceptores que supervisionaram mais de 5 atendimentos dentro de um único mês calendário.

```sql
SELECT
    p.nome AS preceptor,
    DATE_TRUNC('month', atendimento.data_hora) AS mes,
    COUNT(atendimento.id_atendimento) AS total_atendimentos
FROM ATENDIMENTO atendimento
    JOIN PRECEPTOR pr ON pr.id_profissional = atendimento.id_preceptor
    JOIN PROFISSIONAL profissional ON profissional.id_pessoa = pr.id_profissional
    JOIN PESSOA p ON p.id_pessoa = profissional.id_pessoa
GROUP BY p.nome, DATE_TRUNC('month', atendimento.data_hora)
HAVING COUNT(atendimento.id_atendimento) > 5
ORDER BY mes, total_atendimentos DESC;
```

### Principais Pontos Técnicos:

1. **Navegação `INNER JOIN`:** 
   Aqui, `INNER JOIN` (escrito como `JOIN`) é o tipo correto, pois estamos buscando preceptor e atendimento existentes. Preceptores sem atendimento naturalmente não baterão a meta de "> 5".
2. **Normalização de Datas (`DATE_TRUNC`):**
   O campo `data_hora` é um *Timestamp* (muda a cada segundo/minuto). É impossível agrupar mensalmente usando o timestamp puro. A função `DATE_TRUNC('month', ...)` iguala todas as datas de um mesmo mês para o dia 1º à meia-noite (ex: `2025-06-15 14:30` vira `2025-06-01 00:00`). Isso cria blocos uniformes para o `GROUP BY` agrupar.
3. **`GROUP BY` Múltiplo:**
   É agrupado pelo nome do preceptor **E** pelo mês. Agrupar apenas pelo nome somaria os atendimentos do preceptor de todos os meses, distorcendo os dados.
4. **Diferença entre `WHERE` e `HAVING`:**
   A condição `> 5` precisa estar no `HAVING` e nunca no `WHERE`. A cláusula `WHERE` aplica filtros linha a linha **antes** do banco realizar os agrupamentos. Como a "quantidade de atendimentos" é o resultado de uma função de agregação (`COUNT`), ela só existe **após** o agrupamento, momento em que o banco utiliza o `HAVING` para filtrar os grupos gerados.

---

## Consulta 3: Plantões escalados por residente, por unidade

**Objetivo:** Contabilizar a quantidade de plantões fixos semanais de cada residente segmentado por unidade de saúde.

```sql
SELECT
    u.nome AS unidade,
    p.nome AS residente,
    COUNT(e.id_escala) AS qtd_plantoes_semanais
FROM ESCALA e
    JOIN UNIDADE u ON u.id_unidade = e.id_unidade
    JOIN PROFISSIONAL prof ON prof.id_pessoa = e.id_residente
    JOIN PESSOA p ON p.id_pessoa = prof.id_pessoa
GROUP BY u.nome, p.nome
ORDER BY u.nome, qtd_plantoes_semanais DESC;
```

### Principais Pontos Técnicos:

1. **Relacionamentos (Tabela Associativa):**
   A tabela `ESCALA` funciona como a união (N:1) entre a `UNIDADE`, o `RESIDENTE` e o `PRECEPTOR`.
2. **Otimização Inteligente na Subida da Hierarquia:**
   Note que a tabela `RESIDENTE` foi ignorada na cláusula `FROM/JOIN`. A chave estrangeira `ESCALA.id_residente` apontaria para `RESIDENTE.id_profissional`. Contudo, devido à herança (Especialização 1:1), o valor de `id_profissional` na tabela residente é estritamente igual à chave primária `id_pessoa` em `PROFISSIONAL`. A consulta economiza processamento (um `JOIN` a menos) conectando a escala diretamente com `PROFISSIONAL` para acessar a base `PESSOA`, já que dados exclusivos do residente (como o "ano_residencia") não são necessários aqui.

---

## Consulta 4: Pacientes que nunca fizeram procedimento de risco 'ALTO'

**Objetivo:** Filtrar pacientes cujo histórico esteja completamente limpo da execução de procedimentos catalogados como 'ALTO' risco.

```sql
SELECT p.nome AS paciente
FROM PACIENTE pac
    JOIN PESSOA p ON p.id_pessoa = pac.id_pessoa
WHERE pac.id_pessoa NOT IN (
    SELECT a.id_paciente
    FROM ATENDIMENTO a
        JOIN PROCEDIMENTO_REALIZADO pre ON pre.id_atendimento = a.id_atendimento
        JOIN PROCEDIMENTO proc ON proc.id_procedimento = pre.id_procedimento
    WHERE proc.nivel_risco = 'ALTO'
)
ORDER BY p.nome;
```

### Principais Pontos Técnicos:

1. **Subconsulta Não-Correlacionada e `NOT IN`:**
   A estratégia principal aqui é a abordagem por conjuntos. A subconsulta (entre os parênteses) roda independentemente e gera uma lista única contendo o `id_paciente` de todos que realizaram procedimento de nível `ALTO`. Em seguida, a consulta externa varre os pacientes checando via `NOT IN` — descartando os nomes cujos IDs estejam na "lista negra".
2. **Proteção contra Falha de Valores Nulos (`NULL`):**
   Existe um risco grave no uso do `NOT IN`: caso a subconsulta devolvesse um ID nulo (`NULL`) em meio aos resultados, toda a lógica do `NOT IN` falharia, gerando `UNKNOWN` (que o SQL avalia como `FALSE`), retornando 0 pacientes. 
   Porém, graças a nossa forte Integridade de Dados no DDL, essa consulta é perfeitamente segura. No arquivo de definição (`01_create_tables.sql`), a coluna `id_paciente` na tabela `ATENDIMENTO` foi definida como `NOT NULL`. É estruturalmente impossível haver um atendimento anônimo, impossibilitando a existência de `NULL` na subconsulta.

---

## Bônus: Integração com o Backend (FastAPI + SQL)

Como bônus para a sua defesa, é excelente saber explicar como essas consultas chegam na aplicação! Todo esse arquivo `04_analytical_queries.sql` está conectado com o **Backend (FastAPI)**, especificamente no arquivo de rotas `backend/app/routers/relatorios.py`.

A arquitetura do seu projeto usa um padrão muito inteligente chamado **"SQL Loader"** (carregador de consultas). 

### Como funciona passo a passo no código:
1. **O Gatilho:** Quando o frontend ou o usuário chama uma rota da API (ex: `GET /residentes/ranking`), a função correspondente no FastAPI é acionada.
2. **`load_query`:** Em vez de ter SQL misturado e poluindo o código Python, o seu back-end usa a função `load_query(ARQUIVO_SQL, "ranking_residentes_atendimentos")`. Essa função vai no arquivo `04_analytical_queries.sql`, busca pela linha comentada com o nome da query (ex: `-- ranking_residentes_atendimentos`) e carrega o bloco SQL limpinho para a memória.
3. **Gerenciamento do Banco (`get_db_connection`):** A aplicação abre uma conexão com o banco PostgreSQL. Usar a estrutura `with` garante que a conexão será fechada corretamente (liberando a porta do banco) assim que a operação terminar, evitando vazamento de memória (Memory Leak).
4. **Execução (`cur.execute`):** O SQL é disparado no banco de dados. 
5. **Retorno e Serialização (`cur.fetchall` e Pydantic):** O comando `fetchall()` pega todas as linhas (a tabela resultante) e devolve para o Python. O pulo do gato aqui é que a rota do FastAPI tem um `response_model=list[RankingResidenteOut]`. Isso significa que os esquemas do **Pydantic** (`schemas/relatorios.py`) pegam aqueles dados puros do banco e os convertem automaticamente em objetos JSON perfeitamente estruturados e validados para o usuário final!

*Essa separação entre "Arquivo SQL" e "Código Python" é uma excelente prática de Engenharia de Software conhecida como **SoC (Separation of Concerns - Separação de Conceitos)**.*
