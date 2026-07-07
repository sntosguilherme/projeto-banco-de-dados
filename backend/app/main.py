# Ponto de entrada da API

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import get_db_connection
from app.routers import pacientes, atendimentos, procedimentos

# Criação da instância do FastAPI com o título "Sistema Hospitalar Dra. Yuska Maritan Brito".
app = FastAPI(title="Sistema Hospitalar Dra. Yuska Maritan Brito")

# configuração do middleware CORS para permitir solicitações apenas do frontend em http://localhost:3000.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Permite solicitações apenas do frontend em http://localhost:3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#registra as rotas de cada arquivo do routers/ na aplicação
app.include_router(pacientes.router)
app.include_router(atendimentos.router)
app.include_router(procedimentos.router)

# rota para verificar a saúde da API e a conexão com o banco de dados.
@app.get("/health") 
def health():
    try:
        
        # Testa a conexão com o banco de dados PostgreSQL usando a função get_db_connection() definida em app/database.py.
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1;")
                cur.fetchone()
                
        return {"status": "ok", "db": "up"}
        
    except Exception as e:
        return {"status": "error", "db": "down", "detail": str(e)}