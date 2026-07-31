from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.residentes import TempoMedioResidenteOut
from app.sql_loader import load_query

router = APIRouter(prefix="/residentes", tags=["Residentes"])
ARQUIVO_SQL = "03_crud_and_basic_queries.sql"


@router.get(
    "/metricas/tempo-medio-atendimento",
    response_model=list[TempoMedioResidenteOut],
)
def tempo_medio_atendimento_por_residente(db: Session = Depends(get_db)):
    try:
        sql = load_query(ARQUIVO_SQL, "tempo_medio_atendimento")
        return db.execute(text(sql)).mappings().all()
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Erro interno ao buscar métricas de tempo médio de atendimento.",
        )
