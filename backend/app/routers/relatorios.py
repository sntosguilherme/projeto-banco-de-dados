from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import get_db
from app.schemas.relatorios import (
    PacienteSemProcedimentoAltoRiscoOut,
    PlantaoPorUnidadeOut,
    PreceptorSupervisorOut,
    RankingResidenteOut,
)
from app.sql_loader import load_query

router = APIRouter(tags=["Relatórios"])
ARQUIVO_SQL = "04_analytical_queries.sql"


def executar_relatorio(db: Session, nome_query: str):
    query = load_query(ARQUIVO_SQL, nome_query)
    return db.execute(text(query)).mappings().all()


@router.get("/residentes/ranking", response_model=list[RankingResidenteOut])
def ranking_residentes(db: Session = Depends(get_db)):
    try:
        return executar_relatorio(db, "ranking_residentes_atendimentos")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/preceptores/supervisao", response_model=list[PreceptorSupervisorOut])
def preceptores_mais_de_5_atendimentos(db: Session = Depends(get_db)):
    try:
        return executar_relatorio(db, "preceptores_mais_de_5_atendimentos_mes")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/unidades/plantoes", response_model=list[PlantaoPorUnidadeOut])
def plantoes_por_unidade(db: Session = Depends(get_db)):
    try:
        return executar_relatorio(db, "plantoes_por_residente_unidade")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/pacientes/sem-procedimento-alto-risco",
    response_model=list[PacienteSemProcedimentoAltoRiscoOut],
)
def pacientes_sem_procedimento_alto_risco(db: Session = Depends(get_db)):
    try:
        return executar_relatorio(db, "pacientes_sem_procedimento_alto_risco")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
