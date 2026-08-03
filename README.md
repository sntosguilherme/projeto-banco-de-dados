# Projeto Banco de Dados - HYMB Hospital

Este repositório contém o projeto de banco de dados da equipe, desenvolvido com uma arquitetura moderna dividida em três camadas: um banco de dados relacional (PostgreSQL), uma API RESTful para o backend (Python + FastAPI) e uma interface de usuário rica no frontend (Next.js + React).

## Arquitetura do Sistema

O projeto adota uma arquitetura em microsserviços (conteinerizada), dividida nas seguintes camadas:

1. **Banco de Dados (Database):** PostgreSQL 16. O esquema, visões, funções, gatilhos e os dados de teste são gerenciados por migrations evolutivas via Alembic.
2. **Backend (API & ORM):** Desenvolvido em Python 3 com FastAPI. Na **Etapa 2**, a camada de acesso a dados foi totalmente migrada para **SQLAlchemy ORM**, trazendo controle avançado de sessões e transações ACID, mapeamento objeto-relacional (Declarative/Core) e consultas analíticas utilizando a DSL da ORM (substituindo SQL cru).
3. **Frontend (UI):** Aplicação web interativa desenvolvida em React com Next.js e TypeScript. Consome a API do backend exibindo painéis administrativos, relatórios gerenciais das *Views*, logs de auditoria e fluxos de atendimento em tempo real.

---

## Pré-requisitos

Para rodar o projeto de forma automatizada e garantir que todas as dependências estejam isoladas, a recomendação é utilizar o Docker.

- **Docker** e **Docker Compose** instalados na sua máquina.

*(Caso deseje rodar os ambientes manualmente para desenvolvimento local, será necessário ter o **Python 3.10+** e o **Node.js 18+** instalados).*

---

## Configuração Inicial

Antes de executar o projeto, você deve configurar as variáveis de ambiente necessárias.

1. Clone o repositório.
2. Na raiz do projeto, crie uma cópia do arquivo `.env.example` e renomeie-a para `.env`.
3. Preencha as variáveis no arquivo `.env` com as configurações do seu ambiente:

```env
DB_NAME=HYMB_db
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_HOST=db       # Use "db" para rodar com Docker, ou "localhost" para rodar localmente
DB_PORT=5432

# URL de Conexão completa usada pelo Backend:
DATABASE_URL=postgresql://postgres:sua_senha@db:5432/HYMB_db?schema=public

# URL da API usada pelo Frontend:
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Execução Simplificada (Via Docker - Recomendado)

O projeto possui um arquivo `docker-compose.yml` já configurado com a orquestração completa dos serviços (DB, Backend e Frontend). Para subir tudo de uma vez, abra o terminal na raiz do projeto e execute:

```bash
docker compose up -d --build
```

O Docker se encarregará de fazer o build do backend e do frontend e executar `alembic upgrade head` para criar o esquema e inserir os dados de teste.

**Acessando os serviços:**
- **Frontend (Painel Administrativo):** http://localhost:3000
- **Backend (API / Swagger UI):** http://localhost:8000/docs
- **Banco de Dados (Postgres):** Acessível via porta `5432` no `localhost`.

Para derrubar os containers e encerrar o sistema:
```bash
docker compose down
```

---

## Execução Manual (Modo Desenvolvimento)

Se você for desenvolver ou quiser testar os componentes individualmente rodando fora do Docker, siga os passos abaixo:

### 1. Banco de Dados (PostgreSQL)
Se você tem um Postgres rodando localmente (ou subir apenas o container do banco com `docker compose up -d db`), garanta que o `.env` esteja com `DB_HOST=localhost` e `DATABASE_URL` apontando para o `localhost`.

Se for a primeira execução local, crie o banco e aplique as migrations:

```bash
cd backend
alembic -c alembic.ini upgrade head
```

### 2. Backend (FastAPI)
O backend usa as dependências listadas em `backend/requirements.txt`.

Abra o terminal na raiz do projeto e execute:
```bash
# 1. Crie o ambiente virtual
python -m venv .venv

# 2. Ative o ambiente (Windows)
.venv\Scripts\activate
# ou no Linux/Mac: source .venv/bin/activate

# 3. Instale as dependências
pip install -r backend/requirements.txt

# 4. Inicie o servidor FastAPI (via Uvicorn)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --app-dir backend
```
A API ficará disponível em `http://localhost:8000`.

### 3. Frontend (Next.js)
O frontend requer que o Node.js esteja instalado na máquina.

Abra outro terminal na pasta `frontend/`:
```bash
cd frontend

# 1. Instale as dependências
npm install

# 2. Inicie o servidor de desenvolvimento
npm run dev
```
O painel do Frontend ficará disponível em `http://localhost:3000`.

---

## Funcionalidades Avançadas e Regras de Negócio

Na segunda etapa do projeto, o sistema foi enriquecido com lógicas avançadas de banco de dados e mapeamento objeto-relacional:

