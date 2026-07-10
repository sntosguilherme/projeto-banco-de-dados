from fastapi import APIRouter
from app.database import get_db_connection

router = APIRouter()

# rota para verificar a saúde da API e a conexão com o banco de dados.
@router.get("/health") 
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