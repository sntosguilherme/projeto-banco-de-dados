from fastapi import APIRouter, HTTPException
from app.database import get_db_connection
from app.sql_loader import load_query
from app.schemas.procedimento import ProcedimentoOut

router = APIRouter(prefix="/procedimentos", tags=["Catálogo de Procedimentos"])
ARQUIVO_SQL = "03_crud_and_basic_queries.sql"

# Rota para listar todos os procedimentos disponíveis no catálogo
@router.get("", response_model=list[ProcedimentoOut])
def listar_todos_procedimentos():
    try:
        sql = load_query(ARQUIVO_SQL, "listar_todos_procedimentos")

        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(sql)
                return cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