### 1. Stored Procedures & Funções Tabulares
- `sp_registrar_atendimento_completo`: Registro transacional atômico de atendimento junto a múltiplos procedimentos (via JSONB). Em caso de falha de qualquer item, ocorre *rollback* automático de toda a operação.
- `sp_calcular_tempo_medio_espera`: Função tabular no PostgreSQL que calcula o tempo médio exato (em minutos) entre a chegada dos pacientes e o início do primeiro procedimento cirúrgico/clínico em cada unidade hospitalar.
- `sp_reajustar_escala`: Reajuste em lote de plantões de um residente de um dia/turno para outro, previndo conflitos automaticamente.

### 2. Triggers (Gatilhos) & Auditoria de Atendimentos
- `trg_check_sobreposicao_escala` (`BEFORE INSERT/UPDATE` em `escala`): Protege o sistema contra choques de horário, impedindo que um residente seja escalado ao mesmo tempo em duas unidades diferentes com uso de travamento pessimista (`FOR UPDATE`).
- `trg_audita_atendimento` (`AFTER INSERT/UPDATE/DELETE` em `atendimento`): Sistema de auditoria completo que grava cada modificação (inserção, edição ou exclusão) em uma tabela `auditoria_atendimento`, armazenando usuário do banco, timestamp e um comparativo de snapshots em formato `JSONB` dos dados antigos e novos.
- `trg_atualiza_media_procedimentos` (`AFTER INSERT` em `procedimento_realizado`): Gatilho analítico que mantém a coluna de tempo médio real de cada procedimento constantemente atualizada na tabela principal.

### 3. Views (Visões Gerenciais no Banco)
- `vw_pacientes_internados`: Retorna a lista atualizada em tempo real de pacientes que continuam internados (`data_hora_saida IS NULL`).
- `vw_residentes_sem_supervisor`: Aponta inconsistências gerenciais listando residentes em plantão sob supervisão inativa ou preceptores sem titulação de Doutor.
- `vw_estatisticas_atendimentos_mensal`: Consolidação analítica agrupada por mês e unidade, indicando total de atendimentos, duração média e o procedimento mais realizado no período (utilizando `MODE() WITHIN GROUP`).

### 4. Consultas Complexas com SQLAlchemy ORM
Demonstrando o poder da DSL do SQLAlchemy (com Joins explícitos, Subqueries e filtros, sem uso de SQL textual cru):
- Listagem de preceptores que supervisionaram residentes responsáveis pelo atendimento de pacientes flamenguistas (`is_flamengo = TRUE`).
- Consulta do último atendimento de cada paciente (trazendo residente, preceptor e histórico completo dos procedimentos vinculados via relacionamentos *Eager/Lazy Loading*).
- Cálculo dinâmico do percentual de procedimentos de alto risco efetuados por cada residente do hospital.

---

## Testes Automatizados & Simulação de Concorrência

O projeto possui uma suíte completa de testes de integração e simulações multirrealidade em Python para homologar os mecanismos de transação e travamento (*locking*).

Com os contêineres do Docker rodando (`docker compose up -d`), execute as validações via terminal:

### Rodar Suíte Completa de Integração (Procedures, Triggers, Views e ORM)
```bash
docker compose exec -e RUN_DB_INTEGRATION=1 backend python -m unittest discover -s tests -p "test_*.py" -v
```

### Demonstrar Concorrência e Tratamento de Conflito (Lock Pessimista)
Simula duas transações concorrentes simultâneas (em threads paralelas com *start_gun*) tentando escalar o mesmo médico no mesmo turno e exibe a proteção do banco rejeitando a colisão:
```bash
docker compose exec backend python tests/test_concorrencia_escala.py
```

---

## Estrutura do Repositório

```text
├── backend/                  # API FastAPI, modelos SQLAlchemy ORM e suíte de testes
│   ├── app/                  # Rotas (Controllers), Modelos ORM e Schemas Pydantic
│   ├── migrations/           # Histórico evolutivo do banco (Alembic)
│   └── tests/                # Testes de integração (Procedures, Triggers, Views, Concorrência)
├── frontend/                 # Aplicação Next.js/React (Painel Hospitalar e Auditorias)
├── sql/                      # Scripts DDL limpos para avaliação da Etapa 2
│   ├── 01_stored_procedures.sql # Stored Procedures e funções tabulares
│   ├── 02_triggers.sql          # Funções de gatilho, travas e tabela de auditoria
│   └── 03_views.sql             # Definição das visões de relatórios gerenciais
├── docs/                     # Documentação (Relatórios em PDF, Diagrama ER)
├── docker-compose.yml        # Orquestração de microsserviços (Postgres, API, UI)
├── .env.example              # Template das variáveis de ambiente do projeto
└── README.md                 # Documentação principal da arquitetura do projeto
```

## Observações Importantes

- **Reset Completo do Banco:** Para recriar o banco desde o zero, aplicando todos os schemas e alimentando novamente os dados de teste iniciais, remova o volume com `docker compose down -v` e inicie novamente com `docker compose up --build -d`.
