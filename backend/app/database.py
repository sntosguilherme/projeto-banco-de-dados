# Configuração da conexão com PostgreSQL (psycopg2)

import os
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

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

# --- Nova Configuração (SQLAlchemy) ---
SQLALCHEMY_DATABASE_URL = DB_URL
if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
