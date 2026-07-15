# Projeto Banco de Dados - HYMB Hospital

Este repositório contém o projeto de banco de dados da equipe, desenvolvido com uma arquitetura moderna dividida em três camadas: um banco de dados relacional (PostgreSQL), uma API RESTful para o backend (Python + FastAPI) e uma interface de usuário rica no frontend (Next.js + React).

## Arquitetura do Sistema

O projeto adota uma arquitetura em microsserviços (conteinerizada), dividida nas seguintes camadas:

1. **Banco de Dados (Database):** PostgreSQL 16. O banco é inicializado automaticamente com os scripts DDL e DML presentes na pasta `sql/`.
2. **Backend (API):** Desenvolvido em Python 3 utilizando o framework FastAPI. Responsável por expor os endpoints REST, aplicar regras de negócio e realizar a comunicação direta com o banco de dados (usando `psycopg2`).
3. **Frontend (UI):** Aplicação web desenvolvida em React utilizando o framework Next.js. Consome a API do backend para exibir as listagens, gráficos e formulários do sistema do hospital.

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

O Docker se encarregará de fazer o build do backend e do frontend, além de subir o banco de dados e rodar os scripts SQL (`01_create_tables.sql` e `02_insert_data.sql`) de forma automatizada na primeira vez que o container subir.

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

Se for a primeira execução local, certifique-se de criar o banco e rodar os scripts da pasta `sql/ddl/` e `sql/dml/`.

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

## Estrutura do Repositório

```text
├── backend/          # Código-fonte da API em FastAPI e regras de negócio
├── frontend/         # Código-fonte da interface do usuário em Next.js/React
├── sql/              # Scripts SQL do projeto
│   ├── ddl/          # Scripts de criação (Tabelas, Visões, Functions/Triggers)
│   ├── dml/          # Scripts de povoamento (Inserts de dados iniciais)
│   └── queries/      # Consultas analíticas auxiliares
├── docs/             # Documentações adicionais (Relatório, Diagramas, ER)
├── docker-compose.yml# Orquestração dos containers (DB, Backend, Frontend)
├── .env.example      # Template de configuração de variáveis de ambiente
└── README.md         # Documentação inicial
```

## Observações Importantes

- **Reset do Banco de Dados:** Se você alterar os scripts em `sql/ddl` ou `sql/dml` depois que o volume do PostgreSQL já foi criado via Docker, será necessário remover o volume do banco para que a inicialização rode novamente. Você pode fazer isso rodando `docker compose down -v`.
