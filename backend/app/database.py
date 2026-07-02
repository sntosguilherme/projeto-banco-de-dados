# Configuração da conexão com PostgreSQL (psycopg2)

import os
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from dotenv import load_dotenv

load_dotenv()

# Configuração da URL de conexão com o banco de dados. 
DB_URL = os.getenv("DATABASE_URL")

@contextmanager
def get_db_connection():
    # Cria uma conexão com o banco de dados PostgreSQL usando psycopg2 e retorna um cursor do tipo RealDictCursor.
    conn = psycopg2.connect(DB_URL, cursor_factory=RealDictCursor)
    try:
        yield conn
    finally:
        conn.close()

