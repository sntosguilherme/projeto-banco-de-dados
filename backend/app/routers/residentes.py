from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.models import Pessoa, Residente, Atendimento
from app.schemas.residentes import TempoMedioResidenteOut

router = APIRouter(prefix="/residentes", tags=["Residentes"])


@router.get(
    "/metricas/tempo-medio-atendimento",
    response_model=list[TempoMedioResidenteOut],
)
def tempo_medio_atendimento_por_residente(db: Session = Depends(get_db)):
    try:
        pessoa = Pessoa.__table__
        residente = Residente.__table__
        atendimento = Atendimento.__table__
        resultados = (
            db.query(
                pessoa.c.nome.label("nome_residente"),
                residente.c.ano_residencia,
                func.round(func.avg(atendimento.c.duracao_minutos), 2).label("tempo_medio_atendimento")
            )
            .select_from(atendimento)
            .join(residente, atendimento.c.id_residente == residente.c.id_profissional)
            .join(pessoa, residente.c.id_profissional == pessoa.c.id_pessoa)
            .group_by(residente.c.id_profissional, pessoa.c.nome, residente.c.ano_residencia)
            .order_by(func.round(func.avg(atendimento.c.duracao_minutos), 2).desc())
            .all()
        )
        return resultados
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
