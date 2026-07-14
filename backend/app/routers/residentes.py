from fastapi import APIRouter, HTTPException
from app.database import get_db_connection
from app.sql_loader import load_query
from app.schemas.residentes import TempoMedioResidenteOut

router = APIRouter(prefix="/residentes", tags=["Residentes"])
ARQUIVO_SQL = "03_crud_and_basic_queries.sql"


@router.get(
    "/metricas/tempo-medio-atendimento",
    response_model=list[TempoMedioResidenteOut],
)
def tempo_medio_atendimento_por_residente():
    try:
        sql = load_query(ARQUIVO_SQL, "tempo_medio_atendimento")

        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(sql)
                return cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))