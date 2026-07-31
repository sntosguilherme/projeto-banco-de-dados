from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.models import Pessoa, Residente, Atendimento
from app.schemas.residentes import TempoMedioResidenteOut
from app.sql_loader import load_query

router = APIRouter(prefix="/residentes", tags=["Residentes"])


@router.get(
    "/metricas/tempo-medio-atendimento",
    response_model=list[TempoMedioResidenteOut],
)
def tempo_medio_atendimento_por_residente(db: Session = Depends(get_db)):
    try:
        resultados = (
            db.query(
                Pessoa.nome.label("nome_residente"),
                Residente.ano_residencia,
                func.round(func.avg(Atendimento.duracao_minutos), 2).label("tempo_medio_atendimento")
            )
            .join(Residente, Atendimento.id_residente == Residente.id_profissional)
            .join(Pessoa, Residente.id_profissional == Pessoa.id_pessoa)
            .group_by(Residente.id_profissional, Pessoa.nome, Residente.ano_residencia)
            .order_by(func.round(func.avg(Atendimento.duracao_minutos), 2).desc())
            .all()
        )
        return resultados
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
