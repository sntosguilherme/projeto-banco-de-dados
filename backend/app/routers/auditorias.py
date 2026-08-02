from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import AuditoriaAtendimento
from app.schemas.auditoria import AuditoriaAtendimentoOut


router = APIRouter(prefix="/auditorias", tags=["Auditorias"])


@router.get(
    "/atendimentos",
    response_model=list[AuditoriaAtendimentoOut],
)
def listar_auditorias_atendimentos(
    operacao: Literal["INSERT", "UPDATE", "DELETE"] | None = None,
    id_atendimento: int | None = Query(default=None, gt=0),
    limite: int = Query(default=200, ge=1, le=500),
    db: Session = Depends(get_db),
):
    try:
        consulta = db.query(AuditoriaAtendimento)
        if operacao is not None:
            consulta = consulta.filter(AuditoriaAtendimento.operacao == operacao)
        if id_atendimento is not None:
            consulta = consulta.filter(
                AuditoriaAtendimento.id_atendimento == id_atendimento
            )

        return (
            consulta.order_by(
                AuditoriaAtendimento.data_hora.desc(),
                AuditoriaAtendimento.id_auditoria.desc(),
            )
            .limit(limite)
            .all()
        )
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=500,
            detail="Não foi possível consultar a auditoria de atendimentos.",
        ) from exc
