# Projeto Banco de Dados

Repositório do projeto de banco de dados da equipe, com a estrutura inicial do banco em PostgreSQL e a base do backend em Python.

## Estrutura

```text
docker-compose.yml
backend/
sql/
	ddl/
	dml/
	queries/
```

## Requisitos

- Docker 
- Python 3.14

## Configuração inicial

1. Copie o arquivo `.env` na raiz do projeto e garanta que ele possui as variáveis abaixo:

```env
DB_NAME=HYMB_db
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_HOST=localhost
DB_PORT=5432
```

2. Suba o banco de dados com Docker:

```bash
docker compose up -d
```

3. O container do PostgreSQL executa automaticamente os scripts de inicialização abaixo na primeira subida do volume:

- `sql/ddl/01_create_tables.sql`
- `sql/dml/02_insert_data.sql`

4. Verifique se o banco foi criado e o container está ativo:

```bash
docker compose ps
```

## Backend Python

O backend usa as dependências listadas em `backend/requirements.txt`, incluindo `FastAPI`, `Uvicorn`, `psycopg2-binary` e `Pydantic`.

Para preparar o ambiente local:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Observações importantes

- Se você alterar os scripts em `sql/ddl` ou `sql/dml` depois que o volume do PostgreSQL já foi criado, será necessário remover o volume para que a inicialização rode novamente.
- O diretório `sql/queries` contém consultas auxiliares para validação e análise.
- Neste momento, a estrutura do backend ainda está em construção, então a instalação principal do projeto é a do banco e das dependências Python.
